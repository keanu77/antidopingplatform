// Build-time SEO 預渲染（純 Node，無瀏覽器依賴，可在 Docker/Alpine 安全執行）。
// 為每條靜態路由產生 dist/<route>/index.html，並注入 per-page 的
// <title> / description / Open Graph / Twitter / canonical meta。
// Static pages use the same React components; every case includes original facts,
// review limits and sources. The client replaces this initial content on startup.

import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { routesMeta, SITE_URL, caseMeta } from "../src/data/routeMeta.js";
import { build } from "esbuild";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "..", "dist");
const templatePath = join(distDir, "index.html");
const readData = (path) => JSON.parse(readFileSync(resolve(__dirname, "../..", path), "utf8"));
const cases = readData("data/cases.json");
const aliases = readData("data/case-aliases.json");
const categories = readData("backend/data/wada-categories.json");
const registry = readData("backend/data/content-registry.json");
const teaching = readData("data/case-teaching.json");
const rendererDir = mkdtempSync(resolve(__dirname, "../node_modules/.prerender-"));
const rendererFile = join(rendererDir, "pages.cjs");
let staticPage;
try {
  await build({ entryPoints: [join(__dirname, "static-pages.jsx")], outfile: rendererFile,
    bundle: true, platform: "node", format: "cjs", jsx: "automatic",
    external: ["react", "react-dom/server", "react-router-dom"],
    define: { "import.meta.env.PROD": "true", "import.meta.env.VITE_API_PORT": '"8080"' } });
  ({ staticPage } = createRequire(import.meta.url)(rendererFile));
} finally { rmSync(rendererDir, { recursive: true, force: true }); }

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const paragraph = (text) => `<p>${escapeHtml(text || "")}</p>`;
const section = (title, text) => `<section><h2>${escapeHtml(title)}</h2>${paragraph(text)}</section>`;
const safeLink = (url, title) => {
  try { if (!/^https?:$/.test(new URL(url, SITE_URL).protocol)) return ""; } catch { return ""; }
  return `<a href="${escapeHtml(url)}">${escapeHtml(title)}</a>`;
};
function pageBody(route, extra = "") {
  return `<main id="main-content" class="max-w-4xl mx-auto p-6 space-y-6"><nav aria-label="主要導覽">${safeLink("/", "首頁")} · ${safeLink("/learning", "三角色學習")} · ${safeLink("/tue?tab=tools", "用藥條件工具")}</nav><h1>${escapeHtml(route.title.split(" | ")[0])}</h1>${paragraph(route.description)}${extra}<p>教育內容須按適用年度及個案情況解讀，不能代替官方商品查詢或 TUE 核准。</p><footer>${safeLink("/sources", "來源與版本")} · ${safeLink("/editorial-policy", "編輯政策與勘誤")}</footer></main>`;
}
function staticBody(route) {
  const rendered = staticPage(route.path);
  if (rendered) return rendered;
  let extra = "";
  if (["/education", "/prohibited-list"].includes(route.path)) extra = categories.map((c) => section(c.category, c.description)).join("");
  else if (route.path === "/cases") extra = `<ul>${cases.map((c) => `<li>${safeLink(`/cases/${c.id}`, `${c.athleteName}（${c.year}）`)} ${escapeHtml(c.summary || "")}</li>`).join("")}</ul>`;
  else if (route.path === "/case-learning") extra = teaching.records.map((c) => `<article><h2>${safeLink(`/cases/${c.caseId}`, c.title)}</h2>${paragraph(c.facts)}${section("教學重點", c.learningPoint)}${section("查核限制", c.uncertainty.join("；"))}${paragraph(c.ruleYearNote)}</article>`).join("");
  else if (route.path === "/sources") extra = `<p>${escapeHtml(registry.professionalApprovalNote)}</p><ul>${Object.values(registry.sources).map((source) => `<li>${safeLink(source.url, source.title)} — ${escapeHtml(source.publisher)}</li>`).join("")}</ul>`;
  else if (route.path === "/statistics") {
    const sports = Object.entries(cases.reduce((out, c) => { out[c.sport || "未知"] = (out[c.sport || "未知"] || 0) + 1; return out; }, {})).sort((a,b)=>b[1]-a[1]);
    extra = `${section("資料範圍", `本資料集收錄 ${cases.length} 件教學案例，包含未成立違規與合法治療情境，不能當作違規人數或盛行率。`)}<table><caption>收錄案例的運動項目分布</caption><thead><tr><th>運動項目</th><th>案例數</th></tr></thead><tbody>${sports.map(([sport,count])=>`<tr><td>${escapeHtml(sport)}</td><td>${count}</td></tr>`).join("")}</tbody></table>`;
  } else extra = `<section><h2>依你的角色開始</h2><ul><li>${safeLink("/learning?role=athlete", "選手：查藥、藥檢權利與賽前準備")}</li><li>${safeLink("/learning?role=coach", "教練：12 分鐘團隊短課與支援責任")}</li><li>${safeLink("/learning?role=medical", "醫療人員：途徑條件與 TUE 文件")}</li><li>${safeLink("/case-learning", "使用 30 案教材討論角色行動")}</li><li>${safeLink("/quiz", "完成測驗與錯題複習")}</li></ul>${paragraph(`收錄 ${cases.length} 件教育案例。44 項藥物已核對指定規則來源，6 項待補證據；查無資料或待核對不代表允許。`)}${safeLink("https://www.check-antidoping.org.tw/", "TADA 官方藥物查詢")}</section>`;
  return pageBody(route, extra);
}
function caseBody(item) {
  const review = item.review || {};
  const limits = [review.scope, ...(review.auditNotes || [])];
  const comparison = review.sourceComparison;
  if (comparison?.unresolvedSourceFields?.length) limits.push(`仍待查核欄位：${comparison.unresolvedSourceFields.join("、")}`);
  if (comparison?.claimsChangedAfterReview) limits.push("公開文字於來源對讀後有變更，尚未再次對讀。");
  return pageBody(caseMeta(item), `${section("已知事實", item.eventBackground || item.summary)}${section("程序與處理結果", review.outcome || item.punishment?.banDuration)}${section("教學重點與限制", item.educationalNotes)}${section("查核狀態", review.status || "未確認")}${section("查核範圍", limits.filter(Boolean).join("；"))}${paragraph("歷史案例適用事件當年規範，不能以現行清單倒推個案。")}<section><h2>來源</h2><ul>${(item.sourceLinks || []).map((source) => `<li>${safeLink(source.url, source.title)}</li>`).join("")}</ul></section>`);
}

// 以屬性鍵定位、只替換 content 值。使用「替換函式」而非字串，
// 因此 (a) 替換值中的 $ 不會被當成特殊序列（$&、$1…），(b) 可逐條偵測是否真的命中。
function injectMeta(template, { title, description, url }) {
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  const u = escapeHtml(url);
  const keep = (m, p1, p2, value) => `${p1}${value}${p2}`;

  const rules = [
    ["title", /<title>[\s\S]*?<\/title>/, () => `<title>${t}</title>`],
    [
      "description",
      /(<meta name="description" content=")[^"]*("\s*\/?>)/,
      (m, p1, p2) => keep(m, p1, p2, d),
    ],
    [
      "og:title",
      /(<meta property="og:title" content=")[^"]*("\s*\/?>)/,
      (m, p1, p2) => keep(m, p1, p2, t),
    ],
    [
      "og:description",
      /(<meta property="og:description" content=")[^"]*("\s*\/?>)/,
      (m, p1, p2) => keep(m, p1, p2, d),
    ],
    [
      "og:url",
      /(<meta property="og:url" content=")[^"]*("\s*\/?>)/,
      (m, p1, p2) => keep(m, p1, p2, u),
    ],
    [
      "twitter:title",
      /(<meta name="twitter:title" content=")[^"]*("\s*\/?>)/,
      (m, p1, p2) => keep(m, p1, p2, t),
    ],
    [
      "twitter:description",
      /(<meta name="twitter:description" content=")[^"]*("\s*\/?>)/,
      (m, p1, p2) => keep(m, p1, p2, d),
    ],
    [
      "canonical",
      /(<link rel="canonical" href=")[^"]*("\s*\/?>)/,
      (m, p1, p2) => keep(m, p1, p2, u),
    ],
  ];

  const missed = [];
  let html = template;
  for (const [key, pattern, replacer] of rules) {
    let hit = false;
    html = html.replace(pattern, (...args) => {
      hit = true;
      return replacer(...args);
    });
    if (!hit) missed.push(key);
  }
  return { html, missed };
}

let template;
try {
  template = readFileSync(templatePath, "utf8");
} catch {
  console.error(
    `[prerender] 找不到 ${templatePath}，請先執行 vite build 再執行本腳本。`,
  );
  process.exit(1);
}

const failed = [];
let count = 0;

function emit(routePath, { title, description, url }, outPath, body, postProcess) {
  const result = injectMeta(template, { title, description, url });
  // 健全性檢查：8 條注入只要任一條沒命中（模板格式變動），就讓 build 紅燈，
  // 不可靜默出貨保留首頁值的錯誤 meta。
  if (result.missed.length) {
    failed.push(`${routePath} → 未注入: ${result.missed.join(", ")}`);
    return;
  }
  if (!result.html.includes('<div id="root"></div>')) throw new Error("Prerender root placeholder missing");
  const withBody = result.html.replace('<div id="root"></div>', () => `<div id="root">${body}</div>`);
  const html = postProcess ? postProcess(withBody) : withBody;
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html, "utf8");
  count++;
}

// 1) 靜態路由
for (const route of routesMeta) {
  const url = route.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${route.path}`;
  const outPath =
    route.path === "/"
      ? join(distDir, "index.html")
      : join(distDir, route.path, "index.html");
  emit(route.path, { title: route.title, description: route.description, url }, outPath, staticBody(route));
}

// Dataset is bundled at build time: every known case can have real initial content.
for (const item of cases) {
  if (!/^[a-zA-Z0-9_-]+$/.test(String(item.id))) throw new Error("Unsafe case ID");
  const meta = caseMeta(item);
  emit(meta.path, { ...meta, url: `${SITE_URL}${meta.path}` }, join(distDir, meta.path, "index.html"), caseBody(item));
}
const notFound = { path: "/404", title: "頁面未找到 | 乾淨運動從你我開始", description: "找不到此頁面。請返回首頁或使用案例搜尋。" };
emit("/404", { ...notFound, url: `${SITE_URL}/404` }, join(distDir, "404.html"), pageBody(notFound), (html) => html.replace("</head>", '<meta name="robots" content="noindex, follow" /></head>'));
// Preserve historical aliases as permanent redirects, without a wildcard SPA rewrite.
writeFileSync(join(distDir, "_redirects"), Object.entries(aliases).map(([from, to]) => `/cases/${from} /cases/${to} 301`).join("\n") + "\n");
const paths = [...routesMeta.map((r) => r.path), ...cases.map((c) => `/cases/${c.id}`)];
writeFileSync(join(distDir, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${SITE_URL}${escapeHtml(path)}</loc></url>`).join("")}</urlset>`);
console.log(`[prerender] 已產生 ${count} 個具正文的 HTML；未知路徑使用 HTTP 404`);

if (failed.length) {
  console.error(
    `[prerender] 失敗（模板格式可能已變動）：\n  - ${failed.join("\n  - ")}`,
  );
  process.exit(1);
}
