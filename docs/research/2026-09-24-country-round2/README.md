# 國家來源補查第二輪（2026-09-24）

承接第一輪（`../2026-09-24-source-followup/`）剩餘的 215 件公告標題型國家缺口。本輪已處理 44 件：**24 件補入官方來源、6 件保留待確認、14 件查無可用官方來源**；國家待補證 215 → **191** 件。本機仍為 517 件。

## 方法

- 入口：`scripts/country-round.py`（fetch → prepare → run → summarize → apply），全部寫入本資料夾、`.cache/2026-09-24-country-round2/` 與 `data/country-followups/2026-09-24-country-round2.json`，不覆寫第一輪成果。
- 來源只收官方網域的現行頁面（Team USA、各單項協會、World Athletics／Aquatics／Triathlon／Rowing、UIPM、IPC 等），保存原件、擷取文字與 SHA256。未使用 Wayback 快照。
- 模型：依使用者選定的節費方式，每件由 GPT（gpt-6-luna）與 Claude（haiku）兩家族獨立對讀；每包 ≤5 件、只給保留原行號的短摘錄；每次上限 600 秒、同批同席至多重試一次。
- 覆蓋：30 件均有兩家族有效逐案答案；19 次整批回覆中 15 次整批有效，另 15 筆逐案答案取自格式不完整批次（Claude 在 JSON 前後加字），方法同第一輪並保留字元起訖。

## 編輯裁定原則

- **只有國內協會賽事／獎項紀錄者不升級**（Kirby、Irizarry、McKay、Summerhill）：兩模型指出這類頁面未列選手代表國家；為一致起見改列待確認，Schafer 亦同。
- **名單年份與本案不同**：接受，但註記限定該名單時期、不推定事件當年代表資格（Wethington、Bowlby、Fischbach、Pearson）。
- **同人辨識不足**：保留（Park 僅姓名＋項目；Rodriguez Ocasio 官方頁家鄉與 USADA 不同州）。
- 模型疑義後補入第二來源者（Witte、Francis）標為註記在模型對讀後更新。

## 查無官方來源

舉重 masters／國內選手為主：USA Weightlifting 舊版 Webpoint 成績頁網域已停用、舊出場名單 PDF 轉址至首頁，現行官方網站只保留國際賽選手。各案搜尋紀錄見 `search-log.json`（含 Hattingh：官方名單頁 HTTP 429，下輪重試）。

## 檔案

`selection.json`（提案）、`packet-manifest.json`（凍結包雜湊）、`case-coverage.json`／`model-summary.json`／`run-index.json`／`rejected-case-rows.json`（模型覆蓋）、`editorial-decisions.json`／`adjudications.json`（裁定）、`source-manifest.json`（來源雜湊）、`search-log.json`（查無紀錄）。
