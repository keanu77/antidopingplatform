# Riociguat／CMAS 分歧覆核

2026-10-23，固定版本 `9701-20261023`。**結論仍待 CMAS 適用範圍裁定；不能以本機的「未見禁用限制」作為此情境的可用保證。** 本文件沒有改動規則或代為聯絡任何單位。

## 分歧及可重現條件

`衛部藥輸字第026414號`「愛定保肺膜衣錠2.5毫克」，成分 `RIOCIGUAT`。固定測試條件為 2026-10-23、口服、自由潛水（CMAS）、比賽當時。

- [TADA 已保存的產品來源](https://www.check-antidoping.org.tw/inquiry_page.php?id=20743&category=2)：CMAS 限定條件，使用規範提到 72 小時。
- 固定判讀引擎：`no-listed-restriction`。
- [原始情境及結果](../../../artifacts/drugs/tada-validation-9701-20261023/condition-review.json)：`potential-false-clear`。這個標記表示有優先查證需求，不表示已裁定 TADA 或本機哪一方錯誤。

## 主要來源及其界線

1. [CMAS 公開技術規則 PDF](https://www.cmas.org/images/cmas_articles/84/CMAS-TECHNICAL-RULES-ON-BENZODIAZEPINES-AND-SILDENAFIL_FINA_20241001-140759_1.pdf) 第 2 頁除了 benzodiazepines 與 PDE5 inhibitors，也涵蓋相似生物作用的其他物質；其適用期間由賽前 72 小時開始。僅證明 riociguat 不是 PDE5 inhibitor，不能排除這項延伸條款。
2. [DailyMed Adempas 官方仿單](https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=7b57509a-3d5d-41d4-8fed-1471e26372a3) 2026/08 修訂，§12.1：riociguat 作用於 sGC，增加 cGMP 相關訊號並引起血管擴張。這支持需要考慮相似生物作用的疑問，**不等於 CMAS 已將它納入或排除**；後者仍是規則適用的裁定。
3. [CMAS 現行規則索引](https://www.cmas.org/freediving/how-to-regulations.html) 仍列有相關技術文件，但本次下載入口導向登入。因此本次核對的是已保存的公開 PDF，沒有宣稱已核實登入後的最新文件版本。
4. [Felleskatalogen Adempas](https://www.felleskatalogen.no/medisin/adempas-abacus-medicine-738571) 的 WADA 分類不能取代 CMAS 額外規範。

本輪查詢未取得 CMAS 針對 riociguat 的具名公開裁定。未找到裁定不是允許使用的證據。

## 待裁定問題與版本處理

需要確認：在適用於該場 CMAS 自由潛水賽事的規則版本中，riociguat 是否屬相似生物作用條款？若適用，其期間、使用途徑與豁免要求為何？TADA 此筆標示依據哪一份具名規範或回覆？

取得主要來源或具名裁定後，另建修正版及回歸測試。97.01% 快照與原本的失敗情境必須保留；本輪不能以修過的答案重算成原版本通過。任何後續版本在未釐清前，都應對該 CMAS 情境保留需專業確認的狀態。

## 證據保存

- CMAS PDF：`artifacts/drugs/evidence-2026/cmas-technical-rules.pdf`，SHA-256 `555c90a13ca8486a2693483285467175d045b57c5244587d53b373f8c3f7e6de`。
- DailyMed 本輪 HTML：`artifacts/drugs/tada-validation-9701-round2-20261023/primary-sources/dailymed-riociguat.html`，SHA-256 `af6b773dffc7ea090aa20407df78240e7a9788178daf850fc8c3e8264339c5d8`。
- 現行 CMAS 索引同目錄 `cmas-regulations.html`，SHA-256 `b0c7925076a68dc7e96b31e39b66181623d4dfbf57e76f8cc19442b7e9bbc561`。各來源的網址與擷取時間另存 `.meta.json`。
