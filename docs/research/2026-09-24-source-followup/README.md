# 國家來源與日期補查（2026-09-24）

本輪檢查原 258 件標題型國家缺口中的 44 件，另重查全部 7 件日期疑義。44 件均有至少兩個模型家族的有效逐案答案，24 件四模型；依官方資料裁定後，**43 件補入來源、1 件保留待確認**。目前僅靠公告標題的國家缺口為 **215 件**；7 件日期疑義仍保留。本機仍為 517 件，沒有新增或刪除案例。

這是對國家標籤及身分配對的補充，不是整個裁決重新審查。43 件中 27 件採查閱時官方個人資料的國家欄，不能據此認證事件當時代表資格或法律國籍；其餘依所載代表隊／賽事時期，亦不涵蓋所有年份。國家標籤均仍為美國，改的是證據及範圍；不得將 43 件理解為法律國籍認證。

## 實際來源與裁定

- 優先採 World Athletics、IPC、Team USA、World Aquatics 及 UCI 官方個人資料、名單與賽事紀錄。每份新下載保存時間、原件及抽取文字 SHA256；下載成功本身不等於查核通過。
- **Lindsey Scherf 保留待補證**：USADA 網頁發布日為 2022-11-29，內文稱 37 歲；World Athletics 出生日期 1986-09-18 推算為 36 歲。原提案誤寫公告為 2024 年，已在裁定明確否定；不能依模型多數支持消除此疑義。[USADA 公告](https://www.usada.org/sanction/lindsey-scherf-accepts-doping-sanction/)、[官方個人資料](https://worldathletics.org/athletes/united-states/lindsey-scherf-14320707)。
- **Imani Oliver 保留事件時期**：2016 年官方成績表列 USA，2025 年官方賽事資料列 JAM。保留本案 2016 年美國標籤，說明較新紀錄，不推定轉籍生效日。[2016 成績表](https://worldathletics.org/records/toplists/jumps/triple-jump/all/women/senior/2016)、[2025 賽事資料](https://assets.aws.worldathletics.org/document/679eb2a12c2aa609b74b9193.pdf)。
- Jason Young 另以出生年、Lubbock 與鐵餅紀錄排除同名短跑選手；Anthony Ferraro 補入有 Spring Lake、年齡與 2018 世錦賽的個人頁，未把無年份名單當成特定年度證明。
- 補入來源或調整範圍的 11 件，網站另註明這些後續調整未再次送模型；沒有改寫固定輸入或冒用原答案。

7 件日期重查：Takzima 的執教違規確切日期未公開；Álvarez 的 2024／2025 年差異、Meto 的兩個禁賽起算日、Kandie 文內指控程序年份、Kigen 的檢驗通知早於採樣，仍存在。Harrison 與 Jackson 公告仍未列實際採樣日或情境。4 份 AIU 裁決新下載原件與前輪 SHA256 完全相同；官方名冊尚未解決前述差異，維持原有揭露，不自行更正裁決。[逐案日期重查](date-checks.json)。

## 模型範圍及失敗處理

| 模型家族 | 請求模型 | 有效逐案答案 |
| --- | --- | ---: |
| GPT | gpt-6-luna | 43 |
| Gemini | gemini-3.8-flash-medium | 26 |
| Grok | grok-4.7-build-fast | 39 |
| Claude | haiku | 42 |

共 150 筆可用逐案答案，44 件至少兩席、24 件四席。不能與上一輪 500 件的整案模型覆蓋相加；本輪只有國家／身分對讀，沒有全量重審處分。

四批各 11 件，四模型各自獨立讀官方頁面文字及原 USADA 個案文件，不見其他模型答案，不允許工具或額外搜尋。每次上限 600 秒、同批同席至多一次重試。首輪 16 次被沙盒權限／連網限制阻擋；授權後重試 16 次，8 份全批符合結構，其餘有逾時、漏案、截斷、JSON 格式或引用問題。最長一次有效回覆約 351 秒。

**部分答案的計數方法透明保留**：另從不完整批次的最終回答中擷取 62 個本來就完整的逐案 JSON 物件，沒有補字、改結論或推補缺案。每列均須有正確 ID、三項檢核、處分文件與國家文件成對引用、有效行號、相容的總結狀態；衝突重複、缺來源、漏案不計。保留回答雜湊與原文字元起訖，可追溯到原輸出。這不把原批次改記成功。結構無效回答中的可讀疑義仍納入編輯裁定，不因格式失敗而忽略風險。

本輪較長來源包曾造成模型自述截斷；今後補查應提供較短、保留原行號的個案證據摘錄，減少一次 11 件全文造成的漏案。不得把這項改善當成重跑舊批次超過一次重試的理由。

13 件曾出現疑義，已逐一裁定：1 件保留、12 件接受或補入證據／澄清範圍。沒有未處理的模型疑義，也沒有進行中的程序；仍未解決的來源問題另列，不能稱所有欄位已證實。

## 檔案、重建與驗證

本輪重新執行66項測試（資料15、API12、前端39）及12項桌面／390px手機瀏覽器檢查，全部通過；無頁面錯誤或水平溢出。建置、lint、completion 500/500、Python編譯、來源快照雜湊與diff檢查通過。前輪更廣範圍的網站檢查保留為歷史證據，未算入本輪測試數。

- [起始缺口清單](baseline.json)、[原提案（待檢核假設）](selection.json)、[固定來源包雜湊](packet-manifest.json)。
- [逐案模型答案與可追溯起訖](case-coverage.json)、[模型計數](model-summary.json)、[執行紀錄](run-index.json)、[不計數的逐案答案](rejected-case-rows.json)。
- [最終逐案裁定](adjudications.json)、[來源清單](source-manifest.json)、[資料覆蓋檔](../../../data/case-source-followups.json)。
- [驗證紀錄](validation.json)、[桌面／手機瀏覽器紀錄](browser-validation.json)。

`scripts/apply-country-followup.py` 依人工裁定匯出新覆蓋檔；`npm run data:reviewed`／`npm run data:rebuild` 會在舊審核修正後套用。原 500 件模型答案及來源包保持不變，已解決的舊 country 疑義另外保留在 `auditedUnresolvedSourceFields`。不要再執行舊 `record-country-audit-limitations.py`，它只適用補查前的 252 件標題來源。

來源原件、模型輸入及最終答案備份在 `.cache/source-followups-20260924-evidence.zip`，不包含 raw 模型串流、stderr 或登入資料；原模型私有輸出僅留忽略目錄。

2026-09-24 再讀正式站 `/api/stats/overview`，仍為 **171 件**；本輪未 commit、push 或 deploy。以上補查與原新增 500 件仍屬未發布工作版本。
