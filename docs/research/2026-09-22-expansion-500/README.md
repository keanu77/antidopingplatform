> 2026-09-23 補充獨立審核：Codex、Gemini、延長時限後完成的Grok共三席有效回覆；來源抽查合計15件，8件至少兩席、含4件三席重疊。Claude仍逾時缺席。未證實抽樣P0／P1錯誤，仍有國家來源呈現等P2建議。這不等同500件全數經獨立多模型複審通過。詳見[多模型審核報告](../2026-09-23-multi-llm-audit/README.md)及[Grok執行紀錄](../2026-09-23-multi-llm-audit/grok-status.md)。

# 新增 500 件案例審核完成報告

查核完成：2026-09-23。本機收錄 **500 件新增案例＋17 件既有校正／分案＝517 件**，排除台灣選手。新增 500 件均已逐案閱讀官方個案文件並核對名冊；僅有名冊、尚待個案查核的收錄數為 **0**。沒有把下載成功、表格解析或測試通過當成實質審核。

**目前為本機完成、尚未 commit／push／deploy。** GitHub 和正式站仍是 171 件舊資料。本文取代早期 500 總數與 257／403 件進度快照；舊報告保存在 `history/`。

## 收錄與證據

| 分組 | 新增件數 | 查核方式 |
|---|---:|---|
| 首批 | 50 | 52 件候選中接受 50，2 件日期矛盾尚未解決者替換 |
| 後續 ITA | 67 | 個案公告／裁決與官方名冊交叉核對 |
| 後續 AIU | 119 | 個案文件、必要的後續處分與官方名冊交叉核對 |
| 後續 USADA | 264 | 個案公告及更新、官方名冊，必要時補官方身分來源 |
| 合計 | **500** | 與既有 171 筆人名保守去重，新增同人不拆案灌數 |

全部 517 筆中，515 標示「核心事實已查核」，2 件既有案例標示「裁決主文已核對」。Sun Yang 的 2014 年物質事件與 2018 年採樣程序事件有獨立事實，保留為兩件，因此總姓名數為 516。

逐案結論區分身分、國家身分、事件、物質／規則、處分、期間、成績後果及已知程序狀態。污染、違規成立但無過失、公開警告、合法 TUE、未提出違規指控、處分撤銷分別呈現。不以採樣陰性否定已證實的使用／方法違規，也不把申報用藥改寫成陽性檢出。

[後續逐案審核紀錄](individual-case-reviews.json)有 450 件 accepted，另有 3 件 held、16 件 needs_final_source；後兩類均不計入收錄。每個 accepted 都有文件雜湊與段落／頁碼定位。[首批審核](../2026-09-22-case-corrections-batch-01/README.md)另外保存 50 件結論。

目前保留的正式來源包括 [ITA](https://ita.sport/anti-doping-rule-violations/)、[AIU 一審](https://www.athleticsintegrity.org/disciplinary-process/first-instance-decisions)、[AIU 上訴](https://www.athleticsintegrity.org/disciplinary-process/appeal-decisions)、[USADA](https://www.usada.org/results/sanctions/)及各個案官方文件。採當事人事件適用規則，不把今日物質分類、IV 容量門檻或減免制度回套歷史案件。

## 本輪修正的重點

- 追加或變更處分整合在同一案：Evan Boyle 18 個月、Robert Jerry Qualls 39 個月；Danielle Rante 原四年後減為三年；Flavia Paparella 保留原六個月處分及 2021-01-04 終止剩餘期間。
- 國家身分有矛盾時補證據。Paparella 依官方賽事文件列巴西，不因 USADA 管轄或居住美國而推定美國籍。國家欄採官方運動身分描述，不等同法律上的公民資格證明。
- 未來用藥 TUE 不寫成原事件已有豁免；無法確認的成績取消或獎牌剝奪保持 `null`。William Licon 的檢體陰性、申報使用與公開警告分開描述。
- Jessica Denney Phillips 案保留 2016 年「六小時內超過 50 mL」靜脈輸注規則。
- 教育專區原有另一份硬編碼案例，含來源不足與過時敘述，已改從已查核案例 API 讀取，並提供完整個案／來源連結。
- 公開警告不再被計入禁賽篩選與禁賽期間統計。

## 既有資料還有什麼未完成

原始 171 筆：16 筆校正保留、1 筆重複合併、13 筆重大來源疑義隔離、141 筆尚未逐案查核而存入研究待查檔；另拆 Sun Yang 2018 年事件後保留 17 筆。**141 件既有待查資料沒有因本次新增目標完成而變成已審核，也不宣稱它們全部錯誤。** 詳見[既有案例處理表](../2026-09-22-case-corrections-batch-01/README.md)。

本資料集包含部分支援人員／教練，不是 500 名運動員。官方公告支持核心事實，不代表已審閱所有完整仲裁卷宗或窮盡後續救濟。退休停算、尚未公開的完整折抵期間與未知結果明示限制，不硬算到期日。

來源選擇受可取得資料影響，USADA 占後續收錄較多；國別、運動與年份分布不能當作違規盛行率或風險排名。年份含事件年或裁決公布年，逐案保留依據。

## 驗證

- `npm run audit:completion`：**complete，500／500，0 registry-only，errors=[]**。
- `npm run test:reviewed`：**12／12**；含 517 件詳情 API、分頁、排除政策、原名冊保留、更新處分、歷史規則及重建可重現性。
- `npm run test:frontend`：**38／38**。
- `npm run cf:build`：通過，11 個 SEO HTML（含通用詳情頁 fallback）；並非 517 份靜態詳情 HTML。
- 瀏覽器 **12 項檢查**：517 件列表、搜尋、來源連結、舊 ID 對應、六件教育案例與 390 px 排版；沒有 pageerror。詳見[瀏覽器紀錄](browser-validation.json)。
- 原件完整性：後續接受案例的 **462 份文件**原件與文字 SHA256 均相符；首批 **49 份**快照相符，Peter Bol 以官方網頁工具閱讀且明示未取得下載快照。詳見[證據驗證](evidence-validation.json)。
- `git diff --check`：通過。

官方原件及文字另備份於本機 `.cache/antidoping-reviewed-evidence-20260923.zip`，由既有 `.gitignore` 排除，不隨程式發布。來源清冊仍保留原暫存檔路徑，備份可在暫存檔清理後復原核對。

## GitHub 與正式站

2026-09-23 已重新 fetch `origin/main`。本機 HEAD／GitHub 為 `60f7073a9deb98af0b117735717250e638bee9ba`，正式站 `/version.json` 為較舊的 `e0f0c69463c284b8ba0e07786270ed5bb919bbff`。

**正式站 171 件案例及統計、教育、TUE 共 191 項 API 回應，全部與 GitHub 快照相符。** 這證實比對範圍內的資料一致；版本戳記不同，不能宣稱全部部署檔案或提交身分相同。本機未提交的 517 件與教育頁修正尚未公開。詳見[遠端驗證紀錄](remote-verification-2026-09-23.json)。

## 檔案及重建

- [selected-cases.csv](selected-cases.csv)：517 件收錄清單、查核層級與來源。
- [selection-summary.json](selection-summary.json)：最新收錄數。
- [individual-case-reviews.json](individual-case-reviews.json)：逐案結論、定位及限制。
- [individual-source-manifest.json](individual-source-manifest.json)：文件取得紀錄；`downloaded_unreviewed` 是取得狀態，人工接受以審核紀錄為準。
- [validation.json](validation.json)：本次最終資料雜湊及檢查結果。
- [legacy-pending-cases.json](legacy-pending-cases.json)：141 筆既有待查原文，不送進公開 API。

```sh
npm run data:reviewed
npm run audit:completion
npm run test:reviewed
npm run test:frontend
npm run cf:build
git diff --check
```

`handoff-support/` 的 author 檔只供重現人工編輯過程參考；不要重新批次執行而覆蓋後續校正。擴充目標已達成，若繼續新增須另調整目標及去重範圍。
