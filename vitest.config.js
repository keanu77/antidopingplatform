import { defineConfig } from "vitest/config";

// 後端整合測試設定。前端 utils 測試由 frontend/vitest.config.js 負責。
export default defineConfig({
  test: {
    environment: "node",
    include: ["backend/**/*.test.js"],
    testTimeout: 30000,
    // 首次啟動 mongodb-memory-server 需下載 mongod binary，放寬 hook 逾時
    hookTimeout: 120000,
    // 每個測試檔各自啟動一個 in-memory MongoDB，序列化避免同時多個 mongod 造成資源尖峰
    fileParallelism: false,
  },
});
