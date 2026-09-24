本審核任務嚴格限定於內嵌 JSON 內容進行有界比對，不引用任何外部資料。以下為審核結果：

---

### 1. 實際比對的 8 個 ID
1. `usada-d8d5e2c3a318`（Flavia Paparella）
2. `usada-a00b98f42826`（William Licon）
3. `usada-74c3aeb782a0`（Jessica Denney Phillips）
4. `usada-123713999e9c`（Scott Glasgow）
5. `usada-806eab5af83f`（Sarah Heinzl）
6. `usada-80101a12888d`（Danielle Rante）
7. `usada-de625da34c51`（Dylan Fischbach）
8. `usada-30c9fa7aa386`（Emily Oberst）

---

### 2. 逐案確認結果、理由及來源定位

| 案件 ID | 選手姓名 | 審核結果 | 理由說明 | 來源定位 |
| :--- | :--- | :---: | :--- | :--- |
| `usada-d8d5e2c3a318` | Flavia Paparella | **正確** | 體育國籍標註「巴西」獲官方出賽名冊代碼 `BRA` 證實；物質（vilanterol）、TUE 事後駁回但未來核准、原 6 個月依 2021 新規提前終止（服刑近 3 個月）及成績取消，均與來源完全吻合。 | Doc 1（`0249fb750d653fb3` 原案）、Doc 2（`45a3a0f674e68ac1` 減刑）、Doc 3（`efe389388a8556b2` 行 258/716）、Doc 4（`46bfa44f1ace0828` 行 112） |
| `usada-a00b98f42826` | William Licon | **正確** | 賽外檢體對所有物質均為陰性，但主動申報 Breo Ellipta，因無事前 TUE 構成非分析使用違規，處以公開警告（無禁賽）；未載成績取消故不推定。敘述完全吻合。 | Doc 1（`b09c96355f5a9161` 全文實質段落） |
| `usada-74c3aeb782a0` | Jessica Denney Phillips | **無法查證需人工確認** | 靜脈輸注違規事實（6小時內>50 mL）與成績取消均屬實；但公告本文（Doc 1）漏植了禁賽月數字樣（未寫 14 個月），中間名「Denney」亦未見於公告內文或網址。此數據僅存於名冊（`registryAsPublished`），嚴格比對 `sources` 正文無法查證處分期間。 | Doc 1（`c0008427d5086805` 全文實質段落，特別是最後處分段） |
| `usada-123713999e9c` | Scott Glasgow | **正確** | 公告標題雖稱 Athlete，內文主體明確為舉重教練；因 2017 年鼓勵多名選手使用 oxandrolone 等構成 Code 2.9 共謀，處 4 年禁賽；未載個人成績取消，描述完全吻合。 | Doc 1（`fcc053907fb3828f` 全文實質段落） |
| `usada-806eab5af83f` | Sarah Heinzl | **正確** | 賽外採樣陰性，選手於結果公布前主動查出補充品含 higenamine 並通報，屬自願揭露而非檢體陽性；處公開警告無禁賽，未推定成績取消，與來源完全一致。 | Doc 1（`b4a143e7923071dc` 全文實質段落） |
| `usada-80101a12888d` | Danielle Rante | **正確** | 2020 年檢出 19-norandrosterone 處 4 年禁賽；2022 年依 2021 Code 及早承認條款減免 1 年改為 3 年（原起日算起），成績取消維持。兩篇公告互核無誤。 | Doc 1（`f6bf440679867e1a` 原案）、Doc 2（`578c61c04483a4de` 減刑公告） |
| `usada-de625da34c51` | Dylan Fischbach | **正確** | 2015 年拒絕採樣處 2 年禁賽；2016 年更新指出其禁賽期出賽 NWBA 大學賽事，USADA 認定過失輕微僅追加取消成績、未延長禁賽。合併敘述忠實正確。 | Doc 1（`93764cb2b16b94ee` 原案）、Doc 2（`6dcb613d0e3f133d` 違規參賽更新） |
| `usada-30c9fa7aa386` | Emily Oberst | **正確** | 賽外尿液檢出 spironolactone 代謝物 canrenone，無事前 TUE，處公開警告；後續取得未來授權 TUE；公告明示賽外採樣無成績可取消（`resultsCancelled: false`），吻合無誤。 | Doc 1（`c81ed7ac9169c07f` 公告全文）、Doc 2（`438e0ffb0627bd3b` Team USA 檔案） |

---

### 3. P1/P2 具體問題與跨案限制（含原句與建議）

1. **P1 具體問題：公告內文缺漏禁賽期間（依賴名冊補足）**
   * **個案**：`usada-74c3aeb782a0`（Jessica Denney Phillips）
   * **來源原句**：*"Phillips period of ineligibility began on April 25, 2016, the date her use was declared."*（15 詞）
   * **問題說明**：官方公告本文漏列處分月數（缺漏「14-month」），且中間名「Denney」僅存在於名冊。若審核端嚴格隔離 `registryAsPublished` 僅比對 `sources`，該 14 個月處分無法單憑公告內文證實。
   * **具體建議**：公眾案例應明確備註「處分期間 14 個月係依據 USADA 官方制裁名冊登記，原公告正文有排版漏字」。

2. **P2 跨案限制：官方公告標題用詞與內文主體衝突**
   * **個案**：`usada-123713999e9c`（Scott Glasgow）
   * **來源原句**：*"Scott Glasgow, 55, of Provo, Utah, a coach in the sport of weightlifting, has accepted a four-year ban"*（18 詞）
   * **問題說明**：USADA 新聞發布標題誤寫為 *"U.S. Weightlifting Athlete Scott Glasgow Accepts..."*，若自動化模型僅抓取標題會誤判其選手身分，但實質內文為教練（coach）。
   * **具體建議**：教學分類應建立「內文身分優先於標題」之校驗規則，將其明確歸類為運動員支援人員（Support Personnel/Coach）違規。

3. **P2 跨案限制：NADO 地域管轄稱呼與選手代表國籍衝突**
   * **個案**：`usada-d8d5e2c3a318`（Flavia Paparella）
   * **來源原句**：*"U.S. Cycling Athlete Flavia Maria De Oliveira Paparella... has accepted a six-month suspension"*（12 詞）
   * **問題說明**：USADA 慣常將其管轄或居住於美國之受測者冠以 "U.S. [Sport] Athlete"，易導致模型將體育國籍誤判為美國。
   * **具體建議**：涉及跨國參賽選手時，不得僅採信單一國家反禁藥機構新聞稿抬頭，必須以國際單項總會出賽名冊（Entry List / UCI Code `BRA`）為國籍唯一判據。

4. **P2 具體限制：禁賽期違規出賽之處分自由裁量差異**
   * **個案**：`usada-de625da34c51`（Dylan Fischbach）
   * **來源原句**：*"USADA considers Fischbach’s level of fault in this matter to be negligible... subject to disqualification of individual results."*（16 詞）
   * **問題說明**：依世界反禁藥法典，禁賽期出賽原則上面臨全新禁賽期；本案因各方誤解規範，主管機關認定「過失輕微（negligible fault）」僅追加取消成績，未加重禁賽。
   * **具體建議**：反禁藥教學不可將「禁賽期出賽必導致延長禁賽」簡化為絕對規則，需加入主觀過失裁量與僅取消成績之特例教學。

---

### 4. 排除的假陽性

1. **Flavia Paparella 國籍判定非假陽性**：雖然 USADA 公告抬頭標示為 *"U.S. Cycling Athlete"*，但官方軍人運動會與世錦賽名冊（Doc 3、Doc 4）均明確載明國籍為巴西（`BRA`），且前案係由巴西 ABCD 處分，`publicCase` 列為「巴西」屬實質正確，排除「國籍誤述」之假陽性。
2. **William Licon 與 Sarah Heinzl 非「藥檢陽性」**：兩案檢體均為陰性（Negative），違規基礎為申報使用未獲事前 TUE 及自願揭露含有 higenamine，`publicCase` 正確歸類為非分析違規，排除「誤將陰性申報寫為陽性」之疑慮。
3. **Emily Oberst 成績取消標記 `resultsCancelled: false` 非填報錯誤**：一般禁藥案多伴隨成績取消，但本案公告明確載明 *"there are no competitive results to disqualify"*（賽外採樣無須取消之成績），故填寫 `false` 精確反映來源，排除「漏填或邏輯矛盾」之假陽性。

---

### 5. 能與不能下的結論

* **能下的結論：**
  1. 8 件抽查個案在法規法理（事前 TUE 與追溯駁回之區別、及早承認條款減刑、陰性檢體構成非分析使用、2016 年 50mL/6h 靜脈輸注門檻、教練共謀責任）之描述極具專業度與精準度，無扭曲法條情事。
  2. 選手國籍經比對官方 PDF 原始出賽代碼，證實排除台灣選手，且 Flavia Paparella 確實代表巴西。
  3. 補充品自願揭露案件與醫師處方用藥案件，均未被不當混淆為「產品污染（Contamination）」，概念邊界清晰。

* **不能下的結論：**
  1. **不能**僅依賴提供的 `sources` 公告文本完全驗證 Jessica Denney Phillips 處分期為「14 個月」（USADA 2016 公告本文漏字，必須依賴名冊方能佐證）。
  2. **不能**單憑美國反禁藥機構（USADA）新聞稿標題之 "U.S. Athlete" 字眼，逕行推斷該選手之代表國籍或非教練身分。
  3. **不能**將「禁賽期參賽」或「違規受處分」一概推論為「必然延長禁賽」或「必然取消競賽成績」（如賽外採樣無相應賽事成績，或經判定過失輕微僅追溯取消特定賽事成績）。

