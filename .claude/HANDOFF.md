# HANDOFF — 2026-10-10：回饋連結與 D1 migration 修正

## 範圍與進度

- 接續 PR #2：`https://github.com/keanu77/antidopingplatform/pull/2`。
- 開始及推送前核對：main `6aef66fe2fc90d7e512a9c951f832a7da18acee1`，PR head `70c6217bb4f4c3baf13fb1663a3706081447239e`。
- 獨立 clone 分支 `fix/digest-origin-tracked-migrations`；原始專案與未追蹤檔案未改。
- `6cbdf89`：完整 origin 比對、拒絕 URL credentials、URL 邊界與公開 API → D1 → digest 測試。
- `6eb94c2`：D1 原生版本紀錄、local 預設、顯式且驗證 schema 的 legacy baseline、PR CI、操作說明。
- 本文件提交時程式與本機驗證已完成；遠端最終 SHA／checks 由本輪最終回覆記錄，不能由這份文件假設通過。

## 驗證

- `npm test`：8 檔、91 passed。
- `npm --prefix frontend test`：4 檔、40 passed。
- `node --test tests/*.test.mjs`：46 passed。
- `npm run test:migrations:local`：4 passed；真正的 local D1，涵蓋全新、舊 0001、舊 0002、部分套用拒絕、基準與 apply 重跑、資料及歷史時間戳保留。
- `npm --prefix frontend run lint`、`node --check`（新增 migration 腳本與測試）、`npm run cf:build` 通過。
- `SMOKE_BASE_URL=http://localhost:8799 npm run smoke`：19/19 passed；測試回饋只写入 temporary local D1。
- 無 TypeScript 專案設定、typecheck script 或本機 tsc；`npx --no-install tsc --noEmit` 未能執行（找不到套件且 registry 解析失敗），不宣稱型別檢查通過。
- 本機 Pages 預覽指出原有 `_redirects` SPA fallback 規則被忽略；本次未改規則，19 項 smoke 通過。

## 下一步

1. 核對 PR #2 最終 head 與 PR validation／verify 遠端結果，確認該 SHA 的 checks，不能把原本無 checks 當成通過。
2. 需要正式 D1 操作時，先依 `docs/d1-migrations.md` 取得唯讀查核授權，核對真正 schema／ledger，選定 baseline 版本，保存備份／還原點；本次未讀寫正式 D1。
3. 提交具體正式 migration 計畫供使用者批准；合併、正式部署及正式 migration 均尚未授權。無更多已授權產品修改。

## 關鍵限制

- 不 force-push；PR 分支若已改動，改用隔離分支與 draft PR，不覆寫他人工作。
- 未改 `wrangler.toml`、原 migration SQL、正式部署 workflow、Cloudflare 設定、secrets 或權限。
- 新 PR CI 只讀 repository，不用部署 secrets，不執行 remote migration。
- baseline／migration 必須序列執行；未知或部分套用 schema 停止人工審查，不猜正式資料庫的歷史。
- 前一輪交接保存在 Git 歷史 `70c6217:.claude/HANDOFF.md`，其簡報等未追蹤檔案仍留原目錄。
