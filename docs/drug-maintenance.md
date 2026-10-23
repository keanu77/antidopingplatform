# 西藥資料維護

現行公開商品查詢只提供西藥；中藥與營養品快照保留作離線研究，正常建置不發布其查詢資料。教育頁的補充劑內容仍可使用。

## 來源與產物

- `data/drugs/catalog.json.gz`：版本控制中的西藥商品與成分快照。
- `data/drugs/manifest.json`：來源、授權、時間與雜湊。
- `backend/data/drug-*.json`、`backend/data/substances.json`：名稱對照、規則與來源狀態。
- `frontend/public/drug-data/`：建置時生成的瀏覽器索引與明細分片；不進 Git。
- `artifacts/drugs/`：本機 SQLite、候選更新與查驗證據；不進 Git，也不是正式 D1。

一般開發者執行 `npm run cf:build` 即可使用已保存的資料，不需要重新下載來源。

## 月度或季度候選

`.github/workflows/drug-data-update.yml` 已在預設分支啟用，每月 1 日 UTC 01:17（台灣 09:17）排程；GitHub 排程可能延遲。`config/drug-update.json` 的 `cadence` 預設為 `monthly`，可改為 `quarterly`，只在 1、4、7、10 月取得資料。手動 `workflow_dispatch` 可另外執行。

```sh
# 產生候選、差異與品質報告；不替換正式來源
npm run drugs:update

# 查核目前版本的名稱對照門檻
npm run drugs:check-target
```

更新工作流保存候選與報告，不自動合併、覆寫資料或部署網站。人工核對 `update-report.json`、`diff.json`、來源時間與品質門檻後，才在獨立分支套用候選、測試並發布。具體參數見 `python3 scripts/update-drug-catalog.py --help`；歷史操作與限制見[維護研究紀錄](research/2026-10-23-drug-system/maintenance.md)。

## 規則與品質

商品更新不等於 WADA 規則更新。年度、給藥途徑、劑量、運動／聯盟與未知成分的限制仍需來源查核；不得自動延長年份或把 pending 改為臨床核准。名稱覆蓋、來源一致率與用藥安全性是不同指標。

2026-10-23 的凍結、抽樣查驗與後續保留判讀修正分別存於研究與發布紀錄；不要改寫歷史結果。公開介面依使用者要求不顯示資料總數／覆蓋率橫列或內部 TADA 查驗段落，底部商品核對連結保留。最新範圍與驗收見 [western-only.md](research/2026-10-23-drug-system/western-only.md)。

資料測試會重建產物，請先跑資料／worker 測試，再跑正式 build；勿平行寫入 `frontend/public`。離線研究若明確需要舊目錄，可用 `node scripts/prepare-drug-assets.mjs --include-archived-catalogs`，但這些產物不得直接發布。
