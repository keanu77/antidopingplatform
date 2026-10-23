# HANDOFF — 2026-10-23：repo-launch 已發布

## 最新狀態：repo 文件與分享入口

使用者要求依 repo-launch 整理 repo，已完成文件、示範媒體、GitHub 設定與首個 release。應用程式、原始資料與判讀邏輯沒有更動。

- Release `v1.0.0`：https://github.com/keanu77/antidopingplatform/releases/tag/v1.0.0 ，tag 目標 `92ec1ce90bb84bf567055bb656490500957ca3cc`，四個媒體附件均 uploaded。
- 最新整理工作樹 `/private/tmp/antidoping-repo-launch-20261023`，分支 `docs/repo-launch-20261023`；main 已快轉。原工作樹仍保留舊開發分支與未提交研究，不要直接從該分支發布。舊發布工作樹 `/private/tmp/antidoping-drug-release-20261023` 目前也比 main 的文件版本舊。
- 中英文 README 改為現行西藥範圍與可複製的 Pages 快速開始；原案例查核文字保存到 `docs/data-review-history.md`，三類查詢／97%歷史研究加上現況入口。新增開發、資料維護與授權來源指南、MIT 授權檔、CONTRIBUTING、SECURITY、CHANGELOG。
- 正式網站 Demo 沿用 Cloudflare。GitHub homepage、description、12 topics 及 private vulnerability reporting 已更新並讀回；GitHub 已辨識 MIT。公開 repo 的 README GIF、網站與英文連結經 Chromium 實際驗證。
- 全新隔離 Ubuntu 24.04 ARM64，Node22.23.4／npm10.9.9，從公開 clone 完成安裝與build；175前端、22API、13規則、18smoke、lint／HTML／容量及本機D1 migration通過，未配置正式帳號／金鑰／MongoDB。測試 source SHA ed606f9 的程式與鎖檔在此次文件發布中未改。
- 媒體為26.7秒MP4、12秒teaser、約0.83MB GIF及1280×640分享圖；Chromium與WebKit均播放到結束。`docs/launch/`有來源腳本、發布說明與未發布分享草稿。
- 正式程式仍是 `ca699133454a2c493e34ee216a572a35169853da`／https://7a2ff325.antidoping-platform.pages.dev 。只有docs與Markdown變更，沒有再次部署；main文件HEAD、release tag與正式程式SHA不同是刻意的範圍區別。
- 詳細驗證 `docs/launch/verification.md`；完整本機證據 `artifacts/drugs/repo-launch-20261023/`。原工作樹只同步這次新的README／政策／指南／媒體與交接，既有研究修改保留。
- 人工收尾：repo-launch明示社群預覽圖與X／FB貼文由使用者手動處理。預覽圖位於`docs/launch/social-preview.png`，到GitHub Settings → General → Social preview上傳；目前仍是GitHub預設圖，不能稱已套用。X／FB只有草稿，沒有代發。
- 專用VM `antidoping-launch-20261023` 已停止、證據已匯出；已依skill詢問是否刪除，未獲回覆前保留，不能刪除其他VM。

## 前一次網站發布：西藥查詢與明細精簡


## 最新狀態（取代下方歷史版本的查詢入口）

使用者明確要求「只有查詢的部分移除中藥跟營養品」，已部署完成。商品查詢只保留西藥；教育頁「補充劑安全」及中藥／營養品相關教育內容保留。西藥成分明細不再逐項重複TADA連結與內部查核說明，底部「前往 TADA 核對商品」保留。先前要求移除的總數、覆蓋率與TADA驗證摘要仍未顯示。

- 網站 https://antidopingplatform.sportsmedicine.tw/drug-search 。正式程式SHA `ca699133454a2c493e34ee216a572a35169853da`，workflow `39935480312`成功；公開version.json一致，builtAt `2026-10-23T09:59:03.924Z`。固定部署 https://7a2ff325.antidoping-platform.pages.dev 。
- 發布工作樹 `/private/tmp/antidoping-drug-release-20261023`，目前分支 `fix/western-drug-focus-20261023`。原工作樹仍是舊開發分支，僅回寫紀錄與證據，勿直接從原工作樹覆蓋正式版本。
- `9e504ef`移除中藥／營養品查詢路由、入口與生成的公開搜尋資料；原始`data/products/`保留，離線worker測試可明確使用`--include-archived-catalogs`。正式build會清除該產物。西藥資料與判讀邏輯未改，pending紀錄沒有改為專業核准。
- 首次公開驗收12通過、3失敗：舊查詢頁已404，但自訂網域兩個舊manifest仍有快取；固定部署與帶新參數請求皆404。局部Cache Purge因現有OAuth欠缺權限回401，未清除其他快取、未索取憑證。`ca69913`增加`functions/product-data/[[path]].js`固定回404／no-store，已直接驗證不帶參數的兩個舊manifest回404，舊查詢頁亦404。
- 最終CI完整通過，含78項瀏覽器旅程及18項唯讀smoke；部署後公開網站15項查詢測試通過（59.1秒），包含三裝置、保留教育tab、底部TADA連結與停用舊路徑。桌機及手機明細截圖已查看。沒有D1修改、有效回饋寫入、寄信或新增臨床核准。
- 詳細紀錄 `docs/research/2026-10-23-drug-system/western-only.md`，證據 `artifacts/drugs/western-only-20261023/`。沒有未完成的發布步驟。完整前版`e3c39c4`／https://6ee796fe.antidoping-platform.pages.dev 可回復，但會恢復舊查詢；`9e504ef`版本缺少此次快取路徑修正。
- 文件補記不觸發部署，main文件HEAD可能較程式SHA新。下方三類查詢入口與當時分支均是歷史資訊，不能當作現況。後續維護應先核對本段、遠端main與正式version.json；不要恢復已移除的統計摘要或中藥／營養品查詢。

## 前一次三類查詢發布背景

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
