# 使用 Node.js 作為基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 frontend package.json 和 package-lock.json
COPY frontend/package*.json ./frontend/

# 安装前端依赖
RUN cd frontend && npm install

# 复制前端源代码
COPY frontend/ ./frontend/

# 构建前端
RUN cd frontend && npm run build

# 暴露端口
EXPOSE 8080

# 启动应用
CMD ["npm", "run", "start-frontend"]