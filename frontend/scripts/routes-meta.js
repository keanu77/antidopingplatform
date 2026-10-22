// 單一事實來源：每條「靜態」路由的 SEO meta。
// build 後由 scripts/prerender.js 讀取，為每條路由產生含 per-page meta 的 HTML。
// 動態路由（/cases/:id）不在此列，會回退到首頁 meta 的 index.html。

export const SITE_URL = "https://antidopingplatform.sportsmedicine.tw";
export const SITE_NAME = "乾淨運動從你我開始";

export const routesMeta = [
  {
    path: "/herbal-search",
    title: "中藥商品與來源查詢 | 乾淨運動從你我開始",
    description: "依商品名或健保藥品代碼查詢健保署中藥品項資料，核對方名、製造廠與收載資訊；完整處方與禁用風險須另行查證。",
  },
  {
    path: "/supplement-search",
    title: "營養品與食品登錄查詢 | 乾淨運動從你我開始",
    description: "搜尋 TFDA 健康食品與輸入錠膠囊食品登錄資料。食品許可不等於運動禁藥認證，產品配方與批號檢測須另行核對。",
  },
  {
    path: "/drug-search",
    title: "台灣西藥商品與禁用成分查詢 | 乾淨運動從你我開始",
    description: "依商品名、英文成分或許可證字號搜尋 TFDA 西藥開放資料，核對配方與 WADA 2026 使用條件；未對應成分保留待確認。",
  },
  {
    path: "/",
    title: "乾淨運動從你我開始 | 運動禁藥案例資料庫",
    description:
      "全球運動禁藥防制教學案例搜尋、WADA 禁用清單、互動測驗、藥檢流程與 TUE 申請指南，協助選手、教練與醫療人員了解運動禁藥防制規範。",
  },
  {
    path: "/cases",
    title: "案例搜尋 | 乾淨運動從你我開始",
    description:
      "依運動項目、國籍、年份、禁藥類別與處罰結果，搜尋全球運動禁藥防制教學案例，每筆標示查核層級與官方資料來源。",
  },
  {
    path: "/statistics",
    title: "數據統計 | 乾淨運動從你我開始",
    description:
      "以互動圖表呈現運動禁藥案例的運動項目、禁藥類別與處罰程度分布，以及收錄案例的年份分布。",
  },
  {
    path: "/education",
    title: "教育專區 | 乾淨運動從你我開始",
    description:
      "WADA 禁用物質分類完整指南與互動測驗，認識各類禁藥的作用、健康風險與運動禁藥防制規範。",
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
    title: "運動禁藥防制互動測驗 | 乾淨運動從你我開始",
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
    description: "運動禁藥相關的最新違規案例、規範更新與運動禁藥管制組織公告整理。",
  },
  {
    path: "/resources",
    title: "資源連結 | 乾淨運動從你我開始",
    description:
      "WADA、各國運動禁藥管制組織與運動醫學的延伸學習、查詢與申訴資源連結彙整。",
  },
];
