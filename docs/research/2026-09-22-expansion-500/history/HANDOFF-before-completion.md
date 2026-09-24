> 續作更新 2026-09-23：目前 **403／500** 已逐案審核，97 待審，517 總數；測試 10／10，completion in_progress/errors=[]。最新以 `docs/research/2026-09-22-expansion-500/resume-checkpoint-2026-09-23.json` 及 `selection-summary.json` 為準。下方 257 數字為上次交接的歷史快照；八件已讀筆記現已全部整合。USADA author 01–18 已存，從 19 繼續。未 commit/push/deploy。

# HANDOFF — 2026-09-23 00:22 JST

## 進度

- 使用者要求先校正既有案例、審核首批 50 件，通過後擴增至 **新增 500 件**；含污染、撤案、TUE 與爭議教學，**排除台灣選手**。最後指示是 `handoff`，本次停止新增審核並交接。
- **257／500 新案例已逐案審核；243 件仍是名冊層級。** 另有 8 件已讀完公告，僅保存筆記，尚未接受或整合，不能加進完成數。
- 本機資料共 **517 筆**＝500 新候選條目＋17 件既有校正／分案。不是 517 件全部完成逐案審核。
- 首批 52 件中接受 50、暫緩 2。後續接受 207（包括本次新來源 USADA 21 件）、held 3、needs_final_source 14。
- Branch `main`；最後 commit `60f7073a9deb98af0b117735717250e638bee9ba` — `feat: 重建為 Cloudflare Pages + 靜態資料集，移除 MongoDB 依賴`。
- 本次未 commit / push / deploy。正式站上次核對為 171 筆；交接時沒有重新驗證，不能宣稱 GitHub 或正式站已是本機 517 筆。
- Goal 工具查到的是先前既存的 `paused`；本次沒有變更，不能標 complete。使用者再次說繼續時依其指示接續。

## 本次 Session 完成

- 從 231 增至 257：5 件 AIU 個案全文＋21 件 USADA 公告與必要的國家身分資料。八項查核欄位、文件 SHA256 與定位已正式保存。
- 修正新接受案例中的 HTTP 短網址：公開來源改用實際取得的官方 HTTPS 文件網址，保留原名冊資料。
- PDF URL 回傳 HTML 時標為 `unexpected_content`，不冒充取得 PDF。Nicolas Chilard 的 CAS 連結就是此狀況，尚未接受。
- 加入 USADA 官方名冊：1,058 列；去除匿名、同人多列、基底／既有候選重複後有 579 個個案公告候選。未從 USADA 管轄或美國居住地推論國籍。
- 下載兩批共 380 筆 USADA 文件紀錄（含身分補充頁與失敗紀錄）。所有來源總計 601 筆：568 downloaded_unreviewed、32 download_failed、1 unexpected_content。下載不等於審核。
- 新整合邏輯保留所有已接受個案，讓有逐案證據的 USADA 案例取代僅有名冊的候選，總新增數仍固定 500；保守排除既有 171 筆全部人名。
- 已處理的重要差異：Evan Boyle 最新總禁賽 **18 個月**，Robert Jerry Qualls 最新 **39 個月**；Emily Oberst 等公開警告與「未來使用 TUE」不得寫成撤案或原已有豁免；Jaron Flournoy 是持有違規，不是本案採樣陽性。

## 當前狀態與驗證

- `npm run data:reviewed`：通過，517 筆，無必要欄位缺漏。
- `npm run test:reviewed`：**10／10 通過**，以 257 件逐案完成的資料測試。
- `npm run audit:completion`：正確回傳 **in_progress，257 已審／243 待審，errors=[]，exit 1**。此非零值是尚未達成目標，不能改門檻來讓它過。
- `git diff --check`：通過。
- 前端 build、38 項舊前端測試、瀏覽器／production validation 是先前的 500 總筆數快照，**對目前 517 筆已過時**。本次沒有新跑完整 UI 驗證。
- 下載程序已正常結束，沒有需續接的 running shell session 或本機伺服器。
- 未提交變更涵蓋 data、frontend、functions、scripts、tests、package.json、docs；保存的 Git 清單見下方 checkpoint。不要 reset、checkout 覆蓋或刪除這些工作。

## 下一個 Session 的前 3 步

1. **讀 checkpoint 與八件筆記，恢復輔助腳本。**
   - 讀 `docs/research/2026-09-22-expansion-500/handoff-checkpoint-2026-09-23.json`、`selection-summary.json`、`pending-read-notes-2026-09-23.json`。
   - 執行 `cp docs/research/2026-09-22-expansion-500/handoff-support/*.py /private/tmp/`。這只恢復手寫審核的儲存工具；不要批次執行舊 author 檔。
   - 確認 `/private/tmp/antidoping-individual-evidence/` 仍有筆記指定的原件及文字。若缺失，重新取得來源並核對雜湊；不能把新下載雜湊直接替換成已審證據。
2. **將八件已讀個案正式寫成審核。**
   - 依筆記及原始公告，建立 `/private/tmp/antidoping-author-usada-04.py`，用 `antidoping-usada-short-author.py` 的 `persist(rows)` 儲存；可參考已完成的 `antidoping-author-usada-03.py`，但必須逐案手寫。
   - 八件是 Chad Olsen、Addie Bracy、Katerina Brim、Lindsey Corrigan、Breanna Clark、Tyler Burdick、Keiser Witte、Alejandra Echeverri。
   - 特別核對：Brim 是 **申報 insulin 使用而實驗室陰性**，USADA 曾給追溯 TUE、WADA 否決；Corrigan 退休期間 **停止計時**，不能硬算固定到期日；Echeverri 成績取消範圍只有 **2022-10-21 至 10-23**；Bracy 超量 IV 沒有禁用成分也能構成方法違規。
   - 寫完執行 `npm run data:reviewed`，看真實新增完成數；筆記本身不算通過。
3. **從有來源的候選繼續逐案審核，固定完成門檻。**
   - 讀 `usada-next-review-queue.json`：目前 120 個未接受且公告標題有 U.S. 的候選，包含上面八件；每次需排除已接受 ID。這只是排序，不是審核結果。
   - 閱讀文件的全部個案實質段落，核對目前名冊有無後續處分，再手寫八項 findings。其他美國居住者若沒有明確國家身分，補 UCI、World Athletics、Team USA 等官方身分來源再採用。
   - 需要更多來源時執行 `python3 scripts/fetch-case-evidence.py --source usada --limit 40 --retry-failed`；網路需既有批准的 sandbox escalation。上一批末段多個 curl 7／28 失敗，不代表案例不存在。
   - 到資料檢查點執行 `npm run test:reviewed` 和 `npm run audit:completion`。只有真正 500 件逐案證據完備，才做最新前端 build／API／517 路由瀏覽器檢查及 GitHub／正式站同步驗證。

## 查核標準

- 必填八項：identity、nationality、event、rule、outcome、period、disqualification、proceduralStatus；每份證據有 documentId、SHA256、具體頁／段／公告定位。
- 官方名冊、原始公告、完整裁決、上訴、追溯 TUE、未來用藥 TUE 必須區分；不以下載、HTTP 200、schema pass、名稱匹配冒充已審。
- 國籍／代表國使用官方明列身分；不依姓名、出生地、居住地或裁罰機構推論，避免台灣選手。
- 同一人的原處分、追加處分、CAS 階段應合併，除非獨立事件證據足夠；本次新增保守排除所有基底人名。
- `resultsCancelled` 可為 null（未知）；`medalStripped` 除非明確證實實際剝奪獎牌，維持 null。一般 forfeiture 套語不是證據。
- 不把無過失 ADRV、公開警告、未起訴、撤銷、合法 TUE 混成同一結果；不自行補動機、污染、病史或主觀故意。
- 2026-09-22 是凍結名冊目錄日期；現在已跨到 2026-09-23 JST，新手寫審核日期已在輔助腳本改為 09-23。不要改掉原始文件／前案日期。

## 已知待解決事項

1. **Betty Wilson Lempus 有較新期間差異** — `individual-case-reviews.json` 中 `aiu-3b4e8085b64b`，disposition=`needs_final_source`。
   - 已讀 `afb493d2ee94d82b.txt` 全 7 頁：五年自 2022-10-14，DQ 自 2021-09-05；末頁年份 2022 與內文及第一審名冊 2023-01-13 不符。
   - 當前 global ineligible list 另列決定 2023-08-16、eligibility 2027-12-25；須補後續裁決，不可只看初次文書就接受現行期間。
2. **CAS Nicolas Chilard 檔案回傳 HTML** — `scripts/fetch-case-evidence.py:49`。
   - manifest `575f699ac678db33` 為 unexpected_content，不能以它作已讀 PDF。網址 `https://www.tas-cas.org/fileadmin/user_upload/11250_Sentence_FINAL__for_publ._.pdf`。
3. **三個 held 必須保持不在候選選擇內**。
   - Boubacar Mangue Gaya `ita-e7c9638b8a24`：起迄日期與名冊衝突。
   - Anas Lamkabber `ita-6be595c9e467`：到期日 11 vs 12 Feb 2028。
   - Yunder Beytula `ita-d9d54f127965`：只有暫時禁賽公告，不能佐證名冊八年＋終身。
   - 首批另有 Parveen Sharma、Miguel Tudela 日期疑義已換案，不能重新計入。
4. **新來源仍有身分待補**。
   - 已讀 Rider Samelo do Amaral、Erin Oprea、Laura Meador 公告，尚未接受；文章只列居住地，不應直接據此填國籍。
   - Evan Boyle 的 UCI 身分頁 Nationality USA 已核對（原 HTML rider 資料）；其 `Sanctions None` 沒有反映較新 USADA 處分，本案只用 UCI 頁佐證身分。
5. **既有 171 筆仍有未完成歷史查核**。
   - 16 校正＋1 重複合併＋13 重大疑義隔離＋141 歷史待查＝171；另拆 Sun Yang 2018 得保留17。不要稱 141 件都已證偽或已逐案審查。
   - 快照 SHA256 `a2b569c398bd0592522a008b67bcb3525de8e5192cca96378ec43a00e1401da6`。

## 關鍵檔案

- `docs/research/2026-09-22-expansion-500/individual-case-reviews.json` — 已正式寫入的逐案 findings，接受數207，另加首批50。
- `docs/research/2026-09-22-expansion-500/announcement-reviewed-cases.json` — 21 件 USADA 完整公開欄位；與 review 檔共同輸入重建。
- `docs/research/2026-09-22-expansion-500/individual-source-manifest.json` — 601 筆文件取得紀錄，含 URL／SHA／原件與文字路徑；acquisition status 不會因人工接受而改成 reviewed。
- `docs/research/2026-09-22-expansion-500/pending-read-notes-2026-09-23.json` — 八件已讀未整合；不能加進257。
- `docs/research/2026-09-22-expansion-500/usada-next-review-queue.json` — 下一批120候選的文件路徑。
- `docs/research/2026-09-22-expansion-500/handoff-checkpoint-2026-09-23.json` — 最新實際數量、狀態與驗證。
- `docs/research/2026-09-22-expansion-500/handoff-git-status-2026-09-23.txt` — 交接前未提交變更清單。
- `docs/research/2026-09-22-expansion-500/handoff-support/` — 7 個恢復用 Python 輔助檔；舊 author 檔僅供格式參考，不要重跑批次。
- `scripts/build-reviewed-cases.py:421` — 外部已審公告加入、保留既有已接受個案；`:455` 官方最終 HTTPS 來源。
- `scripts/prepare-usada-evidence.py:37` — 凍結USADA名冊與候選建立；不會自動准許案例。重跑會以當下資料重新排除已選人名，不能不看差異就覆蓋工作清單。
- `scripts/fetch-case-evidence.py:64` — 讀個案 queue、USADA queue、supplemental links，下載不自動接受。
- `scripts/audit-new-case-completion.mjs:1` — 編輯完成門檻；尚未500必須回傳in_progress。
- `tests/reviewed-cases.test.mjs:102` — 保留已接受案例、追加處分、未來TUE的新增回歸檢查。
- `data/cases.json` — Cloudflare Pages API 使用的517筆重建資料；舊 MERN 不是部署主體。

## 環境／部署注意事項

- 專案 `/Users/ethanwu/Documents/Vibe coding/claude/Antidopingplatform`；Node 26.5.0、Python 標準庫、pdftotext／pdftoppm 可用。
- 所有原件暫存在 `/private/tmp/antidoping-individual-evidence/`，尚未複製進 Git，請勿清理。OCR文字為 `<id>.ocr.txt`，若需要讀掃描圖，核對原PDF與OCR來源，不能只依OCR自動接受。
- OCR 用 `python3 scripts/ocr-case-evidence.py`；Apple Vision 在 sandbox 內會失敗，需已批准的 escalation。已完成17份掃描件OCR。
- 無 migration 或新增環境變數需求。未做任何新的公開部署或訊息發送。
- 前端驗證輔助腳本 `/private/tmp/antidoping-local-server.mjs`、`/private/tmp/antidoping-browser-500.mjs` 仍須調整為517總筆數；Playwright 在 `/Users/ethanwu/.claude/skills/fb-post/node_modules/playwright/index.mjs`。
- 禁止以 backend 歷史隨機資料生成器補足數量；不要把尚未核實的243件寫成500完成或部署聲明。
