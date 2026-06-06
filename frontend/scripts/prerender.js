// Build-time SEO 預渲染（純 Node，無瀏覽器依賴，可在 Docker/Alpine 安全執行）。
// 為每條靜態路由產生 dist/<route>/index.html，並注入 per-page 的
// <title> / description / Open Graph / Twitter / canonical meta。
// 另產生 dist/cases-detail.html 作為 /cases/:id 動態頁的通用 SEO fallback。
// 主體仍是同一個 SPA，載入後由 React Router 接管渲染；差別只在初始 HTML 的 meta，
// 讓不執行 JS 的社群爬蟲（FB / LINE / Twitter）與搜尋引擎能抓到正確的每頁資訊。

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { routesMeta, SITE_URL } from "./routes-meta.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "..", "dist");
const templatePath = join(distDir, "index.html");

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

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

function emit(routePath, { title, description, url }, outPath, postProcess) {
  const result = injectMeta(template, { title, description, url });
  // 健全性檢查：8 條注入只要任一條沒命中（模板格式變動），就讓 build 紅燈，
  // 不可靜默出貨保留首頁值的錯誤 meta。
  if (result.missed.length) {
    failed.push(`${routePath} → 未注入: ${result.missed.join(", ")}`);
    return;
  }
  const html = postProcess ? postProcess(result.html) : result.html;
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
  emit(route.path, { title: route.title, description: route.description, url }, outPath);
}

// 2) /cases/:id 動態頁通用 fallback。每筆案例的實際 URL 在 build 時未知，
//    故移除 og:url 與 canonical（避免指向錯誤頁；爬蟲改用實際抓取的 URL）。
emit(
  "/cases/:id (fallback)",
  {
    title: "運動禁藥案例詳情 | 乾淨運動從你我開始",
    description:
      "查看此運動禁藥違規案例的選手、違規物質、WADA 分類、處罰結果與新聞／官方來源連結。",
    url: `${SITE_URL}/cases`,
  },
  join(distDir, "cases-detail.html"),
  (html) =>
    html
      .replace(/[ \t]*<meta property="og:url"[^>]*>\n?/, "")
      .replace(/[ \t]*<link rel="canonical"[^>]*>\n?/, ""),
);

console.log(`[prerender] 已產生 ${count} 個 SEO HTML（含 1 個動態案例 fallback）`);

if (failed.length) {
  console.error(
    `[prerender] 失敗（模板格式可能已變動）：\n  - ${failed.join("\n  - ")}`,
  );
  process.exit(1);
}
