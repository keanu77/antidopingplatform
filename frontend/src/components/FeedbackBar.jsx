/**
 * FeedbackBar — 黏在每頁底部的「五星評分 ＋ 錯誤回報」罩層列。
 *
 * 兩段式：點 5 星＝道謝不展開；點 ≤4 星＝就地展開「使用回饋」表；
 * 「回報問題」展開「錯誤回報」表。全程同源 fetch('/api/feedback') JSON 送出、
 * inline 顯示結果、絕不跳轉，保留頁面所有狀態。
 *
 * 移植自「一條龍五星回饋」skill（原為 Next.js client component），改寫為 React 19 JSX：
 *  - toolSlug 用 React Router 的 pathname（逐頁評分、admin 依頁面排名最需改進頁）。
 *  - accent 固定為平台 emerald 主色；不做 A–D 類別推導。
 *  - 樣式自帶 <style>，不動全站 CSS；星星用 ★/☆ 排版字元填色，非 emoji。
 *
 * 隱私：email 選填、匿名優先；free-text 旁有去識別化提示；
 * 離線 / 端點缺席時靜默暫存 localStorage，下次造訪自動補送。
 */
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const ENDPOINT = "/api/feedback";
const ACCENT = "#059669"; // emerald-600（與 Layout 導覽一致）
const KEY_RATED = "adp-fb-rated:"; // + slug → "1"
const KEY_PENDING = "adp-fb-pending"; // JSON array of payloads（離線暫存）

// 身分下拉須與 backend/routes/feedback.js 的 ROLES 白名單一致。
const ROLES = [
  "選手/運動員",
  "教練/防護員",
  "醫師/醫療人員",
  "學生/研究者",
  "一般民眾",
  "不願透露",
];
const ISSUE_TYPES = [
  "內容不夠清楚",
  "資料有誤",
  "操作卡住/不會用",
  "顯示跑版",
  "建議新增內容",
  "其他",
];
const ERROR_TYPES = [
  "案例資料錯誤",
  "WADA 分類標錯",
  "醫學內容過時",
  "引用來源有誤或缺失",
  "連結失效",
  "介面/功能 bug",
  "文字錯字",
  "其他",
];

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

async function postFeedback(payload) {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) return { ok: true, absent: false, tooMany: false };
    if (res.status === 429) return { ok: false, absent: false, tooMany: true };
    // 404/405 → 端點不存在（多半是純前端 dev）→ 視為離線暫存。
    if (res.status === 404 || res.status === 405)
      return { ok: false, absent: true, tooMany: false };
    return { ok: false, absent: false, tooMany: false };
  } catch {
    return { ok: false, absent: true, tooMany: false }; // 網路錯誤 / 離線
  }
}

function queue(payload) {
  try {
    const raw = localStorage.getItem(KEY_PENDING);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push(payload);
    localStorage.setItem(KEY_PENDING, JSON.stringify(arr.slice(-20)));
  } catch {
    /* localStorage 不可用 → 放棄暫存，不阻斷 */
  }
}

async function flushPending() {
  let arr;
  try {
    const raw = localStorage.getItem(KEY_PENDING);
    if (!raw) return;
    arr = JSON.parse(raw);
  } catch {
    return;
  }
  const remaining = [];
  for (const p of arr) {
    const r = await postFeedback(p);
    if (!r.ok) remaining.push(p); // 仍失敗 → 留著下次再試
  }
  try {
    if (remaining.length)
      localStorage.setItem(KEY_PENDING, JSON.stringify(remaining));
    else localStorage.removeItem(KEY_PENDING);
  } catch {
    /* ignore */
  }
}

// 錯誤回報用的頁面快照：只取標題 / H1 / URL，隱私安全（不整頁傾印）。
function pageSnapshot() {
  if (typeof document === "undefined") return "";
  const parts = [];
  if (document.title) parts.push(`標題：${document.title}`);
  const h1 = document.querySelector("main h1, h1");
  if (h1?.textContent) parts.push(`H1：${h1.textContent.trim()}`);
  if (typeof location !== "undefined") parts.push(`URL：${location.href}`);
  return parts.join("\n");
}

const STYLE = `
.adp-fb { position: fixed; left: 0; right: 0; bottom: 0; z-index: 39;
  font-family: -apple-system, BlinkMacSystemFont, "Noto Sans TC", "PingFang TC", sans-serif; }
.adp-fb-bar { background: #ffffff; border-top: 3px solid ${ACCENT};
  box-shadow: 0 -6px 24px rgba(0,0,0,0.14); }
.adp-fb-inner { max-width: 56rem; margin: 0 auto; display: flex; align-items: center;
  gap: 0.75rem; padding: 0.8rem 1.25rem; flex-wrap: wrap; }
.adp-fb-prompt { font-size: 1.0625rem; font-weight: 600; color: #1f2937; margin-right: auto; }
.adp-fb-stars { display: inline-flex; gap: 4px; }
.adp-fb-star { background: none; border: 0; cursor: pointer; font-size: 2.1rem;
  line-height: 1; padding: 0 2px; color: #cbd5e1; transition: color .12s ease, transform .1s ease; }
.adp-fb-star:hover { transform: scale(1.15); }
.adp-fb-star:disabled { cursor: default; }
.adp-fb-report { background: #f0fdf4; border: 1px solid ${ACCENT}; cursor: pointer;
  font-size: 0.9375rem; font-weight: 600; color: ${ACCENT}; border-radius: 0.5rem; padding: 0.4rem 0.85rem; }
.adp-fb-report:hover { background: ${ACCENT}; color: #fff; }
.adp-fb-panel { background: rgba(255,255,255,0.99); border-top: 1px solid #e5e7eb;
  max-height: min(70vh, 32rem); overflow-y: auto; }
.adp-fb-panel-inner { max-width: 56rem; margin: 0 auto; padding: 0.9rem 1rem 1.1rem; }
.adp-fb-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; }
.adp-fb-title { font-size: 0.95rem; font-weight: 700; color: #0f1e3d; }
.adp-fb-close { background: none; border: 0; cursor: pointer; color: #6b7280; font-size: 1rem; line-height: 1; padding: 0.1rem 0.3rem; }
.adp-fb-disc { font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem; line-height: 1.5; }
.adp-fb-f { margin-top: 0.7rem; }
.adp-fb-label { display: block; font-size: 0.8125rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem; }
.adp-fb-req { color: #c8553d; }
.adp-fb-input, .adp-fb-select, .adp-fb-textarea { width: 100%; font: inherit; font-size: 0.875rem;
  padding: 0.5rem 0.65rem; border: 1px solid #e5e7eb; border-radius: 0.5rem;
  background: #fff; color: #171717; box-sizing: border-box; }
.adp-fb-textarea { resize: vertical; min-height: 3.5rem; }
.adp-fb-input:focus, .adp-fb-select:focus, .adp-fb-textarea:focus { outline: 2px solid ${ACCENT}; outline-offset: 0; }
.adp-fb-hint { font-size: 0.72rem; color: #9ca3af; margin-top: 0.25rem; line-height: 1.4; }
.adp-fb-check { display: flex; align-items: flex-start; gap: 0.4rem; font-size: 0.8125rem; color: #374151; margin-top: 0.6rem; cursor: pointer; }
.adp-fb-check input { margin-top: 0.15rem; }
.adp-fb-more { background: none; border: 0; cursor: pointer; font-size: 0.8125rem; color: #6b7280; padding: 0.5rem 0 0; }
.adp-fb-actions { display: flex; align-items: center; gap: 0.6rem; margin-top: 0.9rem; }
.adp-fb-submit { margin-left: auto; background: ${ACCENT}; color: #fff; border: 0;
  font: inherit; font-size: 0.875rem; font-weight: 700; padding: 0.55rem 1.1rem; border-radius: 0.6rem; cursor: pointer; }
.adp-fb-submit:disabled { opacity: 0.6; cursor: default; }
.adp-fb-err { font-size: 0.8125rem; color: #b42318; }
.adp-fb-toast { font-size: 0.875rem; font-weight: 600; padding: 0.15rem 0; }
.adp-fb-toast.ok { color: #067647; }
.adp-fb-hp { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
@media (max-width: 640px) {
  .adp-fb-prompt { width: 100%; margin-right: 0; }
  .adp-fb-report { margin-left: auto; }
}
`;

export default function FeedbackBar() {
  const location = useLocation();
  const slug = location.pathname || "/";

  const [mode, setMode] = useState("collapsed"); // collapsed|rated|thanks|feedback|error|sent|queued
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // 表單欄位
  const [issueType, setIssueType] = useState("");
  const [errorType, setErrorType] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [refs, setRefs] = useState("");
  const [role, setRole] = useState("");
  const [wantReply, setWantReply] = useState(false);
  const [email, setEmail] = useState("");
  const [attachSnapshot, setAttachSnapshot] = useState(true);

  const loadedAtRef = useRef(0);
  const barRef = useRef(null);
  const honeypotRef = useRef(null);

  // 初次掛載：補送離線暫存。
  useEffect(() => {
    loadedAtRef.current = Date.now();
    void flushPending();
  }, []);

  // 逐頁重置：切換路由時，依該頁是否評過決定 collapsed / rated，並清空表單。
  useEffect(() => {
    loadedAtRef.current = Date.now();
    setStars(0);
    setHover(0);
    resetForm();
    let rated = false;
    try {
      rated = localStorage.getItem(KEY_RATED + slug) === "1";
    } catch {
      /* ignore */
    }
    setMode(rated ? "rated" : "collapsed");
  }, [slug]);

  // 展開/收合後量測列高，設 body 底距避免罩層永久遮住 footer 底部。
  useEffect(() => {
    const barH = barRef.current?.offsetHeight ?? 44;
    document.body.style.paddingBottom = `${barH + 8}px`;
    return () => {
      document.body.style.paddingBottom = "";
    };
  }, [mode]);

  function base() {
    return {
      toolSlug: slug,
      url: typeof location !== "undefined" ? window.location.href : "",
      loadedAt: loadedAtRef.current,
      website: honeypotRef.current?.value ?? "",
    };
  }

  function markRated() {
    try {
      localStorage.setItem(KEY_RATED + slug, "1");
    } catch {
      /* ignore */
    }
  }

  function resetForm() {
    setIssueType("");
    setErrorType("");
    setDescription("");
    setMessage("");
    setSuggestion("");
    setRefs("");
    setRole("");
    setWantReply(false);
    setEmail("");
    setShowMore(false);
    setErr("");
  }

  // 點星即記分（樂觀）：5 星道謝、≤4 星展開使用回饋表。
  async function rate(n) {
    if (mode === "rated") return;
    setStars(n);
    setHover(0);
    markRated();
    const payload = { ...base(), type: "rating", rating: n };
    const r = await postFeedback(payload);
    if (!r.ok && r.absent) queue(payload);
    if (n === 5) {
      setMode("thanks");
      window.setTimeout(() => setMode("rated"), 2200);
    } else {
      resetForm();
      setMode("feedback");
    }
  }

  function emailValid() {
    if (!wantReply || !email.trim()) return true;
    if (EMAIL_RE.test(email.trim())) return true;
    setErr("Email 格式有誤");
    return false;
  }

  async function submitFeedback(e) {
    e.preventDefault();
    setErr("");
    if (!emailValid()) return;
    const payload = {
      ...base(),
      type: "feedback",
      rating: stars || undefined,
      issueType: issueType || undefined,
      message: message.trim() || undefined,
      role: role || undefined,
      email: wantReply ? email.trim() || undefined : undefined,
    };
    await submit(payload);
  }

  async function submitError(e) {
    e.preventDefault();
    setErr("");
    if (!errorType) {
      setErr("請選擇錯誤類型");
      return;
    }
    if (!description.trim()) {
      setErr("請描述問題");
      return;
    }
    if (!emailValid()) return;
    const payload = {
      ...base(),
      type: "error",
      errorType,
      description: description.trim(),
      suggestion: suggestion.trim() || undefined,
      refs: refs.trim() || undefined,
      role: role || undefined,
      email: wantReply ? email.trim() || undefined : undefined,
      viewport:
        typeof window !== "undefined"
          ? `${window.innerWidth}x${window.innerHeight}`
          : undefined,
      resultSnapshot: attachSnapshot
        ? pageSnapshot().slice(0, 4000)
        : undefined,
    };
    await submit(payload);
  }

  async function submit(payload) {
    setBusy(true);
    const r = await postFeedback(payload);
    setBusy(false);
    if (r.ok) {
      markRated();
      setMode("sent");
      window.setTimeout(() => setMode("rated"), 2500);
    } else if (r.absent) {
      queue(payload);
      markRated();
      setMode("queued");
      window.setTimeout(() => setMode("rated"), 2500);
    } else if (r.tooMany) {
      setErr("送出太頻繁，請稍後再試");
    } else {
      setErr("送出失敗，請稍後再試");
    }
  }

  function openError() {
    resetForm();
    setMode("error");
  }
  function isRated() {
    try {
      return localStorage.getItem(KEY_RATED + slug) === "1";
    } catch {
      return false;
    }
  }
  function close() {
    setMode(stars || isRated() ? "rated" : "collapsed");
  }

  const fillTo = hover || stars;
  const showStars = mode === "collapsed";

  const moreBlock = (
    <>
      <button
        type="button"
        className="adp-fb-more"
        onClick={() => setShowMore((v) => !v)}
      >
        {showMore ? "▾ 更多" : "▸ 更多（選填：身分、留 Email 讓我們回覆）"}
      </button>
      {showMore && (
        <>
          <div className="adp-fb-f">
            <label className="adp-fb-label" htmlFor="adp-fb-role">
              你的身分（選填）
            </label>
            <select
              id="adp-fb-role"
              className="adp-fb-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">（不願透露）</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <label className="adp-fb-check">
            <input
              type="checkbox"
              checked={wantReply}
              onChange={(e) => setWantReply(e.target.checked)}
            />
            <span>希望收到回覆</span>
          </label>
          {wantReply && (
            <div className="adp-fb-f">
              <input
                type="email"
                className="adp-fb-input"
                placeholder="your@email.com（留空即匿名送出）"
                value={email}
                maxLength={200}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}
        </>
      )}
    </>
  );

  const deidHint = (
    <p className="adp-fb-hint">
      請勿填寫個人可識別資訊（姓名、身分證號、聯絡方式等）；本回饋僅用於改善平台內容。
    </p>
  );

  return (
    <div className="adp-fb">
      <style>{STYLE}</style>

      {/* honeypot：使用者看不到，機器人會填 */}
      <input
        ref={honeypotRef}
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="adp-fb-hp"
      />

      {/* ---- 使用回饋表（A）---- */}
      {mode === "feedback" && (
        <div className="adp-fb-panel">
          <div className="adp-fb-panel-inner">
            <div className="adp-fb-head">
              <div className="adp-fb-title">
                你給了 {"★".repeat(stars)}
                {"☆".repeat(5 - stars)} — 哪裡可以更好？
              </div>
              <button
                type="button"
                className="adp-fb-close"
                onClick={close}
                aria-label="收合"
              >
                ✕
              </button>
            </div>
            <form onSubmit={submitFeedback}>
              <div className="adp-fb-f">
                <label className="adp-fb-label" htmlFor="adp-fb-issue">
                  問題類型（選填）
                </label>
                <select
                  id="adp-fb-issue"
                  className="adp-fb-select"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                >
                  <option value="">（請選擇）</option>
                  {ISSUE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="adp-fb-f">
                <label className="adp-fb-label" htmlFor="adp-fb-msg">
                  想說的話（選填）
                </label>
                <textarea
                  id="adp-fb-msg"
                  className="adp-fb-textarea"
                  rows={3}
                  maxLength={1000}
                  placeholder="想更好用？或想看哪些案例／主題？告訴我們…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                {deidHint}
              </div>
              {moreBlock}
              <div className="adp-fb-actions">
                {err && <span className="adp-fb-err">{err}</span>}
                <button type="submit" className="adp-fb-submit" disabled={busy}>
                  {busy ? "送出中…" : "送出回饋"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- 錯誤回報表（B）---- */}
      {mode === "error" && (
        <div className="adp-fb-panel">
          <div className="adp-fb-panel-inner">
            <div className="adp-fb-head">
              <div className="adp-fb-title">回報這個頁面的問題</div>
              <button
                type="button"
                className="adp-fb-close"
                onClick={close}
                aria-label="收合"
              >
                ✕
              </button>
            </div>
            <p className="adp-fb-disc">
              本平台內容僅供教育參考，不構成醫療或法律建議。感謝你協助我們更正。
            </p>
            <form onSubmit={submitError}>
              <div className="adp-fb-f">
                <label className="adp-fb-label" htmlFor="adp-fb-etype">
                  錯誤類型 <span className="adp-fb-req">＊</span>
                </label>
                <select
                  id="adp-fb-etype"
                  className="adp-fb-select"
                  value={errorType}
                  onChange={(e) => setErrorType(e.target.value)}
                >
                  <option value="">（請選擇）</option>
                  {ERROR_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="adp-fb-f">
                <label className="adp-fb-label" htmlFor="adp-fb-desc">
                  錯在哪裡 <span className="adp-fb-req">＊</span>
                </label>
                <textarea
                  id="adp-fb-desc"
                  className="adp-fb-textarea"
                  rows={3}
                  maxLength={2000}
                  placeholder="例：某案例的判罰年限有誤／WADA 分類標錯／連結失效…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="adp-fb-f">
                <label className="adp-fb-label" htmlFor="adp-fb-sugg">
                  正確內容應該是（選填）
                </label>
                <textarea
                  id="adp-fb-sugg"
                  className="adp-fb-textarea"
                  rows={2}
                  maxLength={1000}
                  placeholder="你認為正確的數值或敘述"
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                />
              </div>
              <div className="adp-fb-f">
                <label className="adp-fb-label" htmlFor="adp-fb-refs">
                  參考來源（選填）
                </label>
                <input
                  id="adp-fb-refs"
                  className="adp-fb-input"
                  maxLength={500}
                  placeholder="WADA／CTADA 連結、新聞或 DOI（有來源能更快修正）"
                  value={refs}
                  onChange={(e) => setRefs(e.target.value)}
                />
              </div>
              <label className="adp-fb-check">
                <input
                  type="checkbox"
                  checked={attachSnapshot}
                  onChange={(e) => setAttachSnapshot(e.target.checked)}
                />
                <span>一併附上目前頁面資訊以利修正（僅標題／網址）</span>
              </label>
              {deidHint}
              {moreBlock}
              <div className="adp-fb-actions">
                {err && <span className="adp-fb-err">{err}</span>}
                <button type="submit" className="adp-fb-submit" disabled={busy}>
                  {busy ? "送出中…" : "送出回報"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- 黏底細列（永遠在面板下方）---- */}
      <div className="adp-fb-bar" ref={barRef}>
        <div className="adp-fb-inner">
          {mode === "thanks" ? (
            <>
              <span className="adp-fb-toast ok">謝謝你的回饋！</span>
              <span className="adp-fb-stars" aria-hidden="true">
                <span style={{ color: ACCENT, fontSize: "1.4rem" }}>★★★★★</span>
              </span>
            </>
          ) : mode === "sent" ? (
            <span className="adp-fb-toast ok">
              ✓ 已送出，感謝你的回饋！我們會據此修正內容。
            </span>
          ) : mode === "queued" ? (
            <span className="adp-fb-toast">已暫存，下次造訪會自動補送。</span>
          ) : (
            <>
              <span className="adp-fb-prompt">
                {mode === "rated" ? "感謝你的回饋 ✓" : "這個頁面對你有幫助嗎？"}
              </span>
              {showStars && (
                <span
                  className="adp-fb-stars"
                  role="radiogroup"
                  aria-label="評分"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className="adp-fb-star"
                      aria-label={`${n} 星`}
                      onMouseEnter={() => setHover(n)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => rate(n)}
                      style={{ color: fillTo >= n ? ACCENT : undefined }}
                    >
                      {fillTo >= n ? "★" : "☆"}
                    </button>
                  ))}
                </span>
              )}
              <button
                type="button"
                className="adp-fb-report"
                onClick={openError}
              >
                {mode === "rated" ? "回報問題" : "發現內容有誤？回報問題"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
