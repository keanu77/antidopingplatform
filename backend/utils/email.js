/**
 * 平台 email HTTP API 寄信封裝（預設 ZSend；非 SMTP，免 app 密碼）。
 * 移植自「一條龍五星回饋」skill 的 zsend.ts。
 *
 * 必要 env：
 *   ZSEND_API_KEY  Zeabur 專案建立：
 *                  npx zeabur@latest email keys create --name feedback --permission send_only
 *   ZSEND_FROM     寄件顯示，如 '運動禁藥案例平台 <noreply@sportsmedicine.tw>'
 *                  ★ from 的網域必須是 ZSend 已驗證網域，否則退信。
 *                  ★ 中文顯示名有 MIME 編碼風險，上線前先寄一封測。
 *
 * 換用 Resend / Postmark：只需改 ENDPOINT / headers / body 對應欄位，
 * digest / route 邏輯完全不變（重點是用平台原生 HTTP email API，不扛 SMTP）。
 * Node 18 內建全域 fetch，無需額外套件。
 */

const ENDPOINT = "https://api.zeabur.com/api/v1/zsend/emails";

function emailConfigured() {
  return Boolean(process.env.ZSEND_API_KEY);
}

async function sendEmail(opts) {
  const key = process.env.ZSEND_API_KEY;
  if (!key) throw new Error("ZSEND_API_KEY 未設定");
  const from =
    process.env.ZSEND_FROM || "運動禁藥案例平台 <noreply@sportsmedicine.tw>";

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
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`ZSend 寄送失敗 ${res.status}: ${detail.slice(0, 300)}`);
  }
}

module.exports = { emailConfigured, sendEmail };
