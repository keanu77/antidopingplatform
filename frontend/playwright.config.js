import { defineConfig, devices } from "@playwright/test";
import process from "node:process";
import { fileURLToPath } from "node:url";
export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  globalTimeout: 300000,
  workers: 2,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: process.env.E2E_BASE_URL || "http://127.0.0.1:8791", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
    { name: "mobile-webkit", use: { ...devices["iPhone 13"] } },
  ],
  webServer: process.env.E2E_BASE_URL ? undefined : {
    command: "node_modules/.bin/wrangler pages dev frontend/dist --ip 127.0.0.1 --port 8791 --persist-to .wrangler/browser-test-state",
    cwd: fileURLToPath(new URL("..", import.meta.url)),
    url: "http://127.0.0.1:8791/api/health",
    reuseExistingServer: false,
    timeout: 60000,
    env: { WRANGLER_SEND_METRICS: "false" },
  },
});
