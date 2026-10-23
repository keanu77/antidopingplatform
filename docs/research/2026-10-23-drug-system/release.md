# 三類商品查詢發布紀錄

2026-10-23。使用者已明確要求將這批內容部署網站；先前「未授權發布」的交接限制已被此指示取代。

發布工作位於隔離分支 `release/drug-catalog-20261023`，以 `a584e84` 正式主分支為基礎整合 `feat/taiwan-drug-search` 與 97.01% 規則。原始開發工作樹、97.01% 凍結快照與查驗證據不改動。

- 西藥 66,522 筆、中藥 10,046 筆、食品登錄 7,972 筆。新功能使用靜態 JSON 與瀏覽器 worker，無正式 D1 schema 變更。
- 名稱覆蓋 19,282／19,876＝97.01%；含缺少成分許可證的分母 22,509，比例 85.66%。不是安全性或準確率。
- 網頁公開固定 500 筆查驗摘要：476 筆參考，373 可直接比較且一致，17 未定、84 參考附條件、2 配方衝突、24 未取得參考。摘要明示快照版本、非目前版本重新抽樣、非獨立臨床驗證。
- 保留正式主分支的來源審核狀態。paracetamol 等基礎來源待核對時不藉商品名稱對應繞過；公開 TUE 評估仍須通過來源及日期檢查。
- 所有糖皮質激素吸入／局部例外均需確認核准劑量與適應症，與既有正式站一致；依 [WADA 2026 第19頁](https://www.wada-ama.org/sites/default/files/2025-09/2026list_en_final_clean_september_2025.pdf)。
- Riociguat 的 CMAS 適用仍待裁定。未選運動／CMAS 情境均保留需確認，不宣稱它是 PDE5 抑制劑或已裁定禁用；未更改歷史結果。
- 西藥更新工作流程每月 1 日台灣 09:17 產生候選、差異與品質報告，保留90天。config 可改季度。候選不自動覆寫正式資料；規則更新仍需來源審核。

## 與凍結版比較

固定 500 筆、1,000 個賽內外判定：88 個改為保留判讀（70 個 unresolved、18 個 conditional）；330 個補充情境有34個保留判讀的改變，其中包含riociguat。兩組均沒有新增 no-listed-restriction。這是版本變更檢查，不是獨立準確率驗證。逐筆差異保存在原工作樹 `artifacts/drugs/release-20261023/`，未改動凍結來源。

## 發布前驗證

- 前端173、後端91、Python42、Node141、實際本機D1遷移4項通過。
- ESLint、建置與既有檔案大小門檻通過。主載入JS gzip約127KB、CSS約11KB；來源證據分成可快取的獨立區塊，未提高上限。
- 18個靜態路由、517個案例正文／來源範圍與404檢查通過。
- 專案為JavaScript，無TypeScript設定；不宣稱已執行TypeScript型別檢查。
- 瀏覽器：既有63項通過；新增15項在修正測試的select定位後全數通過（桌機Chromium、手機Chromium、手機WebKit）。初次缺少對應瀏覽器快取，安裝後重跑；不把未啟動的測試算通過。
- 正式執行依賴npm audit：前端與根目錄均0項漏洞；沿用主分支lockfile，未升級套件。
- 26個凍結快照檔案SHA逐一重核無變更。
- PR #8 合併前 CI（39928028474）及正式部署流程（39928791496）均通過完整78項瀏覽器測試。兩次均包含其他工作階段先合併的PR #7日期／來源有效性修正，最終測試數為前端175、後端91、Python42、Node147、本機D1遷移4項。

## 正式部署

- [PR #8](https://github.com/keanu77/antidopingplatform/pull/8) 已合併。正式程式SHA `eca41a39a97abee1321c0cb3935d2bbebe22395c`，`version.json` 的 builtAt 為 `2026-10-23T09:03:53.744Z`；已直接從正式網域讀回相同SHA。
- [正式部署流程39928791496](https://github.com/keanu77/antidopingplatform/actions/runs/39928791496) 成功，6分7秒；建置、全部測試、78項瀏覽器旅程、上傳、版本核對與18項唯讀API smoke全部通過。
- Cloudflare部署ID `80413963-b7c1-4824-b874-b441a10cd52c`，固定網址 <https://80413963.antidoping-platform.pages.dev>。
- 正式入口：[西藥](https://antidopingplatform.sportsmedicine.tw/drug-search)、[中藥](https://antidopingplatform.sportsmedicine.tw/herbal-search)、[食品／營養品](https://antidopingplatform.sportsmedicine.tw/supplement-search)。
- 可回復的緊鄰前版為PR #7的 `f77d4ee4d5f62361d78fa447ba32346dc7c4e3d1`，部署ID `0d755bfa-59c0-4aed-ba8d-9ee09876836b`，<https://0d755bfa.antidoping-platform.pages.dev>。最初檢查時的af8a47f已被該版取代，不能當成本次緊鄰前版。
- 部署後以 `E2E_BASE_URL=https://antidopingplatform.sportsmedicine.tw npm --prefix frontend run test:browser` 直接測試公開網站，**78／78通過（2.5分鐘）**，涵蓋桌機Chromium、手機Chromium、手機WebKit。包含三類查詢、完整配方、riociguat保留判讀、2027停止判讀、reload／深連結、來源摘要、鍵盤與無障礙、行動版無水平溢出。三種裝置截圖均已實際查看；完整報告及圖片保存在本次artifacts。與流程內使用建置產物本機伺服器的78項測試分開記錄。
- 四項獨立正式環境驗收通過：必要secret名稱齊全（未讀值）；D1三筆migration無待執行項、schema／索引相符、回饋仍6筆且ID1–6；API與同源限制8項回應符合預期；DNS、TLS憑證及三個新路由皆正常。
- `EXPECTED_SHA=eca41a39a97abee1321c0cb3935d2bbebe22395c npm run check:live` 通過，517案例、來源有效期無警告。基礎來源44／50有效、6筆待審保持不可用；這是既有基礎來源集合，與97.01%商品名稱覆蓋分母不同。
- 未測試有效回饋新增、實際寄信送達、第三方郵件key效力或自然月度排程；未發出郵件、未新增正式回饋、未改D1 schema。既有讀取與拒絕行為的成功不代表這些未測能力已完成。
- 證據：原工作樹 `artifacts/drugs/release-20261023/` 內的 `production-workflow.log`、`production-browser.log`、`production-playwright-report/`、四份 `production-*-check.json`、`deployments-after.json` 與 `deployment-receipt.json`。文件補記提交不觸發部署，因此遠端main文件HEAD可能高於實際程式SHA。

## 月度更新實際驗證

[首次手動啟動的更新流程39928979491](https://github.com/keanu77/antidopingplatform/actions/runs/39928979491) 成功，下載66,522筆；名稱覆蓋97.01147112094989%，品質守門通過，新增／刪除／異動均0筆。候選狀態`ready-for-review`、`applied:false`、`productionDeployed:false`，沒有替換凍結來源。

候選artifact `drug-data-update-39928979491`（ID12490074665，11,602,867 bytes）已實際下載並核對ZIP SHA `5aa85f0b28c9871e952758d78f29fb060ec8046b764617ba63ee29022e6ec195`，讀回update-report與diff。候選catalog SHA `dd07bc3fa3c75b360d0a0922843f0d08224d239878175ffa956d04e714624095`；原正式catalog SHA仍為`f7a04977d6007534ac8f1b4da4db48adea34c1b7c625d9acccd6cfc65a904644`。保留期90天，至2027-01-21。

排程已在main設定為每月1日台灣09:17；這次證據是首次手動觸發成功，尚未觀察下一次自然排程執行。更新僅適用西藥來源候選；中藥、食品資料與WADA／聯盟規則仍需另行更新審核。

## CI 下載修復

PR #8 首次雲端驗收39926706387的程式／資料／遷移、建置及容量檢查通過，但Azure Ubuntu鏡像下載119MB的瀏覽器依賴停滯逾6分鐘；於安裝階段取消，沒有部署。日誌保留在本次發布artifacts。工作流程固定ubuntu-24.04並改用Ubuntu官方archive鏡像，加入有限逾時與重試，原本78個瀏覽器檢查及全部其他門檻保留。
