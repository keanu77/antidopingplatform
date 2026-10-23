# 西藥查詢範圍與明細精簡

2026-10-23。使用者要求商品查詢只保留西藥，並明確保留中藥／營養品相關教育內容；西藥成分明細不再逐項重複顯示TADA查驗連結與內部查核說明，但保留最下方「前往 TADA 核對商品」。

## 修改

- 移除`/herbal-search`與`/supplement-search`的路由、選單、SEO資料與商品查詢元件；主選單改為「西藥查詢」。舊網址使用既有404機制。
- TUE查詢資源卡只提供禁用物質與西藥查詢。教育頁的「補充劑安全」及其他文章維持原樣。
- 正式build只生成西藥搜尋資料，清理以前生成的`frontend/public/product-data`；建置檢查禁止發布退休頁面及該目錄。原始中藥／食品資料保留於`data/products/`；離線worker測試明確使用`--include-archived-catalogs`，隨後正式build清除產物。
- 西藥商品明細移除逐成分TADA連結、來源頁碼／核對日期及推導說明；其他來源保留簡潔連結，底部TADA核對商品連結原樣保留。
- 提醒文字縮短，保留未知成分、年份、靜脈方法與賽內檢體限制；判讀邏輯與原始來源資料沒有改動，也沒有把pending紀錄改成專業核准。
- M2摘要文字已對照[WADA 2026清單第13頁](https://www.wada-ama.org/sites/default/files/2025-09/2026list_en_final_clean_september_2025.pdf)。這是文字整理，不是新增臨床審核。

## 首次部署與驗收

- 正式程式SHA `9e504efbc6b1b0d9d030e77b061ca911655becdf`；公開version.json已讀回相同SHA，builtAt `2026-10-23T09:45:42.676Z`。
- [部署流程39933990238](https://github.com/keanu77/antidopingplatform/actions/runs/39933990238)成功，78項瀏覽器旅程及18項唯讀smoke通過；固定部署 https://55de7b8f.antidoping-platform.pages.dev 。
- 本機lint、175前端測試、6項worker測試、build、容量與16路由／517案例HTML檢查通過；15項查詢瀏覽器測試通過，包含使用者提供的005917號商品、僅保留底部TADA連結、舊頁及資料404、補充劑教育仍可使用。
- 原工作樹證據目錄：`artifacts/drugs/western-only-20261023/`。緊鄰前版程式`e3c39c4c23e228ad0bffc9f40c97dff27f88d436`，固定部署 https://6ee796fe.antidoping-platform.pages.dev 。

## 舊搜尋資料快取修正

首次公開網站驗收為12項通過、3項失敗，不算全數通過。兩個舊查詢頁面皆已回404，固定部署的舊資料網址亦回404；自訂網域兩個`/product-data/*/manifest.json`仍回200，帶約40分鐘Age及`public, s-maxage=604800`。加入新查詢參數後回404，證實殘留舊資料快取。

嘗試只清除兩個退休資料路徑prefix，Cloudflare API回401；目前Wrangler OAuth沒有Cache Purge權限，未清除其他網站快取、未索取新憑證。改以`functions/product-data/[[path]].js`固定回404與`Cache-Control: no-store`，避免舊資料路徑落回靜態資產。這個修正不改動西藥頁、來源資料或教育內容。本機15項瀏覽器旅程再次通過。

修正程式SHA `ca699133454a2c493e34ee216a572a35169853da`，部署流程`39935480312`成功；固定部署 https://7a2ff325.antidoping-platform.pages.dev 。

## 最終正式驗收

- [部署流程39935480312](https://github.com/keanu77/antidopingplatform/actions/runs/39935480312)完整通過，含78項瀏覽器旅程及18項唯讀API smoke。公開`/version.json`讀回程式SHA `ca699133454a2c493e34ee216a572a35169853da`與builtAt `2026-10-23T09:59:03.924Z`。
- 直接查詢正式網域、未加cache-busting參數：兩個舊查詢頁及兩個舊manifest網址皆回404；舊資料回應為「此商品查詢服務已停止提供」，附`Cache-Control: no-store`與`X-Robots-Tag: noindex`。不再依賴清除Cloudflare快取的額外權限。
- 公開網站15項查詢測試全數通過（59.1秒），涵蓋桌機Chromium、手機Chromium、手機WebKit；補充劑教育頁仍可選取，西藥005917號商品只剩底部一個TADA核對連結。桌機與手機明細截圖已查看。
- 證據：`artifacts/drugs/western-only-20261023/production-final-http.json`、`production-final-browser.log`、`retirement-deployment.log`、`production-playwright-report/`與三裝置截圖。首次12通過／3失敗的log及快取診斷另外保留，未改寫為成功。
- 最終部署包含`9e504ef`的查詢範圍／明細整理與`ca69913`的舊資料路徑停用。回復到`9e504ef`會失去快取修正；完整前版為`e3c39c4`，固定部署 https://6ee796fe.antidoping-platform.pages.dev ，但會恢復使用者要求移除的查詢入口。
- 沒有更動原始資料、判讀邏輯、教育文章、D1資料或金鑰；沒有有效回饋寫入或寄信。文件補記不觸發部署，遠端main文件HEAD可較上述程式SHA新。
