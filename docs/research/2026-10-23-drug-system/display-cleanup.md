# 西藥查詢頁面資訊簡化

2026-10-23，依使用者要求移除頁面的許可證總數、未註銷總數、資料取得日期橫列、列名物質數、覆蓋率／目標／分母說明，以及「與TADA的抽樣查驗」完整區塊。資料來源展開區中重複的匯入數量亦簡化；搜尋結果筆數、用藥提醒、來源授權與規則有效期間保留。

只調整顯示與既有瀏覽器測試定位；來源資料、判讀規則、凍結快照、查驗JSON及報告沒有修改。原發布紀錄release.md描述前一版畫面，本次變更取代其公開摘要的顯示狀態。

- 正式程式：`e3c39c4c23e228ad0bffc9f40c97dff27f88d436`；公開version.json已讀回同一SHA。
- [正式入口](https://antidopingplatform.sportsmedicine.tw/drug-search/)；[固定部署](https://6ee796fe.antidoping-platform.pages.dev)。
- [部署流程39931644089](https://github.com/keanu77/antidopingplatform/actions/runs/39931644089)成功，含78項瀏覽器旅程與18項唯讀smoke。
- 本機lint、前端175項測試、build、大小／HTML檢查與15項查詢瀏覽器測試通過。
- 部署後公開網站15項查詢測試通過（桌機Chromium、手機Chromium、手機WebKit），桌機與手機截圖已查看，指定區塊已移除。
- 證據在原工作樹`artifacts/drugs/display-cleanup-20261023/`；前一可回復程式為`eca41a39a97abee1321c0cb3935d2bbebe22395c`。

沒有新增schema、金鑰、正式回饋寫入或寄信驗證。後續文件提交不觸發重新部署。
