運動禁藥教學案例：真實性初步稽核與擴增評估（2026-09-22）

**建議先修正現有資料，再以 500 篇可追溯的教學案例作為第一階段目標。** 本次找到 783 個尚未與現有資料姓名匹配、附官方個案連結的候選姓名鍵；它們仍需身分、國籍、事件及裁決更新審核，不能視為 783 件已通過查證的新案例。現有 171 筆與 GitHub／網站同步，不代表內容真實性已獲確認。

依使用者指定，範圍包含確定違規、污染、撤案／未成立違規、合法 TUE、歷史爭議；**排除台灣選手**。這應是一個反禁藥「教學案例庫」，不能將所有頁面合稱已確定禁藥違規。來源未列國籍時，先標記待查，不推定該反禁藥機構所管轄者都是同一國籍。

**查核範圍與結果**

基準為 commit `60f7073a9deb98af0b117735717250e638bee9ba` 的 `data/cases.json`，共 171 筆，年份欄為 1966–2024，部分敘述已有 2025 年更新。這是目前 Cloudflare API 使用的資料，不是舊的案例確認清單或 MongoDB 種子資料。

本次完成全部 171 筆的來源與結構初篩，再針對疑點較高的 23 筆做外部資料核對：16 筆「有問題」、6 筆「無法查證需人工確認」、1 筆核心主張「確認正確」。**這是針對疑點選案，不能據此估計全站錯誤率；也不是 23 筆所有欄位都已審查。** 其餘 148 筆尚未完成逐項外部查證。

| 全量初篩項目 | 結果 | 意義 |
|---|---:|---|
| 案例數 | 171 | 包含不同性質的教學事件，非 171 件獨立、已成立的運動員違規 |
| 來源連結 | 263 個、15 種 URL | 262 個是首頁，剩餘 1 個為機關入口頁 |
| 沒有個案專屬來源 | 171／171 | 讀者無法直接由來源欄確認該筆處分與事實；不代表全部虛構 |
| 處分欄標有 TUE | 11 | 必須區分合法醫療使用與違規，標籤本身尚不等於 TUE 獲證實 |
| 物質欄含「疑似／指控」 | 13 | 不能算成已成立違規 |
| 集體／系統事件、支援人員 | 7、3 | 應各自分類，不能都算為單一運動員案例；數字可重疊 |
| C.J. Hunter／CJ Hunter | 2 筆 | 同事件重複，需合併 |
| 國籍欄標為台灣 | 0 | 僅反映現有欄位，並非獨立核實所有身分 |

舊 `案例真實性確認清單.md` 對應不同版本；`backend/clean-fabricated-cases.js` 也記載過隨機產生案例的歷史。現有資料未匹配該舊模板的完整文字指紋，**不能因此判定現有 171 筆都是真實案例**。擴增時不應直接復用這些舊清單。

**已找到的具體問題**

下列行號為本次 commit 的 `data/cases.json` 個案起始行；詳細原文、來源定位及建議收在 [findings.json](findings.json)。

| 案例／行號 | 現有資料的問題 | 官方資料支持的修正方向 |
|---|---|---|
| Simone Biles／1273 | 同時寫合法 TUE 與「違規」；背景又把 Methylphenidate 寫成另一藥名 | [USA Gymnastics 聲明](https://usagym.org/usa-gymnastics-statement-regarding-simone-biles-and-wada-hack/)明示 TUE 核准、未違反藥檢規則。適合保留作合法 TUE 教學，應修正違規暗示與藥名 |
| Simona Halep／198 | 仍寫禁賽四年 | [ITIA 公布 CAS 結果](https://www.itia.tennis/news/sanctions/full-decision-in-the-case-of-simona-halep-v-itia/)已改為九個月；取消成績期間也須按裁決更正 |
| Erriyon Knighton／3 | 仍寫暫時禁賽、調查中 | [AIU 上訴裁決表](https://www.athleticsintegrity.org/disciplinary-process/appeal-decisions)列 2025-09-12 CAS 四年禁賽，並有特定期間成績取消 |
| Christian Coleman／343 | 兩年；把錯過檢測寫成「使用……被檢出」及 M2 | [AIU 公告](https://www.athleticsintegrity.org/downloads/pdfs/know-us/en/AIU-PRESS-RELEASE-ATHLETICS-INTEGRITY-UNIT-WELCOMES-CAS-DECISION-TO-BAN-CHRISTIAN-COLEMAN.pdf)：十八個月；屬行蹤申報違規 |
| Blessing Okagbare／228 | 只保留原十年處分 | [AIU 2022 公告](https://www.athleticsintegrity.org/downloads/pdfs/know-us/en/Press-Release-blessing.pdf)：追加一年，總計十一年 |
| Wilson Kipsang／603 | 寫成六年 | [AIU 清單](https://www.athleticsintegrity.org/downloads/pdfs/disciplinary-process/en/Latest-Santions-AUGUST-2020.pdf)列四年 |
| Gil Roberts／1083 | 2016 年 Probenecid、取得 TUE 而免罰 | [2017 仲裁裁決](https://www.usada.org/wp-content/uploads/07_12_17-Gil-Roberts-AAA-FinalAward.pdf)為 2017 年事件，依間接暴露與無過失認定免禁賽；不是 TUE。後來的其他事件應分開 |
| Nijat Rahimov／1198 | 將本次八年禁賽原因寫成 Turinabol | [ITA 個案公告](https://ita.sport/news/the-ita-welcomes-decision-of-cas-add-to-sanction-weightlifter-nijat-rahimov-for-adrv-of-swapping-samples/)所指為 2016 年尿液樣本替換 |
| Sun Yang／1728 | 把 2014 TMZ 與 2018 採樣事件混為一案 | [CAS 裁決](https://aquaticsintegrity.com/wp-content/uploads/2023/01/Award_6148__FINAL_.pdf)第 4–6、85、88 頁：前案三個月，後案在 2021 年重審判五十一個月；前案用於再犯處分計算，並非兩案合併重審 |
| Alexander Legkov／1543；Alexander Tretiakov／1568 | 保留終身禁賽、取消索契金牌，未反映翻案 | CAS [5379](https://jurisprudence.tas-cas.org/Shared%20Documents/5379.pdf)及 [5429](https://jurisprudence.tas-cas.org/Shared%20Documents/5429.pdf)主文撤銷相關 IOC 決定並恢復成績。這兩份本次由搜尋索引讀取主文，舊 PDF 直連未正常提供全文；正式改稿前應重取原件 |
| Sha’Carri Richardson／283 | 大麻被分類為 S6 興奮劑 | [USADA 個案公告](https://www.usada.org/sanction/shacarri-richardson-accepts-doping-sanction/)支持一個月禁賽；[USADA 清單說明](https://www.usada.org/athlete-advisory/athlete-advisory-2020-prohibited-list/)列大麻素為 S8 |
| Iga Swiatek／33 | 一個月正確，背景缺乏污染與過失認定 | [ITIA 公告](https://www.itia.tennis/news/sanctions/polish-tennis-player-iga-swiatek-accepts-one-month-suspension-under-tennis-anti-doping-programme/)說明藥物污染、非故意及無重大過失；仍須保留違規與制裁事實 |
| Jannik Sinner／63 | 三個月和解已更新，但取消成績欄為 false | [ITIA 原審公告](https://www.itia.tennis/news/sanctions/independent-tribunal-rules-no-fault-or-negligence-in-case-of-italian-player-jannik-sinner/)明載 Indian Wells 成績、積分、獎金取消；[2025 和解公告](https://www.itia.tennis/news/sanctions/itia-statement/)列三個月 |
| C.J. Hunter／3623；CJ Hunter／3653 | 重複計數且檢測年代敘述不精確 | [World Athletics](https://worldathletics.org/news/news/iaaf-comment-regarding-cj-hunter-allegations)說明 2000 年夏季四次陽性及 2001 年三月兩年禁賽；兩筆應合併 |

Ryan Lochte／683 的「2018 年超量靜脈輸注、十四個月禁賽」核心主張與 [USADA 公告](https://www.usada.org/sanction/ryan-lochte-accepts-doping-sanction/)一致；仍須補個案來源及 12 小時內輸注量、醫療例外等條件。這不是對全部教育說明的查核通過。

**優先人工確認的六筆**

Jennifer Thompson（2021 Ostarine、警告）、Adam Peaty（2019 Prednisolone TUE）、Blaine Sumner（2019 Testosterone TUE）、Stefi Cohen（2019 Cardarine、六個月）、Sharif Sharifov（2012 Turinabol、取消金牌）、Zlatan Vanev（1984 Stanozolol、十八個月），本次未取得足以支持其具體敘述的官方個案文件。不能因查不到就稱為虛構，也不能繼續當作已證實違規。

其中 [UWW 的 Sharifov 介紹](https://cms.uww.org/athletes/sharifov-sharif)仍保留倫敦奧運冠軍描述，與網站「取消金牌」衝突，需優先追查裁決與正式成績更動；介紹頁本身不等於完整無違規證明。合法 TUE 兩筆則還有內文自相矛盾。以上原始主張、查詢詞及查核界線均保存在 findings.json。

**可擴增的實際資料量**

以下為 2026-09-22 擷取官方 HTML 後的程式盤點，非機構公布的總案例數，也不是全數個案已驗證。

| 來源 | 擷取表列數 | 有姓名且附個案連結的初篩結果 | 使用限制 |
|---|---:|---:|---|
| [USADA sanctions](https://www.usada.org/results/sanctions/) | 1,058 列 | 665 列、627 姓名鍵 | 排除 393 列已移除姓名資料；名單未列國籍，不能推定全為美國選手 |
| [ITA ADRV](https://ita.sport/anti-doping-rule-violations/) | 615 列 | 僅取 Resolved 且附連結：173 列、170 姓名鍵 | 排除待審及暫時停賽；Resolved 仍不保證上訴期限已過；含少數支援人員 |
| 合併初步去重 | 838 列 | 796 姓名鍵 | 只將姓名去音調、拆字與排序；未以出生日期及事件辨識真正去重 |
| 排除與現有資料匹配者 | — | **783 個新候選姓名鍵** | 已扣除 13 個現有姓名鍵；不得直接與 171 相加作可發布總數 |

**台灣排除條件已加入匯出流程。** ITA 原始表有 2 列國籍為 Chinese Taipei，均已從候選匯出檔排除，且都不在上述「Resolved 加個案連結」子集中，因此 783 這個初篩數字沒有改變。783 中有 **168 個**可在來源表找到其他國籍，另外 **615 個**仍待逐案確認國籍；不是 783 個都已完成非台灣身分審核。現有資料國籍欄也沒有台灣，但身分核對仍為發稿必經步驟。

若連 ITA 已解決、但沒有個案連結的列也計入，已排除已知台灣資料後，較寬名單為 1,057 個未匹配的姓名鍵。這是包含前述 783 的更大集合，**不能相加**，也不是可靠可發布數。USADA 已移除姓名的紀錄不回推身分，不把它們計入具名擴增量；其官方頁載明姓名移除政策。

教學用途還能從 [Sport Integrity Australia](https://www.sportintegrity.gov.au/news/media-statements/2023-08/update-peter-bol-matter)、[AIU 裁決](https://www.athleticsintegrity.org/disciplinary-process/first-instance-decisions)、[ITIA](https://www.itia.tennis/sanctions/)、[UKAD](https://www.ukad.org.uk/sanctions/)、[IWF 歷史處分](https://iwf.sport/anti-doping/sanctions/)及運動組織公開 TUE 聲明擴增。這些來源本次沒有完整去重計數，不加入已量化的 783；ITIA 須排除非反禁藥的廉政案件，IWF 與 ITA 重疊尤其要注意，台灣來源不列擴增方向。

例如現有資料未收錄的澳洲 Peter Bol，就很適合教「異常檢測、暫時停賽與最終是否成立違規的差別」：[SIA 2023-08-01 官方聲明](https://www.sportintegrity.gov.au/news/media-statements/2023-08/update-peter-bol-matter)表示，後續分析將 A 樣本報為陰性，該樣本不再推進違規案件，調查結束。應以此結果呈現，不能沿用最初陽性新聞。

已讀到個案公告的新候選還包括 [Michael Brinegar 的 ABP 案](https://www.usada.org/sanction/michael-brinegar-receives-doping-sanction/)、[Yul Moldauer 的行蹤申報案](https://www.usada.org/sanction/yul-moldauer-accepts-whereabouts-sanction/)，兩者在匯出清單仍保留國籍待查標記。另有 ITA 表列美國的 [Cameron Schiller](https://ita.sport/news/the-ita-reports-that-softball-player-cameron-schiller-has-accepted-a-3-year-ban-for-his-anti-doping-rule-violation/)三年禁賽案，但公告仍載有上訴權，不能因表格寫 Resolved 就聲稱所有程序確定終結。

**數量建議與推估界線**

可以規劃「第一階段共 500 篇、下一階段朝 800 篇」的教學庫。這是工作目標，不是本次已驗證可交付的數量。以下只做透明的情境計算：

| 假設 783 個候選通過所有審核的比例 | 可新增的近似數 | 與現有資料的關係 |
|---|---:|---|
| 50% | 392 | 加上經查核後可保留的既有案例 R |
| 70% | 548 | 加上 R |
| 85% | 666 | 加上 R |

通過比例包含非台灣身分確認、證據足夠、裁決更新、事件去重、教學價值與可公開性，**未經隨機抽樣估計**。R 目前未知；修正、合併、拆分或移出待查區都會改變現有總數，不能固定設為 171。姓名也不等於事件：同一人可以有多個獨立事件，但同事件的原審、上訴及和解只能算一案。TUE、撤案與歷史爭議另有來源潛力，本次未量化，不用任意百分比加成。

若要設定 1,000 篇以上目標，下一步應先量化其他官方來源、驗證一批代表性候選的通過率，再更新估算。本次證據足以支持「有數百篇擴增空間」的研究規劃，尚不足以確認最高可達多少篇。

**教學分類與發稿條件**

| 教學分類 | 必須清楚呈現 |
|---|---|
| 已成立違規 | 違反哪條規則、最新有效處分、上訴是否待定 |
| 污染／誤用 | 污染是否被裁決接受、過失程度、是否仍成立違規與取消成績；不能把聲稱污染當成已證實 |
| 撤案／未成立／撤銷處分 | 撤案的機關、範圍及日期，不把撤銷某裁決擴張成所有爭議已釐清 |
| 合法 TUE | 公開且可靠的核准資訊，不使用外洩醫療紀錄；不列入違規統計 |
| 歷史爭議／制度事件 | 明列證據限制與當時規則；群體事件與個人案件分開計數 |
| 支援人員 | 角色與具體行為，另計教練、醫師或工作人員事件 |

案件成立與否、故意／過失認定、處分、教學主題應分欄，不只用一個「有無禁藥」布林值。頁首與搜尋結果就顯示裁決狀態，避免讀者只看姓名、物質便形成錯誤印象。

每筆至少需要：身分與國籍依據（台灣排除）、事件日期、檢測與裁決日期、裁決機關與案號、適用規則版本、物質／方法／行蹤等違規類型、最新結果、過失認定、禁賽起訖與折抵、取消成績範圍、來源 URL 及頁碼／段落、最後查核日、下一次追蹤日、發布審核欄。不同聯盟規則不可直接套用 WADA 年度分類。

執行順序：先修正 P0 的錯誤違規暗示與無可靠來源指控；再整理過期裁決與重複事件；接著從具非台灣國籍來源的候選挑 50 件，涵蓋多種教學主題，逐件核對與寫作。取得該批的實際通過率後再擴大到 500。這次只產生研究文件，沒有修改公開案例、推送 GitHub 或部署網站。

**交付檔案與重現方法**

- [171 筆初篩表](current-171-screening.csv)：每筆原始位置、結構旗標、查核狀態；未外查者明示其限制。
- [23 筆重點查核](findings.json)：原始敘述、判定、依據、定位、擬修正方向；`publication_approved` 全為 false。
- [官方來源盤點表](official-source-candidates.csv)：已排除已知台灣列；包含匿名、待審等不合收錄條件的列，以旗標供研究追蹤，不能直接匯入。
- [有連結的新候選表](new-candidates-with-links.csv)：排除已匹配姓名及已知台灣資料，保留國籍待查標記；列數與唯一姓名數不同。
- [統計與來源雜湊](inventory-summary.json)、[可重跑的盤點程式](analyze.py)。

程式只使用 Python 標準函式庫、讀取公開資料及已下載 HTML，不修改 `data/cases.json`。來源原始快照保留於 `/private/tmp/antidoping-usada-sanctions-20260922.html` 及 `/private/tmp/antidoping-ita-adrv-20260922.html`，雜湊記在 inventory-summary.json；這些暫存快照不是永久歸檔。若檔案仍在，以 `python3 docs/research/2026-09-22-case-authenticity/analyze.py` 重跑即可。日後重新下載官方頁面會得到新的時間點數量，應另存日期與雜湊，不覆蓋本次基準來宣稱結果可完全重現。
