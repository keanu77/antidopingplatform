# 採用版本：柔和 3D 插畫

2026-09-24。使用者選擇C「柔和 3D 插畫」後，將首頁主視覺及藥檢／TUE／測驗三張入口配圖统一成同系列。本機完成，未提交或部署。

## 預覽

- 本機：http://127.0.0.1:4187
- [桌面首頁](screenshots/1280-home.png)／[桌面學習卡](screenshots/1280-learning.png)
- [手機首頁](screenshots/390-home.png)／[手機學習卡](screenshots/390-learning.png)
- [320px完整頁](screenshots/320-full.png)

## 圖片

採用的首頁原圖：[c-soft-3d.png](../style-options/c-soft-3d.png)。三張配圖使用它作風格參考，經內建image_gen生成：[藥檢](testing.png)、[TUE](tue.png)、[測驗](quiz.png)。[完整生成提示詞](prompts.json)已保存。最初三張請求因中斷／連線失敗未取得輸出，恢復後同提示詞重試成功，未使用CLI替代。

網站引用版本全部保存在 `frontend/public/images/clean-sport/`，新檔名包含`soft3d`；原先插畫與其他候選版本保留。僅切換Home.jsx圖片引用，不修改規則或資料。

| 圖片 | 小尺寸WebP | 大尺寸WebP |
|---|---:|---:|
| hero-soft3d | 768px / 25,698 bytes | 1440px / 62,244 bytes |
| testing-soft3d | 400px / 12,560 bytes | 640px / 22,910 bytes |
| tue-soft3d | 400px / 12,202 bytes | 640px / 21,950 bytes |
| quiz-soft3d | 400px / 11,138 bytes | 640px / 19,808 bytes |

圖片為虛構情境，沒有真實選手、品牌標誌、內嵌文字或官方核准章。數字、規則、中文與操作按鈕仍由HTML呈現。裝飾入口圖的空alt、首圖優先載入、配圖lazy、固定圖片比例沿用前輪已實作方式。

## 驗證範圍

本次針對圖片更換重跑build、lint、git diff --check，以及1280／390／320px首頁圖片／連結／首屏CTA／水平溢出檢查，詳細見[browser-validation.json](browser-validation.json)。所有4張圖成功載入且引用soft3d檔；三個學習卡目的地正確；主按鈕在固定回饋列上方；沒有pageerror或回饋送出。

前輪40項單元測試及15項跨頁操作驗證是更換風格前的證據，本次未改其邏輯、未把歷史測試冒稱重跑。正式網路效能、用戶學習成效尚未測量。
