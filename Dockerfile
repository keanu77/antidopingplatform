# 階段 1: 構建前端
FROM node:18-alpine AS frontend-build
WORKDIR /app

# 複製前端 package.json 和安裝依賴
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

# 複製前端源碼並構建
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# 階段 2: 準備後端依賴
FROM node:18-alpine AS backend-deps
WORKDIR /app

# 複製後端 package.json 和安裝依賴
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# 複製根目錄 package.json 和安裝依賴
COPY package*.json ./
RUN npm ci --only=production

# 階段 3: 生產運行環境
FROM node:18-alpine AS production
WORKDIR /app

# 複製根目錄配置和依賴
COPY package*.json ./
COPY --from=backend-deps /app/node_modules ./node_modules

# 複製後端代碼和依賴
COPY backend/ ./backend/
COPY --from=backend-deps /app/backend/node_modules ./backend/node_modules

# 複製統一的 server.js
COPY server.js ./

# 複製構建好的前端文件
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# 創建非 root 用戶
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001
USER nextjs

# 暴露端口
EXPOSE 8080

# 設置環境變量
ENV NODE_ENV=production
ENV PORT=8080

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

# 啟動統一服務
CMD ["node", "server.js"]