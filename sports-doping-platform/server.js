const express = require('express');
const path = require('path');
const app = express();

// 設置靜態文件目錄
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// 處理 SPA 路由
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});