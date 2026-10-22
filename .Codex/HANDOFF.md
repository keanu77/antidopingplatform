# HANDOFF — 2026-10-23，台灣西藥／中藥／營養品查詢

## 進度

- 使用者要求分析並盡力重建 TADA 西藥查詢，後續明確加入中藥與營養品；三類可執行查詢均已完成本機實作。
- 工作目錄：`/Users/ethanstudio/Documents/Vibe coding/antidopingplatform`
- 分支：`feat/taiwan-drug-search`；基底：`5495d6d29c83ba290fd9c967023f2d398397609c`。
- 最後實作 commit：`9692504b42d8874b6b229e3898469d2c3afef1a4`，`feat: add portable Taiwan drug herbal and supplement catalogs`。其後的文件 commit 只補移植包與交接資訊；以 `git log -3 --oneline` 查當前 HEAD。
- 未推送、未部署、未改正式 D1，沒有新增金鑰／環境變數。不要把舊線上 TUE 50 項物質工具視為已更新的商品查詢。

## 已完成與驗證

- `/drug-search`：TFDA 66,522 筆許可證，72,088 原始列＋126,028 成分列完整保存於 SQLite。複方、品牌／成分／許可證搜尋、效期與註銷篩選、賽內／賽外及途徑／運動／S5／日期條件。
- `/herbal-search`：健保署 115.10.01 版，10,046 筆（複方 6,539／單方 3,507）。使用者已協助下載兩份 ODS，檔案驗證及匯入完成；不要再要求下載同一份。
- `/supplement-search`：TFDA 健康食品 565＋輸入錠膠囊食品 7,407，共 7,972 筆。
- 來源 manifest、SHA-256、gzip JSON 快照、版本化索引與分檔、可移植 SQLite、匯入／規則／worker 測試均已建立。
- 自動測試共 251 項：後端 91、前端 89、Node 58、Python 13；lint、Vite build、diff check 通過。JS／JSX 專案無 tsconfig／typecheck script，離線 tsc 未能執行，不宣稱型別檢查通過。
- 三份 SQLite `integrity_check=ok`、FK 無違反。手機 393×852 模擬看過西藥／營養品明細，修正新明細標題的 scroll margin；不是實體 iPhone／Safari 驗證。
- Chrome 本機實測：普拿疼 50 筆、麻黃 148 筆、CREATINE 10 筆；分類切換、單方與食品詳細資料、營養品明細重新載入成功。早期普拿疼品牌別名誤展開到 2,150 筆已修正並加入回歸測試。

完整證據與限制：`docs/research/2026-10-23-drug-system/README.md`、`validation.md`。覆蓋率：同目錄 `coverage.json`、`unmapped-ingredients.csv`。

## 可直接交付的資料

- 移植包：`artifacts/drugs/antidoping-catalogs-2026-10-23.zip`（46,833,641 bytes）。包含三份 SQLite gzip、三份來源 manifest、README、checksums；ZIP 8 個成員 CRC 已驗證。
- SHA-256：`5b91cab97898687cdead446277ece495f9e71bce203bfb11e38c0926340fdf47`。
- 原始 SQLite：`artifacts/drugs/{taiwan-drugs,herbal,supplements}.sqlite`，另各有 `.gz`。大檔不進 Git。
- 三份可重建前端的快照已進 Git：`data/drugs/`、`data/products/herbal/`、`data/products/supplements/`。
- ODS：`artifacts/drugs/antidoping-nhi-tcm-{complex,single}.ods`。食品原始 JSON：`artifacts/drugs/food-sources/`。西藥原始下載在 `/tmp/antidoping-tfda36.download`、`/tmp/antidoping-tfda43.download`，可能被系統清理，SQLite 仍保留原始列。

## 重要邊界

1. 不是 TADA 私有 DB 或人工分類的副本。公開介面僅少量核對，不知道其實體 schema／全量筆數；精確複製仍需原權利人提供匯出、規則、授權與更新機制。未代寄信、未大規模擷取原站。
2. 西藥 156 項規則只適用 2026。7,686 個不同成分名中 230 可對應，7,456 未對應；全成分名稱可對應的 4,933 筆不代表均可用。未全面處理 S0／同類物質、S2 性別等規則，不計算檢體濃度、個人劑量或清除期。
3. 中藥健保代碼不是藥證，來源沒有完整處方／含量；不能依方名推斷可用。`A038755` 兩筆不同商品均保留；3 筆異常發證日期留原值與警示；取消給付不等於藥證註銷。
4. 食品登錄不等於禁藥檢測。健康食品只有功效相關成分，未必完整；沒有批號檢測證明資料，不等於判定從未檢測。`productEvidence.js` 沒有 permitted／safe 產品結論。
5. 沒有國際認證營養品的全量清單；尚未串接 NSF／Informed Sport 等逐批資料。TADA／USADA 官方查證入口保留。
6. 資料不是即時同步。更新需主動匯入及重建；2027 年需先更新並審核規則。臨床逐品項審核未完成。
7. 原生 Chrome 自動操作曾出現重新載入後暫時空白，開 DevTools 後內容出現且無 console error；最後營養品直接 reload 已成功，未找出先前原因。使用者後來切至其他 Chrome 視窗，為避免干擾沒有再操作該視窗；本機預覽視窗可能仍開著 DevTools 裝置模擬。

## 執行方式

```sh
npm run test:drugs
npm --prefix frontend test
npm --prefix frontend run lint
npm run cf:build
# 新查詢不需要 MongoDB／API
npm --prefix frontend run dev -- --host 127.0.0.1 --port 5188 --strictPort
```

本 session 曾保留 dev `127.0.0.1:5188`（session 75818）、正式建置 preview `127.0.0.1:5189`（session 47930）；下次先確認是否仍在執行，避免搶埠。Preview 不提供原有 Pages Functions API，不要拿 API 404 誤判新資料查詢失敗。建置前必須有三份快照，checksum／分類不符會中止或拒絕結果。

重新取得西藥：`npm run drugs:import`；食品：`npm run foods:import`。中藥需從健保署確認下載頁最新版本與檔案，舊下載 URL 不保證永久更新，然後：

```sh
npm run herbs:import -- \
  --complex-file artifacts/drugs/antidoping-nhi-tcm-complex.ods \
  --single-file artifacts/drugs/antidoping-nhi-tcm-single.ods \
  --snapshot-date 2026-10-01
npm run drugs:audit
```

不要把舊檔匯入時間冒稱下載時間。中藥 manifest 已明示時間來自瀏覽器下載檔 mtime。健保署 CLI 曾回 403 challenge／connection reset；本次沒有繞過驗證碼。

## 下一個 session 前 3 步

1. **執行 `git status --short`、`git log -3 --oneline`，讀 `docs/research/2026-10-23-drug-system/validation.md`**：確認本機 commit 與未部署範圍，對照使用者新指示，不自動部署。
2. **讀 `docs/research/2026-10-23-drug-system/unmapped-ingredients.csv` 前 21 列及 `backend/data/drug-ingredient-rules.json`**：若使用者要擴充判讀，從高頻未對應成分建立有正式來源的別名／規則審核；不要把無清單命中設成允許。若要原站一比一資料，先取得授權匯出欄位樣本再建立 importer。
3. **有規則／匯入變更後執行 `npm run drugs:audit`、`npm run test:drugs`、`npm --prefix frontend test`、`npm run cf:build`**：更新覆蓋率及來源時間，重測具體複方與分類切換；發布僅在使用者明確要求及確認待發布版本後進行。

## Git 與部署注意

- 既有未追蹤內容保留，未納入本次 commit：`.claude/audit/`、9 月 handoffs、`docs/lectures/`、`docs/reviews/2026-09-25-official-links/`、`docs/reviews/2026-10-22-world-class/`、`docs/reviews/2026-10-23-phase1/release.md`。
- 不要 `git add -A`。目前 `.github/workflows/deploy.yml` 已補 Python importer tests；這只是檔案修改，沒有觸發任何雲端部署。
- `main` push 會自動部署；此分支沒有 push。Cloudflare Pages 為 Direct Upload，D1 僅回饋；沒有本次 migration。
- 所有本次 snapshot／程式碼已提交；交接文件 commit 後若看到其他髒檔，先辨識來源，勿覆蓋。
