const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 載入環境變數
dotenv.config();

const app = express();

// 中間件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB 連接
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-doping-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// API 路由
app.use('/api/cases', require('./backend/routes/cases'));
app.use('/api/stats', require('./backend/routes/stats'));
app.use('/api/education', require('./backend/routes/education'));
app.use('/api/tue', require('./backend/routes/tue'));

// 健康檢查
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sports Doping Platform API is running' });
});

// 提供前端靜態文件
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// SPA 路由處理 - 必須在所有 API 路由之後
app.get('*', (req, res) => {
  // 確保不是 API 請求才返回 index.html
  if (!req.originalUrl.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
});