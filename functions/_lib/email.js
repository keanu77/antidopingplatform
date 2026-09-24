/**
 * ZSend（Zeabur 的 email HTTP API）寄信封裝。移植自 backend/utils/email.js，
 * 差別只在設定改由 Pages 的 env 傳入（Workers 沒有 process.env）。
 *
 * 必要 secrets：ZSEND_API_KEY、FEEDBACK_DIGEST_TO；選填 ZSEND_FROM。
 * ★ from 的網域必須是 ZSend 已驗證網域，否則退信。
 */
const ENDPOINT = "https://api.zeabur.com/api/v1/zsend/emails";
const DEFAULT_FROM = "運動禁藥案例平台 <noreply@sportsmedicine.tw>";

export const emailConfigured = (env) => Boolean(env?.ZSEND_API_KEY);

export async function sendEmail(env, { to, subject, html, text }) {
  if (!env?.ZSEND_API_KEY) throw new Error("ZSEND_API_KEY 未設定");
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.ZSEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.ZSEND_FROM || DEFAULT_FROM, to: [to], subject, html, text }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`ZSend 寄送失敗 ${res.status}: ${detail.slice(0, 300)}`);
  }
}
