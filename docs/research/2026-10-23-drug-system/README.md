# 台灣西藥、中藥與營養品查詢：可行性、實作與移植

查核日期：2026-10-23（台灣）。目標是使用者指定的 [TADA 西藥查詢頁](https://www.check-antidoping.org.tw/inquiry.php?category=2)。

**已建立可執行的三類查詢與可移植資料庫，共 84,540 筆來源紀錄；尚不是 TADA 全資料、全判讀或視覺的一比一複本。** 商品事實資料直接取自 TFDA 與健保署官方開放資料，TADA 只做少量公開介面與詳細結果核對。未取得其內部資料庫或人工分類表。

## 原站實際觀察

| 項目 | 查核結果 |
| --- | --- |
| 查詢入口 | PHP 伺服器輸出 HTML；前端使用 jQuery、Bootstrap、Select2 |
| 查詢欄位 | 使用者類型、運動類型、關鍵字；四個分類分別為物質、西藥、中藥、營養品 |
| 公開查詢參數 | `inquiry.php?category=2&part=13&sport=102&keyword=tramadol`，分頁使用 `page`；這是網站查詢介面，不是有版本保證的開放 API |
| 分頁選項 | 10、25、50、100、1000 筆 |
| 明細入口 | `inquiry_page.php?id=22246&category=2`，原站 ID 不等於 TFDA 許可證 |
| 明細內容 | 商品中英文名、賽內／賽外狀態、條件、禁用物質、WADA 分類、許可證、劑型、主成分、適應症、申請商、製造商 |
| 嵌入限制 | 2026-10-23 實際 HTTP HEAD 回傳 `X-Frame-Options: SAMEORIGIN`，不適合直接跨站 iframe |
| robots.txt | 本次取得 404；這不構成資料重製授權 |
| 後端資料庫 | 公開頁面不能確認 DBMS、實體資料表、完整筆數、人工分類規則或完整更新歷史 |

本次 `tramadol` 公開查詢回傳 32 筆。重建版 TFDA 快照的相同字串搜尋回傳 43 筆，包含歷史註銷紀錄，顯示兩者資料範圍／更新／搜尋邏輯不同，不能宣稱筆數或結果完全相同。

實際比對的原站明細為「斯眠靜注射液」、許可證 `衛署藥製字第036167號`：原站列出 tramadol、S7、賽內禁止／賽外不禁止。本機找到同一許可證與 `TRAMADOL HCL`，規則判讀同為賽內受限，並保留賽外殘留提醒。**這只是一筆抽查，不代表全站判讀一致性驗證。**

## 三種做法的取捨

| 做法 | 可行性與限制 |
| --- | --- |
| 直接嵌入／即時代理原站 | iframe 受阻；解析 HTML 的代理會受對方介面、可用性與使用條款影響，本次未採用 |
| 原站資料庫與介面一比一移植 | 須由權利人提供資料匯出、分類表、程式／素材授權與更新約定；公開頁面不足以重建全部內容 |
| 官方開放資料＋獨立查詢與規則 | 本次已實作。可自行維護、匯出 SQLite、離開原站運作；臨床判讀須逐步建立與審核 |

[原站使用條款](https://www.check-antidoping.org.tw/privacy.php)對受著作權保護的內容要求取得同意或授權；本次沒有複製其品牌圖像、版型原始碼或大量人工說明。TFDA 的 [全部藥品許可證](https://data.gov.tw/dataset/9122)與[藥品詳細處方成分](https://data.gov.tw/dataset/9121)則標示[政府資料開放授權條款第 1 版](https://data.gov.tw/license)，可在遵守顯名等條件下利用。本專案已保留提供機關、資料集網址、取得時間、來源 SHA-256 與加工說明。

若要取得原站一比一版本，應向 TADA／建置單位確認：商品表與成分表、同義名、成分到 WADA 的人工對照、途徑／劑量／運動／時段例外、清單版本及生效日、更新與刪除紀錄、轉載及再授權範圍。這次未代為寄信或聯絡。

## 本次資料成果

來源實際下載於 2026-10-23 01:33（台灣），原始下載 URL 與雜湊見 [manifest](../../../data/drugs/manifest.json)。資料提供平台標示每 7 日同步；下載時間並非官方每筆資料的更新時間。

| 指標 | 數量 |
| --- | ---: |
| 原始許可證列 | 72,088 |
| 原始處方成分列 | 126,028 |
| 依許可證去重後 | 66,522 |
| 多製造商等重複資料列 | 5,566 |
| 來源未標示註銷的許可證 | 22,509 |
| 已註銷／已廢止 | 43,860／153 |
| 缺少成分的許可證 | 3,807 |
| 無對應許可證的成分原始列 | 1（保留於 SQLite 原始表，不臆造藥品） |
| 非製造商關鍵欄位互相衝突的許可證 | 0 |

包含 TFDA 原始資料中的製劑、原料藥、菌疫與其他許可證類型，並非 66,522 款仍在市售的藥品。「未註銷」也不等於已核實藥證有效；介面可另外篩選來源有效日期尚未過期的紀錄。

## 禁用判讀的實際覆蓋

規則固定適用 **2026-01-01 至 2026-12-31**，以 [WADA 2026 正式清單](https://www.wada-ama.org/sites/default/files/2025-09/2026list_en_final_clean_september_2025.pdf)與專案原有 50 項規則為基礎，增加列名物質與明確同義名，共 156 項物質規則。追加規則保存在 `backend/data/drug-ingredient-rules.json`，保留原有單一物質工具的資料來源與判讀引擎。

| 名稱對照結果 | 全部許可證 | 未標示註銷 |
| --- | ---: | ---: |
| 所有已提供成分名稱均可對應 | 4,933 | 1,664 |
| 部分名稱可對應 | 4,020 | 1,787 |
| 所有名稱尚未對應 | 53,762 | 16,425 |
| 原資料缺少成分 | 3,807 | 2,633 |

7,686 個不同成分名稱中，230 個可對應，目前還有 **7,456 個待整理**。這是名稱對照覆蓋率，不是禁用盛行率，也不是用藥安全性或可用藥品數。WADA 禁用類別包含未逐一列名的同類物質，不能靠「沒列在清單」推定允許。已依正式清單第 6 頁補入 DHEA／dehydroepiandrosterone 對應 prasterone。

- 完整統計：[coverage.json](coverage.json)
- 待確認清單，依未註銷品項出現次數排序：[unmapped-ingredients.csv](unmapped-ingredients.csv)
- 已知限制：S0／同類藥理物質未全面涵蓋；S2 的性別條件及其他未建模規則仍待處理；不計算個人劑量、檢體濃度或清除期；不判定 TUE 核准。中藥與營養品已提供本機商品查詢，但沒有足夠資料授予產品可用判定。

複方保留每個成分；已知禁用成分不會被其他成分遮蓋，未知成分也不會被推定允許。鹽類僅使用明列的完整字尾與明確別名，沒有模糊子字串判定。S3 仍須確認劑量及 S5 併用，P1 使用目前運動項目表，S9 不從劑型猜測實際途徑。超出規則年份會停止顯示各成分的允許／禁用判定。

## 中藥與營養品新增範圍

| 分類 | 官方來源／版本 | 已匯入 | 判讀界線 |
| --- | --- | ---: | --- |
| 中藥複方 | 健保署用藥品項表，115.10.01 版 | 6,539 | 無完整處方成分與藥證效期 |
| 中藥單方 | 同上 | 3,507 | 商品名不能替代實際成分／含量確認 |
| 健康食品 | TFDA 資料集 6951 | 565 | 只列保健功效相關成分，非完整配方 |
| 輸入錠狀／膠囊狀食品 | TFDA 資料集 9047 | 7,407 | 來源登錄成分不等於實際批號檢測 |

中藥來源是[健保署中藥用藥品項表](https://www.nhi.gov.tw/ch/cp-14300-03585-2467-1.html)，遵循[政府網站資料開放宣告](https://www.nhi.gov.tw/ch/cp-4379-5d212-3280-1.html)。本次命令列下載遇到來源防護，使用者協助在瀏覽器完成兩份 ODS 的儲存；匯入保留檔案 SHA-256、工作表、列號與原始欄位。取得時間使用本機下載檔的完成寫入時間，已在 manifest 註明，不冒稱伺服器發布時間。不是衛福部所有中藥許可證的全量副本；舊中藥開放資料集 8578 已下架，未用舊資料冒充現況，也未繞過 MOHW 查詢驗證碼。

10,046 筆中藥紀錄包含 10,045 個不同健保代碼。`A038755` 在來源出現「天明」與「忠山」兩筆不同紀錄，均保留並顯示衝突；`A045324`、`A045419`、`A045772` 的發證日期分別為 `120`、`321`、`10918`，保留原值並標示無法解析，不自行補年份。健保「不再收載日期」獨立保存，包含來源已預告的未來日期，沒有轉成藥證註銷。中藥 ID 依來源種類與原始列內容雜湊，來源內容變更時 ID 也會變更，不能用它當永久藥證 ID。

食品來源為 [TFDA 健康食品](https://data.gov.tw/dataset/6951)與[輸入錠狀膠囊狀食品查驗登記](https://data.gov.tw/dataset/9047)，採政府資料開放授權條款。兩份 JSON 於台灣 2026-10-23 02:22 分別下載並記錄時間，未刪除失效／註銷歷史紀錄。5 筆沒有成分內容；7,972 筆均沒有可由此來源驗證的運動禁藥批號證明。`certifications=[]`、`batchVerification=not-provided` 表示資料未提供證明，**不是認定該產品從未接受檢測**。

TADA 營養品分類還整合國際檢測／認證來源；本次台灣食品登錄資料不等於那份產品清單，沒有大量擷取 NSF、Informed Sport、Cologne List 等來源。介面提供 TADA 與 USADA 官方查證入口。後續若取得第三方資料授權，應另外建立「產品版本＋批號＋檢驗單位＋報告日期／效期＋原始證明」資料表，逐批核對，不可把同品牌其他商品或不同批號套用同一認證。[USADA 指引](https://www.usada.org/athlete-advisory/supplement-risk-nsf-certified-for-sport/)指出第三方檢測可降低風險，不能消除所有風險。

## 操作與移植

查詢頁：`/drug-search`、`/herbal-search`、`/supplement-search`。三頁共用分類導覽，支援商品、來源有提供的成分、許可／核備／健保代碼、分頁與可分享的明細網址。西藥另有註銷與效期篩選，以及逐成分賽內／賽外對照。品牌查詢不會把其他同成分商品當作該品牌。

```sh
# 不需連線到 TADA，也不需啟動 MongoDB，即可使用新增的藥品頁
npm --prefix frontend run dev -- --host 127.0.0.1 --port 5188 --strictPort

# 從 TFDA 重新下載；需要 Python 3 與網路，不需額外 Python 套件
npm run drugs:import
npm run foods:import
# 先由健保署頁面取得同一版本的單方與複方 ODS
npm run herbs:import -- \
  --complex-file artifacts/drugs/antidoping-nhi-tcm-complex.ods \
  --single-file artifacts/drugs/antidoping-nhi-tcm-single.ods \
  --snapshot-date 2026-10-01
npm run drugs:audit
npm run test:drugs
npm --prefix frontend test
npm --prefix frontend run lint
npm run cf:build
```

`drugs:import` 不是已啟用的背景排程。新來源若缺少必要欄位、筆數異常或日期格式錯誤會中止，不覆蓋既有快照。離線匯入必須提供兩個原始檔與真實 `--retrieved-at`，避免把舊檔誤標為剛取得；指令範例見 `scripts/import-tfda-drugs.py --help`。

| 檔案 | 用途 |
| --- | --- |
| `data/drugs/catalog.json.gz` | 版本控制中的正規化 JSON 全量快照，約 11.5 MB；可直接解壓移植 |
| `data/drugs/manifest.json` | 資料來源、授權、筆數、下載及匯入時間、原始檔與快照雜湊 |
| `artifacts/drugs/taiwan-drugs.sqlite` | 本機 SQLite 匯出，含完整原始列與正規化資料；不進 Git |
| `artifacts/drugs/taiwan-drugs.sqlite.gz` | SQLite 的壓縮移植檔；不進 Git |
| `frontend/public/drug-data/` | 建置自動產生的瀏覽器資料，不進 Git |
| `data/products/{herbal,supplements}/` | 中藥與營養品的壓縮 JSON 快照與來源 manifest，進 Git |
| `artifacts/drugs/herbal.sqlite(.gz)` | 中藥移植檔，含來源工作表、列號與原始欄位；不進 Git |
| `artifacts/drugs/supplements.sqlite(.gz)` | 食品移植檔，保留許可／核備字號與原始欄位；不進 Git |
| `frontend/public/product-data/` | 中藥與營養品的建置產物，不進 Git |
| `artifacts/drugs/antidoping-catalogs-2026-10-23.zip` | 三份 SQLite gzip、來源 manifest、SHA-256 與操作說明的移植包，46,833,641 bytes；不進 Git |

移植包已檢查 ZIP 全部 8 個成員的 CRC，SHA-256 為 `5b91cab97898687cdead446277ece495f9e71bce203bfb11e38c0926340fdf47`。包內各檔案的 SHA-256 在 `checksums.json`；壓縮前的三份 SQLite 均通過完整性與外鍵檢查。包內沒有應用程式原始碼；原始碼已保存於本專案獨立分支，實作 commit `9692504b42d8874b6b229e3898469d2c3afef1a4`。

SQLite 有 `products`、`ingredient_details`、`source_licenses`、`source_ingredients`、`metadata` 五張表。原始列以 JSON 完整保存，去重不刪原始證據；產品以許可證衍生穩定 ID，製造商彙整為多值。許可證註銷狀態與運動禁藥狀態是不同欄位／資料層。

```sql
SELECT license, name_zh, name_en, cancellation
FROM products
WHERE name_zh LIKE '%普拿疼%';

SELECT p.license, i.name, i.basis, i.amount, i.amount_text, i.unit
FROM products p JOIN ingredient_details i ON i.product_id = p.id
WHERE p.license = '衛署藥輸字第023917號';
```

網站採靜態索引＋256 個藥品明細分檔，11 MB 索引在背景 Web Worker 載入與搜尋，明細按需取得。版本目錄及 SHA-256 驗證阻止資料混版；載入失敗顯示錯誤，不使用空資料假裝「查無」。沒有把 66,522 筆全量資料塞進 Pages Functions bundle，也沒有新增正式 D1 migration、金鑰或雲端服務。

中藥索引 1.03 MB、食品索引 1.82 MB，也各自分為 256 個明細檔。每個 worker 只允許單一分類，來源 manifest 分類不符或檔案雜湊不符就拒絕顯示結果。三類資料皆為公開事實資料，JSON／SQLite 是方便移植的形式，不是 TADA 的後端 schema。

若移至其他 React 網站，可搬資料建置腳本、`drugCatalog.js`、`drugAssessment.js`、worker 與頁面組件；若改成服務端查詢，可直接讀 SQLite／JSON。現行 `POST /api/tue/check` 仍是原本的單一物質工具，**不是新增的全量商品查詢 API**。

## 驗證與目前狀態

- 匯入測試 13 項通過；涵蓋正規化與原始列、複方、重複製造商、來源衝突、遺失成分、ROC 日期、ODS 重複空白欄位、異常日期與 SQLite 保存。
- 前端 89 項測試通過，含 11 項新西藥判讀與 4 項食品／中藥證據邊界測試。
- Node 合約／規則／資料／worker 測試 58 項通過，包含真正 worker 的搜尋、別名、品牌誤匹配回歸、分頁、三類明細與分類隔離、缺少雜湊／檔案損壞時拒絕結果及重試。
- 原有後端整合測試 91 項通過；使用測試專用暫存 MongoDB。
- ESLint 無錯誤與警告；Vite 正式建置通過。此專案為 JS/JSX，沒有 TypeScript 設定／typecheck script；嘗試離線 `tsc --noEmit` 因未安裝及無快取而未能執行，不宣稱型別檢查通過。
- SQLite `integrity_check=ok`、`foreign_key_check` 無結果；原始表筆數與下載來源一致。
- 桌面 Chrome 已實際操作許可證搜尋、複方明細與判讀；更完整的瀏覽器紀錄見 [驗證紀錄](validation.md)。

工作位於 `feat/taiwan-drug-search`。正式站尚未部署，未宣稱專業藥事審核、完整原站一致性或 2027 清單支援。若要成為正式的醫療決策服務，下一步是處理待對照成分、完成逐條規則與代表性複方的專業審核，再決定發布範圍。
