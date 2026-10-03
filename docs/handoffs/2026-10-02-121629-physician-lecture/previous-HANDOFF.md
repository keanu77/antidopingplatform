# HANDOFF - 2026-09-30

## 進度
- 本 repo 程式碼本次**無變更**；最後 commit 仍為 `73f121e`（線上 version.json 同步，已確認）。
- 本次主要產出在 repo 外：藥師版 HTML 簡報（完成、QA 通過）。
- 上一份交接（9/29 TUE 優化＋自動部署）歸檔於 `docs/handoffs/2026-09-29-handoff-1834.md`。

## 本次 Session 完成
- [x] 藥師版 HTML 簡報 `../lecture/2026-10-pharmacist-antidoping/`（repo 外、無 git）
  - 來源 `../lecture/2026-07-19 antidoping-TUE/TUE_Antidoping_Lecture 1.4.pptx`，50 分鐘 79 頁，reveal.js 離線單檔
  - 產物：`dist/index.html`（約 3 MB）、`dist/藥師與運動禁藥防制-講義.pdf`（79 頁）
  - 保留 5 頁非禁藥工具介紹（使用者指定）；新增網站專章 5 頁＋第 64 頁離線藥物查詢（讀 `data/substances.json`，複製自本 repo `backend/data/`）
  - QA：`QA_OFFLINE=1` qa-screenshots 通過、`scripts/heights.mjs` 全頁不溢出、live 模式無 JS 錯誤
  - 維護流程寫在該目錄 `README.md`（改 `content.js` → `node build.js` → heights → QA → print-pdf）
- [x] 修 `~/.claude/skills/html-slide-deck/scripts/gen-image.sh`：`$RC；` 改 `${RC}`、macOS 無 `timeout` 改依序 timeout／gtimeout／perl（實測生圖成功）
- [x] 刪除 GitHub repo `keanu77/antidoping-platform`（使用者於網頁刪除，已驗證 404；90 天內可救回）。本 repo 內的 `antidoping-platform` 字樣是 **Cloudflare Pages 專案名**，不受影響，勿改

## 當前狀態
- Branch：`main`，與 origin 同步
- 未 commit：只有 untracked `.claude/`、`docs/handoffs/`（含本次歸檔）、`docs/reviews/2026-09-25-official-links/`（非產品碼，是否 commit 未決，勿自行處理）
- Build／Test：本次未改程式，未重跑（9/29 全過）

## 下一個 Session 的前 3 步
1. **執行** `git status --short && curl -s https://antidopingplatform.sportsmedicine.tw/version.json` — 確認 HEAD 與線上仍為 `73f121e`
2. 若使用者要改簡報：**編輯** `../lecture/2026-10-pharmacist-antidoping/content.js`，再依該目錄 README 重建與 QA
3. 無更多既定任務，等待使用者新需求

## 已知疑義 / 未做
1. **簡報藥師版新增內容待使用者講前核對**（依 WADA 2026 清單整理）：第 15 頁 S0–S5 藥局品項、18 頁閾值表、39 頁噴數換算、55 頁中藥陷阱（鹿茸、higenamine 藥材標「可能含有」）、56 頁藥局速查
2. **本 repo 無 LICENSE**；使用者若想開源，可補 LICENSE／CITATION.cff（舊 repo 的 MIT 版已隨刪除消失）
3. 沿用上一份：其他頁面 Code／ISTUE 條號分散（2027/1/1 新 Code 要掃）；testosterone 指引版本未核；S2／S3 分類寫法未統一；國家來源補查已結案勿續補

## 關鍵檔案
- `.github/workflows/deploy.yml` — push main 自動部署 Cloudflare Pages
- `backend/data/substances.json` — 藥物單一來源（網站與簡報查詢頁共用；改了要重新複製到簡報 `data/`）
- `../lecture/2026-10-pharmacist-antidoping/{content.js,build.js,styles/deck.css,styles/effects.js}` — 簡報源頭

## 環境 / 部署注意事項
- Migration／新 env：無；未完成部署：無
- `rm -rf` 會被安全 hook 擋；簡報目錄的 `qa/` 截圖可由使用者手動清
