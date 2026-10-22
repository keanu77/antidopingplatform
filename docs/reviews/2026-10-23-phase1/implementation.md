# 第一階段：查藥與教育內容校正

日期：2026-10-23（Asia/Taipei）
基底：`5198e451d72df1290069c185c99a4eb49dc4a0d9`
分支：`fix/phase1-drug-safety-20261023`

## 交付內容

| 問題 | 修正後行為 |
|---|---|
| Salbutamol 等快速查詢直接顯示允許 | 與多步工具共用判定；缺少途徑、時段或運動項目時顯示「需確認使用條件」。未知規則不推定允許。 |
| 缺少 S5 併用條件 | 現有資料的五種列名閾值物質增加併用選項，預設尚未確認；例外與禁用併用分開判定，切換藥物或範例重置答案。 |
| S5 規則過度概括 | Salmeterol、vilanterol 不套用列名閾值併用規則；氣喘與心血管教材共用列名規則及例外說明。S5 藥物本身禁用與本次所選藥物判定分開說明。 |
| 分類搜尋漏查 | 搜尋描述、完整名稱、細分類與既有資料別名；統一大小寫、全半形與空白。查無結果提示不代表允許，提供 TADA、WADA 與清除篩選入口。 |
| 分類錯置 | SARMs 保留 S1.2；tibolone 改列 S1.1；IGF-1 改列 S2.3。S0 補上未列於其他分類的條件。 |
| 課程與機關名稱過時 | 移除推薦中的 ALPHA／Sport Physician's Toolkit 舊名稱，改以選手、教練、醫療人員及現行重點資源呈現；校正 TADA 查詢機構及運動部委託說明，保留 CTADA 的防制／TUE 職責。 |
| API 欄位與快取 | Express 與 Pages 都傳遞 S5、P1 賽外限制欄位；教育與物質清單查詢加入規則版本參數，避免沿用舊快取。 |

未擴張為個人劑量計算器、完整藥品資料庫或 2027 年清單；閾值結果仍要求核對實際劑量／檢體濃度及個案條件。

## 驗收證據

新增測試先在舊實作重現快速查詢、S5、未知規則與搜尋問題；分類 API 回歸測試先重現 S0 的錯誤 SARM 範例，再修正資料。

最終檢查：

- `npm test`：91 項通過。
- `npm --prefix frontend test`：74 項通過。
- `node --test tests/*.test.mjs`：48 項通過。
- 合計 213 項；相較基底增加 36 項。
- `npm --prefix frontend run lint`、`npm run cf:build`、`git diff --check` 通過。此專案為 JavaScript，沒有 TypeScript typecheck 設定；未宣稱通過 TS 檢查。
- 本機實際 Pages runtime `http://127.0.0.1:8789`，`SKIP_WRITE=1 npm run smoke`：18/18 通過，沒有寫入真實回饋或寄送郵件。
- 獨立程式審查：無待修 correctness finding；另比較 50 種物質的 Express／Pages 回傳及 shared-engine 結果，一致。

桌面 Chrome 真實操作已驗證：

1. 快速查詢 salbutamol → 黃色「需確認使用條件」，顯示 S5 提醒及詳細工具入口。
2. 偽麻黃鹼範例預設「尚未確認」，不直接允許。
3. 改為「已確認未併用」→ 有條件允許，保留閾值及未計算個人劑量的說明。
4. 改為「有併用禁用的 S5 藥物」→ 需申請 TUE，不再以原閾值作為允許依據。
5. 改為「僅使用 S5 例外」→ 回到原物質的閾值條件，顯示例外途徑限制。
6. 切至賽外 triamcinolone 範例 → 保留清除期、賽內殘留及回溯 TUE 說明；返回偽麻黃鹼時併用答案重置。
7. 換藥為 salbutamol → 途徑清空、併用重置，結果待確認。
8. 搜尋 ` VILANTEROL ` → S3；`胰島素` → S4；`unknown-drug-123` → 0 項、警語與官方連結；清除後恢復 14 項。

瀏覽器工具曾出現 noWindowsAvailable 與單一分頁空白；新建本機預覽分頁後恢復並完成上述操作。未把這次工具／分頁異常判定為已確認的網站缺陷。未做完整手機、WebKit 或報讀軟體驗收。

## 來源與專業審閱

- [WADA 2026 禁用清單](https://www.wada-ama.org/sites/default/files/2025-09/2026list_en_final_clean_september_2025.pdf)：S0–S3 分類、S5 列名物質、適用時段與例外，特別是第 12 頁。
- [WADA ADEL FAQ](https://www.wada-ama.org/sites/default/files/adel_faqs_en.pdf)：舊課程轉換關係。
- [WADA ADO 網站建置指引](https://www.wada-ama.org/sites/default/files/2024-06/guide_for_an_ado_website_development.pdf)：角色課程與 At-a-Glance 資源名稱。
- [台灣運動禁藥查詢系統介紹](https://www.check-antidoping.org.tw/about.php)：委託與建置團隊。

原評估第一階段的完成門檻包含「醫療／規範責任人審閱」。本紀錄證明實作、來源核對及工程驗收，不能代替責任人的專業簽核；目前尚未取得該簽核。待審重點為 S5 併用／例外文案、條件式結果名稱及分類校正。發布狀態以後續 release 紀錄為準，不以測試通過代替上線證據。
