# HANDOFF — 2026-10-23：三類查詢發布

使用者明確指示「請把這些內容部署到網站」，已授權本次發布。先前凍結與查驗成果仍保留，99% 擴充未繼續。

本次在 `/private/tmp/antidoping-drug-release-20261023`、`release/drug-catalog-20261023` 整合最新 `origin/main` a584e84 與商品查詢分支040e04a及原工作樹97.01%規則。原工作樹 `/Users/ethanstudio/Documents/Vibe coding/antidopingplatform` 保留開發資料及凍結證據，不覆寫、不清理。

發布細節與驗證見 `docs/research/2026-10-23-drug-system/release.md`。三個入口 `/drug-search`、`/herbal-search`、`/supplement-search`；西藥66,522、中藥10,046、食品7,972筆。新增月度候選更新流程，非自動臨床規則發布。

名稱覆蓋19,282／19,876＝97.01%，含缺成分分母22,509則85.66%。固定500筆查驗373直接一致，不等於整體準確率；正式版保留主分支來源待確認、S9劑量條件並加riociguat／CMAS待裁定守門。原97.01%快照與330情境結果不改寫。

凍結版位於原工作樹 `artifacts/drugs/checkpoint-9701-20261023/`；第二輪查驗位於 `artifacts/drugs/tada-validation-9701-round2-20261023/`。備份分別為同名tar.gz及round2的-v2.tar.gz；詳細SHA與歷史證據見 `tada-validation-9701-round2.md`。本次版本差異／驗收證據另放 `artifacts/drugs/release-20261023/`。

目前發布前前端173、後端91、Python42、Node141、本機D1遷移4項、lint、build、budget、HTML檢查已通過；瀏覽器驗收及正式部署進行中。不要在部署回寫前宣稱正式站已更新。

部署前正式站SHA直接讀回為 af8a47f2ff3f6319f65648997d6cb322a251ff64。新功能不新增正式D1 schema或金鑰。正式流程為PR／main→GitHub Actions→Cloudflare Pages→live version.json SHA與實際瀏覽器／API驗證。繼續前先確認git與workflow最新狀態，不重複發布、不使用git add -A。
