/**
 * /api/* 的單一路由入口（Cloudflare Pages Functions）。
 *
 * 取代原本的 Express + MongoDB 後端：案例與教育內容改為 build 期編入的靜態資料，
 * 僅「使用者回饋」需要寫入，改用 D1。回應格式逐一對齊舊 API，前端未修改。
 */
import {
  queryCases, getCaseById, getFilterOptions, stats, lookupSubstance,
  wadaCategories, quizzes, specialties, adrv, substancesData, tueContent,
} from "../_lib/store.js";
import { normalizeFeedback, FEEDBACK_INSERT_SQL, feedbackInsertParams } from "../_lib/feedback.js";
import { buildDigestHtml, buildDigestText, rowFromD1, secretMatches } from "../_lib/digest.js";
import { emailConfigured, sendEmail } from "../_lib/email.js";

const MAX_SEARCH_LEN = 200;
const MAX_BODY_BYTES = 32 * 1024;

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });

// 靜態內容可安心快取；回饋寫入不快取。
const CACHE_1H = { "Cache-Control": "public, max-age=3600" };
const NO_STORE = { "Cache-Control": "no-store" };

async function readJson(request) {
  const len = Number(request.headers.get("Content-Length") || 0);
  if (len > MAX_BODY_BYTES) return { tooLarge: true };
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return { tooLarge: true };
  try { return { body: JSON.parse(raw) }; } catch { return { bad: true }; }
}

// ── 回饋：D1 寫入 + 基本防濫用 ────────────────────────────────────────
// 欄位驗證在 _lib/feedback.js（對齊前端 FeedbackBar 的 rating / feedback / error）。
async function handleFeedback(request, env) {
  const { body, bad, tooLarge } = await readJson(request);
  if (tooLarge) return json({ error: "內容過長" }, 413, NO_STORE);
  if (bad || !body) return json({ error: "格式錯誤" }, 400, NO_STORE);

  const now = Date.now();
  const result = normalizeFeedback(body, { now, userAgent: request.headers.get("User-Agent") || "" });
  if (result.status === "drop") return json({ ok: true }, 200, NO_STORE); // 疑似機器人：不給提示
  if (result.status === "error") return json({ error: result.error }, result.code, NO_STORE);

  if (!env.FEEDBACK_DB) {
    // D1 未綁定時不讓前端看到錯誤（回饋非關鍵路徑），但留下伺服器端紀錄
    console.warn("FEEDBACK_DB 未綁定，回饋未寫入");
    return json({ ok: true }, 200, NO_STORE);
  }

  // 以 IP 雜湊做每小時上限，不存明文 IP
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip + "|antidoping"));
  const ipHash = [...new Uint8Array(digest)].slice(0, 8).map((b) => b.toString(16).padStart(2, "0")).join("");

  try {
    const { results } = await env.FEEDBACK_DB
      .prepare("SELECT COUNT(*) AS n FROM feedback WHERE ip_hash = ? AND created_at > ?")
      .bind(ipHash, now - 3600_000).all();
    if ((results?.[0]?.n ?? 0) >= 10) return json({ ok: true }, 200, NO_STORE);

    await env.FEEDBACK_DB.prepare(FEEDBACK_INSERT_SQL)
      .bind(...feedbackInsertParams(result.row, ipHash, now)).run();
  } catch (err) {
    console.error("回饋寫入失敗:", err?.message);
    return json({ ok: true }, 200, NO_STORE); // 不因回饋失敗影響使用者
  }
  return json({ ok: true }, 200, NO_STORE);
}

// ── 每日回饋彙整信 ───────────────────────────────────────────────────
// 由外部排程（cron-job.org）每天打一次：GET /api/cron/feedback-digest
// header：x-cron-secret: <CRON_SECRET>。不收 ?secret= query（會洩漏到 log / Referer）。
// 查最近 24 小時的回饋寄給站長；當日無回饋則不寄。
const DIGEST_WINDOW_MS = 24 * 3600_000;

async function handleFeedbackDigest(request, env) {
  if (!secretMatches(request.headers.get("x-cron-secret"), env.CRON_SECRET)) {
    return json({ error: "unauthorized" }, 401, NO_STORE);
  }
  if (!env.FEEDBACK_DB) return json({ error: "FEEDBACK_DB 未綁定" }, 500, NO_STORE);

  let rows;
  try {
    const { results } = await env.FEEDBACK_DB
      .prepare("SELECT * FROM feedback WHERE created_at >= ? ORDER BY created_at ASC")
      .bind(Date.now() - DIGEST_WINDOW_MS).all();
    rows = (results ?? []).map(rowFromD1);
  } catch (err) {
    console.error("feedback digest 查詢失敗:", err?.message);
    return json({ error: "查詢失敗" }, 500, NO_STORE);
  }

  if (rows.length === 0) return json({ ok: true, sent: false, count: 0 }, 200, NO_STORE);
  if (!emailConfigured(env)) return json({ error: "ZSEND_API_KEY 未設定" }, 500, NO_STORE);
  if (!env.FEEDBACK_DIGEST_TO) return json({ error: "FEEDBACK_DIGEST_TO 未設定" }, 500, NO_STORE);

  try {
    await sendEmail(env, {
      to: env.FEEDBACK_DIGEST_TO,
      subject: `運動禁藥案例平台 每日回饋總結（${rows.length} 筆）`,
      html: buildDigestHtml(rows, env.SITE_URL || undefined),
      text: buildDigestText(rows),
    });
    return json({ ok: true, sent: true, count: rows.length }, 200, NO_STORE);
  } catch (err) {
    console.error("feedback digest 寄送失敗:", err?.message);
    return json({ error: "寄送失敗" }, 500, NO_STORE);
  }
}

// ── 路由 ─────────────────────────────────────────────────────────────
export async function onRequest({ request, env, params }) {
  const url = new URL(request.url);
  const segs = (Array.isArray(params.path) ? params.path : [params.path]).filter(Boolean);
  const [group, a, b, c] = segs;
  const method = request.method;
  const qs = url.searchParams;

  if (method === "OPTIONS") return new Response(null, { status: 204 });

  // ---- /api/cases ----
  if (group === "cases") {
    if (method !== "GET") return json({ error: "此 API 為唯讀" }, 405, NO_STORE);

    if (!a) {
      const search = qs.get("search") || "";
      if (search.length > MAX_SEARCH_LEN) return json({ error: "搜尋字串過長，請縮短後再試" }, 400);
      const page = Math.max(1, parseInt(qs.get("page")) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(qs.get("limit")) || 12));
      return json(
        queryCases({
          sport: qs.get("sport"), nationality: qs.get("nationality"), year: qs.get("year"),
          substanceCategory: qs.get("substanceCategory"), punishmentType: qs.get("punishmentType"),
          search, page, limit,
        }),
        200, CACHE_1H,
      );
    }
    if (a === "filters") return json(getFilterOptions(), 200, CACHE_1H);

    const found = getCaseById(a);
    return found ? json(found, 200, CACHE_1H) : json({ error: "找不到此案例" }, 404);
  }

  // ---- /api/stats ----
  if (group === "stats") {
    const table = {
      undefined: stats.overview, "": stats.overview, overview: stats.overview,
      "yearly-trends": stats.yearlyTrends,
      "sport-distribution": stats.sportDistribution,
      "substance-distribution": stats.substanceDistribution,
      "nationality-distribution": stats.nationalityDistribution,
      "country-distribution": stats.countryDistribution,
      "punishment-stats": stats.punishmentStats,
      "ban-duration-distribution": stats.banDurationDistribution,
      "ban-duration-distribution-detailed": stats.banDurationDistribution,
    };
    const fn = table[a ?? ""];
    return fn ? json(fn(), 200, CACHE_1H) : json({ error: "API 端點不存在" }, 404);
  }

  // ---- /api/education ----
  if (group === "education") {
    if (!a) return json({ substances: wadaCategories, quizzes, specialties }, 200, CACHE_1H);
    if (a === "substances") return json(wadaCategories, 200, CACHE_1H);
    if (a === "adrv") return json(adrv, 200, CACHE_1H);
    if (a === "quizzes") {
      if (b && c === "answer" && method === "POST") {
        const { body } = await readJson(request);
        const quiz = (quizzes || []).find((q) => String(q.id) === String(b));
        if (!quiz) return json({ error: "找不到此題目" }, 404, NO_STORE);
        const correct = String(body?.answer) === String(quiz.correctAnswer ?? quiz.answer);
        return json(
          { correct, correctAnswer: quiz.correctAnswer ?? quiz.answer, explanation: quiz.explanation },
          200, NO_STORE,
        );
      }
      // 原實作每次回傳打亂後的題序
      const shuffled = [...(quizzes || [])].sort(() => Math.random() - 0.5);
      return json(shuffled, 200, NO_STORE);
    }
    if (a === "articles") {
      if (!b) return json(specialties, 200, CACHE_1H);
      const one = (specialties || []).find?.((s) => String(s.id) === String(b))
        ?? specialties?.[b];
      return one ? json(one, 200, CACHE_1H) : json({ error: "找不到此內容" }, 404);
    }
    return json({ error: "API 端點不存在" }, 404);
  }

  // ---- /api/tue ----
  if (group === "tue") {
    if (!a) return json(tueContent, 200, CACHE_1H);
    if (a === "basic") return json(tueContent.basicInfo, 200, CACHE_1H);
    if (a === "application") return json(tueContent.applicationGuide, 200, CACHE_1H);
    if (a === "diseases") return json(tueContent.diseaseGuides, 200, CACHE_1H);
    if (a === "tools") return json(tueContent.tools, 200, CACHE_1H);
    if (a === "substances") return json(substancesData, 200, CACHE_1H);
    if (a === "check") {
      if (method !== "POST") return json({ error: "需使用 POST" }, 405, NO_STORE);
      const { body, bad } = await readJson(request);
      if (bad) return json({ error: "格式錯誤" }, 400, NO_STORE);
      const drugName = body?.drugName;
      if (!drugName) return json({ error: "請提供藥物名稱" }, 400, NO_STORE);
      if (typeof drugName !== "string" || drugName.length > 200) {
        return json({ error: "藥物名稱過長或格式不正確" }, 400, NO_STORE);
      }
      const match = lookupSubstance(drugName);
      if (!match) {
        return json({
          drugName, matchedKey: null, needsTUE: null, wadaCategory: "未知",
          explanation: `未找到 "${drugName}" 的資訊。建議：1) 檢查藥物名稱是否正確 2) 諮詢醫療專業人員 3) 查閱最新WADA禁用清單 4) 聯繫相關反禁藥組織確認`,
        }, 200, NO_STORE);
      }
      const { key, info } = match;
      return json({
        drugName, matchedKey: key, displayName: info.displayName, needsTUE: info.needsTUE,
        wadaCode: info.wadaCode, wadaCategory: info.categoryLabel, prohibition: info.prohibition,
        tueEligible: info.tueEligible, routes: info.routes, sportRestricted: info.sportRestricted,
        washout: info.washout, explanation: info.note,
      }, 200, NO_STORE);
    }
    return json({ error: "API 端點不存在" }, 404);
  }

  // ---- /api/feedback ----
  if (group === "feedback" && !a) {
    if (method === "POST") return handleFeedback(request, env);
    return json({ error: "需使用 POST" }, 405, NO_STORE);
  }

  // ---- /api/cron/feedback-digest ----
  if (group === "cron" && a === "feedback-digest" && !b) {
    if (method !== "GET") return json({ error: "需使用 GET" }, 405, NO_STORE);
    return handleFeedbackDigest(request, env);
  }

  // ---- /api/health ----
  if (group === "health") {
    return json({ status: "ok", cases: stats.overview().totalCases, timestamp: new Date().toISOString() }, 200, NO_STORE);
  }

  return json({ error: "API 端點不存在" }, 404, NO_STORE);
}
