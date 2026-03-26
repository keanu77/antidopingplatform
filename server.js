const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const path = require("path");

// 載入環境變數
dotenv.config();

// P0: Production 環境強制要求 MONGODB_URI
if (process.env.NODE_ENV === "production" && !process.env.MONGODB_URI) {
  console.error("FATAL: MONGODB_URI is required in production environment");
  process.exit(1);
}

const app = express();

// 中間件
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "frame-ancestors": [
          "'self'",
          "https://*.blogspot.com",
          "https://*.blogger.com",
        ],
      },
    },
    frameguard: false,
  }),
);

// P1: Compression 中間件
app.use(compression());

const corsOptions = {
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : process.env.NODE_ENV === "production"
      ? false
      : true,
  credentials: true,
};
app.use(cors(corsOptions));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "請求過於頻繁，請稍後再試" },
});
app.use("/api/", apiLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 確保模型已載入
require("./backend/models/Case");

// 健康檢查
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Sports Doping Platform API is running" });
});

// 設定 API 路由（先掛載，連線成功後 mongoose 會自動 buffer 或執行）
app.use("/api/cases", require("./backend/routes/casesFixed"));
app.use("/api/stats", require("./backend/routes/statsFixed"));
app.use("/api/education", require("./backend/routes/education"));
app.use("/api/tue", require("./backend/routes/tue"));

// 提供前端靜態文件
app.use(express.static(path.join(__dirname, "frontend/dist")));

// SPA 路由處理 - 必須在所有 API 路由之後
app.get("*", (req, res) => {
  if (!req.originalUrl.startsWith("/api")) {
    res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
  } else {
    res.status(404).json({ error: "API endpoint not found" });
  }
});

// MongoDB 連接（含自動重連）
const mongoUri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/sports-doping-db";

mongoose.connection.on("connected", () => console.log("Connected to MongoDB"));
mongoose.connection.on("disconnected", () =>
  console.warn("MongoDB disconnected, will auto-reconnect..."),
);
mongoose.connection.on("error", (err) =>
  console.error("MongoDB connection error:", err.message),
);

async function connectMongoDB() {
  try {
    console.log("Attempting to connect to MongoDB...");
    console.log(
      "MongoDB URI (masked):",
      mongoUri.replace(/\/\/.*@/, "//***:***@"),
    );
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      heartbeatFrequencyMS: 5000,
    });
  } catch (err) {
    console.error("MongoDB initial connection failed:", err.message);
    console.log("Retrying in 5 seconds...");
    setTimeout(connectMongoDB, 5000);
  }
}

connectMongoDB();

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
});
