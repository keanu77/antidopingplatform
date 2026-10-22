# 可信內容與三角色學習平台 Implementation Plan

> **For agentic workers:** Use subagent-driven-development; each implementation receives a separate spec review and code-quality review before release.

**Goal:** 完成評估報告 B、C、D 可由程式與公開來源交付的優化，保留真人研究及具名專業簽核的真實狀態。

**Architecture:** 保留 React / Cloudflare Pages Functions 與既有案例資料。共用內容登錄表供工具、測驗、角色路徑及來源頁使用；年度規則需明確啟用，不能按日期換字即視為完成法規更新。匿名學習進度只存本機，不收集用藥個資。

**Tech Stack:** React 19, JavaScript, Vite, Tailwind, Vitest, Node contract tests, Cloudflare Pages / D1.

## 0. 第一階段發布
- [x] 使用者確認繼續，合併 PR #5：5495d6d。
- [x] CI 39817704603 成功、production SHA 5495d6d 相符、唯讀 smoke 18/18。

## 1. B：可信內容結構
Files: new shared content registry / frontend source components and policy page; substances, quiz metadata, TUE verdict integration; content audit scripts/tests.
- [x] 逐一覆蓋 50 成分及 16 題的官方來源、章節、適用年、生效日、查核狀態、下次複核、責任角色、修訂記錄；另盤點 API 題庫，避免遺漏。
- [x] 工具結果與題目解析一操作可見來源。來源不足、版本過期、未啟用版本不得給確定允許；日期邊界有測試。
- [x] 官方核對 2027 公告，建立現行／預告資訊與切換檢查；不自行推定尚未核對之新規則。
- [x] 公開編輯政策、勘誤及利益衝突揭露狀態，不虛構審閱人或認證。
- [x] 依現有查核資料產生補證隊列，保留 unknown，明確責任角色與優先次序；精選約 30 案教材使用原始證據與程序狀態，避免把合法 TUE 當違規。
- [x] meaningful tests → implementation → tests/lint → scoped commit → independent spec review → quality review.

## 2. C：三角色學習產品
Files: Home, new learning data/page, Quiz and progress utility, TUE/Education tabs, shared accessible tabs, route metadata, prerender, case details.
- [x] 首頁三角色同等入口，每角色至少 3 項具體任務與可列印準備清單，連到正確工具分頁、官方資源及教材。
- [x] 測驗能力／角色標籤、錯題回顧、補學連結、延後複習、本機可清除紀錄；保留題目與作答配對、避免完成頁重洗題。
- [x] TUE / 教育 tabs 支援 URL、方向鍵、Home/End、ARIA panel 關聯；不把用藥個資放 URL。
- [x] 各路由及每案 title / canonical / description 一致，初始 HTML 有實質內容；未知路由／案例正確 404。
- [x] 三角色各 3 項工程任務驗證；真人成功率／耗時／學習前後研究需另外收集，不冒充。
- [x] tests/lint/build → scoped commit → spec review → quality review.

## 3. D：維運與發布門檻
Files: feedback frontend/API, D1 migrations, digest/email, tests, workflows, dependency locks, README/CLAUDE, monitoring/performance scripts.
- [x] 回饋 request ID 與重試去重；彙整成功游標、固定窗口、provider idempotency、延遲補送；合成測試不得寄真實信。
- [x] 相容依賴更新；不使用 audit fix --force，記錄剩餘風險之可達性。
- [x] 固定關鍵 browser journeys (Chrome + WebKit/mobile CI)、唯讀監測與版次檢查、效能基線，保留測試輸出。
- [x] 文件以 Pages runtime 為主，legacy 清楚分隔；發布、回退及資料保存／勘誤流程可執行。
- [x] 本機合成 migration / tests → preflight → preview → browser verification → PR / merge / deploy → live SHA + smoke。

## 完成證據與限制
每項交付記錄實際測試與版本。無法以自動化替代的外部具名專業審閱、真人使用者研究、真實 CWV、自然排程寄達及長期追蹤，列出所需資料與研究方式；不宣稱已完成。
