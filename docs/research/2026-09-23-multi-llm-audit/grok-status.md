# Grok 補充席：延長後完成

2026-09-23，Grok 在上限從三分鐘延長至十分鐘後，於 **312.80 秒（約 5 分 13 秒）** 正常交回八件逐案審核，exit 0、`stopReason=end_turn`。請求模型 `grok-4.6`、推理強度 `high`，回傳模型用量 ID 為 `grok-4.6-build`。這次延長有效，不保證所有逾時都能用同樣方式解決。

## 方法與歷史

1. 原沙箱嘗試無法建立工作階段，回傳 `FS_PERMISSION_DENIED`。
2. 允許的沙箱外重試在 180.03 秒逾時，無最終答案；該次失敗完整保留在 [grok-run.json](grok-run.json) 及 [grok-diagnostics.json](grok-diagnostics.json)。
3. 使用者詢問延長時間後，以十分鐘上限另開獨立工作階段；保持相同八件來源包、相同高推理設定，框題只將 120 秒作答期限改為 600 秒。未提供其他模型結論，未要求外部工具或修改資料。
4. 最終答案已原樣保存為 [grok-answer.md](grok-answer.md)。只將最終答案納入正式審核，不把內部處理過程當成審核結論。

原 [red-team 技能](/Users/ethanwu/.claude/skills/red-team/SKILL.md) 的三分鐘是初輪預設；這次依使用者後續指示延長，不再把原逾時當成目前缺席。

來源包 SHA256：`3e0532f58cf0c3b0eb07ac36402c215898a9231bb4d4aeca87230e7bdb6dcf53`。延長框題 SHA256：`0ba25c47487e0c0aa579ef0cf058d984d87a9617eb7252e726e6907ac08762b7`。來源包的公開欄位與當前案例資料逐欄完全一致。

## 主持人裁決

Grok 完成 Paparella、Licon、Phillips、Glasgow、Heinzl、Rante、Fischbach、Oberst 共八件來源對讀，沒有提出經確認的新增 P0／P1。收到完整回答，不等同接受全部判斷：

- **國家身分證據限制成立**，併入原 A01；不能將 U.S. 標題普遍等同代表國，也不能憑此認定六件美國欄位已證實錯誤。
- **Phillips 的公告正文未列 14 個月**這個限制成立，但主持人再次核對 [USADA 官方名冊](https://www.usada.org/results/sanctions/)，確有 `Denney Phillips, Jessica`、14 個月及同一公告連結，故不採用把期間改為未知的建議。這項已列 G01，與 Gemini 原先的 P1 誤報區分。
- **Paparella 摘要可更清楚**：追溯 TUE 未准，減免來自清單變更。正文及教育註本來已區分；將摘要改得更明確是措辭建議，未列新增核心事實錯誤。見 [原案公告](https://www.usada.org/sanction/flavia-paparella-accepts-second-doping-sanction/)及[減免公告](https://www.usada.org/sanction/flavia-paparella-granted-reduced-sanction/)。
- **「八件皆非台灣選手、符合排除條件」不採用**：Grok 同一回答承認六件缺乏直接身分證據，不能將這個限制外推成已排除。沒有證實其中存在台灣選手。

詳細裁決見 [adjudicated-findings.json](adjudicated-findings.json) 的 G01–G04。既有三項 P2 仍保留，包括 Grok 沒有指出的「服刑」措辭；增加模型不代表每一問題都會被各席找到。

## 實際涵蓋

有效席次為 Codex、Gemini、Grok；Claude 仍未交回答案。不同案例來源對讀仍 **15 件**；其中 **8 件至少兩席、含 4 件三席對讀**。剩餘 **485 件**未在本輪獨立來源對讀，不能宣告 500 件多模型複審通過。

[延長執行紀錄](grok-extended-run.json)、[逐案覆蓋](coverage.json)、[原始檔清冊](raw-artifacts.json)。完整輸入及 CLI 輸出位於既有 gitignore 排除的本機 `.cache/multi-llm-audit-20260923/`，沒有放入公開資料。

這次只更新審核報告，沒有改動案例、程式、提交或部署。案例資料 SHA256 前後同為 `81585990d76b5d4015fa92c3a39f2d8ad60470da67177e010ac40c7db2511a07`。
