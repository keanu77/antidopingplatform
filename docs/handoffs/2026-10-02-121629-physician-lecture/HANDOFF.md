# HANDOFF — 2026-10-02 12:16 JST

## 當前任務與交付狀態

- 使用者已取得 **「運動禁藥倫理：醫師扮演的角色」60 頁 HTML 簡報**；最新指令只有 `handoff`，目前沒有新的修改或發布任務。
- 演講：**2026/10/18，醫師聽眾，45 分鐘授課＋5 分鐘問答**；繁體中文、台灣臨床情境。
- 已選定 **白底藍綠＋乾淨等角插畫**；4 張圖片由 Codex CLI 生成，文字、數字、流程及 QR 由 HTML/SVG 排版。
- 工作根目錄：`/Users/ethanwu/Documents/Vibe coding/claude/Antidopingplatform`。
- 主檔：`docs/lectures/2026-10-18-physician-antidoping/html/dist/index.html`（**1,153,163 bytes**，單一檔案離線播放）。
- SHA-256：`8c77ffad7abe47fd4ed6ab5baf65c5d3d859477046ab9d78776d880b95f4196e`。
- 今日以 SHA-256 確認交付檔與 10/1 最終紀錄一致；60 個 section、60 段備註、24 個來源、4 張 JPG 均存在，配速 2700＋300 秒。
- 舊交接含 **另一份79頁藥師簡報**，已完整存入 `docs/handoffs/2026-10-02-121629-physician-lecture/previous-HANDOFF.md`。本次60頁醫師版與 `../lecture/2026-10-pharmacist-antidoping/` 分開，勿混改。

## 已完成的內容與製作

- 官方規範、倫理原文、臨床指引與原始裁決研究；完整逐頁內容、講者提示、來源頁碼對照與一頁檢核表。
- 60頁離線 Reveal.js HTML：方向鍵換頁、S 備註、G 跳頁、O／Esc 總覽、B 黑屏、24項來源面板、第3／56頁互動題、手機閱讀模式。
- **S 備註是同一螢幕對話框，並非雙螢幕講者視窗**；外部來源連結及 QR 目的頁仍需網路。
- 第58–59頁供會後查閱；授課可 G → 60 直接進入問答，總頁數維持60。
- 生圖版本、prompt、session ID、原圖雜湊已保存；圖片為合成概念／情境，沒有使用病人資料或真實裁決人物肖像。
- 多模型內容審查實際為 **GPT＋Gemini**；Gemini Pro與Flash均完成指定範圍。Grok因HTTP426未完成，不能寫成三家族都通過。詳細範圍與裁決見 `docs/lectures/2026-10-18-physician-antidoping/audit/report.md:7`。
- HTML增量獨立審查已解決第25頁 TUE 第二條件摘要的比較基準，以及第42頁規範上限限定字級；另修正關閉備註後鍵盤焦點及第59頁頁尾。

## Git 與驗證：分清日期

- Branch：`main`。
- HEAD：`73f121e42ceeb5a2c987b629da482b8416738aec` — `ci: actions/checkout 與 setup-node 升到 v5（改用 Node 24 執行）`。
- 本機快取 `origin/main` 同為 `73f121e42ceeb5a2c987b629da482b8416738aec`，ahead/behind `0/0`；**今日未 fetch／查詢遠端，因此不宣稱 GitHub 即時同步**。
- 本次研究、簡報製作與handoff沒有建立commit、push或部署；網站產品碼／案例資料未改。
- 未追蹤資料如下；完整快照見 `docs/handoffs/2026-10-02-121629-physician-lecture/git-status-before-handoff.txt`。勿 `git add .`、reset／clean或刪除他人工作。

```text
?? .claude/
?? docs/handoffs/2026-09-25-125558-uiux-links/
?? docs/handoffs/2026-09-25-handoff-1310.md
?? docs/handoffs/2026-09-25-uiux-handoff-1255.md
?? docs/handoffs/2026-09-29-handoff-1834.md
?? docs/handoffs/2026-10-02-121629-physician-lecture/
?? docs/lectures/
?? docs/reviews/2026-09-25-official-links/
```

| 證據 | 結果與範圍 |
|---|---|
| 2026/10/1 瀏覽器QA | 60頁逐頁離線截圖；無外部請求、JS錯誤、已偵測的溢出；CTADA QR解碼相符 |
| 2026/10/1 操作QA | 換頁、S備註／備註內換頁、G跳頁、總覽、黑屏、來源、兩題展開答案通過；60段備註原文保留 |
| 2026/10/1 顯示QA | 1280×720全頁；1024×768比例抽查；390×844手機無水平溢出；停用JS可讀60頁 |
| 2026/10/1 QA後變更 | 僅嵌入不影響渲染的Reveal.js MIT授權註解；最終hash已記錄 |
| 2026/10/02 本次handoff | 核對檔案hash、頁數、來源、圖片、配速與既存報告；**未重跑瀏覽器、網站測試或重新查醫學來源** |

尚未進行實際會場投影或完整試講；未製作／驗證這份60頁醫師版PDF或PPTX。網站線上版本及既有部署狀態本輪未查，舊交接的線上結果只是歷史紀錄。

## 下一個 Session 的前 3 步

1. **讀取** `docs/lectures/2026-10-18-physician-antidoping/html/README.md:1` 與本交接，先確認仍在醫師版任務。用以下指令核對交付檔；若hash不同，先查差異，勿覆寫：

   ```sh
   shasum -a 256 docs/lectures/2026-10-18-physician-antidoping/html/dist/index.html
   git status --short
   ```

2. **依使用者新指示處理**；若只是取檔，直接提供上列HTML。若要修改，先定位下列源檔再改；只有源內容變更才重建，不必重新生成四張圖片：

   ```sh
   node docs/lectures/2026-10-18-physician-antidoping/html/build.mjs
   ```

   醫療正文變更應先同步 `build_content.py`／`sources.json`，執行該Python建稿程式產生 `slides.json` 後再build HTML；不要只手改dist。

3. **只有修改後才重跑相應QA**。完整驗證程式已備份，可從repo根執行：

   ```sh
   node docs/handoffs/2026-10-02-121629-physician-lecture/verify-html.mjs
   ```

   該指令會呼叫html-slide-deck的全頁截圖檢查，再跑操作、手機、無JS與內容邊界檢查，輸出到 `.cache/physician-html-20261001/final/`。依賴本機技能及下述已安裝套件；瀏覽器啟動若被sandbox拒絕，走既有escalation，不要宣稱通過。檢查完成後更新交付QA報告與hash。

**無更多既定任務**：若使用者沒有要求改版，到此等待新指示；handoff不代表要部署、重做研究或再生圖。

## 關鍵檔案與維護入口

以下皆以 `docs/lectures/2026-10-18-physician-antidoping/` 為基準：

| 路徑 | 用途 |
|---|---|
| `README.md:1` | 演講範圍、配速、講前核對 |
| `60頁簡報內容與講者提示.md:1` | 完整逐頁講稿 |
| `build_content.py:1`、`slides.json:1` | 原始內容建稿程式與渲染輸入 |
| `sources.json:1`、`sources.md:1`、`source-to-slide.json:1` | 24項來源、定位、使用限制及頁碼對照 |
| `physician-checklist.md:1`、`timing.csv:1` | 門診檢核表與逐頁秒數 |
| `html/build.mjs:21` | 逐頁視覺摘要；第82行起是共用投影片生成 |
| `html/styles.css:1` | 白底藍綠CSS、手機排版 |
| `html/runtime.js:3` | 閱讀／投影片模式；第8行跳頁、第9行備註 |
| `html/assets/image-provenance.json:1`、`html/assets/_versions/` | Codex圖片來源與原始PNG；不要覆蓋版本 |
| `html/README.md:27` | 操作與驗證範圍、重建方式 |
| `html/qa/report.json:1`、`html/qa/functional-report.json:1` | 10/1逐頁及功能驗證結果 |
| `html/qa/overview.png`、`html/qa/cover.png` | 最終總覽與封面預覽 |
| `audit/report.md:1`、`audit/html-independent-review.md:1` | 原文裁決、多模型限制與HTML增量審查 |
| `audit/html-final-checks.json:1` | 最終HTML hash與驗證範圍 |

## 必須保留的內容界線

- 來源查核截止 **2026/10/1**。本場以2021 Code、2023 ISTUE、2026清單為基準；2027 Code／清單已公布，但2027/1/1才生效。10/18前若要更新，重新查官方來源並記錄日期，不能把今天的檔案檢查當新資料查核。
- 一般TUE四條件與追溯資格分開；ISTUE4.3是極特殊例外。緊急或急迫救治優先，不以核准等待延誤。
- IV成分與方法分開；不得把合法醫院治療等方法例外說成禁用成分一律免TUE。
- 排除期不等於陰性保證；吸入藥物規範上限不等於治療劑量。
- Freeman以2023 NADP裁決及歷史期間教學；Brown採2021 CAS上訴主文，勿照搬已調整的2019原指控。
- 保密／揭露依具體同意與義務判斷，沒有一律通報或絕對保密。
- AAS研究未讀付費全文，只核對公開摘要及書目；不引用未核實的精確風險倍數。

## 已知限制、環境與待使用者補充

- 無已知阻擋HTML交付的bug；講者姓名、單位、利益揭露尚待講者提供，上台前需要彩排。
- HTML build只用Node內建模組與本地vendor，不需安裝新套件或API key。
- QA依賴 `/Users/ethanwu/.claude/skills/html-slide-deck/scripts/qa-screenshots.mjs`，套件取自 `/Users/ethanwu/Documents/Vibe coding/claude/lecture/2026-10-pharmacist-antidoping/node_modules/`；這只是共用已安裝依賴，非藥師版內容。
- `.cache/physician-html-20261001/` 保存全部截圖、CLI日誌與原始驗證腳本；`.cache/physician-antidoping-20261001/` 保存內容審查來源包。兩者被git忽略，勿當已進版控。驗證腳本本輪另備份於交接歸檔。
- migration／新增env／待執行部署：無。`main`推送可能觸發網站CI部署，本輪未請求發布；維持本機交付範圍。
- 平台既有待辦及藥師簡報詳細內容查看 `docs/handoffs/2026-10-02-121629-physician-lecture/previous-HANDOFF.md`，不要自動重啟已結案國家來源補查。

本次可機讀核對：`docs/handoffs/2026-10-02-121629-physician-lecture/checkpoint.json`；上次交接已逐byte保存。
