// 單一事實來源：每條「靜態」路由的 SEO meta。
// build 後由 scripts/prerender.js 讀取，為每條路由產生含 per-page meta 的 HTML。
// 案例 meta 由 build 與詳情頁依資料產生。

export const SITE_URL = "https://antidopingplatform.sportsmedicine.tw";
export const SITE_NAME = "乾淨運動從你我開始";

export const routesMeta = [
  { path: "/adel", title: "ADEL 官方學習資源 | 乾淨運動從你我開始", description: "選手、教練與醫療人員的 WADA ADEL 官方課程入口；本站測驗紀錄與官方證明分開。" },
  { path: "/sources", title: "內容來源與版本 | 乾淨運動從你我開始", description: "查詢每個用藥結論與測驗答案的官方來源、適用年度、生效日期及查核狀態。" },
  { path: "/editorial-policy", title: "編輯政策與勘誤 | 乾淨運動從你我開始", description: "了解本站的來源選擇、查核範圍、年度更新、利益衝突揭露狀態與錯誤更正流程。" },
  { path: "/case-learning", title: "案例教材與補證進度 | 乾淨運動從你我開始", description: "從精選案例辨識程序、證據與角色行動；查看仍待補證的欄位，避免將合法治療與違規混為一談。" },
  { path: "/learning", title: "選手、教練與醫療人員學習路徑 | 乾淨運動從你我開始", description: "依你的角色完成查藥、賽前準備、藥檢及 TUE 文件任務，使用可列印清單與錯題複習。" },
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

export function caseMeta(item) {
  return { path: `/cases/${item.id || item._id}`, title: `${item.athleteName} | 乾淨運動從你我開始`, description: (item.eventBackground || item.summary || "查看案例事實、程序、查核限制與來源。").slice(0, 180) };
}
