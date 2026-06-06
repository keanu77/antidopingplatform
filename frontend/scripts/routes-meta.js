// 單一事實來源：每條「靜態」路由的 SEO meta。
// build 後由 scripts/prerender.js 讀取，為每條路由產生含 per-page meta 的 HTML。
// 動態路由（/cases/:id）不在此列，會回退到首頁 meta 的 index.html。

export const SITE_URL = "https://antidopingplatform.sportsmedicine.tw";
export const SITE_NAME = "乾淨運動從你我開始";

export const routesMeta = [
  {
    path: "/",
    title: "乾淨運動從你我開始 | 運動禁藥案例資料庫",
    description:
      "全球運動禁藥違規案例搜尋、WADA 禁用清單、互動測驗、藥檢流程與 TUE 申請指南，協助選手、教練與醫療人員了解反禁藥規範。",
  },
  {
    path: "/cases",
    title: "案例搜尋 | 乾淨運動從你我開始",
    description:
      "依運動項目、國籍、年份、禁藥類別與處罰結果，搜尋全球運動禁藥違規案例，每筆附 WADA 分類與新聞／官方來源連結。",
  },
  {
    path: "/statistics",
    title: "數據統計 | 乾淨運動從你我開始",
    description:
      "以互動圖表呈現運動禁藥案例的運動項目、禁藥類別與處罰程度分布，以及歷年違規趨勢。",
  },
  {
    path: "/education",
    title: "教育專區 | 乾淨運動從你我開始",
    description:
      "WADA 禁用物質分類完整指南與互動測驗，認識各類禁藥的作用、健康風險與反禁藥規範。",
  },
  {
    path: "/tue",
    title: "TUE 治療用途豁免指南 | 乾淨運動從你我開始",
    description:
      "治療用途豁免（TUE）申請流程、常見疾病用藥指引、藥物查詢工具與申請前檢查清單，協助合法用藥的選手與醫師。",
  },
  {
    path: "/prohibited-list",
    title: "禁用清單 | 乾淨運動從你我開始",
    description:
      "WADA 運動禁藥禁用清單分類速查，快速了解各類別（S0–S9、M1–M3、P1）的禁用物質與方法。",
  },
  {
    path: "/quiz",
    title: "反禁藥互動測驗 | 乾淨運動從你我開始",
    description:
      "透過知識題與情境題的互動測驗，檢視你對運動禁藥規範、TUE 與藥檢流程的了解程度。",
  },
  {
    path: "/testing-process",
    title: "藥檢流程說明 | 乾淨運動從你我開始",
    description:
      "從通知、採樣到結果管理，完整說明運動禁藥檢測的標準流程，以及受檢選手應有的權益與注意事項。",
  },
  {
    path: "/news",
    title: "最新消息 | 乾淨運動從你我開始",
    description: "運動禁藥相關的最新違規案例、規範更新與反禁藥組織公告整理。",
  },
  {
    path: "/resources",
    title: "資源連結 | 乾淨運動從你我開始",
    description:
      "WADA、各國反禁藥組織與運動醫學的延伸學習、查詢與申訴資源連結彙整。",
  },
];
