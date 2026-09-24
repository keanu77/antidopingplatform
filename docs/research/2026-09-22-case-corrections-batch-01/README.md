# 既有案例勘誤與首批 50 件個案審核

查核日期：2026-09-22。收錄目的為反禁藥教學，包含成立違規、污染、合法 TUE、撤銷處分及調查結束；不收錄台灣選手。

首批審閱 **52 件，50 件可收錄，2 件待查**。原選定 50 件中的 48 件通過；B01-16、B01-45 暫不納入，以 B01-51、B01-52 補足。通過代表本頁的核心敘述有官方依據，並非完整裁決全文、所有訴訟程序均已審閱。

## 既有 171 筆的處理

| 處理 | 筆數 | 說明 |
|---|---:|---|
| 更正並保留原 ID | 16 | 更新裁決、物質或程序分類、處分與教學文字 |
| 合併重複 | 1 | C.J. Hunter 的 135 合併至 134；API 保留舊 ID 對應 |
| 重大來源疑義，隔離待查 | 13 | 6 件個案依據不足、7 件無個案來源的 TUE 敘述；不宣稱當事人違規或案例虛構 |
| 尚未逐案查核，移至研究待查檔 | 141 | 原文完整保留，不計入網站已查核條目 |

另將 Sun Yang 的 2014 年物質事件與 2018 年採樣程序事件分開，新增後者獨立條目。最後有 **17 件既有勘誤／分案條目**。

原始 171 筆保存在 [baseline-cases.json](baseline-cases.json)，SHA-256：`a2b569c398bd0592522a008b67bcb3525de8e5192cca96378ec43a00e1401da6`。待查資料不匯入正式 API。

重要勘誤包含 Knighton 上訴後四年、Sinner 2025 年三個月和解、Halep 九個月、Okagbare 十一年、Coleman 十八個月、Kipsang 四年，以及 Lochte 的輸注方法違規。Biles 的合法 TUE、Legkov／Tretiakov 原處分撤銷及 Gil Roberts 2017 年無過失事件分別標示，避免把所有教學案例都寫成作弊。

## 首批審查結果與來源差異

- **B01-15 Mariana Bernal Sanchez：已解決。** ITA 名冊的結束年誤列 2025；[ITA 個案公告](https://ita.sport/news/the-ita-reports-that-archer-mariana-bernal-sanchez-has-accepted-a-3-year-ban-for-her-anti-doping-rule-violation/) 與 [World Archery 公告](https://www.worldarchery.sport/fr/node/202516) 交叉確認三年、至 2028-12-21。網站採公告日期，原名冊轉錄另留存。
- **B01-16 Parveen Sharma：待查。** 官方名冊的成績取消截止年與公告處分起年不一致，尚未取得獨立裁決解決差異。
- **B01-45 Miguel Tudela Chiozza：待查。** 名冊與公告對結束日及成績保留例外期間記載不一致，待取得 CAS ADD 裁決。
- **B01-28 Jean Carlos Herrera Malambo：採最新公告。** 名冊頂部仍有暫時禁賽舊文字，詳細欄及新公告已列三年處分。
- **B01-51 Oleh Pryimachov：已核對。** 網址仍含 `4-year`，但現行標題、內文與名冊一致為兩年；不能用網址字串取代文件內容。
- **B01-49 Imogen Simmonds：違規成立、無過失免禁賽。** 不改寫成「未違規」。
- **B01-50 Peter Bol：該樣本不再推進違規程序。** [Sport Integrity Australia 公告](https://www.sportintegrity.gov.au/news/media-statements/2023-08/update-peter-bol-matter) 已閱讀；直接 HTML 下載失敗，因此來源清冊明示以網頁工具查閱，沒有捏造檔案雜湊。

公告只說可上訴時，不推定已有上訴或救濟已結束。B01-44 的公告明示期限屆滿且無上訴，可依此註明。未列成績／獎牌處置者保留 `null`，不當成確認沒有處置。

## 可核對的檔案

- [reviews.csv](reviews.csv)：適合逐列審閱的 52 件表格，含國籍、結論、理由及個案來源。
- [reviews.json](reviews.json)：逐案編輯結果、處分、教學重點及差異說明。
- [selection.json](selection.json)：官方候選資料與實際個案網址。
- [source-manifest.json](source-manifest.json)：查閱方式、下載文件雜湊與日期。
- [current-register-check.json](current-register-check.json)：51 件 ITA 案例的名冊交叉核對；Peter Bol 使用 SIA 公告。
- [quarantined-cases.json](quarantined-cases.json)：13 件高優先待查原始資料。
- [擴充至 500 件的報告](../2026-09-22-expansion-500/README.md)：收錄層級、排除規則與驗證結果。

`data/case-corrections.json` 是勘誤輸入，`data/curated-cases.json` 是新增資料輸入；不得以舊種子資料或隨機生成內容補數。
