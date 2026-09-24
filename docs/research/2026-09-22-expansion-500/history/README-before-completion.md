> **進度更正：目標為新增 500 件，既有校正／分案 17 件不計入新增數。**
> 目前本機共 517 筆，但尚非 500 件新增個案均已審核完成。最新數量看 `selection-summary.json`，未完成門檻以 `npm run audit:completion` 判定；下方早期 500 筆驗證紀錄僅代表當時快照，不能當成目前完成證明。
> `individual-case-reviews.json` 保存後續逐案結論，`individual-review-queue.json` 保存剩餘待核對清單。尚未 commit、push 或部署。

# 500 件教學案例資料集：查核層級與交付範圍

2026-09-22 本機資料集共 **500 個條目、499 個姓名**。Sun Yang 的 2014 年物質事件及 2018 年採樣程序事件是兩個獨立事件，因此同名兩列。未將一審、上訴、轉交機構或多份檢體分別灌入件數。國籍依官方公開資料排除台灣選手；研究輸入中的排除列不進入網站。

| 查核層級 | 筆數 | 實際做了什麼 |
|---|---:|---|
| 個案核心事實已查核 | 65 | 既有勘誤及首批公告：核對個案敘述、結果與官方資料 |
| 裁決主文已核對 | 2 | Legkov、Tretiakov；官方裁決主文檢索內容已核對，未宣稱取得並重讀完整 PDF |
| 官方名冊已核對 | 433 | ITA 276、AIU 157：姓名、國籍、事件／裁決日期、規則、處分、程序狀態及來源定位 |

**這是 500 個可追溯的教學條目，不是 500 份裁決全文審閱。** 433 件名冊紀錄只寫來源明示的基本事實，未添加污染來源、故意程度、個人診斷、藥理或未公布的裁決理由。網站列表及詳情均顯示查核層級，資料來源可以點擊。

首批的 50 件由 52 件個案審查中選出，2 件日期差異未解決者留待查，詳見[首批審核報告](../2026-09-22-case-corrections-batch-01/README.md)。既有 171 筆中，16 筆更正、1 筆合併、13 筆重大來源疑義隔離、141 筆尚未逐案查核而移至研究檔；另新增 Sun Yang 獨立事件。保留原始資料不代表認定待查敘述正確或錯誤。

## 官方來源及核對方式

1. [ITA Anti-Doping Rule Violations](https://ita.sport/anti-doping-rule-violations/)：615 列公開紀錄；僅在名冊層級選擇 `Resolved` 且核心欄位可明確解讀者。ITA 說明名冊不是所有運動及機構案件的完整清單，部分案件仍可能處於爭議中；`Resolved` 不直接等同已窮盡上訴。
2. [AIU First Instance Decisions](https://www.athleticsintegrity.org/disciplinary-process/first-instance-decisions)：187 列；僅使用列為 Final 或 Case Resolution Agreement 的紀錄，另檢查 [Appeal Decisions](https://www.athleticsintegrity.org/disciplinary-process/appeal-decisions) 的 9 列。上訴另有結果者不自動套用舊一審資料。
3. [首批個案來源清冊](../2026-09-22-case-corrections-batch-01/source-manifest.json)：官方個案公告及來源取得方式。

凍結的事實轉錄檔保留來源網址、查核日期與原始 HTML 的 SHA-256；不將全文新聞稿複製為教學內容。每件名冊案例使用「姓名＋來源國籍＋事件／裁決日期」定位。ITA 沒有可靠的永久單列網址，因此提供真正的名冊網址與定位資訊，沒有捏造個案網址。

名冊另附的裁決／公告連結保存在 `officialRecord.linkedDocuments`，**不代表那些文件已逐份開啟查核**，網站不將其冒充已閱讀的證據。相同姓名跨事件的去重採保守做法；同名多列、複合處分與須人工解釋者先排除。未以「姓名＋年份相同」自動覆寫舊個案，避免混淆 LIMS 與奧運檢體重驗。

## 篩選與發現的問題

802 列 ITA／AIU 一審輸入經篩選後，478 列符合本次名冊層級規則，選入 433 列；另 45 列未加入這次 500 件。324 列排除理由逐一保存在 [selection-exclusions.json](selection-exclusions.json)，其中也包含已由首批或既有勘誤處理的重複候選，不能把 324 全解讀為錯誤資料。

規則包括排除台灣、國籍不明、匿名、未決／暫時禁賽、同名多列、上訴待整合、核心日期缺漏、日期倒置、年限與起訖差異、複合或需解釋的折抵處分，以及非反禁藥案件。實際發現並排除：

- Carey McLeod 名冊的個案連結指向 Alysha Newman 文件，待補正。
- 三件 AIU Integrity Standard 案屬誠信守則，不納入反禁藥案例。
- 部分 ITA 紀錄所載年限與起訖不符、年份截斷或成績欄缺尾；沒有擅自改成「看起來正確」的日期。
- Joanna Evans 的名冊國籍有疑義，保留待查，沒有憑記憶換國籍。

## 資料解讀限制

- 年份混合「違規事件年」與「裁決公布年」，每件標示依據；統計不是年度發生率、國家風險或違規盛行率。
- `null` 代表來源未確認的成績或獎牌處置；不轉成 `false`，也不加入已確認處置數。
- 物質分類若未按事件當年清單另核對，就明示未核對，不把程序違規放入禁用物質類別。
- 部分條目為支援人員或官員，並非 500 位運動員；全部統稱教學條目。
- 判斷截至本次查核日；後續上訴、新公告或官方名冊勘誤可能改變資料。
- 433 件名冊層級條目若要成為完整敘事教案，仍需補讀個案公告／裁決及後續程序，不能直接標記「裁決全文已審閱」。

## 檔案與重建

- [selected-cases.csv](selected-cases.csv)：全部 500 件的姓名、國籍、年份、查核層級與來源。
- [selection-summary.json](selection-summary.json)：收錄數與處理範圍。
- [legacy-pending-cases.json](legacy-pending-cases.json)：141 件尚未完成個案查核的既有原文，不進網站。
- `ita-records.json`、`aiu-first-records.json`、`aiu-appeal-records.json`：凍結來源的事實轉錄。
- `registry-candidates.json`：符合名冊篩選規則的 478 件候選，不等於額外 478 件全文審閱。

```sh
npm run data:reviewed
npm run test:reviewed
npm --prefix frontend test
npm --prefix frontend run build
git diff --check
```

重建先凍結舊 ID，再套用明確勘誤、移出待查敘述並加入已選資料；不重編既有已保留案例 ID。舊 135 的 API 仍對應合併後 134。待查舊頁回傳找不到案例，研究檔不打包到 API。

## 驗證與線上狀態

本機資料／API 8 組回歸檢查通過，包含全部 500 件詳細路由、分頁不重複、分類、排除政策、首批待查隔離、未知值、舊 ID 合併及可重現重建；前端 38 項測試通過，正式建置與 SEO 預渲染通過。瀏覽器驗證另見 `browser-validation.json`；主要檢查列表、查核標籤、官方來源連結與手機寬度。

本次未 commit、push 或部署。2026-09-22 重新讀取正式站 `/api/cases?limit=1`，仍為 **171 件**；本機的 500 件尚未反映在線上，也不能聲稱目前本機資料與 GitHub／正式站一致。
