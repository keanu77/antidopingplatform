# HANDOFF — 2026-10-03 20:54 JST

## 當前任務與授權範圍

- 最新指令只有 `handoff`。前一題是「這個repo適合用github flow繼續開發嗎」；只要求評估，尚未要求導入或合併。
- 評估結論：適合GitHub Flow；先新增PR CI並驗證，再設定main保護。沒有建立分支／Issue／PR、修改CI／GitHub設定或部署。
- 60頁醫師版HTML簡報已完成交付，仍在本機。使用者詢問過公開狀態，但沒有要求公開，也未決定是否移到private repo。
- 本次只更新交接及唯讀檢查；沒有commit、push、GitHub寫入或產品碼修改。
- 工作根目錄：`/Users/ethanwu/Documents/Vibe coding/claude/Antidopingplatform`。
- Branch：`main`；HEAD：`73f121e42ceeb5a2c987b629da482b8416738aec`。
- 最後commit：`ci: actions/checkout 與 setup-node 升到 v5（改用 Node 24 執行）`，不是本輪新增。

## 2026/10/3重新核對

查核時間：`2026-10-03T20:54:28.512715+09:00`。原始結果：`docs/handoffs/2026-10-03-205428-github-flow-handoff/github-readonly-check.json` 與 `local-checkpoint.json`。

| 項目 | 今日結果 |
|---|---|
| Repo | `keanu77/antidopingplatform`，public，預設main |
| 遠端main | `73f121e42ceeb5a2c987b629da482b8416738aec`，與本機HEAD相同 |
| main保護 | `protected: false`；required checks空；repository rulesets `[]` |
| 遠端簡報 | 完整main tree（truncated=false）沒有 `docs/lectures/` |
| 遠端workflow | 僅 `.github/workflows/deploy.yml` |
| 本機簡報 | `git ls-files docs/lectures` 無輸出，仍未追蹤 |
| 本機追蹤檔 | `git diff --stat` 空白 |
| HTML | 1,153,163 bytes；60頁、60備註、24來源、4 JPG；與10/1最終hash相同 |

本次只查遠端main tree，不宣稱掃描所有分支或其他repo。這段對話未推送簡報。沒有重新檢查網站線上版本、跑CI／瀏覽器測試或更新醫學來源。

## GitHub Flow建議方案（尚未實作）

1. 新增 `.github/workflows/ci.yml`，在 `pull_request` 跑既有lint、測試與build；不使用正式部署secrets，不部署網站。
2. 先證明PR檢查能正常完成，再設定main要求PR、必要檢查及禁止force push。必要job建議用獨立且穩定名稱如 `verify`，不要直接選現有 `deploy`。
3. 較大／跨session任務開Issue，寫背景、驗收與來源；PR連結Issue。小修可直接PR。醫學內容仍需原文版本與人工查核，CI不代表醫療正確。
4. 流程：Issue（較大工作）→ feat/fix分支 → PR → CI通過 → 使用者明確決定合併 → main自動部署 → 線上版本／smoke驗證。
5. 先保持簡單，不預先引入長期develop分支、多層審核或project board。

目前依據：

- `.github/workflows/deploy.yml:9` 只在push main／workflow_dispatch觸發，沒有pull_request。
- 第12行略過 `docs/**`、`**/*.md`、`.claude/**`；第49行起lint／後端、前端、Node規則測試／build；第63行部署Cloudflare，73行起線上version及smoke。
- Required workflow若被路徑／分支條件跳過，可能持續Pending；PR必要檢查必須能在適用PR產生結果。
- **公開repo的功能分支也公開**；paths-ignore只影響workflow，不能讓已推送的docs變私有。
- `.gitignore` 尚未排除整個 `docs/lectures/`。一般 `dist/` 規則只涵蓋其中輸出；原始講稿、圖片與審查資料並未整體排除。若要保持本機私有，之後決定排除方式或另建private repo；本輪未改。
- 已讀 `/Users/ethanwu/.claude/skills/github-flow/SKILL.md`。不要把「適合嗎」或handoff解讀成導入、開Issue／PR、改保護或合併的授權。

官方參考：

- https://docs.github.com/en/get-started/using-github/github-flow
- https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks

## 下一個Session的前3步

1. **核對狀態與使用者新指示**：先讀本交接，再執行下列唯讀命令。若有差異先檢視，保留未追蹤簡報與其他工作。

   ```sh
   git status --short
   git log -1 --format='%H %s'
   gh api repos/keanu77/antidopingplatform/branches/main --jq '{name,protected,sha:.commit.sha}'
   ```

2. **按新指示分流**：若明確要求導入，讀deploy workflow、package scripts及github-flow技能，在隔離分支／worktree準備PR CI，完成本機檢查與可review差異；未獲授權的遠端設定及合併不自行執行。若要改簡報，讀 `docs/lectures/2026-10-18-physician-antidoping/html/README.md:40` 後改源檔。若只是取檔或查公開狀態，提供本機產物／唯讀核對即可。

3. **只有修改後才重跑相應檢查**。PR CI沿用：

   ```sh
   npm --prefix frontend run lint
   npm test
   npm --prefix frontend test
   node --test tests/*.test.mjs
   npm run cf:build
   ```

   簡報改版才執行：

   ```sh
   node docs/lectures/2026-10-18-physician-antidoping/html/build.mjs
   node docs/handoffs/2026-10-02-121629-physician-lecture/verify-html.mjs
   ```

**無更多已授權待辦**：沒有新指示就維持現況；已完成的研究、製作不需重跑。

## 60頁醫師簡報與維護入口

- 主題：運動禁藥倫理：醫師扮演的角色；2026/10/18、醫師聽眾、45分鐘授課＋5分鐘問答、繁體中文。
- 已選白底藍綠＋乾淨等角插畫；4張Codex CLI生圖，沒有病人資料或真實裁決人物肖像。
- 主檔：`docs/lectures/2026-10-18-physician-antidoping/html/dist/index.html`。單檔離線播放；外部來源連結需網路。
- SHA-256：`8c77ffad7abe47fd4ed6ab5baf65c5d3d859477046ab9d78776d880b95f4196e`。
- S為同一螢幕備註視窗，非雙螢幕講者模式；G跳頁、O／Esc總覽、B黑屏。第3／56頁互動；58–59頁會後查閱，第60頁問答。
- 來源查核截止10/1，本場採2021 Code、2023 ISTUE、2026清單；2027新版另標生效日。今日檔案核對不等於重新查規範。
- 多模型實際完成GPT＋Gemini；Grok HTTP426未完成。視覺摘要也經獨立審查，不把模型一致當原文證據。
- TUE／追溯例外、急救優先、IV成分與方法分查、排除期限制、保密及原始裁決等界線詳見舊交接與audit，不因縮短版面刪去限定。

以下路徑以 `docs/lectures/2026-10-18-physician-antidoping/` 為基準：

| 檔案 | 用途 |
|---|---|
| `README.md:1`、`html/README.md:1` | 範圍、操作、配速與維護 |
| `build_content.py:1`、`slides.json:1` | 內容源頭與60頁輸入；正式正文修改同步建稿程式 |
| `sources.json:1`、`source-to-slide.json:1` | 24項來源、原文位置／限制與頁碼 |
| `html/build.mjs:21`、`html/styles.css:1`、`html/runtime.js:3` | 視覺摘要、CSS與互動；不要手改dist |
| `html/assets/image-provenance.json:1`、`html/assets/_versions/` | prompt、session、雜湊與PNG版本 |
| `audit/report.md:1`、`audit/html-independent-review.md:1` | 原文裁決、多模型限制、HTML修正 |
| `audit/html-final-checks.json:1`、`html/qa/functional-report.json:1` | 最終hash與10/1功能QA |
| `html/qa/report.json:1`、`html/qa/overview.png` | 逐頁檢查與總覽 |

## 驗證日期與限制

- **10/1已完成**：60頁離線截圖、QR、JS／外部請求／溢出檢查；換頁、備註、跳頁、總覽、黑屏、來源與互動；390×844手機及無JS閱讀；1024×768比例抽查。
- **10/3本輪完成**：核對Git、HTML雜湊／結構、GitHub可見性／main／rulesets／檔案樹，並保存交接。未重跑瀏覽器QA、網站測試、build或醫療檢索。
- 尚無實際會場投影、完整試講、這份60頁PDF／PPTX驗證；講者姓名、單位、利益揭露待講者補充。
- 無已知阻擋HTML交付的bug；GitHub Flow是待採用建議，不是執行中的任務。

## 工作樹、環境與歷史保存

- 未追蹤：`.claude/`、`docs/lectures/`、`docs/handoffs/`中的多份交接、`docs/reviews/2026-09-25-official-links/`；完整清單：`docs/handoffs/2026-10-03-205428-github-flow-handoff/git-status.txt`。
- 本輪新檔僅保存在本機。勿 `git add .`、reset／clean。後續推送需逐檔檢查內容與範圍。
- migration／新增env／待部署：無；未觸發GitHub Actions或Cloudflare部署，網站線上狀態未重新驗證。
- HTML build僅需Node內建模組與vendor。QA依賴本機html-slide-deck技能及旁邊藥師目錄已安裝的Playwright等套件。
- `.cache/physician-html-20261001/`、`.cache/physician-antidoping-20261001/`被git忽略，包含截圖、CLI日誌與來源包，勿當已版控或已公開。
- 上一份完整60頁交接原樣保存至 `docs/handoffs/2026-10-03-205428-github-flow-handoff/previous-HANDOFF.md`。
- 79頁藥師版在 `../lecture/2026-10-pharmacist-antidoping/`，更早交接在 `docs/handoffs/2026-10-02-121629-physician-lecture/previous-HANDOFF.md`。勿混改，亦勿自行重啟已結案國家來源補查。
