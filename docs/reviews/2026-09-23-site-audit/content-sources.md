# 2026-09-23 教育內容規則校正來源

本次僅核對下列高風險規則與過度絕對化敘述，不代表全站醫療建議、所有 TUE 適應症或每一種物質均已完成實證查核。適用版本為 2026 禁用清單／監控計畫、當時生效的 2021 Code，以及下列指引；不將未生效的 2027 規範提前套用。

| 修正範圍 | 官方原始來源與定位 | 校正重點 |
| --- | --- | --- |
| `backend/data/substances.json`、`data/tue-content.json`、`backend/routes/tue.js`、`backend/data/wada-categories.json`、`backend/data/medical-specialties.json` 的 S3 | [WADA 2026 Prohibited List](https://www.wada-ama.org/sites/default/files/2025-09/2026list_en_final_clean_september_2025.pdf)，S3（頁 9） | Formoterol 以 delivered dose 計：54µg/24h 且任何 12h ≤36µg；Salmeterol 200µg/24h 且任何 8h ≤100µg；Salbutamol 1600µg/24h 且任何 8h ≤600µg。劑量例外並不保證尿液檢測結果；S5 併用遮蔽劑亦有獨立規則。 |
| P1 資料（含 `backend/data/wada-categories.json`）、TUE 說明、決策判定 | 同上，P1（頁 20） | 刪除滑雪／雪板；納入迷你高爾夫。CMAS 自由潛水、魚槍捕魚、水下標靶射擊的所有分項，與射箭、射擊一樣賽內外皆禁。其餘列名運動僅賽內禁。前端運動選項直接讀 API 名單。 |
| `backend/data/medical-specialties.json` 心臟科利尿劑敘述 | 同上，S5（頁 12） | 刪除泛稱「利尿劑（非禁用類）」的替代推薦；Furosemide、Hydrochlorothiazide、Spironolactone、Indapamide 均屬 S5。S5 另有明列例外，不能外推成所有利尿劑一律禁用。 |
| `prohibitedList.js` 的 S4/S6 標籤 | 同上，S4（頁 10）、S6（頁 15–16） | S4.1/S4.2 為特定，S4.3/S4.4 為非特定；S6.A 為非特定，S6.B 為特定。不能將整類均標成特定物質，亦不將非特定直接等同較重處分。 |
| M2 與 pseudoephedrine 測驗 | 同上，M2.2（頁 13）、S6（頁 16） | >100mL/12h 的方法例外包括合法醫院治療、外科手術、臨床診斷；例外不自動涵蓋禁用輸注物質。Pseudoephedrine 尿液濃度 >150µg/mL 時禁用，不是任何感冒藥使用一律違規。 |
| 糖皮質激素資料、S9 說明、`tueDecision.js` | [WADA Glucocorticoids and TUEs，2025 年 9 月](https://www.wada-ama.org/sites/default/files/2025-09/glucocorticoids_and_therapeutic_use_exemptions_september_2025.pdf)，頁 2–5；另見清單 S9（頁 19） | 賽外使用不禁，但可能殘留於賽內檢體，必要時須回溯 TUE。清除期算至賽內期間開始；肌注 triamcinolone acetonide 的 60 天不是最長保證，緩釋製劑可能更久。吸入與局部途徑允許限於核准劑量／適應症。 |
| Testosterone 的 TUE 查詢 | [WADA Male Hypogonadism v9，2026 年 1 月（CTADA 官方提供）](https://www.antidoping.org.tw/wp-content/uploads/2026/03/tue_physician_guidelines_male_hypogonadism_-_version_9_-_january_2026.pdf)，頁 2–3 | 不再回傳一律 `needsTUE=false/tueEligible=false`。器質性性腺功能低下可依指引評估，體質性青春期延遲另有特殊情況；單純功能性低睪固酮不符該指引。`tueEligible=true` 表示可進入個案申請審查，並非保證核准，文字明列醫師與 TUEC 審查。 |
| 首頁 GLP-1、測驗 sc7 | [WADA 2026 Monitoring Program](https://www.wada-ama.org/sites/default/files/2025-09/2026_list_monitoring_program_en_final_clean_september_2025.pdf)，第 4 類 | Semaglutide/tirzepatide 標記物列賽內外監控，未列禁用清單；移除 2028 前禁用預測。 |
| 首頁 ILIB | 2026 清單 M1.3（頁 13） | 原文禁止以物理／化學方式血管內操縱血液或血液成分，並未逐字列名 ILIB。頁面因此以「侵入式 ILIB 可能涉及」表述，這是依機制的規則解讀，不宣稱所有靜脈操作均違規。 |
| 首頁嚴格責任、測驗 kn2/kn5 | [WADA 2021 Code](https://www.wada-ama.org/sites/default/files/resources/files/2021_wada_code.pdf)，2.1.1 與註解、10.2、10.4–10.9 | 存在違規不需證明故意或過失；處分仍考慮個案過失與加減條款。四年／兩年為指定違規的一般基準，非所有違規均相同；誤服不自動排除違規，也不代表絕不可能減免禁賽。 |
| 測驗 kn7 未成年人陪同 | [USADA Sample Collection Process](https://www.usada.org/sample-collection-process/)，Minor Athletes 段落 | 代表可支持未成年運動員並觀察採樣人員；不能簡化成陪同者必須全程直接觀看排尿。本次測驗保留依未成年人採樣規範調整的文字，採樣頁另由主代理核實。 |

## 驗證範圍

`tests/education-rules.test.mjs` 打包並呼叫實際 Cloudflare Pages API，使用回傳物質資料執行 TUE 決策；另檢查上述教材的關鍵限制。測試固定原文規則邊界，不做整份資料的內容快照，也不代表自動作出個別病人的醫療或 TUE 核准決定。既有前端決策測試與 Express TUE 測試同步取消 testosterone 一律不具申請資格的錯誤期待。

## 主代理追加核對

- `TestingProcess.jsx`：依 [USADA 採樣流程](https://www.usada.org/sample-collection-process/)修正合理延遲須經許可、未成年人代表與目視採樣區別、檢體編號核對及實驗室表單不含姓名。刪除無年份與分母的 90%／10% 圖卡，DBS 不再限定指尖或標為新技術。
- `ADeL.jsx`、首頁與測驗：依 [CTADA 測驗平台公告](https://www.antidoping.org.tw/news/測驗平台公告/)，115 年全中運／全大運及全民運動會取消將線上測驗通過證明列作報名條件。身心障礙賽會的原文限定肢體及聽覺障礙選手，不外推全部選手或未來每一年。
- `Education.jsx` 補充劑卡片：依 [Geyer 2004 原始研究](https://pubmed.ncbi.nlm.nih.gov/14986195/)保留 94／634＝14.8%、2000–2001 採樣、13 國與非荷爾蒙產品範圍；刪除沒有匹配來源的 9–15% 今日市場推估。嚴格責任段落區分違規成立與處分減免。
- 專科教材改讀與 API 相同的 `medical-specialties.json`，移除前端第二份硬編碼資料中的錯誤分類、未限定吸入劑與克洛米芬替代推薦。移除尚無逐項證據支持的 G-CSF／GM-CSF／TPO 受體激動劑一概 S2.3 標示，不把缺乏核實改寫成全部允許。
- Codeine 依 [2026 監控計畫](https://www.wada-ama.org/sites/default/files/2025-09/2026_list_monitoring_program_en_final_clean_september_2025.pdf)移出 S7 禁用藥物列舉。輸血須依 M1／TUE 規範，不能視為在醫療監督下就免 TUE；參照 [USADA 血液禁藥與 EPO 說明](https://www.usada.org/spirit-of-sport/education/blood-doping-epo-faq/)。必要胰島素不列飲食或口服藥為可直接替代的方案。

上述為列明問題的來源核對，並非每個藥品商品、替代治療、外部課程或病例完整卷宗的逐項認證。
