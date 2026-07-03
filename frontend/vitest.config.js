import { defineConfig } from "vitest/config";

// 前端 utils 單元測試設定（純邏輯，無需 DOM，用 node 環境即可）。
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.js"],
  },
});
