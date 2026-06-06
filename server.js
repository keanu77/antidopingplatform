const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

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

// 版本資訊：供部署後驗證 live build == HEAD（抓 Zeabur push 成功卻跑舊 code）。
// 解析順序：runtime 環境變數（平台注入）→ build 時寫入的 dist/version.json → "unknown"。
app.get("/api/version", (req, res) => {
  const envKeys = [
    "GIT_SHA",
    "ZEABUR_GIT_COMMIT_SHA",
    "ZEABUR_GIT_COMMIT",
    "SOURCE_COMMIT",
    "COMMIT_SHA",
  ];
  let sha = envKeys.map((k) => process.env[k]).find((v) => v && v.trim());
  let builtAt = null;
  try {
    const stamp = JSON.parse(
      fs.readFileSync(path.join(distDir, "version.json"), "utf8"),
    );
    if (!sha) sha = stamp.sha;
    builtAt = stamp.builtAt || null;
  } catch {
    // 無 build stamp：忽略，回 "unknown"
  }
  res.json({ sha: (sha && sha.trim()) || "unknown", builtAt });
});

// 設定 API 路由（先掛載，連線成功後 mongoose 會自動 buffer 或執行）
app.use("/api/cases", require("./backend/routes/casesFixed"));
app.use("/api/stats", require("./backend/routes/statsFixed"));
app.use("/api/education", require("./backend/routes/education"));
app.use("/api/tue", require("./backend/routes/tue"));

// 提供前端靜態文件（index:false / redirect:false → 目錄請求交給下方 catch-all 處理，
// 才能回傳 build 時預渲染、含 per-page SEO meta 的對應 HTML）
const distDir = path.join(__dirname, "frontend/dist");
app.use(express.static(distDir, { index: false, redirect: false }));

// SPA 路由處理 - 必須在所有 API 路由之後
// 優先回傳對應路由的預渲染 HTML（dist/<route>/index.html），找不到再回退首頁 index.html。
const indexHtml = path.join(distDir, "index.html");
app.get("*", (req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  const cleanPath = req.path.replace(/\/+$/, "");

  // 預渲染檔：先顯式拒絕含 ".." 的路徑，再用 path.relative 確認 candidate 確實位於
  // distDir 之內（避免 startsWith 對同前綴 sibling 目錄誤判），最後才在檔案存在時回傳。
  if (!cleanPath.includes("..")) {
    const candidate =
      cleanPath === ""
        ? indexHtml
        : path.join(distDir, cleanPath, "index.html");
    const rel = path.relative(distDir, candidate);
    const inside = !rel.startsWith("..") && !path.isAbsolute(rel);
    if (inside && fs.existsSync(candidate)) {
      return res.sendFile(candidate);
    }
  }

  // 動態案例詳情（/cases/:id）：給不執行 JS 的社群爬蟲一個通用的案例 SEO fallback
  if (cleanPath.startsWith("/cases/")) {
    const caseFallback = path.join(distDir, "cases-detail.html");
    if (fs.existsSync(caseFallback)) {
      return res.sendFile(caseFallback);
    }
  }

  res.sendFile(indexHtml);
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
