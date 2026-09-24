# Clean Sport 圖片與 UI 實作

**最新採用版本：使用者已選定[柔和 3D 插畫](soft-3d/README.md)，目前首頁已切換到該版本。下方保留首輪插畫實作紀錄。**

2026-09-24。依四模型審核與使用者的 injury.sportsmedicine.tw 參考，完成本機版，尚未提交或部署。

## 可檢視成果

- 唯讀本機預覽： http://127.0.0.1:4187 （程序運作期間可用）
- [桌面首頁](screenshots/1280-home-viewport.png)、[手機首頁](screenshots/390-home-viewport.png)、[手機完整頁](screenshots/390-home.png)
- 四張圖片及響應式版本：[圖片目錄](../../../frontend/public/images/clean-sport/)
- [瀏覽器驗證](browser-validation.json)

## 最終驗證

- build、lint、40項前端測試及git diff --check通過。
- 瀏覽器：1280／390／320px，首頁、案例、藥檢、統計共12組畫面；15項操作（搜尋返回／重整、第二頁返回、篩選重整、回饋展開收合、藥檢下一步）通過。
- pageerror=0、上述畫面overflow=0、回饋請求=0；四張圖片皆成功載入。
- 320px搜尋框約84→288px；390px約154→358px。預設回饋列149→53px。390px首頁學習標題y976→681；統計第一圖標題y1706→1142。前後資料採不同日期同寬度畫面，數值是本輪版面比較，不是正式站已改。
- 初次測試使用不存在的Playwright isFocused方法而中斷；第二次焦點檢查未等待動畫影格而失敗，改成waitForFunction後完成最終全回歸。這些歷史失敗保留於browser-failure.json，以browser-validation.json為最後結果。

## 變更

- 首頁：深綠主視覺、HTML標題與雙CTA、緊湊數字列；三張同系列插畫引導藥檢／TUE／測驗，其他查詢工具保留文字圖示。手機使用橫式圖文卡，移動隨機知識卡至主要入口之後。
- 搜尋：URL保存搜尋、五項篩選及頁碼；回到列表與重新整理可還原。點入案例前記錄該查詢的捲動位置。手機搜尋輸入獨占一列。
- 回饋：初始狀態只顯示意見回饋／回報問題兩入口，按下才展開原評分與表單；ResizeObserver維護底部留白，收合還原鍵盤焦點。資料送出行為未改。
- 藥檢：320px縮小步驟間距，維持四步按鈕與目前步驟標示。
- 統計：加章節索引；查核方法改可展開。教學案例非盛行率警語及各圖分母／限制仍直接可見。

其他工作同期有提交資料補查、台灣藥品查詢及回饋後端。此輪只編輯Home、CaseList、TestingProcess、Statistics、FeedbackBar、index.css及新增圖片／設計證據，不替其他工作的變更背書。測試使用當前本機實際Cloudflare handler bundle；未連線正式站資料寫入端點。

## 圖片與生成方式

使用內建 image_gen 工具。四張最终圖經人工目視檢查，WebP由cwebp縮圖／壓縮；HTML保留標題、來源、規則及按鈕。圖片是虛構情境，不當作真實選手或案件證據。

| 名稱 | 正式引用檔案 | 位元組 |
|---|---|---:|
| Hero | hero-768.webp / hero-1440.webp | 40,012 / 105,492 |
| 藥檢 | testing-400.webp / testing-640.webp | 16,200 / 31,192 |
| TUE | tue-400.webp / tue-640.webp | 19,882 / 39,778 |
| 測驗 | quiz-400.webp / quiz-640.webp | 16,626 / 34,094 |

首圖fetchPriority=high、不lazy；其他圖lazy＋async，指定寬高與srcset，皆屬入口裝飾，使用空alt，附近有「插畫為虛構情境示意」。此為本機載入與版面驗證，不是正式網路LCP／CLS效能結論。

生成原檔在本專案`.cache/uiux-20260924/hero-original.png`及`testing-final.png`、`tue-final.png`、`quiz-final.png`；網站只引用public內的WebP。原始內建工具輸出保留在Codex generated_images，網站不依賴該目錄。

## Prompt set

共用原始生成前綴：

> Use case: illustration-story. Create a finished bitmap illustration for a Traditional Chinese clean sport education website, no text whatsoever, no letters, numbers, logos, watermarks or recognizable real people. Cohesive sophisticated semi-realistic editorial digital painting, visibly illustrated rather than documentary photography, deep forest green, emerald, teal and warm ivory palette, restrained warm amber highlights, subtle paper grain, anatomically natural adults, compassionate professional sporting atmosphere.

Hero附加提示：

> Asset: wide landscape homepage hero, 16:9 composition. A dynamic fictional diverse adult sports group: woman runner in foreground, cyclist and basketball player behind, on the RIGHT 60% of frame, flowing energetic curved track lines, dramatic yet soft side lighting, painterly premium sports magazine quality. Left 40% is quiet deep forest green negative space blending softly into the scene for HTML heading overlay. No medications or medical procedure. Background edges dark forest green. All heads and important hands within central safe crop. Generate and save image.

藥檢初稿附加提示：

> Landscape 4:3 module illustration. Fictional adult woman athlete in emerald track jacket, with a friendly adult testing officer in neutral ivory polo, standing at a simple check-in table discussing an unmarked clipboard. Only two people, clearly natural hand gestures, no clinical procedure, no samples, no badges or official symbols. Warm ivory background with teal architectural shapes, balanced central composition and generous breathing space.

初稿出現不需要的背景文字及偏攝影風格，未採用。最終編輯提示：

> Edit this image: remove ALL lettering from both background walls, replace with entirely plain warm ivory walls. Remove white triple-stripe branding on athlete jacket, use solid emerald fabric. Transform the entire image into visibly hand-painted editorial illustration, broad painterly brush marks and simplified softly shaded illustrated faces, NOT photorealistic. Preserve composition, two fictional adult women discussing blank clipboard, check-in table, emerald/teal/ivory palette. Absolutely no text, logos, badges. Landscape 4:3.

TUE初稿附加提示：

> Landscape 4:3 module illustration. Fictional adult male athlete in emerald sportswear sitting at a consultation desk with adult woman physician in ivory coat, discussing a blank folder, respectful collaborative body language. Only two people, no pills, injections, approval seals or official symbols. Warm ivory room with teal shapes, soft window light, balanced central composition, generous breathing space.

最終編輯提示：

> Transform this image into visibly hand-painted editorial illustration, broad painterly brushwork, paper grain, simplified softly shaded illustrated faces, NOT photorealistic. Preserve composition of fictional adult male athlete and female physician discussing a blank teal folder. Preserve emerald/teal/warm ivory palette. Remove white stripe branding on athlete shorts. No text, logos, seals or numbers. Landscape 4:3.

測驗首次連線失敗；最終重做提示：

> Create a hand-painted sports education editorial illustration, NOT a photo: fictional adult woman athlete in emerald sportswear thoughtfully reading an entirely blank teal booklet at a simple warm ivory desk, an unbranded closed supplement container and water bottle nearby. Clearly visible painterly brush strokes, simplified illustrated features, soft paper grain, warm ivory background, forest green and teal palette, soft daylight, sophisticated sports magazine visual. Landscape 4:3, balanced central composition, natural hands. No text, lettering, logos, question marks, checkmarks, numbers, seals, or recognizable real people. No medication use. Image teaches thoughtful information checking without revealing any answer.

## 重現

瀏覽器需安裝既有Playwright Chromium；`preview-server.mjs`須從repo root執行，僅提供GET API，回饋POST不寫入。測試會另外攔截回饋，不產生真實評分。

```sh
npm --prefix frontend run lint
npm --prefix frontend test
npm --prefix frontend run build
node docs/design/2026-09-24-clean-sport/preview-server.mjs
# 另開終端：
node docs/design/2026-09-24-clean-sport/browser-check.mjs
```

完整規則、醫療資料、慢網路Core Web Vitals、螢幕閱讀器及實機觸控未於本輪全面驗證；不以本機通過宣稱已上線。預覽server的埠為4187。
