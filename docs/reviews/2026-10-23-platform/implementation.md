# 可信內容、三角色學習與維運優化

本次完成原評估 B／C／D 中可由程式、現有證據及公開官方來源交付的項目。實際部署資訊另見 release.md；沒有把來源核對當成具名臨床簽核。

## 內容與學習

- 50 成分、16 正式測驗題、70 舊題均有來源登錄與狀態。44 成分提供已核對規則，6 成分待補證；69 舊題停止答案與評分。7 項 S9 的吸入／局部使用保留製造商核准劑量與適應症條件。
- 共用資料有效期使用 Asia/Taipei，獨立於賽事所在地的賽內／賽外判斷。2027 為已公布未啟用，跨年、缺證據、過期及無效日期停止確定判定。
- 30 案教材保留原事實、處理結果、來源與限制；517 案補證隊列明示未知及優先順序。沒有重新讀完全部 517 案來源。
- 首頁三角色入口；各 4 項任務與 5 項列印準備事項；教練 12 分鐘教案。官方 ADEL 課程與站內練習分開。
- 測驗固定抽出的題組，按同一題目／選項計分；錯題顯示來源與補學連結，可重做並設定回訪複習日期。匿名進度僅存本機，90 天或內容／規則期限先到者失效，可清除；開啟中的頁面也處理到期與返回分頁。

## 介面與初始 HTML

TUE／Education 分頁有 URL 狀態、方向鍵、Home／End 與 ARIA 關聯。來源頁支援瀏覽器上一頁／下一頁。修正頁尾、回饋按鈕、TUE 官方連結及補充劑標題對比。準備清單列印不保留其他隱藏區塊的高度。

15 條靜態路由有各自正文；學習、政策、TUE、藥檢等採共用 React 元件於建置時輸出，避免複製後漂移。517 案初始 HTML 保留全部查核 scope、994 則 audit notes、187 項待查欄位及 16 則對讀後文字變更警示。共享 title／description／canonical／社群 metadata，移除會在換頁後覆寫標題的舊 effects。未知路徑及案例回傳 HTTP 404。

## 維運

回饋新增 request ID 去重、7 天／20 筆離線佇列、可清除待送資料；彙整改為持久化游標與固定內容的冪等批次，處理延遲、併發與不確定寄送。0003 migration 保留舊資料且不虛構寄達狀態。詳見 [操作說明](../../feedback-operations.md)。

依賴以相容更新為主，移除不再需要的 nodemon／depcheck，Tailwind 更新至 4 並保留必要樣式預設。root、frontend、legacy backend 三個 npm audit 均為 0 findings（2026-10-23 當次查詢）；不代表未來無新漏洞。Tailwind 4 的現代瀏覽器支援邊界見 CLAUDE.md。

PR 與正式部署均加入 Chromium／手機 Chromium／手機 WebKit 操作與 axe 檢查、初始 HTML 完整性及 gzip budget。六小時唯讀監測對照最近成功部署的 SHA，避免文件提交被誤認為未部署。

## 審查與本機證據

- B spec、B quality、C spec、C quality、D spec、D quality 均通過；審查發現的 malformed date、時區、source history、S9 條件、初始 HTML 範圍、開啟頁面到期、寄送 lease、D1 大小上限與離線佇列競態均已修正。
- 前端 119 tests；舊 Express 91 tests；Node Pages／資料／來源／migration contracts 105 tests；真正本機 D1 migration 4 tests 通過。
- 建置及 lint 通過；15 路由＋517 案正文／查核警示完整性通過。初始 gzip JS 約 126 KB、CSS 約 11 KB，低於 200／40 KB 的限制；不把這些數值當 field CWV。
- 跨瀏覽器操作涵蓋三角色任務／清除／列印、10 題完整測驗與重做、來源導覽、藥物條件／失敗重試、鍵盤分頁、真實 404、資料到期及 metadata。最終完整結果與 CI／預覽／正式版證據記錄於 release.md。

## 仍須真人或營運證據

尚無逐項具名專業審閱／利益關係揭露、三角色真人任務研究、學習前後及延後成效、field CWV、自然六小時監測或真實彙整信寄達紀錄。已有 [研究與量測方案](measurement-plan.md)，不可用自動測試或 provider acceptance 填補這些結果。歷史 6 筆回饋在 migration 前未有寄送 ledger，需保留對帳限制；此數量需以發布記錄的正式查核為準。
