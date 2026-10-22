# HANDOFF — 2026-10-23：可信來源、三角色學習與正式發布

## 授權與工作範圍

使用者先要求部署，指定選手、教練與醫療人員並重，之後多次要求繼續及「完成後面優化」。本輪完成 B／C／D 的工程、來源結構及維運工作，並按既有授權發布。具名專業簽核、真人研究及真實寄達不能由程式測試替代。

- 第一階段 PR #5 已發布：`5495d6d29c83ba290fd9c967023f2d398397609c`。
- 本輪 PR #6：https://github.com/keanu77/antidopingplatform/pull/6
- 已合併程式版本：`af8a47f2ff3f6319f65648997d6cb322a251ff64`。
- 正式發布流程：https://github.com/keanu77/antidopingplatform/actions/runs/39826544387
- 正式部署與驗證狀態：workflow attempt 2 成功；正式站 SHA 相符，瀏覽器 63/63、唯讀 API 18/18 通過，已直接檢視桌面／手機畫面。
- 完整證據：[release.md](../docs/reviews/2026-10-23-platform/release.md)；交付內容：[implementation.md](../docs/reviews/2026-10-23-platform/implementation.md)。

## 已完成交付

1. 50 成分／16 正式題／70 舊題的來源、效期、責任角色與修訂記錄；未查核或過期停止確定判定。44 成分已核對、6 待補證；69 舊題停止答案及評分。2027 已公布但尚未啟用。
2. 首頁三角色同等入口、每角色 4 任務／5 項列印清單、12 分鐘教練教案、30 案教材、517 案補證隊列。測驗有錯題來源、補學、重做、延後複習及可清除的本機進度，處理開啟中頁面到期。
3. 無障礙 URL 分頁／鍵盤操作、集中 metadata、15 路由與 517 案的實質初始 HTML，保留查核限制；未知頁／案例真正 404。
4. 回饋去重／離線重試／清除佇列，彙整游標與不可變批次、lease、provider idempotency、逾時停止對帳；合成測試不寄真實信。
5. 相容依賴更新、三份 npm audit 零 findings；CI／部署加入三種瀏覽器、axe、HTML 完整性及 gzip 門檻；六小時唯讀監測與最新成功部署 SHA 核對。

## 資料庫與營運

- 正式 `antidoping-feedback` 在 migration 前為完整舊 0002 schema、空 ledger；驗證後補登 0001／0002，再成功套用 additive 0003。
- 部署後再次唯讀核對：原 6 筆回饋 IDs 1–6 保留，切換期間沒有新增回饋；`legacy_through_id=6`、`cursor_id=6`，無 pending batch／寄送成功宣稱。舊資料須人工對帳，不自動重寄。
- 私密 Time Travel bookmark 已取得；沒有執行 restore，不能宣稱還原驗證。
- 所需 Pages secret 名稱已確認存在，未讀取／顯示值；沒有呼叫真實 digest，也沒有測試寄信。
- 操作、回退、資料保存及對帳：[feedback-operations.md](../docs/feedback-operations.md)。

## 驗證與邊界

本機：前端 119、Express 91、Node contracts 105、真正 local D1 migration 4；lint／build／15 路由＋517 案初始 HTML／budget 通過。初始 JS gzip 126,430 bytes、CSS 10,942 bytes，這不是 field CWV。

預覽 https://7b49e7a3.antidoping-platform.pages.dev ：63/63 瀏覽器、18/18 唯讀 smoke 通過；已直接檢視桌面／手機截圖。最終 PR CI 39824324851 attempt 2 通過；第一次 Ubuntu 套件鏡像下載異常緩慢，取消後以相同 commit 重試成功。正式站亦完整通過 63/63 瀏覽器、18/18 唯讀 smoke，版本碼為 af8a47f。正式部署 attempt 1 同樣因 Ubuntu 鏡像下載停滯而取消，attempt 2 成功。手動唯讀監測 [39829286781](https://github.com/keanu77/antidopingplatform/actions/runs/39829286781) 通過；自然排程尚未觀察。

## 原始工作目錄有並行開發，務必保留

本輪隔離工作目錄：`/private/tmp/antidoping-next-20261023`。原始 `/Users/ethanstudio/Documents/Vibe coding/antidopingplatform` 仍有另一項 TFDA 藥品查詢開發，包含 App、Layout、TaiwanDrugLookupCard、package scripts、route metadata 與新 data／worker／測試。嘗試 fast-forward 時 Git 已拒絕，未合併、未安裝依賴、未覆寫；不要 reset、stash 或打包提交那些修改。

原始 checkout 的 local main 在本輪檢查時仍為 `5495d6d`，remote main 已含本次發布。整合 TFDA 時需先保存其 scoped changes，再處理衝突；路由 metadata 現集中於 `frontend/src/data/routeMeta.js`（scripts 路徑是 re-export），需沿用初始 HTML／404／budget／browser 門檻。

## 後續真正未完成事項

- 六項待補證成分與 69 舊題的逐項官方來源審查；2027 規則需正式核對、測試並明確啟用，不能只換年份。
- 具名專業審閱、利益關係揭露、案例補證隊列；不把來源核對等同醫療背書。
- 三角色真人任務、學習前後與延後測量，見 [measurement-plan.md](../docs/reviews/2026-10-23-platform/measurement-plan.md)；尚無研究結果。
- field CWV、自然六小時監測、自然 digest 與 provider／收件匣寄達證據；目前不宣稱。
- 上述有關真實收件、具名審核或真人資料的工作，應取得實際證據後再更新狀態。

## 重現唯讀正式驗證

```sh
SMOKE_BASE_URL=https://antidopingplatform.sportsmedicine.tw EXPECTED_SHA=af8a47f2ff3f6319f65648997d6cb322a251ff64 npm run check:live
SMOKE_BASE_URL=https://antidopingplatform.sportsmedicine.tw SKIP_WRITE=1 npm run smoke
E2E_BASE_URL=https://antidopingplatform.sportsmedicine.tw PLAYWRIGHT_BROWSERS_PATH=/private/tmp/antidoping-playwright-browsers npm --prefix frontend run test:browser
```

瀏覽器測試攔截 `/api/feedback`；不要用正式回饋或 digest 寫入作為 smoke。新環境需先安裝相同 lockfile 依賴與 Playwright Chromium／WebKit。文件提交不觸發正式部署，線上 SHA 應對照最近成功的 `deploy.yml`，不一定等於含交付紀錄的 main 最新 SHA。
