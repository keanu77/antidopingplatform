// Express 版 client-IP 擷取（供 feedback route 的記憶體限流用）。
//
// 絕不信任 X-Forwarded-For 最左端：當前端代理是 append（而非 replace）行為時，
// 最左端是呼叫方可自填的，拿它當 rate-limit key 會被輪替假 IP 繞過。從最右往左找
// 第一個「非私有」IP，在 replace / append 兩種代理行為下都安全：平台若 replace，
// 單一 entry 即真實 client；若 append，最右邊的 public IP 是可信代理自己記錄的那個。
const PRIVATE_IP = [
  /^10\./,
  /^127\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
  /^::1$/,
  /^::ffff:(10\.|127\.|192\.168\.)/i,
  /^f[cd][0-9a-f]{2}:/i,
  /^fe80:/i,
];

function isPublic(ip) {
  return ip.length > 0 && !PRIVATE_IP.some((re) => re.test(ip));
}

// req.headers['x-forwarded-for'] 通常是字串；Node 在同名 header 重複時可能給陣列。
function clientIp(req) {
  const raw = req.headers["x-forwarded-for"];
  const xff = Array.isArray(raw) ? raw.join(",") : raw;
  if (xff) {
    const parts = String(xff)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    for (let i = parts.length - 1; i >= 0; i--) {
      if (isPublic(parts[i])) return parts[i];
    }
    if (parts.length > 0) return parts[parts.length - 1];
  }
  const real = req.headers["x-real-ip"];
  return (real && String(real).trim()) || req.ip || "unknown";
}

module.exports = { clientIp };
