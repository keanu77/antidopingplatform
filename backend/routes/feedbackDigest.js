const express = require("express");
const { timingSafeEqual } = require("node:crypto");
const { connect, getDb } = require("../db");
const { emailConfigured, sendEmail } = require("../utils/email");
const router = express.Router();

/**
 * 每日回饋總結信。由外部排程（Zeabur Cron 或 cron-job.org 等）每天打一次：
 *   GET /api/cron/feedback-digest（header：x-cron-secret: <CRON_SECRET>）
 * 不接受 ?secret= query string——secret 進 URL 會洩漏到 log / Referer。
 *
 * 查最近 24 小時的 feedback，彙整成一封 HTML（+純文字 fallback）信寄給站長；
 * 當日無回饋則不寄。移植自 skill 的 feedback-digest-route.ts（Next → Express/Mongo）。
 */

// 於模組載入時啟動共用連線；失敗僅記錄，handler 以 if(!db) return 500 擋。
connect().catch((err) => console.error("Feedback digest route DB error:", err));

const SITE_URL =
  process.env.SITE_URL || "https://antidopingplatform.sportsmedicine.tw";
const WINDOW_MS = 24 * 60 * 60_000;

function avg(nums) {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

// 使用者填寫的自由文字進入 HTML 信前一律跳脫，避免破版或注入。
function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function summarize(rows) {
  // 只算 type='rating'（每次點星一筆）；feedback 表雖也帶 rating，僅作脈絡，
  // 不重複計入平均，避免低分被算兩次。
  const ratings = rows.filter((r) => r.type === "rating" && r.rating != null);
  const errors = rows.filter((r) => r.type === "error");
  const messages = rows.filter((r) => r.type === "feedback" && r.message);

  const byTool = new Map();
  for (const r of ratings) {
    const arr = byTool.get(r.toolSlug) ?? [];
    arr.push(r.rating);
    byTool.set(r.toolSlug, arr);
  }
  const ranked = [...byTool.entries()]
    .map(([slug, arr]) => ({ slug, mean: avg(arr), n: arr.length }))
    .sort((a, b) => a.mean - b.mean);

  return {
    ratings,
    errors,
    messages,
    overall: avg(ratings.map((r) => r.rating)),
    ranked,
  };
}

// ---- 純文字版（email text fallback）----
function buildDigestText(rows) {
  const { ratings, errors, messages, overall, ranked } = summarize(rows);
  const lines = [];
  lines.push(`運動禁藥案例平台 過去 24 小時回饋總結（共 ${rows.length} 筆）`);
  lines.push("");
  lines.push(
    `・評分 ${ratings.length} 筆、錯誤回報 ${errors.length} 筆、文字建議 ${messages.length} 筆`,
  );

  if (ratings.length) {
    lines.push("");
    lines.push(`【評分】整體平均 ${overall.toFixed(2)} 星`);
    for (const t of ranked) {
      lines.push(`  ${t.mean.toFixed(2)} 星（${t.n} 筆）— ${t.slug}`);
    }
  }

  if (errors.length) {
    lines.push("");
    lines.push("【錯誤回報】");
    for (const e of errors) {
      lines.push(`  ◆ [${e.toolSlug}] ${e.errorType ?? "未分類"}`);
      if (e.description) lines.push(`    錯在哪：${e.description}`);
      if (e.suggestion) lines.push(`    建議正確內容：${e.suggestion}`);
      if (e.refs) lines.push(`    參考來源：${e.refs}`);
      if (e.role) lines.push(`    回報者身分：${e.role}`);
      if (e.email) lines.push(`    回覆 Email：${e.email}`);
      if (e.url) lines.push(`    頁面：${e.url}`);
      lines.push("");
    }
  }

  if (messages.length) {
    lines.push("【使用建議 / 許願】");
    for (const m of messages) {
      const star = m.rating != null ? `${m.rating}★ ` : "";
      const issue = m.issueType ? `（${m.issueType}）` : "";
      lines.push(`  ◇ [${m.toolSlug}] ${star}${issue}`);
      lines.push(`    ${m.message}`);
      if (m.email) lines.push(`    回覆 Email：${m.email}`);
      lines.push("");
    }
  }

  return lines.join("\n");
}

// ---- HTML 美化版 ----
function palette(mean) {
  if (mean >= 4) return { bg: "#dcfce7", fg: "#067647" }; // 綠：高分
  if (mean >= 3) return { bg: "#fef3c7", fg: "#b45309" }; // 黃：中等
  return { bg: "#fee2e2", fg: "#b42318" }; // 紅：低分優先修
}

function starBar(mean) {
  const full = Math.round(mean);
  let out = "";
  for (let i = 1; i <= 5; i++) {
    out += `<span style="color:${i <= full ? "#f59e0b" : "#d4d4d8"};">★</span>`;
  }
  return out;
}

// slug 即前端 pathname（如 "/tue"）；組成站內連結。
function toolLink(slug) {
  const s = esc(slug);
  const path = String(slug).startsWith("/") ? s : `/${s}`;
  return `<a href="${SITE_URL}${path}" style="color:#059669;text-decoration:none;font-weight:600;">${s}</a>`;
}

function badge(mean) {
  const p = palette(mean);
  return `<span style="display:inline-block;padding:2px 10px;border-radius:999px;background:${p.bg};color:${p.fg};font-weight:700;font-size:13px;">${mean.toFixed(2)}</span>`;
}

function buildDigestHtml(rows) {
  const { ratings, errors, messages, overall, ranked } = summarize(rows);
  const total = rows.length;
  const sections = [];

  if (ratings.length) {
    const rankRows = ranked
      .map(
        (t) =>
          `<tr><td style="padding:9px 0;border-bottom:1px solid #f0f0f0;">${toolLink(t.slug)}</td><td style="padding:9px 0;border-bottom:1px solid #f0f0f0;font-size:15px;white-space:nowrap;">${starBar(t.mean)}</td><td style="padding:9px 0 9px 8px;border-bottom:1px solid #f0f0f0;text-align:right;white-space:nowrap;">${badge(t.mean)}<span style="color:#9ca3af;font-size:12px;">　${t.n} 筆</span></td></tr>`,
      )
      .join("");
    sections.push(
      `<h2 style="font-size:15px;color:#0F1E3D;margin:28px 0 8px;">評分</h2><div style="font-size:14px;color:#374151;margin-bottom:10px;">整體平均 ${badge(overall)} 星　<span style="color:#9ca3af;font-size:12px;">（低分優先排序，先修這些）</span></div><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${rankRows}</table>`,
    );
  }

  if (errors.length) {
    const cards = errors
      .map((e) => {
        const parts = [];
        if (e.description)
          parts.push(
            `<div style="margin-top:6px;"><b style="color:#6b7280;">錯在哪：</b>${esc(e.description)}</div>`,
          );
        if (e.suggestion)
          parts.push(
            `<div style="margin-top:4px;"><b style="color:#6b7280;">建議正確內容：</b>${esc(e.suggestion)}</div>`,
          );
        if (e.refs)
          parts.push(
            `<div style="margin-top:4px;"><b style="color:#6b7280;">參考來源：</b>${esc(e.refs)}</div>`,
          );
        const meta = [];
        if (e.role) meta.push(`身分：${esc(e.role)}`);
        if (e.email) meta.push(`回覆：${esc(e.email)}`);
        if (meta.length)
          parts.push(
            `<div style="margin-top:6px;color:#9ca3af;font-size:12px;">${meta.join("　·　")}</div>`,
          );
        const safeUrl = e.url && /^https?:\/\//.test(e.url) ? e.url : null;
        const link = safeUrl
          ? `<div style="margin-top:8px;"><a href="${esc(safeUrl)}" style="color:#059669;font-size:12px;">開啟頁面 ↗</a></div>`
          : "";
        return `<div style="border:1px solid #fde68a;background:#fffbeb;border-radius:10px;padding:12px 14px;margin-top:10px;font-size:14px;color:#1f2937;line-height:1.6;"><div><span style="display:inline-block;padding:1px 8px;border-radius:6px;background:#f59e0b;color:#fff;font-size:12px;font-weight:700;">${esc(e.errorType ?? "未分類")}</span>　${toolLink(e.toolSlug)}</div>${parts.join("")}${link}</div>`;
      })
      .join("");
    sections.push(
      `<h2 style="font-size:15px;color:#0F1E3D;margin:28px 0 4px;">錯誤回報（${errors.length}）</h2>${cards}`,
    );
  }

  if (messages.length) {
    const cards = messages
      .map((m) => {
        const star =
          m.rating != null
            ? `<span style="color:#f59e0b;">${"★".repeat(m.rating)}</span> `
            : "";
        const issue = m.issueType
          ? `<span style="color:#9ca3af;font-size:12px;">（${esc(m.issueType)}）</span>`
          : "";
        const email = m.email
          ? `<div style="margin-top:6px;color:#9ca3af;font-size:12px;">回覆：${esc(m.email)}</div>`
          : "";
        return `<div style="border:1px solid #e5e7eb;background:#fafafa;border-radius:10px;padding:12px 14px;margin-top:10px;font-size:14px;color:#1f2937;line-height:1.6;"><div><b>${toolLink(m.toolSlug)}</b> ${star}${issue}</div><div style="margin-top:6px;">${esc(m.message)}</div>${email}</div>`;
      })
      .join("");
    sections.push(
      `<h2 style="font-size:15px;color:#0F1E3D;margin:28px 0 4px;">使用建議 / 許願（${messages.length}）</h2>${cards}`,
    );
  }

  return `<!doctype html><html><body style="margin:0;background:#f3f4f6;"><div style="background:#f3f4f6;padding:24px 12px;font-family:-apple-system,'Noto Sans TC',Helvetica,Arial,sans-serif;"><table width="600" cellpadding="0" cellspacing="0" align="center" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);"><tr><td style="background:#065f46;padding:20px 24px;"><div style="color:#ffffff;font-size:18px;font-weight:700;">運動禁藥案例平台 每日回饋總結</div><div style="color:#6ee7b7;font-size:13px;margin-top:4px;">過去 24 小時 · 共 ${total} 筆</div></td></tr><tr><td style="padding:18px 24px 28px;"><div style="font-size:13px;color:#6b7280;">評分 ${ratings.length} 筆　·　錯誤回報 ${errors.length} 筆　·　文字建議 ${messages.length} 筆</div>${sections.join("")}<div style="margin-top:30px;padding-top:14px;border-top:1px solid #eee;font-size:12px;color:#9ca3af;line-height:1.6;">此信由系統每日自動彙整，請勿直接回覆。</div></td></tr></table></div></body></html>`;
}

// 常數時間比對；timingSafeEqual 對長度不等的 buffer 會拋，故先比長度。
function secretMatches(provided, expected) {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

router.get("/", async (req, res) => {
  const provided = req.headers["x-cron-secret"] || "";
  const expected = process.env.CRON_SECRET;
  if (!expected || !secretMatches(String(provided), expected)) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not connected" });

  const since = new Date(Date.now() - WINDOW_MS);
  let rows;
  try {
    rows = await db
      .collection("feedback")
      .find({ createdAt: { $gte: since } })
      .sort({ createdAt: 1 })
      .toArray();
  } catch (e) {
    console.error("feedback digest query failed", e);
    return res.status(500).json({ error: "查詢失敗" });
  }

  if (rows.length === 0) {
    return res.json({ ok: true, sent: false, count: 0 });
  }

  if (!emailConfigured()) {
    return res.status(500).json({ error: "ZSEND_API_KEY 未設定" });
  }

  const to = process.env.FEEDBACK_DIGEST_TO;
  if (!to) {
    return res.status(500).json({ error: "FEEDBACK_DIGEST_TO 未設定" });
  }

  try {
    await sendEmail({
      to,
      subject: `運動禁藥案例平台 每日回饋總結（${rows.length} 筆）`,
      html: buildDigestHtml(rows),
      text: buildDigestText(rows),
    });
    return res.json({ ok: true, sent: true, count: rows.length });
  } catch (e) {
    console.error("feedback digest send failed", e);
    return res.status(500).json({ error: "寄送失敗" });
  }
});

module.exports = router;
