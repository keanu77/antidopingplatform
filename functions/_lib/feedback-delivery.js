import { buildDigestHtml, buildDigestText, rowFromD1 } from "./digest.js";
import { sendEmail } from "./email.js";

const LEASE_MS = 60_000;
// Resend retains keys for 24 hours. Leave an hour of margin; uncertain older
// attempts require reconciliation, never a fresh key that could send twice.
const SAFE_RETRY_MS = 23 * 3600_000;
const MAX_PENDING_BYTES = 750_000; // D1 has a 2 MB string/row limit; allow headroom.

async function rows(db, sql, ...args) {
  const result = await db.prepare(sql).bind(...args).all();
  if (result.success !== true || !Array.isArray(result.results)) throw new Error("D1 read unconfirmed");
  return result.results;
}
async function run(db, sql, ...args) {
  const result = await db.prepare(sql).bind(...args).run();
  if (result.success !== true || !Number.isInteger(result.meta?.changes)) throw new Error("D1 write unconfirmed");
  return result.meta.changes;
}

export async function feedbackDeliveryStatus(db, now = Date.now()) {
  const [state] = await rows(db, `SELECT cursor_id, legacy_through_id, last_success_at,
    first_attempt_at, pending_json IS NOT NULL AS pending, lease_until,
    (SELECT COUNT(*) FROM feedback WHERE id > cursor_id) AS unsent_count,
    (SELECT COUNT(*) FROM feedback WHERE id <= legacy_through_id) AS legacy_unreconciled_count
    FROM feedback_delivery WHERE id = ?`, 1);
  if (!state) throw new Error("Delivery state missing");
  return { ...state, reconciliationRequired: Boolean(state.pending && now - state.first_attempt_at >= SAFE_RETRY_MS) };
}

/** Immutable bounded batch, durable cursor, single sender lease. No clock-based
 * lookback: a missed daily invocation cannot silently discard older new rows. */
export async function deliverFeedback(env, clock = Date.now) {
  const now = clock();
  const db = env.FEEDBACK_DB;
  const token = crypto.randomUUID();
  const locked = await run(db, `UPDATE feedback_delivery SET lock_token = ?, lease_until = ?
    WHERE id = 1 AND lease_until <= ?`, token, now + LEASE_MS, now);
  if (!locked) return { ok: true, sent: false, count: 0, busy: true };
  try {
    const [state] = await rows(db, "SELECT * FROM feedback_delivery WHERE id = ?", 1);
    if (!state) throw new Error("Delivery state missing");
    let pending = state.pending_json ? JSON.parse(state.pending_json) : null;
    if (pending && state.first_attempt_at !== null && clock() - state.first_attempt_at >= SAFE_RETRY_MS) {
      return { ok: false, error: "彙整寄送狀態待核對；已停止自動重送以避免重複寄信", reconciliationRequired: true };
    }
    if (!pending) {
      const records = await rows(db, "SELECT * FROM feedback WHERE id > ? ORDER BY id ASC LIMIT 100", state.cursor_id);
      if (!records.length) return { ok: true, sent: false, count: 0 };
      if (!env.RESEND_API_KEY || !env.FEEDBACK_DIGEST_TO) throw new Error("Email configuration missing");
      const batchKey = `feedback-digest/${crypto.randomUUID()}`;
      do {
        const data = records.map(rowFromD1);
        const endId = records.at(-1).id;
        pending = {
        endId, count: data.length,
        message: {
          to: env.FEEDBACK_DIGEST_TO,
          from: env.EMAIL_FROM || env.ZSEND_FROM || "運動禁藥案例平台 <noreply@sportsmedicine.tw>",
          subject: `運動禁藥案例平台 回饋總結（${data.length} 筆）`,
          html: buildDigestHtml(data, env.SITE_URL || undefined).replace(/過去 24 小時/g, "本次待彙整"),
          text: buildDigestText(data).replace(/過去 24 小時/g, "本次待彙整"),
          idempotencyKey: batchKey,
        },
        };
        if (new TextEncoder().encode(JSON.stringify(pending)).byteLength <= MAX_PENDING_BYTES) break;
        records.pop();
        if (!records.length) throw new Error("Single feedback exceeds delivery storage limit");
      } while (true);
      if (await run(db, `UPDATE feedback_delivery SET pending_json = ?, first_attempt_at = ?
        WHERE id = 1 AND lock_token = ?`, JSON.stringify(pending), clock(), token) !== 1) throw new Error("Delivery lease lost");
    }
    // A slow read may outlive the lease. Validate ownership and renew atomically
    // immediately before the bounded provider request, including retry batches.
    const sendingAt = clock();
    if (await run(db, `UPDATE feedback_delivery SET lease_until = ?
      WHERE id = 1 AND lock_token = ? AND lease_until > ?`, sendingAt + LEASE_MS, token, sendingAt) !== 1) throw new Error("Delivery lease expired");
    const confirmedAt = clock();
    if (sendingAt + LEASE_MS - confirmedAt < 30_000) throw new Error("Delivery lease acknowledgement too late");
    if (state.first_attempt_at !== null && confirmedAt - state.first_attempt_at >= SAFE_RETRY_MS) {
      return { ok: false, error: "彙整寄送狀態待核對；已停止自動重送以避免重複寄信", reconciliationRequired: true };
    }
    const providerId = await sendEmail(env, pending.message);
    if (await run(db, `UPDATE feedback_delivery SET cursor_id = ?, pending_json = NULL,
      first_attempt_at = NULL, last_success_at = ?, last_provider_id = ?
      WHERE id = 1 AND lock_token = ?`, pending.endId, clock(), providerId, token) !== 1) throw new Error("Delivery acknowledgement not saved");
    return { ok: true, sent: true, count: pending.count };
  } finally {
    await run(db, "UPDATE feedback_delivery SET lock_token = NULL, lease_until = 0 WHERE id = 1 AND lock_token = ?", token);
  }
}
