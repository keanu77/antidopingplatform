# 運動禁藥教學平台

提供國際案例搜尋、資料庫分析、禁用清單、TUE 決策工具、測驗及藥檢流程。
正式網站：https://antidopingplatform.sportsmedicine.tw/

## 資料與查核範圍

目前工作版本收錄 517 件教學案例：500 件新增、17 件既有校正／分案。包括違規、污染、合法 TUE、未提出指控與處分撤銷等情境；不能把案例數當作違規人數或盛行率。

500 件新增案例均已取得至少兩個不同模型家族的有效來源對讀，15 件取得四模型回覆；GPT 463 件、Gemini 485 件、Grok 53 件、Claude 29 件。這是對固定來源包的審核覆蓋，不代表所有欄位已證實。22 件已依原文修正文句或來源限制標示，其中 16 件的公開文字在對讀後改動，尚未再次送交模型。完整紀錄見 [全量模型補查](docs/research/2026-09-23-full-audit/README.md)。

2026-09-24 另做 44 件國家來源補查，每件至少兩模型、24 件四模型；43 件已補充官方資料，1 件年齡配對疑義保留。僅靠標題的國家缺口從 258 件降至 **215 件**，另 **7 件日期**疑義重查後仍未消除。43 件中有 27 件僅引用查閱時個人資料所列國家，不能因此認證事件當時代表資格；補審後追加來源或調整註記亦明示未再送模型。這輪限國家與身分欄位，不灌入上一輪完整個案模型數。資料未收錄標示為台灣／中華台北的選手，尚不能宣稱排除條件已逐件獨立核實。見 [官方來源補查](docs/research/2026-09-24-source-followup/README.md)。

2026-10-23 第一階段正式站已驗證 517 件。每次發布仍須以 `/version.json` 與即時 API 比對，不以本機數量推定上線。

- 案例資料：`data/cases.json`
- 案例查核與證據索引：`docs/research/`
- 本次整站檢查：`docs/reviews/2026-09-23-site-audit/`
- 多模型逾時政策：`docs/research/2026-09-23-multi-llm-audit/runtime-policy.json`

## 目前正式架構

React 19 / Vite 前端部署於 Cloudflare Pages，`functions/api/[[path]].js` 提供 Pages Functions API。案例、教育與 TUE 資料在建置時編入；讀取這些資料不需要 MongoDB。使用者回饋寫入 D1 的 `FEEDBACK_DB`，未綁定或儲存失敗會回傳 503，前端不顯示假成功。

`server.js`、`backend/` 的 Express / MongoDB 服務保留作舊架構及測試參考，並非目前正式站的 API。`backend/data/substances.json` 仍是 Pages Functions 共用的藥物規則來源。

## 安裝與本機驗證

需要 Node.js 22.13 以上、npm；Cloudflare 本機環境另需 Wrangler。

```sh
npm ci
npm --prefix frontend ci
npm run cf:build
npx wrangler pages dev frontend/dist
```

使用 Wrangler 輸出的網址（預設 `http://localhost:8788`），才能同時測前端與 Pages Functions。僅執行 Vite preview 不會提供 API。需測試回饋成功時，先在本機初始化 D1：

```sh
npm run cf:migrate
```

`cf:migrate` 預設只操作本機，使用 D1 的 `d1_migrations` 紀錄並只套用待執行版本。若已有未追蹤的 `feedback` 表，指令會停止；先依 [D1 migration 操作說明](docs/d1-migrations.md) 核對版本並明確建立基準，不能直接重跑 SQL。正式操作必須在已授權發布範圍內，先確認還原點、實際 schema 與明確的 `--remote` 目標。

## 資料重建與測試

```sh
npm run data:reviewed
npm run audit:completion
npm run test:reviewed
npm run test:api
npm run test:rules
npm run test:frontend
npm run test:migrations:local
npm --prefix frontend run lint
npm run cf:build
npm run check:budget
npm --prefix frontend exec -- playwright install chromium webkit
npm --prefix frontend run test:browser
```

`npm test` 另跑舊 Express 後端測試，需能啟動 mongodb-memory-server；不可用其通過取代 Pages Functions 測試。`npm run smoke` 為讀取型 API 冒煙檢查，環境變數用法以腳本為準。

## 主要 API

- `GET /api/cases`、`GET /api/cases/:id`、`GET /api/cases/filters/options`
- `GET /api/stats/overview`、`GET /api/stats/review-summary`
- `GET /api/stats/yearly-trends`、`sport-distribution`、`substance-distribution`、`nationality-distribution`、`ban-duration-distribution`
- `GET /api/tue`、`GET /api/tue/substances`、`POST /api/tue/check`
- `GET /api/education/*`（實際支援端點見 Functions 路由）
- `POST /api/feedback`（同站 JSON、大小及流量限制；需 D1）

正式 API 不提供案例新增、修改或刪除；更新資料必須經版本控制與部署。

## 發布

先完成資料與前端檢查，再確認欲發布的 Git 版本。`npm run cf:deploy` 會重新建置並發布 Cloudflare Pages；D1 migration 是獨立動作，不能以發布前端代替。發布後須比對 `/version.json`、`/api/stats/overview` 與案例明細，才可判定正式站與資料版本一致。

MIT License


## 可信內容與學習

- `/sources` 提供 50 成分、16 正式題與 70 舊題的來源／版本／查核狀態。待核對項目停止確定判定；2027 尚未啟用。
- `/learning` 提供選手、教練與醫療人員的任務與列印清單；`/quiz` 提供錯題回顧、補學與本機延後複習。
- `/case-learning` 提供 30 案教材與全 517 案補證隊列；不把模型對讀視為具名專業簽核。
- [回饋與發布維運](docs/feedback-operations.md)、[實際使用者驗證方案](docs/reviews/2026-10-23-platform/measurement-plan.md)。

每個 PR 與 production 發布都執行 Chromium、手機 Chromium、手機 WebKit 的功能／無障礙檢查。六小時唯讀監測檢查版本、API 與主要頁面；工作流執行成功不等於真實使用者 CWV、自然排程寄達或臨床內容簽核。
