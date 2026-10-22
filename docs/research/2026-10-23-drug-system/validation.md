# 查詢系統驗證紀錄

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
