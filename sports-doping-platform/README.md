# 運動禁藥案例資料庫平台

一個整合國際運動禁藥案例的互動式知識平台，提供案例搜尋、數據視覺化和教育功能。

## 功能特色

- **案例資料庫**：完整的運動禁藥案例資料，包含運動員資訊、禁用物質、處罰結果等
- **智慧搜尋**：支援多條件篩選和全文搜尋
- **數據視覺化**：年度趨勢、運動項目分布、禁藥類型統計等圖表
- **教育專區**：禁藥知識介紹、互動測驗、延伸閱讀
- **案例比較**：選擇兩個案例進行詳細對比分析

## 技術架構

### 前端
- React 19 + Vite
- React Router v6
- Tailwind CSS
- Chart.js
- Axios

### 後端
- Node.js + Express
- MongoDB + Mongoose
- RESTful API

## 安裝步驟

### 前置需求
- Node.js 16+
- MongoDB
- npm 或 yarn

### 1. 複製專案
```bash
git clone [repository-url]
cd sports-doping-platform
```

### 2. 安裝套件
```bash
# 安裝根目錄套件
npm install

# 安裝前後端套件
npm run install-all
```

### 3. 設定環境變數

在 `backend` 目錄下創建 `.env` 檔案（如果尚未存在）：

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sports-doping-db
JWT_SECRET=your-secret-key-change-this-in-production
```

### 4. 啟動 MongoDB

確保 MongoDB 正在運行：
```bash
# macOS/Linux
mongod

# 或使用 MongoDB as a Service
```

### 5. 導入範例資料

```bash
npm run seed
```

### 6. 啟動應用程式

開發模式（同時啟動前後端）：
```bash
npm run dev
```

前端將在 http://localhost:5173 運行
後端 API 將在 http://localhost:5000 運行

## API 端點

### 案例相關
- `GET /api/cases` - 獲取案例列表（支援篩選和分頁）
- `GET /api/cases/:id` - 獲取單一案例詳情
- `POST /api/cases` - 新增案例
- `PUT /api/cases/:id` - 更新案例
- `DELETE /api/cases/:id` - 刪除案例
- `GET /api/cases/filters/options` - 獲取篩選選項
- `POST /api/cases/compare` - 比較兩個案例

### 統計相關
- `GET /api/stats/yearly-trends` - 年度趨勢
- `GET /api/stats/sport-distribution` - 運動項目分布
- `GET /api/stats/substance-distribution` - 禁藥類型分布
- `GET /api/stats/nationality-distribution` - 國家分布
- `GET /api/stats/punishment-stats` - 處罰統計
- `GET /api/stats/overview` - 總覽統計

### 教育相關
- `GET /api/education/substances` - 禁藥物質資訊
- `GET /api/education/quizzes` - 互動測驗題目
- `POST /api/education/quizzes/:id/answer` - 提交測驗答案
- `GET /api/education/articles` - 教育文章列表

## 專案結構

```
sports-doping-platform/
├── backend/                 # 後端服務
│   ├── models/             # 資料模型
│   ├── routes/             # API 路由
│   ├── server.js           # 主伺服器檔案
│   └── seedData.js         # 資料導入腳本
├── frontend/               # 前端應用
│   ├── src/
│   │   ├── components/     # React 元件
│   │   ├── pages/          # 頁面元件
│   │   ├── services/       # API 服務
│   │   └── App.jsx         # 主應用元件
│   └── package.json
└── package.json            # 根目錄套件設定
```

## 開發指令

```bash
# 安裝所有套件
npm run install-all

# 開發模式
npm run dev

# 生產模式
npm run start

# 建置前端
npm run build

# 導入範例資料
npm run seed
```

## 瀏覽器支援

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 授權

MIT License