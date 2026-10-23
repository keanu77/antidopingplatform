# HANDOFF — 2026-10-23：三類查詢已正式發布

使用者指示「請把這些內容部署到網站」，本次發布及驗收已完成；先前沒有push／部署授權的歷史限制已由此指示取代。覆蓋率維持97.01%，依使用者先凍結再查驗的要求，沒有繼續擴充至99%。

## 正式版本

- 網站：https://antidopingplatform.sportsmedicine.tw；入口 `/drug-search`、`/herbal-search`、`/supplement-search`。
- 正式程式SHA `eca41a39a97abee1321c0cb3935d2bbebe22395c`，PR #8已合併；部署workflow `39928791496` 成功。Cloudflare部署ID `80413963-b7c1-4824-b874-b441a10cd52c`，固定網址 https://80413963.antidoping-platform.pages.dev 。
- 公開網域version.json、78項正式網站瀏覽器測試（桌機Chromium、手機Chromium、手機WebKit）全數通過；部署流程另有完整78項瀏覽器測試與18項唯讀API smoke通過。三裝置截圖已實際查看。
- 最終前端175、後端91、Python42、Node147、本機D1遷移4項，lint、build、容量與HTML檢查均通過。保留其他工作階段PR #7的核對日期／來源有效性修正。
- 必要secret名稱齊全；正式D1三項migration已套用、schema相符，6筆回饋ID1–6與部署前一致。API同源限制、未授權拒絕、DNS及TLS均驗證。沒有有效回饋寫入、實際寄信或臨床核准證據。
- 緊鄰可回復前版 `f77d4ee4d5f62361d78fa447ba32346dc7c4e3d1`，部署ID `0d755bfa-59c0-4aed-ba8d-9ee09876836b`，https://0d755bfa.antidoping-platform.pages.dev 。沒有新增正式schema或金鑰。

## 工作樹與資料邊界

- 發布工作樹 `/private/tmp/antidoping-drug-release-20261023`，分支 `release/drug-catalog-20261023`。正式程式已在遠端main；最後文件提交不觸發部署，因此main文件HEAD可高於正式程式SHA，勿誤判為部署落後。
- 原工作樹 `/Users/ethanstudio/Documents/Vibe coding/antidopingplatform` 仍為 `feat/taiwan-drug-search`／`040e04aa427faaa063729f28cf2d5081509c6149`，保留原有未提交規則、查驗及無關文件。本次只回寫交接／發布紀錄與驗收artifacts，不重設、不清理、不git add -A。
- 西藥66,522筆、中藥10,046筆、食品7,972筆。名稱覆蓋19,282／19,876＝97.01%；含缺成分來源分母22,509則85.66%，不是安全性或準確率。
- 固定500筆查驗373可直接比較且二元一致、17未定、84來源條件、2配方衝突、24未取得參考。330補充情境原有riociguat／CMAS潛在誤判；正式版已保留需確認，但官方聯盟適用仍待裁定。保留基礎來源待審與S9劑量條件，沒有回寫凍結結果成為通過。
- 原始凍結版 `artifacts/drugs/checkpoint-9701-20261023/` 與第二輪 `artifacts/drugs/tada-validation-9701-round2-20261023/`、各自tar.gz／round2-v2備份皆保留；26凍結檔SHA重核不變。歷史交接已原樣存於 `docs/handoffs/2026-10-23-drug-coverage.md`。
- 新版對固定500的1,000個賽內外判定有88個改為保留（70未定、18條件）；330補充情境34個變為保留。兩組均沒有新增無限制判讀。這是版本比較，不是新版獨立準確率。

## 月度更新

`.github/workflows/drug-data-update.yml` 已在main啟用，每月1日台灣09:17（UTC `17 1 1 * *`）；config可切季度。首次手動run `39928979491` 成功，66,522筆、差異0、coverage gate通過，候選artifact已下載核對SHA及report。狀態`ready-for-review`、`applied:false`、`productionDeployed:false`，沒有替換正式來源。自然排程尚未到期，不能稱已觀察。只更新西藥候選；中藥、食品與禁藥規則仍需另行審核更新。

## 證據與後續

詳細公開發布紀錄 `docs/research/2026-10-23-drug-system/release.md`。完整驗收在原工作樹 `artifacts/drugs/release-20261023/`，包含deployment-receipt、workflow／browser logs、四份正式環境檢查、三裝置截圖、完整Playwright報告、月度update-report／diff與凍結版本比較。CI第一次因Ubuntu鏡像下載停滯而取消，改官方archive及有限逾時後通過；沒有跳過測試。

部署沒有未完成步驟。後續若使用者要求維護：

1. 先讀上述release.md並核對遠端main、正式version.json；勿從舊開發工作樹直接覆蓋正式版本。
2. 下次月度更新後讀候選update-report／diff並核對coverage gate，審核後才另版發布。`npm run drugs:update`不代表已部署。
3. 讀 `riociguat-cmas-review.md` 與第二輪查驗報告；取得聯盟主要來源或裁定後另版修正。WADA2026期限2026-12-31，2027規則尚未匯入；不能為延續判讀而自動延長年份。
