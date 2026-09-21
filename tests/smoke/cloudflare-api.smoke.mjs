#!/usr/bin/env node
/**
 * Cloudflare 版 API 的 smoke test。
 *
 * 2026-09-19 從 Express + MongoDB 遷到 Pages Functions + 靜態資料集後，
 * 既有的 backend/__tests__ 測的是已下線的舊後端，抓不到新架構的回歸。
 * 本檔對「實際部署的站」發請求，驗證前端會用到的每條路徑。
 *
 * 只讀，唯一的寫入是一筆標記為 smoke-test 的回饋（會進 D1，可事後辨識）。
 *
 * 用法：
 *   node tests/smoke/cloudflare-api.smoke.mjs                    # 正式網域
 *   node tests/smoke/cloudflare-api.smoke.mjs <baseUrl>          # 指定環境
 *   SKIP_WRITE=1 node tests/smoke/cloudflare-api.smoke.mjs       # 不送回饋
 */
const BASE = (process.argv[2] || process.env.SMOKE_BASE_URL || "https://antidopingplatform.sportsmedicine.tw")
  .replace(/\/+$/, "");
const SKIP_WRITE = process.env.SKIP_WRITE === "1";

const results = [];
async function check(name, fn) {
  try {
    results.push({ name, ok: true, detail: (await fn()) ?? "ok" });
  } catch (e) {
    results.push({ name, ok: false, detail: e instanceof Error ? e.message : String(e) });
  }
}
const expect = (cond, msg) => { if (!cond) throw new Error(msg); };
const getJson = async (p) => {
  const r = await fetch(BASE + p);
  expect(r.ok, `${p} → HTTP ${r.status}`);
  return r.json();
};

// ── 靜態頁面 ────────────────────────────────────────────────────────
await check("首頁回 200 且標題正確", async () => {
  const r = await fetch(BASE + "/");
  expect(r.status === 200, `HTTP ${r.status}`);
  const html = await r.text();
  expect(/運動禁藥/.test(html), "首頁標題不含預期文字");
  expect(!/zeabur/i.test(html), "首頁仍殘留 zeabur 字樣");
  return "200";
});

// ── 案例 ────────────────────────────────────────────────────────────
let total = 0;
await check("案例列表有資料且依年份降序", async () => {
  const j = await getJson("/api/cases?limit=50");
  expect(j.totalCases > 100, `總筆數異常: ${j.totalCases}`);
  expect(j.cases.length === 50, `單頁筆數異常: ${j.cases.length}`);
  expect(j.cases.every((c, i, a) => i === 0 || a[i - 1].year >= c.year), "未依年份降序");
  total = j.totalCases;
  return `${total} 筆`;
});

await check("分頁不重複且末頁筆數正確", async () => {
  const perPage = 50;
  const [p1, p2] = await Promise.all([
    getJson(`/api/cases?page=1&limit=${perPage}`),
    getJson(`/api/cases?page=2&limit=${perPage}`),
  ]);
  const ids = new Set([...p1.cases, ...p2.cases].map((c) => c.id));
  expect(ids.size === p1.cases.length + p2.cases.length, "跨頁出現重複 id");
  const last = await getJson(`/api/cases?page=${p1.totalPages}&limit=${perPage}`);
  expect(last.cases.length === total - (p1.totalPages - 1) * perPage, "末頁筆數不符");
  return `${p1.totalPages} 頁`;
});

await check("列表只回必要欄位（projection 未退化）", async () => {
  const j = await getJson("/api/cases?limit=1");
  const c = j.cases[0];
  expect(!("eventBackground" in c), "列表不應回傳 eventBackground");
  expect(!("sourceLinks" in c), "列表不應回傳 sourceLinks");
  expect(c.athleteName && c.sport && c.year, "列表缺少必要欄位");
  return "ok";
});

await check("單筆詳情欄位完整", async () => {
  const c = await getJson("/api/cases/1");
  for (const f of ["athleteName", "sport", "nationality", "year", "substance",
                   "substanceCategory", "eventBackground", "summary", "educationalNotes"]) {
    expect(c[f], `缺欄位 ${f}`);
  }
  expect(Array.isArray(c.sourceLinks) && c.sourceLinks.length > 0, "缺來源連結");
  expect(c.punishment && typeof c.punishment.banDuration === "string", "缺處罰資訊");
  return c.athleteName;
});

await check("不存在的案例回 404", async () => {
  const r = await fetch(BASE + "/api/cases/999999");
  expect(r.status === 404, `HTTP ${r.status}`);
  return "404";
});

await check("篩選選項齊全", async () => {
  const f = await getJson("/api/cases/filters");
  for (const k of ["sports", "nationalities", "substanceCategories", "years"]) {
    expect(Array.isArray(f[k]) && f[k].length > 0, `${k} 為空`);
  }
  expect(f.years.every((y, i, a) => i === 0 || a[i - 1] >= y), "年份未降序");
  return `${f.sports.length} 運動 / ${f.nationalities.length} 國`;
});

await check("中文篩選與搜尋可用", async () => {
  const bySport = await getJson("/api/cases?" + new URLSearchParams({ sport: "田徑" }));
  expect(bySport.totalCases > 0, "運動項目篩選無結果");
  const byPunish = await getJson("/api/cases?" + new URLSearchParams({ punishmentType: "獎牌剝奪" }));
  expect(byPunish.totalCases > 0, "處罰類型篩選無結果");
  expect(byPunish.cases.every((c) => c.punishment.medalStripped === true), "獎牌剝奪篩選不準");
  const search = await getJson("/api/cases?" + new URLSearchParams({ search: "Armstrong" }));
  expect(search.totalCases >= 1, "搜尋無結果");
  return `田徑 ${bySport.totalCases}、獎牌剝奪 ${byPunish.totalCases}`;
});

await check("過長搜尋字串被擋（防 ReDoS）", async () => {
  const r = await fetch(BASE + "/api/cases?search=" + "a".repeat(250));
  expect(r.status === 400, `HTTP ${r.status}`);
  return "400";
});

// ── 統計 ────────────────────────────────────────────────────────────
await check("統計總覽與列表筆數一致", async () => {
  const o = await getJson("/api/stats/overview");
  expect(o.totalCases === total, `overview ${o.totalCases} ≠ 列表 ${total}`);
  expect(o.uniqueSports > 0 && o.uniqueCountries > 0, "統計維度為零");
  return `${o.totalCases} 筆 / ${o.uniqueSports} 運動`;
});

await check("各統計端點格式正確", async () => {
  const shapes = {
    "yearly-trends": ["year", "count"],
    "sport-distribution": ["sport", "count"],
    "substance-distribution": ["category", "count"],
    "nationality-distribution": ["name", "value"],
    "ban-duration-distribution": ["category", "count", "percentage"],
  };
  for (const [ep, keys] of Object.entries(shapes)) {
    const rows = await getJson(`/api/stats/${ep}`);
    expect(Array.isArray(rows) && rows.length > 0, `${ep} 無資料`);
    for (const k of keys) expect(k in rows[0], `${ep} 缺欄位 ${k}`);
  }
  const p = await getJson("/api/stats/punishment-stats");
  expect(Number.isInteger(p.medalStripped) && Number.isInteger(p.resultsCancelled), "punishment-stats 格式錯誤");
  return `${Object.keys(shapes).length + 1} 個端點`;
});

// ── 教育 / TUE ──────────────────────────────────────────────────────
await check("教育內容端點有資料", async () => {
  const all = await getJson("/api/education");
  expect(all.substances && all.quizzes && all.specialties, "教育總表缺區塊");
  for (const ep of ["/api/education/substances", "/api/education/adrv", "/api/education/quizzes"]) {
    const d = await getJson(ep);
    expect(d && (Array.isArray(d) ? d.length : Object.keys(d).length) > 0, `${ep} 無資料`);
  }
  return "ok";
});

await check("TUE 內容端點有資料", async () => {
  const t = await getJson("/api/tue");
  for (const k of ["basicInfo", "applicationGuide", "diseaseGuides", "tools"]) {
    expect(t[k], `TUE 缺 ${k}`);
  }
  for (const ep of ["/api/tue/basic", "/api/tue/application", "/api/tue/diseases", "/api/tue/tools", "/api/tue/substances"]) {
    await getJson(ep);
  }
  return "ok";
});

await check("TUE 藥物查詢：命中、未命中、輸入驗證", async () => {
  const post = (body) => fetch(BASE + "/api/tue/check", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  const hit = await (await post({ drugName: "prednisolone" })).json();
  expect(hit.matchedKey, "已知藥物未命中");
  expect(typeof hit.needsTUE === "boolean", "needsTUE 格式錯誤");
  const miss = await (await post({ drugName: "這個藥不存在xyz" })).json();
  expect(miss.matchedKey === null && miss.wadaCategory === "未知", "未命中回應格式錯誤");
  expect((await post({})).status === 400, "缺藥名未回 400");
  expect((await post({ drugName: "x".repeat(250) })).status === 400, "過長藥名未回 400");
  return "ok";
});

// ── 回饋（唯一寫入）────────────────────────────────────────────────
await check("回饋：honeypot 靜默丟棄", async () => {
  const r = await fetch(BASE + "/api/feedback", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "rating", rating: 5, website: "bot-filled", elapsedMs: 9000 }),
  });
  expect(r.status === 200, `HTTP ${r.status}`);
  return "200（不洩漏已被擋）";
});

await check("回饋：不合法評分被拒", async () => {
  const r = await fetch(BASE + "/api/feedback", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "rating", rating: 99, elapsedMs: 9000 }),
  });
  expect(r.status === 400, `HTTP ${r.status}`);
  return "400";
});

if (!SKIP_WRITE) {
  await check("回饋：正常送出成功（寫入 D1）", async () => {
    const r = await fetch(BASE + "/api/feedback", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "issue", message: "smoke-test：自動化測試留下，可忽略", page: "/smoke", elapsedMs: 9000 }),
    });
    const j = await r.json();
    expect(r.status === 200 && j.ok === true, `HTTP ${r.status} ${JSON.stringify(j)}`);
    return "ok";
  });
}

// 2026-09-21：遷移時漏搬這條路由，cron-job.org 每天收到 404 才發現。
// 只驗「路由存在且有擋授權」，不帶 secret、不會觸發寄信。
await check("每日彙整信端點存在，且未帶 secret 回 401", async () => {
  const r = await fetch(BASE + "/api/cron/feedback-digest");
  expect(r.status === 401, `HTTP ${r.status}（404 = 路由沒部署）`);
  const bad = await fetch(BASE + "/api/cron/feedback-digest", { headers: { "x-cron-secret": "wrong" } });
  expect(bad.status === 401, `錯誤 secret 應為 401，實得 ${bad.status}`);
  return "401";
});

await check("未知 API 路徑回 404 JSON", async () => {
  const r = await fetch(BASE + "/api/definitely-not-a-route");
  expect(r.status === 404, `HTTP ${r.status}`);
  expect((await r.json()).error, "404 未回 JSON");
  return "404";
});

const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}  (${r.detail})`);
console.log(`\n${results.length - failed.length}/${results.length} passed against ${BASE}`);
process.exit(failed.length ? 1 : 0);
