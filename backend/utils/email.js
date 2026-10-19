/**
 * 平台 email HTTP API 寄信封裝（Resend REST API；非 SMTP，免 app 密碼）。
 * 原本使用 Zeabur ZSend，2026-10 Zeabur 撤銷 ZSend key 後改為 Resend。
 *
 * 必要 env：
 *   RESEND_API_KEY Resend dashboard → API Keys 建立（建議 sending access 權限）
 *   EMAIL_FROM     寄件顯示，如 '運動禁藥案例平台 <noreply@sportsmedicine.tw>'（選填；未設時沿用舊的 ZSEND_FROM）
 *                  ★ from 的網域必須是 Resend 已驗證網域，否則會被拒寄。
 *                  ★ 中文顯示名有 MIME 編碼風險，上線前先寄一封測。
 *
 * digest / route 邏輯完全不變（重點是用平台原生 HTTP email API，不扛 SMTP）。
 * Node 18 內建全域 fetch，無需額外套件。
 */

const ENDPOINT = "https://api.resend.com/emails";

function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

async function sendEmail(opts) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY 未設定");
  const from =
    process.env.EMAIL_FROM ||
    process.env.ZSEND_FROM ||
    "運動禁藥案例平台 <noreply@sportsmedicine.tw>";

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend 寄送失敗 ${res.status}: ${detail.slice(0, 300)}`);
  }
}

module.exports = { emailConfigured, sendEmail };
