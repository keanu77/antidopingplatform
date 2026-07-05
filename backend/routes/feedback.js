const express = require("express");
const crypto = require("crypto");
const { connect, getDb } = require("../db");
const { clientIp } = require("../utils/clientIp");
const router = express.Router();

/**
 * 五星回饋與錯誤回報收集端點（移植自「一條龍五星回饋」skill；由 Next/Prisma 改寫為
 * Express + MongoDB native driver）。
 *
 *  - POST /：各頁底部 FeedbackBar 同源送入 JSON，寫進 `feedback` collection 後回
 *    { ok: true }；不每筆寄信，通知交由後續每日彙整（本階段先只落 DB + admin 統計）。
 *  - GET /admin：DB 端 aggregate 出「整體平均星數＋各頁排行（低分優先）＋錯誤回報」，
 *    需 x-admin-secret header 比對 FEEDBACK_ADMIN_SECRET（常數時間比對）。
 *
 * 隱私：不存完整 IP（僅記憶體內雜湊做 rate-limit）、不存完整 UA（只存粗分類）。
 */

// 於模組載入時啟動共用連線；失敗僅記錄，各 handler 以 if(!db) return 500 擋。
connect().catch((err) => console.error("Feedback route DB error:", err));

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const TYPES = new Set(["rating", "feedback", "error"]);
// 前端 FeedbackBar 的身分下拉須與此白名單一致，否則 role 會被存成 null。
const ROLES = new Set([
  "選手/運動員",
  "教練/防護員",
  "醫師/醫療人員",
  "學生/研究者",
  "一般民眾",
  "不願透露",
]);

function clean(v, max) {
  return String(v ?? "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, max);
}

// 從 UA header 粗分類，server 端推導，永不儲存完整 UA 字串。
function coarseUA(ua) {
  const u = (ua || "").toLowerCase();
  const device = /ipad|tablet/.test(u)
    ? "平板"
    : /mobile|android|iphone/.test(u)
      ? "手機"
      : "桌機";
  const browser = u.includes("edg/")
    ? "Edge"
    : u.includes("firefox")
      ? "Firefox"
      : u.includes("chrome") || u.includes("crios")
        ? "Chrome"
        : u.includes("safari")
          ? "Safari"
          : "其他";
  return `${device}/${browser}`;
}

// --- 記憶體內 rate-limit（per 匿名化 IP；raw IP 與計數永不落 DB / log）---
// FNV-1a 雜湊 IP 當 bucket key（30 次 / 5 分）。serverless 多實例不共享，只是基本擋洪。
const RL_WINDOW_MS = 5 * 60_000;
const RL_MAX = 30;
const hits = new Map();

function hashIp(ip) {
  let h = 0x811c9dc5;
  for (let i = 0; i < ip.length; i++) {
    h ^= ip.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function rateLimited(req) {
  const key = hashIp(clientIp(req));
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < RL_WINDOW_MS);
  arr.push(now);
  hits.set(key, arr);
  // 機會性清理，避免 map 無限成長。
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (!v.some((t) => now - t < RL_WINDOW_MS)) hits.delete(k);
    }
  }
  return arr.length > RL_MAX;
}

// 常數時間比對，避免 timing attack 猜測 admin secret。
function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

// POST /api/feedback — FeedbackBar 同源 JSON 送入。
router.post("/", async (req, res) => {
  if (rateLimited(req)) {
    return res.status(429).json({ error: "請求過於頻繁，請稍後再試" });
  }

  const body = req.body || {};

  // honeypot：隱藏欄位被填＝機器人 → 假裝成功、什麼都不存。
  if (clean(body.website, 100)) return res.json({ ok: true });

  const type = clean(body.type, 20);
  if (!TYPES.has(type)) return res.status(400).json({ error: "類型錯誤" });

  const toolSlug = clean(body.toolSlug, 100);
  if (!toolSlug) return res.status(400).json({ error: "缺少頁面識別" });

  // time-trap：非 rating 類型瞬間送出視為機器人（rating 一鍵點星可能很快故略過）。
  if (type !== "rating") {
    const loadedAt = Number(body.loadedAt);
    if (Number.isFinite(loadedAt) && Date.now() - loadedAt < 1500) {
      return res.json({ ok: true }); // 靜默丟棄疑似機器人
    }
  }

  const email = clean(body.email, 200);
  if (email && !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Email 格式有誤" });
  }

  let rating = null;
  if (type === "rating" || type === "feedback") {
    const r = Math.round(Number(body.rating));
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      return res.status(400).json({ error: "評分需為 1-5" });
    }
    rating = r;
  }

  const errorType = clean(body.errorType, 50);
  const description = clean(body.description, 2000);
  if (type === "error") {
    if (!errorType) return res.status(400).json({ error: "請選擇錯誤類型" });
    if (!description) return res.status(400).json({ error: "請描述問題" });
  }

  const role = clean(body.role, 30);

  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not connected" });

  try {
    await db.collection("feedback").insertOne({
      type,
      toolSlug,
      rating,
      issueType: clean(body.issueType, 50) || null,
      errorType: errorType || null,
      description: description || null,
      message: clean(body.message, 1000) || null,
      suggestion: clean(body.suggestion, 1000) || null,
      refs: clean(body.refs, 500) || null,
      role: ROLES.has(role) ? role : null,
      email: email || null,
      userAgentClass: coarseUA(req.headers["user-agent"]),
      viewport: clean(body.viewport, 20) || null,
      resultSnapshot:
        type === "error" ? clean(body.resultSnapshot, 4000) || null : null,
      url: clean(body.url, 500) || null,
      createdAt: new Date(),
    });
    return res.json({ ok: true });
  } catch (e) {
    console.error("feedback insert failed", e);
    return res.status(500).json({ error: "儲存失敗，請稍後再試" });
  }
});

// GET /api/feedback/admin — 統計彙整（全部在 DB 端 aggregate，不撈全表進記憶體）。
router.get("/admin", async (req, res) => {
  const secret = process.env.FEEDBACK_ADMIN_SECRET;
  if (!secret) {
    return res
      .status(503)
      .json({ error: "Admin 統計未啟用（未設定 FEEDBACK_ADMIN_SECRET）" });
  }
  const provided = req.headers["x-admin-secret"];
  if (!provided || !safeEqual(provided, secret)) {
    return res.status(401).json({ error: "未授權" });
  }

  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not connected" });

  try {
    const col = db.collection("feedback");

    const [overall] = await col
      .aggregate([
        { $match: { type: "rating", rating: { $ne: null } } },
        { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
      ])
      .toArray();

    // 各頁平均星數 + 筆數（低分優先＝最需改進）
    const byPage = await col
      .aggregate([
        { $match: { type: "rating", rating: { $ne: null } } },
        {
          $group: {
            _id: "$toolSlug",
            avg: { $avg: "$rating" },
            count: { $sum: 1 },
          },
        },
        { $sort: { avg: 1, count: -1 } },
        { $limit: 100 },
      ])
      .toArray();

    // type 分布
    const byType = await col
      .aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }])
      .toArray();

    // 最近的錯誤回報（只取要顯示的欄位）
    const recentErrors = await col
      .find({ type: "error" })
      .project({
        toolSlug: 1,
        errorType: 1,
        description: 1,
        suggestion: 1,
        refs: 1,
        createdAt: 1,
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // 最近的文字回饋
    const recentFeedback = await col
      .find({ type: "feedback", message: { $ne: null } })
      .project({
        toolSlug: 1,
        rating: 1,
        issueType: 1,
        message: 1,
        role: 1,
        createdAt: 1,
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return res.json({
      overall: overall || { avg: null, count: 0 },
      byPage,
      byType,
      recentErrors,
      recentFeedback,
    });
  } catch (e) {
    console.error("feedback admin aggregate failed", e);
    return res.status(500).json({ error: "統計失敗" });
  }
});

module.exports = router;
