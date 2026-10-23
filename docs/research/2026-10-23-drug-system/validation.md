# 查詢系統驗證紀錄

## 最新驗證：固定500筆查驗第二輪（2026-10-23 16:08 台灣）

新增400筆凍結後產品參考，476／500已有參考，373筆可直接比較且一致；17筆未定、84筆條件、2筆配方衝突、24筆未取得。330個條件情境：310一致、19未定、1個riociguat／CMAS潛在誤判可用。另36筆複雜條件中的32筆完成121個成分條文查核，該層次無差異；4筆植物材料仍需批次／配方證據。這些分母不能混合，尚無整體準確率估計。

本輪Python42、查驗相關Node9，共51項測試通過；語法與git diff check通過。新來源逐一從原始HTML重解析、核對SHA與完整配方。原111個條件案例重跑完全相同；原500＋50樣本、26個凍結檔、對應工作樹輸入與原備份雜湊未變。沒有改UI或規則，沒有部署；下方320項原版本測試與Chrome209情境屬先前驗證，未宣稱本輪重新執行。

證據在`artifacts/drugs/tada-validation-9701-round2-20261023/`：`final/`、`verification-receipt.json`、`python-tests.log`、`node-tests.log`。完整資料、限制及未完成清單見[第二輪查驗報告](tada-validation-9701-round2.md)。

## 歷史驗證：97.01%存檔與第一輪TADA查驗（2026-10-23）

依使用者最新指示，在**19,282／19,876＝97.01147112094989%**停止擴充並存檔。本輪相較96.10%增加181個完整品項；全部未註銷22,509筆含2,633筆缺成分，覆蓋85.66%。未提交／推送／部署，不能用舊HEAD聲稱包含這批修改。

| 檢查 | 實測結果 |
| --- | --- |
| 後端Vitest | 91／91 |
| Python匯入／更新／證據 | 30／30 |
| 前端Vitest | 124／124 |
| 既有Node測試 | 75／75 |
| 新查驗比較器Node測試 | 5／5 |
| ESLint、git diff check | 通過 |
| cf:build | 通過，14個SEO HTML；既有大型chunk提醒保留 |
| 1,615個決策冪等重匯入 | 0規則／0一般別名／0整字串別名新增 |
| 明確97%覆蓋門檻 | 通過，未四捨五入或縮小分母 |
| 月更新候選門檻 | 通過，無警告／藥證問題，applied=false |
| Chrome操作 | 209個情境通過，pageErrors=[]，手機無水平溢出 |
| 凍結備份讀回 | 26個固定檔與3,176個原HTML雜湊相符 |
| 固定500＋50樣本重現 | 相同種子、相同品項與結果，逐項比對相同 |

97.01%版本320項自動測試通過，另有5項查驗工具測試，共325項。日誌位於`artifacts/drugs/goal99-batch01/`：前端`frontend-final.log`、Python`python-final.log`、後端`backend-final-escalated.log`、Node`node-final-v2.log`、新比較器`comparator-tests.log`、建置`build-final-v2.log`。後端初次被沙盒listen限制阻擋，允許本機連接埠後通過；新增97%里程碑後修正原測試的預期清單。初次Chrome因舊預覽已停止而連線失敗，啟動本機預覽後重跑成功；失敗日誌未刪。

本輪修復TADA產品標題h3跨越欄位，吞掉「禁用物質名」的解析問題。3,176筆事實由未變的原HTML重建，加入專門回歸測試與更嚴格的具名／CMAS匯入守門，全部既有決策重新驗證通過。丁香9個完整材料名稱依JPA2026與具名來源保留S3；7個僅依賴矛盾綠色配方的新材料規則撤回，備份在`goal99-batch01/clove-review/`。

新的IV凝血蛋白／微氣泡材料限定已查證途徑，succinyl gelatin保留S5靜脈限制。新材料保持整體名稱，不等同單一純成分。新同義名保留S2性別、S4、S5、S9與同位素身分。原先基準規則與前1,457項決策未覆寫，相關一致性證據見本輪`final-consistency.json`。

最新Chrome證據在`artifacts/drugs/browser-2026-10-23-9701/`，涵蓋既有188情境加丁香、efmoroctocog、兩種微氣泡與succinyl gelatin，合計209；另檢視丁香來源衝突品項的手機截圖。頁面實際顯示97.01%，不是正式站、實體手機或多瀏覽器驗證。建置drugSearch chunk為2,180.02kB／gzip324.09kB，沒有TypeScript專案設定，不宣稱typecheck。

[存檔快照](../../../artifacts/drugs/checkpoint-9701-20261023.tar.gz)含凍結資料、原HTML證據與可執行判讀bundle。保存後才抽取固定500筆與另50筆高風險資料；目前54筆二元直接比較一致、22筆須條件覆核、424筆尚未取得參考。補充111個條件情境為92一致、18未定、1個riociguat／CMAS潛在誤判可用，仍待主要來源裁定。沒有將查驗答案回灌凍結規則，沒有宣稱100%準確。完整方法、分母與限制見[TADA查驗報告](tada-validation-9701.md)。

## 歷史驗證：96.10%（2026-10-23 13:29 台灣）

分支 `feat/taiwan-drug-search`，HEAD `040e04aa427faaa063729f28cf2d5081509c6149`。本輪由 **18,992 提升至 19,101／19,876 = 96.10082511571744%**，新增 109 個完整品項；分母、TFDA 快照均未改。98% 尚差 378，99% 尚差 577。全部未註銷族群仍包含 2,633 筆缺成分，覆蓋率為 84.86%。變更仍在本機工作樹，未 commit／push／deploy。

| 驗證 | 最新結果 |
| --- | --- |
| 後端 Vitest | 91／91 |
| Python 匯入／更新／證據 | 29／29 |
| 前端 Vitest | 119／119 |
| Node catalog／worker／coverage／identity／reference 等 | 75／75 |
| ESLint、`git diff --check` | 退出 0 |
| `npm run cf:build` | 退出 0；Node 測試完成後執行，14 個 SEO HTML |
| 1,457 個決策冪等匯入 | 0 規則、0 一般別名、0 整字串別名新增 |
| 95% 驗收／真實候選更新門檻 | 皆通過；無警告或藥證證據問題 |
| 最新建置 Chrome 互動 | 188 個情境通過，`pageErrors=[]` |

共 **314 項自動測試**，另加 188 個瀏覽器情境。全部最新日誌在 `artifacts/drugs/continuation-9555/*-final.log`，不是引用舊輪測試結果。後端與 Python 在最終鹽型收斂前完成，其對應程式未變；前端、Node、lint、build、匯入、候選門檻、瀏覽器於收斂後重跑通過。Vite 原有大型 chunk 提醒保留：drugSearch 1,885.95 kB／gzip 285.72 kB。沒有 TypeScript typecheck 設定，不宣稱型別檢查通過。

### 本輪新增與修正

- 新增 105 個逐項決策、58 項規則。5 個具名成分 flumazenil、medazepam、nordazepam、prazepam、remimazolam 已核對 CMAS 官方列名與72小時條文，使用 `named-cmas-conditional`；未取消既有守門。
- Imlunestrant 依 DailyMed 具名 estrogen receptor antagonist 機轉及 WADA 2026 S4.2 分類。保留「類別推導」說明，不宣稱 WADA PDF 逐字列名。舊 FDA PDF 網址本次 404；改取有效 DailyMed 仿單並保存 SHA。Flucloronide 同義名另存 PubChem CID 20054914 JSON；GSRS 應用程式殼未當成身分證據。
- Halcinonide micro、flucloronide、meprednisone acetate 沿用 S9 完整途徑條件；gonadotrophin／menotrophin 沿用 S2 男性限定。Etilefrine 原商品綠色狀態未覆寫主要 S6 限制。
- Iron dextran 是獨立鐵複合物規則，不被 S5 dextran 血漿增容劑吸收；M2 靜脈輸液提醒仍在。既有禁用複方成分及未知內容仍不會因新名稱而變成可用。
- 最終別名稽核發現 edetate disodium 的來源父子關係會把未定義 sodium edetate／tetrasodium EDTA 擴成 disodium，已設 `exactNameOnly` 並加負例測試；來源別名從中間版 320 收斂至 **318**。目標族群覆蓋不受影響；全部歷史資料少1個可對應名稱，據實列入統計。
- `MAGNESIUM OXIDE (MG. TRISILICATE)`、`NIACIN (NIACINAMIDE)`、通用菌屬、未定義混合物、相近但不同同位素保持未知。沒有為達標猜補名稱。

### 瀏覽器與資料一致性

實際操作最新成品 `http://127.0.0.1:5189/drug-search`，頁面顯示96.10%。既有147個情境加上CMAS、鐵複合物、3個S9名稱、imlunestrant、etilefrine及menotrophin，共188個；日期切至2027停止判讀，明細reload成功，393×852無水平溢出。初次新增測試因「運動項目」標籤的精確定位超時，僅修正測試locator後重跑通過，未修改產品邏輯來迎合測試。

證據：`artifacts/drugs/browser-2026-10-23-9610/{verify.py,verification.json,verification-output.txt}`。已查看 flumazenil 手機與 iron-dextran 桌面截圖；全頁擷取的固定導覽列可能出現在擷取位置，不以此宣稱像素比對、實體手機或多瀏覽器驗證。

`continuation-9555/final-consistency.json` 確認原有1,289個證據群組與30個主要規則群組未被覆寫、既有顯式別名保留，原始1,352個決策內容未變。本機覆蓋報告、public／dist manifest、候選門檻同為19,101／19,876；public與dist manifest完全一致，catalog SHA仍為 `f7a04977d6007534ac8f1b4da4db48adea34c1b7c625d9acccd6cfc65a904644`。

最新資料：2,259規則、3,434來源名稱、318來源別名（衝突0）、3人工整字串別名；1,457明確決策。公開事實3,026筆：6主要限制差異、329排除、2,691參考用途。本次150個限量查詢／284次請求新增134筆事實；收集器沒有建立規則。全部新判讀仍 `clinicalReview=pending`。

最終冪等輸出 `continuation-9555/idempotence-final-v2/`；候選報告 `artifacts/drugs/updates/coverage-9610-final-v2-20261023/update-report.json`，`applied=false`、`productionDeployed=false`、`ready-for-review`，沒有替換同SHA的來源快照。

剩餘896個名稱工作表：`continuation-9555/remaining-work.json`。429個有精確且完整配方相符的有效人體製劑參考、467個需追加證據；假設前者全部能完成為98.41%，明列 `achieved=false`，不是實際達標。月／季更新仍僅在本機分支，遠端排程未啟用；2027規則與臨床審核未完成。

## 歷史驗證：95.55%（2026-10-23 12:59 台灣）

分支 `feat/taiwan-drug-search`，HEAD `040e04aa427faaa063729f28cf2d5081509c6149`。本輪與前輪擴充仍在工作樹，未 commit／push／deploy。由 90.10% 提升到 **18,992／19,876 = 95.55242503521835%**，增加 1,084 個完整品項。原訂 95% 已達成；**98% 尚差 487 品項，99% 尚差 686 品項**。同一 TFDA 快照、同一驗收分母，不把未知改成允許或刪除品項。全部未註銷 22,509 筆的覆蓋率為 84.38%，來源缺成分 2,633 筆另列。

| 驗證 | 結果 |
| --- | --- |
| 後端 Vitest | 91／91，本輪較早完成；後端程式其後未變 |
| Python 匯入／更新／證據測試 | 29／29，本輪較早完成；Python 程式其後未變 |
| 前端 Vitest | 116／116，最新規則套用後通過 |
| Node catalog／worker／coverage／identity／reference | 75／75，最新規則套用後通過 |
| ESLint | 退出 0 |
| 正式建置 `npm run cf:build` | 退出 0；Node 測試完成後循序執行，14 個 SEO HTML |
| 1,352 個決策冪等匯入 | 0 規則、0 一般別名、0 整字串別名新增 |
| 95% 驗收門檻 | 退出 0，`targetMet=true` |
| 真實 TFDA 候選重驗 | 退出 0，`gate.passed=true`、無理由／警告／藥證證據問題 |
| Chrome 互動驗證 | 147 個情境通過，`pageErrors=[]` |

合計 **311 項自動測試**，另加 147 個瀏覽器情境。最新測試及建置紀錄在 `artifacts/drugs/continuation-9503/`；後端／Python 紀錄在 `continuation-9010/`。既有後端 Vitest ESM 提醒及 Vite 大型 chunk 提醒仍保留；藥品頁 chunk 為 1,809.03 kB、gzip 272.64 kB。沒有 TypeScript typecheck 設定，不聲稱通過 typecheck。

本輪重點回歸：有限參考途徑、明確皮膚外用與其他局部區分、S5／S6／S9 路由不退步、混方限制、完整材料身分與同位素／立體構型、具名複合物不拆成單一成分、2027 停判。整字串別名只接受 3 筆有固定證據的原始名稱；濃度改動、額外括號、未知尾碼、空值或別名衝突不會被猜補。Noradrenaline 不借用 adrenaline 例外；opium 材料保留 S7，WITHOUT OPIUM 不命中。原本「甘草＋opium 未知」測試依新增獨立來源改為賽內受限。

### 最新瀏覽器與視覺檢查

以最新建置及獨立 headless Chrome 操作 `http://127.0.0.1:5189/drug-search`，實際顯示 95.55%。沿用 120 個既有情境，再增加 riociguat、pepsin、horse-chestnut seed、完整包衣 paracetamol 混合物與鴉片／甘草複方，共 **147 個**；涵蓋賽內外、缺少途徑、已支持與未支持途徑、2027 停判、回到 2026、明細直接重新載入。

證據：`artifacts/drugs/browser-2026-10-23-9555/{verify.py,verification.json,verification-output.txt}` 與桌面／393×852 截圖。已實際查看 `opium-licorice-mobile.png`、`coated-paracetamol-desktop.png`；手機沒有水平溢出，原始混合物名稱與來源說明保留。完整頁面截圖的固定導覽列可能出現在擷取位置，不以此聲稱全頁像素比對通過。這不是正式站、實體手機或多瀏覽器驗證。

### 資料與守門證據

- 2,201 規則、3,315 可對應來源名稱、311 生成別名、3 整字串別名；生成衝突 0。
- 1,352 個明確決策，全部新增臨床判讀仍 `clinicalReview=pending`；名稱對照率不等於醫療判讀正確率或每條途徑有結論。
- 公開參考 2,892 筆：5 主要限制差異、317 排除、2,570 參考用途。新增 opium 差異採獨立來源的 S7；不讓商品綠色結果覆寫主要限制。
- 最近追加收集 150 個名稱、292 次限速請求、140 筆新事實，未由收集器建立規則。證據與逐筆選定紀錄在 `continuation-9503/`；更早擴充保留於 `continuation-9010/`、`continuation-9255/`、`continuation-9265/`。
- Flumazenil 正面途徑草稿被既有 CMAS 守門拒絕，已移除並保存 `primary/held-flumazenil.json`。沒有關掉防護。兩個注射用抗生素混合物也未只憑劑型推斷靜脈參考途徑。
- 最後候選報告：`artifacts/drugs/updates/coverage-9555-final-20261023/update-report.json`。快照 SHA 仍為 `f7a04977d6007534ac8f1b4da4db48adea34c1b7c625d9acccd6cfc65a904644`，差異為空，`applied=false`、`productionDeployed=false`，狀態 `ready-for-review`。

剩餘 1,002 個目標名稱的逐筆工作表在 `continuation-9503/remaining-work.json`：403 有精確有效人體製劑參考、599 需追加來源。假設前者全數可完成也僅 97.75%，此情境明列 `achieved=false`，不計入實際覆蓋。月／季更新流程只存在本機分支，**遠端排程未啟用**；2027 規則與臨床審核未完成。

## 歷史驗證：90.10%（2026-10-23 11:03 台灣）

分支 `feat/taiwan-drug-search`，HEAD `040e04aa427faaa063729f28cf2d5081509c6149`。全部擴充仍在工作樹，未 commit／push／deploy。由前輪 80.74% 提升到 **17,908／19,876 = 90.09861139062185%**，增加 1,860 個完整品項；**95% 尚未達到，還差 975 筆**。全部未註銷 22,509 筆的覆蓋率為 79.56%，其中來源缺成分 2,633 筆另列。

| 檢查 | 本輪實測 |
| --- | --- |
| 後端 `npm test` | 91 項通過 |
| 前端 `npm --prefix frontend test` | 103 項通過，最後第 16 批匯入後再跑通過 |
| `node --test tests/*.test.mjs` | 72 項通過，最後第 16 批匯入後再跑通過 |
| Python `test_*.py` | 28 項通過 |
| ESLint | 通過 |
| `npm run cf:build` | 通過，1,703 modules、14 個 SEO HTML |
| 873 個明確決策重匯入 | 0 規則、0 別名新增，冪等 |
| 生成別名重建 | 289 條、0 衝突 |
| 95% 門檻 | 退出 1，`targetMet=false` |
| 真實 TFDA 候選重驗 | 退出 2，僅 `coverage-target-not-met`；`applied=false` |

**294 項自動測試通過**。涵蓋 S5 靜脈血漿增容劑、未知注射、S5 併用、腎上腺素局部麻醉用途、舊 S3／S9 途徑相容、精確聚合物身分、povidone iodine 別名、CMAS 條件及含 opium／ephedra 配方不得由綠色標籤建立允許規則。既有資料、年度、來源及更新退步門檻維持通過。

本輪曾有一項新測試未提供 terbutaline 途徑而錯誤預期直接受限；補上明確口服途徑後測試通過，保留未知途徑待確認的既有行為。Benzylhydrochlorothiazide 曾在未套用的審核草稿被誤列為 benzthiazide 別名；來源核對發現兩者不同，套用前移除並建立獨立 S5 規則與回歸測試。

正式建置藥品共用 chunk 為 1,127.18 kB（gzip 176.38 kB），有 Vite 500 kB 容量提醒；後端 Vitest 既有 ESM-in-CommonJS 警告仍在。未提高警告門檻。沒有 TypeScript 專案設定，不宣稱 typecheck。Node worker 測試與建置已循序執行，避免同時修改 `frontend/public`。

最終正式建置用獨立 headless Chrome／Playwright 實測 **26 個情境**：

- 查詢頁顯示 90.10%；以許可證找到並開啟下列真實商品。
- `衛署藥製字第009633號` 滿乃通：未知／不明注射待確認，靜脈賽內外受限，明確非靜脈不適用這項 S5 限制。
- `衛署藥製字第015514號` 腎上腺素：不明用途待確認；非靜脈全身用途賽內受限；非靜脈且已確認局部麻醉適用例外；靜脈配上局部麻醉選項仍待確認；眼部局部適用例外。賽外分別核對。
- `衛署藥製字第048554號` 多舒明：未知／其他局部待確認，眼部例外，口服受限。
- `衛部藥輸字第028340號` 亮丙瑞林：性別未選待確認，男性賽內外受限，女性不適用男性條款；再清空選項恢復待確認。
- 四個品項各測 2027 停判；回到 2026 恢復。明細 reload 成功，393×852 無橫向溢出，`pageerror=[]`。已查看腎上腺素手機與 mannitol 桌面截圖；不是實體手機或多瀏覽器驗證。

瀏覽器證據：`artifacts/drugs/browser-2026-10-23-fast-final/`，含 `verify.py`、`verification.json`、`verification-output.txt` 及九張截圖。測試與建置 log：`artifacts/drugs/continuation-progress/` 的 `backend-tests-final.txt`、`frontend-tests-final16.txt`、`node-tests-final16.txt`、`python-tests-final.txt`、`lint-final.txt`、`build-final.txt`。較早 80.74% 瀏覽器證據保留原目錄。

資料證據：目前 1,766 規則、2,780 個來源名稱可對應，873 決策。公開參考 2,349 筆，3 筆主要來源差異、264 排除、2,082 參考用途。第 9–16 批套用前備份在 `artifacts/drugs/reference-import-batch9` 至 `batch16`；個別限制來源在 `reference-restrictions-batch15`。最後冪等報告 `reference-import-idempotence-9010/import-report.json`。候選門檻報告 `updates/coverage-fast-final-20261023/update-report.json`；同一 TFDA SHA，沒有替換快照。

新增 `drugs:review-queue` 產生 1,503 個未對應名稱的優先順序。剩餘缺口含植物、酵素、通用 gelatin、不完整名稱及需另行核對的生物製劑；不刪分母或將未知改成允許。月／季 workflow 存在本機，**遠端排程未啟用**；未部署、未臨床核准、2027 規則未完成。

## 前輪歷史驗證：80.74%（2026-10-23 09:33 台灣）

分支 `feat/taiwan-drug-search`、HEAD `040e04aa427faaa063729f28cf2d5081509c6149`。本輪工作仍未 commit／push／deploy；HEAD 不包含這批變更。由 69.79% 提升到 **16,048／19,876 = 80.74059166834373%**，增加 2,177 個完整品項；距 95% 還差 2,835 筆。

| 檢查 | 最新實測 |
| --- | --- |
| `npm test` | 91 項通過 |
| `npm --prefix frontend test` | 97 項通過 |
| `node --test tests/*.test.mjs` | 70 項通過；最後的警告文字檢查另重跑相關 5 項通過 |
| `python3 -m unittest discover -s tests -p 'test_*.py'` | 28 項通過 |
| ESLint | 通過 |
| `npm run cf:build` | 通過，1,703 modules、14 個 SEO HTML |
| `git diff --check` | 通過 |
| 逐項匯入重跑 | 289 個決策，0 條新增規則／0 條新增別名 |
| 名稱別名重建 | 233 條，0 衝突 |
| 95% 門檻 | 退出碼 1，`targetMet=false`，未把 80.74% 宣稱為達標 |
| 既有真實 TFDA 候選重驗 | 退出碼 2，唯一原因 `coverage-target-not-met`，`applied=false` |

合計 **286 項自動測試**，另做下述瀏覽器驗證。新測試涵蓋精確搜尋結果／實際回傳成分不同、快取 HTML 雜湊或狀態被修改、配方衝突、過期或非人體製劑藥證、CMAS 72 小時條件、警告文字變更、S2 性別適用條件及混方限制。具名複合物 `albumin tannate` 保留獨立身分，不錯配為 albumin；新 salmeterol 鹽類保留 S3 途徑與劑量條件。

驗證中修正一項測試預期：salmeterol 不在 S5 所列的六種閾值物質內，不能只因外部 S5 併用就套用該條款；同一產品含 hydrochlorothiazide 仍受限。依官方條文核對後修正測試，沒有改寫產品規則來迎合測試。第一次並行執行 Node worker 測試與建置時，兩者重建相同資產暫存目錄而導致建置失敗；待測試完成後循序建置通過，後續必須循序執行。

建置新增一項容量提醒：藥品頁 chunk 522.79 kB（gzip 86.97 kB），超過 Vite 500 kB 提醒門檻；不是建置失敗。既有 Vitest ESM-in-CommonJS 未來相容性警告仍在。沒有 TypeScript 專案設定，不宣稱 typecheck。

最終正式建置以獨立 headless Chrome／Playwright 驗證：

- 首頁實際顯示 80.74%、95% 尚未達標及 2,633 筆來源缺成分。
- `衛署藥製字第048554號` 多舒明：未選／其他局部為待確認，眼部適用例外，口服受限。
- `衛部藥輸字第028340號` 李氏醋酸亮丙瑞林 22.5 mg：未選性別時賽內外都待確認；男性都受限；女性不適用該男性條款；再清除選項恢復待確認。
- 2027-01-01 時停止判定，切回 2026 恢復；手機 393×852 無水平溢出，明細 reload 成功，`pageerror=[]`。已看過手機截圖。未作實體手機或其他瀏覽器驗證。

本機證據：`artifacts/drugs/browser-2026-10-23-final/{verification.json,verification-output.txt,verify.py,leuprorelin-mobile.png,leuprorelin-desktop.png,dorzolamide-mobile.png,dorzolamide-desktop.png}`。較早 78.00% 的中間驗證留在 `browser-2026-10-23-continuation/`，沒有覆寫成最新成果。

資料與匯入證據：`coverage.json`、`reference-review.json`；`artifacts/drugs/reference-import-batch2` 至 `batch8` 保存套用前備份與報告；最後重跑位於 `reference-import-idempotence-8074-warning`。公開參考 1,026 筆：3 筆主要來源差異、130 筆排除、893 筆參考用途；289 個決策中具名規則來源的共同 M2 警告 SHA 已逐一確認，未知警告不能新增允許規則。

最新候選重驗：`artifacts/drugs/updates/coverage-continuation-final-20261023/update-report.json`。目前 TFDA 快照與候選的 SHA 相同，未替換原快照。沒有正式站部署、遠端自然排程或臨床核准證據；2027 規則尚未實作。

## 前輪歷史驗證：69.79%（2026-10-23 04:26 台灣）

本節保留前輪工作樹結果，不代表下方數字仍是最新。分支 `feat/taiwan-drug-search`，HEAD `040e04aa427faaa063729f28cf2d5081509c6149`；本輪變更尚未 commit／push／deploy，不能用 HEAD SHA 冒稱包含這批修改。

| 檢查 | 結果 |
| --- | --- |
| `npm test` | 91 項通過 |
| `npm --prefix frontend test` | 95 項通過 |
| `node --test tests/*.test.mjs` | 65 項通過 |
| `python3 -m unittest discover -s tests -p 'test_*.py'` | 26 項通過 |
| ESLint | 通過 |
| `npm run cf:build` | 通過，1,703 modules、14 個 SEO HTML |
| `git diff --check` | 通過 |
| 95% 門檻 | **未通過**，13,871／19,876 = 69.78768363855906%；不是測試故障 |
| 真實 TFDA 下載及候選重驗 | 新舊 SHA 相同、差異為空；門檻因低於 95% 回傳 2，`applied=false` |

合計 **277 項自動測試通過**，不包含下面另外執行的瀏覽器操作。新增回歸涵蓋：固定分母、缺成分、來源衝突、95% 不能四捨五入通過、PIN 單一父成分、完整 EQ TO、截斷／混合物拒絕、S5 眼部例外及未確認狀態、S6 局部途徑、CMAS 特定時段、更新回退／過期／舊來源／藥證證據失效。既有 S3／S5／S9／P1 判讀及其他功能均保留測試。

本輪沒有 TypeScript 專案設定與 typecheck script，不宣稱執行 TypeScript 檢查。後端 Vitest 的 ESM-in-CommonJS 未來相容性警告仍在，未因本次功能改動擴大處理。

瀏覽器驗證使用暫存 Python Playwright 1.64.1 與本機安裝的 Chrome，獨立暫存設定檔、headless 模式，測試後關閉。原生 CUA 無法取得 Chrome 視窗，本輪沒有把它回報為成功。

- 正式建置預覽 `http://127.0.0.1:5189/drug-search` 實際顯示 69.79%、95% 尚未達標及 2,633 筆缺成分。
- 以許可證 `衛署藥製字第048554號` 找到「多舒明點眼液2%」，確實開啟明細。
- dorzolamide 未選途徑與其他局部使用時為條件未確認；眼部使用適用例外，口服受限。修正過程另外移除不適用的吸入例外說明，未知眼部條件也不再被當成已確認禁用 S5 併用。
- 日期改為 2027-01-01 停止判讀；改回 2026 恢復適用規則。
- 393×852 手機寬度未見水平溢出，明細直接 reload 成功，`pageerror=[]`。不是實體手機或多瀏覽器驗證。

本機證據：`artifacts/drugs/browser-2026-10-23/verification.json`、`verification-output.txt`、`desktop.png`、`dorzolamide-desktop.png`、`dorzolamide-mobile.png`。來源候選重驗：`artifacts/drugs/updates/coverage-final-20261023-v2/update-report.json`。這些不代表正式站部署、自然排程已執行或臨床核准。

目前有 1,012 項規則，1,566 個來源名稱可對應。距 95% 尚差 5,012 筆完整配方，詳見 [維護與缺口文件](maintenance.md)。月／季排程已實作，尚未在遠端啟用；2027 醫療規則未實作。

## 初版歷史紀錄（以下為擴充前的 251 項結果）

日期：2026-10-23，Asia/Taipei。分支 `feat/taiwan-drug-search`；基底 `5495d6d29c83ba290fd9c967023f2d398397609c`。以下均是本機結果，不是正式部署或臨床核准。

## 自動驗證

| 指令／檢查 | 實際結果 |
| --- | --- |
| `npm test` | 8 個檔案、91 項後端整合測試通過；測試專用暫存 MongoDB |
| `npm --prefix frontend test` | 8 個檔案、89 項通過 |
| `python3 -m unittest discover -s tests -p 'test_*import.py'` | 13 項通過 |
| `node --test tests/*.test.mjs` 所對應的 6 個測試檔 | 58 項通過 |
| `npm --prefix frontend run lint` | 退出碼 0，無錯誤與警告 |
| `npm run cf:build` | Vite 正式建置通過；1,700 modules；14 個 SEO HTML |
| `git diff --check` | 通過 |
| 三份 SQLite `PRAGMA integrity_check` | 全為 `ok` |
| 三份 SQLite `PRAGMA foreign_key_check` | 全無違反 |

合計 **251 項自動測試**。前端初次新增測試曾發現 DHEA 別名漏收，已依 WADA 2026 第 6 頁加入 DHEA／dehydroepiandrosterone → prasterone，再跑完整前端與 Node 測試通過。未將初次失敗計作通過。

實際執行的 Node 檔案：`cloudflare-contract.test.mjs`、`education-rules.test.mjs`、`reviewed-cases.test.mjs`、`migrations.test.mjs`、`drug-catalog.test.mjs`、`drug-worker.test.mjs`。未在這輪另外執行 `tests/migrations/local.test.mjs`，沒有改 D1 schema。

此專案為 JS／JSX，沒有 `tsconfig` 或 typecheck script；離線 `tsc --noEmit` 因未安裝／無快取而未能執行，不宣稱型別檢查通過。根目錄 Vitest 另外顯示現有設定檔以 CommonJS 載入 ESM 語法的未來相容性警告，測試仍全部通過。

## 資料核對

| 資料庫 | products | 原始證據與範圍 |
| --- | ---: | --- |
| `artifacts/drugs/taiwan-drugs.sqlite` | 66,522 | 原始許可證 72,088 列、處方成分 126,028 列；多製造商去重、孤立成分仍保存 |
| `artifacts/drugs/herbal.sqlite` | 10,046 | 複方 6,539＋單方 3,507；10,045 個不同代碼；1 個代碼衝突、3 筆異常日期 |
| `artifacts/drugs/supplements.sqlite` | 7,972 | 健康食品 565＋輸入錠膠囊食品 7,407；5 筆缺成分；沒有批號禁藥檢測證明資料 |

三份正規化 gzip 的 SHA-256 與 manifest 相符。西藥規則有 156 項列名物質；230 個來源名稱能對應、7,456 個名稱未對應。名稱覆蓋不等於產品可用。已知成分的匹配採明確別名及完整鹽類字尾，不做 substring 藥理判斷。

實際 worker 測試會讀完整已產生索引與分檔，驗證一般查詢、中文品牌、英文成分、複方、跨頁不重複、來源分類隔離、不同分類 manifest、路徑格式、損壞索引／明細、缺少 checksum、重試恢復。食品／中藥的 evidence helper 不提供 permitted／safe 產品結論。

## Chrome 實際操作

本機開發預覽 `http://127.0.0.1:5188`，正式建置預覽 `http://127.0.0.1:5189`。後者僅提供靜態網頁；本次沒有把回饋 API 或全站案例 API 當作此預覽的驗收項目。

| 操作 | 觀察 |
| --- | --- |
| 西藥許可證 `衛署藥輸字第023917號` | 找到 ULTRACET TABLETS，保留 tramadol 與 paracetamol 兩成分 |
| 西藥 `036167` | 找到斯眠靜、`TRAMADOL HCL`；比賽期間受限、非比賽期間結果及殘留提示，註銷／效期資訊可見 |
| 將使用日期改成 2027，再改回 2026 | 2027 時整品及成分均停止允許／禁用判定；恢復 2026 後回到適用規則 |
| 西藥 `普拿疼` | 最終正式建置找到 50 筆；已修正早期將 paracetamol 的品牌別名展開到其他商品的錯誤（原錯誤結果 2,150 筆） |
| 從西藥切中藥 | 顯示 10,046 筆、單方／複方分別筆數，無西藥結果殘留 |
| 中藥 `麻黃` | 找到 148 筆；開啟 A005158「東陽麻黃濃縮散」，明細為單方、健保代碼、完整成分未提供、尚不能判定運動員可用 |
| 從中藥切營養品 | 顯示 7,972 筆與兩份來源分別筆數 |
| 營養品 `CREATINE` | 找到 10 筆；開啟核備函 1056068969「DHC 倍燃元素‧膠囊食品」 |
| 營養品明細 | 原登錄成分與 2027-02-22 有效日期可見；未提供批號檢測證明、未匹配不等於無禁藥的提示可見 |
| 直接重新載入營養品明細網址 | 最新正式建置重新載入後，索引及明細成功還原；不是只驗證 SPA 內跳轉 |
| Chrome DevTools console | 觀察到 0 messages；最後營養品驗證畫面顯示 No Issues |
| 393×852 iPhone 16 模擬 | 看過西藥與營養品明細；營養品長成分、警示與來源連結可換行，未見明顯水平溢出。修正新明細標題的 scroll margin，避免被固定導覽遮住 |

實際明細 ID：ULTRACET `tw-082ed017b404f96f7e39`；斯眠靜 `tw-7c11c7cdf51319814353`；東陽麻黃 `tw-b17e9b360d5051dc469c`；DHC 倍燃元素 `tw-ecfba5d2a1a9c75abaa3`。這些 ID 屬本資料快照，非 TADA ID。

本次原生 UI 自動操作曾數次在重新載入後觀察到暫時空白，開 DevTools 後內容出現且 console 無錯誤；最後營養品明細重新載入已直接成功。未找出先前空白的根因，不宣稱已修復所有首次載入情況。這是 Chrome 裝置模擬，未以實體 iPhone／Safari／Firefox 或弱網全面驗收。截圖與 AX 狀態在本 session 工具紀錄中，沒有另行宣稱已保存截圖檔。

## 尚未建立的證據

- 未部署正式站、未推送遠端、未驗證線上新功能。
- 未取得 TADA 的私有資料庫、完整人工分類與授權匯出；只有少量公開頁面對照，不能推論全站一致。
- 未完成逐產品藥事／中醫／運動禁藥專業審核，也未串接國際營養品認證或逐批報告。
- 2027 規則尚未實作；目前判讀適用 2026。資料更新為明確執行匯入，不是已啟用的每日排程。
