/**
 * Resend（REST API）寄信封裝。移植自 backend/utils/email.js，
 * 差別只在設定改由 Pages 的 env 傳入（Workers 沒有 process.env）。
 *
 * 必要 secrets：RESEND_API_KEY、FEEDBACK_DIGEST_TO；選填 EMAIL_FROM（未設時沿用舊的 ZSEND_FROM）。
 * ★ from 的網域必須是 Resend 已驗證網域，否則會被拒寄。
 */

const ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "運動禁藥案例平台 <noreply@sportsmedicine.tw>";

/** FEEDBACK_DIGEST_TO 等可為逗號分隔；Resend `to` 需分開的陣列元素。 */
function parseRecipients(to) {
  return String(to ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const emailConfigured = (env) => Boolean(env?.RESEND_API_KEY);

export async function sendEmail(env, { to, subject, html, text, replyTo }) {
  if (!env?.RESEND_API_KEY) throw new Error("RESEND_API_KEY 未設定");
  const from = env.EMAIL_FROM || env.ZSEND_FROM || DEFAULT_FROM;
  const recipients = parseRecipients(to);
  if (recipients.length === 0) throw new Error("收件人為空");
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: recipients, subject, html, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend 寄送失敗 ${res.status}: ${detail.slice(0, 300)}`);
  }
}
