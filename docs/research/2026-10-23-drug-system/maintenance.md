# 西藥覆蓋率與定期更新

2026-10-23。工作在 `feat/taiwan-drug-search`，尚未推送或部署。**97.01% 已存檔，依使用者指示停止擴充並轉入TADA查驗**。本版完整成分對照為19,282／19,876；本輪由96.10%增加181個完整品項。前端、稽核指令與更新門檻使用同一套 matcher，不以估算值代替實測。

## 驗收口徑

- 目標族群：TFDA 來源未註銷且至少有一個成分的許可證；包含製劑、原料藥等原始類型，不冒稱全部仍在市售。
- 分子：每個已提供成分名稱皆有規則，而且來源無關鍵欄位衝突。
- 缺少成分的 2,633 筆另列，同時保留全部未註銷 22,509 筆的覆蓋率 85.66%。
- `npm run drugs:check-target` 未達 95% 時退出碼為 1。資料更新門檻未過則為 2，下載／格式失敗為 1。
- 名稱對照完成仍可能得到「禁用」或「需確認條件」，也不是判讀正確率或臨床核准率。

## 本版已做的工作

1. 規則由初版 156 增為 2,411，本輪由2,259淨增加152項；3,644 個來源名稱可對應。保留來源、年份、查核日期及衍生方法；新增證據仍標示 `clinicalReview=pending`。
2. NLM 的 289 筆 PIN→IN 關係只解決名稱身分；327 條生成別名不會把沒有規則的物質變成可用。已有精確物質規則時不再用較廣的父成分覆蓋；既有規則、顯式別名與來源別名的衝突會使重建失敗。
3. 增補 S6 局部途徑、S5 眼部例外、S9 糖皮質激素與 CMAS 特定賽事限制。列名 S2.2.1 藥物支援男性適用條件，未選或值不明時保持待確認；女性選項也不會消除其他成分的限制。不從劑型猜用法，賽外條件保留殘留與 CMAS 72 小時期間的提醒。
4. 商品明細可檢查規則與名稱對照來源；首頁顯示真實覆蓋率與缺成分數。舊頁面若遇不同規則版本的覆蓋率，隱藏不相符的數字，搜尋仍可用。
5. TFDA 更新採候選快照、差異、品質檢查與備份；不修改來源網站、不聯絡第三方、不自動發布。
6. 新增可重現的逐項參考匯入器：1,615 個明確決策，逐一核對原 HTML 雜湊、實際成分、TFDA 完整配方與有效人體製劑藥證。重複匯入新增 0 條規則／0 條一般別名／0 條整字串別名，已實測。

7. 新增 S5 靜脈血漿增容劑與腎上腺素例外，明確區分注射未確認、靜脈、非靜脈及局部麻醉用途；不從劑型或複方推定例外。Dextran 衍生物與 albumin tannate 保留獨立身分。
8. 新增 `npm run drugs:review-queue`，以「只差這一個成分即可完成的品項數」及複方缺口排序；NLM 型別只供優先查核，沒有改變分母或判定。

9. 新增 `referenceRoutes` 與來源範圍說明：口服消化酵素／具名植物材料、皮膚外用 ichthammol 等只在已核對範圍內判讀；未選途徑待確認，其他途徑待查。`exactNameOnly` 不從 RxClass 泛化材料，空值／錯誤途徑設定會拒絕載入。`named-unconditional` 不能覆寫這類既有範圍。
10. 修正 `N(2)-…` 搜尋截斷；完整 alanylglutamine 藥品可查核。Isoproterenol HCl 與 hetastarch 新身分對照保留 S3／S5 限制，所有複方與 M2 提醒仍有效。

11. `edetate disodium` 只接受明確 disodium 身分，已禁止 RxClass 把 tetrasodium 或未定義 sodium edetate 自動對應為 disodium；保留回歸測試。
12. 本輪新建 imlunestrant S4.2 具名分類，連結 flucloronide／meprednisone 的 S9、gonadotrophin 的男性限定規則；iron dextran 與 S5 dextran 分開。來源括號互相矛盾的 `MAGNESIUM OXIDE (MG. TRISILICATE)`、`NIACIN (NIACINAMIDE)` 保持未知。

## 補齊成分的操作

`config/drug-reference-decisions.json` 保存明確的原始名稱、標準名、來源 URL／SHA-256、身分依據與判定理由。`named-unconditional` 只接受沒有額外條件且不與主要限制衝突的具名成分；`identity-only` 只能對照已存在的規則；`named-cmas-conditional` 另須精確核對聯盟來源與 72 小時條件。這不是臨床核准表，也不會從搜尋結果批次自動填入。

```sh
# 先產生優先查核清單；不改變任何規則或覆蓋數
npm run drugs:review-queue

# 有限量取得公開查核證據；不是建立規則
npm run drugs:references:collect -- --max-queries 30 --max-requests 90
npm run drugs:references:audit

# 逐項查核並編輯 decisions 後，先預覽，再明確套用至本機規則
npm run drugs:review-import -- --output artifacts/drugs/REVIEW-RUN
npm run drugs:review-import -- --output artifacts/drugs/REVIEW-RUN --apply
npm run drugs:aliases
npm run drugs:audit
npm run drugs:check-target
```

每一批套用使用新目錄，避免覆蓋先前備份。收集工具正規化空白並保留化學位置造成的短前綴；這只修正查詢字串，實際回傳成分仍必須完整相同。匯入重新解析 `artifacts/drugs/reference-checks/cache/` 的原 HTML，不信任可被編輯的綠色旗標；具名規則的共同 M2 警告 SHA 亦須符合已核對版本，警告文字不同時停止匯入。搜尋詞、其他相似商品、不同配方不能成為規則依據；使用規範含條件者也不能當成無條件允許。正常網站建置只讀保存的規則，不依賴外站或本機 HTML 快取。

目前3,176筆公開參考中，9筆與不依途徑的主要規則有差異、347筆排除、2,820筆參考用途；此工具不代表完整途徑／聯盟一致率。新增丁香S3與succinyl gelatin靜脈S5限制，撤回7筆依賴矛盾配方的新材料規則。固定樣本查驗另發現riociguat／CMAS條件差異待裁定，見[查驗報告](tada-validation-9701.md)。

## 原始名稱有錯誤附註時

`literal-identity-only` 只能把經逐筆查證的完整原始字串連到已存在的規則，不會建立新分類。`reviewedLiteralAliases` 目前 3 筆，保留來源 URL／SHA-256、對應藥證、日期及身分依據；只正規化大小寫、全半形與空白，禁止自動補括號或外推其他濃度。一般不完整名稱仍拒絕配對；JSON 空值、未知目標、別名衝突、雜湊變更或編輯既有證據會停止匯入。

## 月／季更新

設定：`config/drug-update.json`。預設 `cadence=monthly`，GitHub cron 每月 1 日台灣時間 09:17 觸發；GitHub 排程可能延遲，並非準時保證。改為 `quarterly` 後僅 1／4／7／10 月執行資料取得。手動 `workflow_dispatch` 可隨時檢查。

目前 workflow 只存在本機分支，**沒有已啟用的遠端排程**。要啟用須將經審查的版本整合至儲存庫預設分支；本專案 push main 會觸發既有 production 部署，不能把啟用排程當成沒有部署影響的操作。

```sh
# 只下載、匯入候選及產生差異，不替換目前快照
npm run drugs:update

# 查看排程日；--date 僅能用於排程檢查，不能規避來源新鮮度／規則年份
python3 scripts/update-drug-catalog.py --check-due --date 2026-11-01

# 既有候選以目前規則重新稽核，輸出必須使用新目錄
python3 scripts/update-drug-catalog.py \
  --candidate artifacts/drugs/updates/RUN/candidate \
  --output artifacts/drugs/updates/RECHECK

# 審查完成且全部門檻通過後，明確替換本機資料；仍不部署
python3 scripts/update-drug-catalog.py \
  --candidate artifacts/drugs/updates/RUN/candidate \
  --output artifacts/drugs/updates/APPROVED-RUN --apply
```

每次產生 `diff.json`、`before/coverage.json`、`after/coverage.json`、`update-report.json`。排程會保存候選與報告 90 日，失敗也保留；不會寄出電子郵件或自行建立 PR。

以下會擋住替換：低於 95%、覆蓋率下降、總筆數或未註銷筆數異常減少、來源衝突增加、缺成分率上升、來源過舊、來源／規則雜湊不符、規則過期、用於類別推導的人體製劑藥證失效或成分改變。替換前再次確認兩份快照未變；寫入失敗會還原備份。程序／機器中斷不保證多檔案同時原子切換，但後續建置的 checksum 會拒絕不完整快照。

實際下載的最新候選與原快照 SHA 相同，沒有新增／刪除／變更。最後重驗報告：`artifacts/drugs/updates/coverage-9610-final-v2-20261023/update-report.json`，退出 0、`gate.passed=true`，無警告或藥證證據問題；`applied=false`、`productionDeployed=false`。原資料未被覆蓋。

## 年度規則與審核

月／季自動化目前更新 **TFDA 商品與成分**。WADA、各聯盟及允許範例文件不會被自動解析成新醫療判定；需年度與公告變更審核。2026 規則到 12 月 31 日，距到期 60 日內產生警告，過期即阻止更新替換，查詢也停止允許／禁用判定。

主要依據：

- [WADA 2026 正式清單](https://www.wada-ama.org/sites/default/files/2025-09/2026list_en_final_clean_september_2025.pdf)及[監控計畫](https://www.wada-ama.org/sites/default/files/2025-09/2026_list_monitoring_program_en_final_clean_september_2025.pdf)。
- [日本藥劑師會 2026 指引](https://www.nichiyaku.or.jp/files/co/activities/guidebook_2026.pdf)、[NADA 允許範例](https://www.nada.de/medizin/digitale-beispielliste)、[荷蘭 2026 允許藥品](https://www.dopingautoriteit.nl/juridisch/dopinglijst/toegestane-geneesmiddelen)。
- [荷蘭禁藥機構／KNMP 2026 具名禁用物質](https://www.dopingautoriteit.nl/juridisch/dopinglijst/verbodenstoffenlijst)，保存具名 S2／S3／S5／S6／S7／S9 及性別、途徑條件。
- [CMAS 特定成分規則](https://www.cmas.org/document/freediving/freediving-regulations/cmas-technical-rules-on-benzodiazepines-and-pde5-inhibitors.html)。
- [RxNorm 型別關係](https://lhncbc.nlm.nih.gov/RxNav/APIs/api-RxNorm.getRelatedByType.html)只作身分對照，並非運動禁藥判定來源。

## 97% 存檔後的查驗

99%擴充依使用者最新指示暫停。凍結版本19,282／19,876，97.01%；98%尚差197、99%尚差396，這些數字僅保留進度，不是當前工作。

資料與判讀程式位於`artifacts/drugs/checkpoint-9701-20261023/`，完整壓縮備份在同名`.tar.gz`；規則變更不能覆寫此目錄。抽樣及結果位於`artifacts/drugs/tada-validation-9701-20261023/`。固定500筆不換樣本，分開報告開發來源重疊、未取得參考、條件不足與可能誤判可用。riociguat聯盟適用範圍優先裁定。詳見[第二輪報告](tada-validation-9701-round2.md)。

解析器已修正藥名h3吞掉第一個欄位的問題。原HTML重解析3,176筆，匯入禁止空白「禁用物質名」通過一般允許守門；必須精確為「不含禁用物質」。CMAS精確核對具名物質，不把非空條件欄忽略。遇access/rate-limit停止，不能換工具繞過或反覆重試。

第二輪新增參考獨立保存在 `artifacts/drugs/tada-validation-9701-round2-20261023/references/`，不寫回規則或凍結前的 facts。`collect-drug-validation-references.py` 僅接受固定 500 筆的藥證；原 HTML、網址、擷取時間、SHA、逐次查詢與失敗紀錄均保留。同名不同藥證不採用，配方不同保留衝突，不替換樣本。

`--known-links-only` 僅讀已觀察到的明細網址；`--ingredient-search-only` 每個待查品項最多用兩個普通成分關鍵字作定位，仍要求完整藥證／配方核對，不能把搜尋用的名稱截短當作成分身分證據。網站表單支援每頁 1000 筆；若結果未涵蓋完整搜尋範圍，只能記錄該次未找到精確配對，不能宣稱網站未收錄。HTTP 401／403／429 會建立全批停止檔；拒絕／空白／解析失敗的品項不自動重試。`--trade-name-search-only` 可對其他仍未配對品項補查無引號控制字元的完整名稱，不刪改原名稱以規避拒絕。

停止收集、待 `facts.json` 穩定後，可以用下列指令重算到**新的目錄**。工具會檢查凍結檔與原樣本雜湊、原始 HTML 重解析、完整成分及新增參考的凍結後時間；收集途中 facts 改變會拒絕評分。原比較器不變，高風險 50 筆也不重抽。

```sh
node scripts/validate-drug-reference-sample.mjs \
  --checkpoint artifacts/drugs/checkpoint-9701-20261023 \
  --sample artifacts/drugs/tada-validation-9701-20261023/sample.json \
  --references artifacts/drugs/tada-validation-9701-round2-20261023/references \
  --output artifacts/drugs/tada-validation-9701-recheck

node scripts/review-drug-validation-conditions.mjs \
  --checkpoint artifacts/drugs/checkpoint-9701-20261023 \
  --results artifacts/drugs/tada-validation-9701-recheck/results.json \
  --output artifacts/drugs/tada-validation-9701-recheck/condition-review.json

node scripts/review-drug-validation-complex.mjs \
  --checkpoint artifacts/drugs/checkpoint-9701-20261023 \
  --results artifacts/drugs/tada-validation-9701-recheck/results.json \
  --conditions artifacts/drugs/tada-validation-9701-recheck/condition-review.json \
  --output artifacts/drugs/tada-validation-9701-recheck/complex-review.json
```

最後兩份是有限情境／條文查核，不會把條件不足改成產品比對通過。所有新參考仍未經獨立臨床裁定；來源一致率不能作為準確率。riociguat／CMAS 的來源與待裁定事項見[分歧覆核文件](riociguat-cmas-review.md)。

下列既有更新／品質檢查仍可使用；95%為最低更新門檻，另有不得退步檢查。97%存檔驗收使用`npm run drugs:audit -- --target 97 --require-target`。月／季workflow仍只在本機分支，沒有遠端自然排程證據。

```sh
npm run drugs:aliases
npm run drugs:audit
npm run drugs:check-target
python3 -m unittest discover -s tests -p 'test_*.py'
node --test tests/*.test.mjs
npm --prefix frontend test
npm --prefix frontend run lint
npm run cf:build
```

別名重建的本機來源在 `artifacts/drugs/evidence-2026/`；取得工具為 `download-drug-identities.py`、`prepare-rxnorm-identities.mjs`、`collect-rxnorm-identities.py`、`build-drug-rxnorm-identities.mjs`。正常網站建置只用已保存的規則與別名，不必重抓外站。

Node worker 測試會重建 `frontend/public` 的資料檔，須與 `cf:build` 循序執行，避免同時修改相同暫存目錄。最新正式建置通過，但藥品頁 chunk 超過 Vite 500 kB 提醒門檻（1,809.03 kB，gzip 272.64 kB）；未以提高警告門檻隱藏此訊息。

最新自動驗證為 311 項測試通過；建置、ESLint、95% 門檻及真實 TFDA 候選門檻均通過。最新瀏覽器結果與截圖見 [驗證紀錄](validation.md)；沒有正式站、實體手機或多瀏覽器驗證。
