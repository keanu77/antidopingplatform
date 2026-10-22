# D1 migration 與舊安裝接軌

`npm run cf:migrate` 使用 Wrangler 原生 `d1 migrations apply`，以 `d1_migrations` 的檔名紀錄只套用待執行版本。依賴固定為 Wrangler 4.125.0；需 Node 22.13 以上。`migrations/0001_feedback.sql`、`0002_feedback_fields.sql` 保留原樣，日後只新增檔案，不改寫已發布 migration。

所有 npm migration 指令預設 `--local`。沒有自動 remote、沒有自動猜測 legacy baseline，也沒有在 CI 或部署 workflow 執行正式 migration。原本直接重跑 0002 的 `cf:migrate:0002` 已移除。

## 本機／全新資料庫

```sh
npm ci
npm run cf:migrate:status
npm run cf:migrate
npm run cf:migrate                 # No pending migrations
```

可加 `-- --persist-to /tmp/your-new-test-directory` 使用獨立的本機 DB；status、baseline、apply 必須使用同一目錄。全新資料庫依序套用 0001、0002、0003；已追蹤的資料庫只執行 pending migration。未知、非連續的歷史或已追蹤但不符 schema 的狀態會停止。

## 既有安裝：明確建立歷史基準

舊指令用 `d1 execute --file`，不會登記 migration 歷史。僅改成 `migrations apply` 無法知道哪些 SQL 已手動執行，因此必須先檢查：

```sh
npm run cf:migrate:status
```

status 只查詢 schema 與 migration 名稱，不讀回饋內容，也不建立 ledger。基準版本必須由操作者核對；不能從此 repo、正式網站正常運作或過往文字推定正式 D1 的實際狀態。

| 已確認狀態 | 動作 |
| --- | --- |
| 沒有 feedback 表、沒有歷史 | 直接 apply |
| 只有 0001 的 7 欄及 2 個 index，沒有歷史 | baseline through 0001，再 apply 0002、0003 |
| 已有完整 0002 的 18 欄及 2 個 index，沒有歷史 | baseline through 0002，再 apply 0003 |
| 0001 有紀錄、0002 曾手動套用且 schema 完整 | baseline through 0002，補記缺少的版本 |
| 部分欄位、缺 index、額外 constraint／trigger、未知歷史 | 停止，另做 schema 差異審查與修復方案 |

只在確認狀態後執行其中一條：

```sh
npm run cf:migrate:baseline -- --through=0001
# 或：npm run cf:migrate:baseline -- --through=0002
npm run cf:migrate
```

baseline 會在記錄前，把實際表／index／trigger 的 SQL 與本機記憶體 SQLite 依歷史 SQL 建出的 schema 比較（忽略註解與空白）。不符則拒絕。此比較刻意保守；手動建表產生的語法差異也可能需人工確認，不能略過驗證或直接把所有版本標成已完成。baseline 只新增歷史紀錄，不改 feedback 或既有資料；相同版本重跑為 no-op。baseline 不會順便 apply。

同一資料庫的 baseline／migration 操作必須序列執行，暫停其他 schema 變更工作；檢查與寫入之間不能有另一位操作者改 schema。Wrangler 每個 migration 失敗時回滾該 migration，先前成功版本仍保留。

## 正式執行前的授權與確認

1. 先取得正式 D1 唯讀查核授權，確認帳號、database ID、`wrangler.toml` 指向預期資料庫。執行 `npm run cf:migrate:status -- --remote`，保存 schema 與歷史證據。
2. 依證據選定「全新／0001／0002／異常」路徑。取得備份或 Time Travel 還原點、記錄執行者與時間、安排單一操作者；確認必要的 D1 權限已存在，不由此流程擴權。
3. 記錄具體 baseline 版本、待執行 SQL、備份及復原方案；在使用者已授權的發布範圍內對同一目標執行 `npm run cf:migrate:baseline -- --remote --through=0001`（或已核實的 0002）；全新 DB 跳過 baseline。
4. 在同一授權發布範圍內執行 `npm run cf:migrate -- --remote`，再 status 核對紀錄與 schema；核對原有資料筆數及取樣，重跑 apply 應無 pending。程式合併與正式部署須符合當次發布授權。

若失敗，保留錯誤與當時紀錄，停止後續部署；不刪 ledger、不刪欄位、不 reset、不以重跑歷史 SQL 修復。優先審查後新增修正 migration；需要恢復備份時另行取得批准。回退程式碼不代表 D1 schema 已回退。

## 驗證

`node --test tests/migrations.test.mjs` 重現舊 0002 重跑失敗，測試新流程的歷史與 schema 防護。`npm run test:migrations:local` 以真正的 Wrangler 本機 D1，在全新 temp 目錄測試全新、legacy 0001、legacy 0002、重跑與部分套用拒絕；檢查既有資料、migration 名稱及時間戳保留。測試不使用正式 D1。

原生 migration 行為參考：[Cloudflare D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/)。

0003 的 legacy 回饋切點、冪等寄送與人工對帳規則見 [feedback-operations.md](feedback-operations.md)。不以 migration 成功推定歷史信件已寄達。
