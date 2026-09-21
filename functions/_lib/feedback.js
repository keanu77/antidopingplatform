/**
 * 回饋 payload 的驗證與正規化（純函式，無 I/O，方便測試）。
 *
 * 規則逐條對齊舊 Express 版 backend/routes/feedback.js，因為前端 FeedbackBar 沒改：
 * 它送的是 rating / feedback / error 三種類型 + toolSlug / loadedAt。
 * 2026-09-19 遷到 Pages 時後端被簡化成只認 rating / issue，導致 error 回報一律 400、
 * feedback 的 issueType / email / role 被丟棄；本檔把合約補回來。
 * issue 是遷移期間的簡化類型，smoke test 仍在用，保留相容。
 */
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const TYPES = new Set(["rating", "feedback", "error", "issue"]);
// 須與前端 FeedbackBar 的身分下拉一致，否則 role 會被存成 null。
const ROLES = new Set([
  "選手/運動員", "教練/防護員", "醫師/醫療人員", "學生/研究者", "一般民眾", "不願透露",
]);
const TIME_TRAP_MS = 1500;

function clean(v, max) {
  return String(v ?? "").replace(/\r\n/g, "\n").trim().slice(0, max);
}

// 從 UA 粗分類；永不儲存完整 UA 字串。
function coarseUA(ua) {
  const u = (ua || "").toLowerCase();
  const device = /ipad|tablet/.test(u) ? "平板" : /mobile|android|iphone/.test(u) ? "手機" : "桌機";
  const browser = u.includes("edg/") ? "Edge"
    : u.includes("firefox") ? "Firefox"
    : u.includes("chrome") || u.includes("crios") ? "Chrome"
    : u.includes("safari") ? "Safari"
    : "其他";
  return `${device}/${browser}`;
}

const fail = (error) => ({ status: "error", code: 400, error });
const DROP = { status: "drop" }; // 疑似機器人：呼叫端回 ok、什麼都不存

/**
 * @returns {{status:"ok",row:object}|{status:"drop"}|{status:"error",code:number,error:string}}
 */
export function normalizeFeedback(body, { now = Date.now(), userAgent = "" } = {}) {
  if (!body || typeof body !== "object") return fail("格式錯誤");
  if (clean(body.website, 100)) return DROP; // honeypot

  const type = clean(body.type, 20);
  if (!TYPES.has(type)) return fail("類型錯誤");

  const page = clean(body.toolSlug, 100) || clean(body.page, 100);
  if (!page) return fail("缺少頁面識別");

  // time-trap：rating 是一鍵點星、可能很快，略過；其餘類型瞬間送出視為機器人。
  if (type !== "rating") {
    const loadedAt = Number(body.loadedAt);
    if (Number.isFinite(loadedAt) && loadedAt > 0 && now - loadedAt < TIME_TRAP_MS) return DROP;
    const elapsed = Number(body.elapsedMs); // 舊版 issue 表單送的是 elapsedMs
    if (elapsed > 0 && elapsed < TIME_TRAP_MS) return DROP;
  }

  const email = clean(body.email, 200);
  if (email && !EMAIL_RE.test(email)) return fail("Email 格式有誤");

  let rating = null;
  if (type === "rating" || type === "feedback") {
    const r = Math.round(Number(body.rating));
    if (!Number.isFinite(r) || r < 1 || r > 5) return fail("評分需為 1-5");
    rating = r;
  }

  const errorType = clean(body.errorType, 50);
  const description = clean(body.description, 2000);
  const message = clean(body.message, 1000);
  if (type === "error") {
    if (!errorType) return fail("請選擇錯誤類型");
    if (!description) return fail("請描述問題");
  }
  if (type === "issue" && !message) return fail("請描述問題");

  const role = clean(body.role, 30);
  return {
    status: "ok",
    row: {
      type,
      rating,
      message,
      page,
      issueType: clean(body.issueType, 50) || null,
      errorType: errorType || null,
      description: description || null,
      suggestion: clean(body.suggestion, 1000) || null,
      refs: clean(body.refs, 500) || null,
      role: ROLES.has(role) ? role : null,
      email: email || null,
      url: clean(body.url, 500) || null,
      uaClass: coarseUA(userAgent),
      viewport: clean(body.viewport, 20) || null,
      snapshot: type === "error" ? clean(body.resultSnapshot, 4000) || null : null,
    },
  };
}

export const FEEDBACK_INSERT_SQL =
  "INSERT INTO feedback (type, rating, message, page, ip_hash, created_at, issue_type, error_type, " +
  "description, suggestion, refs, role, email, url, ua_class, viewport, snapshot) " +
  "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

export function feedbackInsertParams(row, ipHash, now) {
  return [
    row.type, row.rating, row.message, row.page, ipHash, now, row.issueType, row.errorType,
    row.description, row.suggestion, row.refs, row.role, row.email, row.url, row.uaClass,
    row.viewport, row.snapshot,
  ];
}
