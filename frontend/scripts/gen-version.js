// Build-time 版本戳記：寫出 public/version.json（{ sha, builtAt }），
// 供部署後驗證 live build == HEAD（抓 Zeabur push 成功卻跑舊 code）。
// SHA 解析順序：環境變數（平台/CI 注入）→ 本地 git → "unknown"。
// 純 Node、無瀏覽器依賴，可在 Docker/Alpine 安全執行（無 .git 時自動降級）。

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "..", "public", "version.json");

// 平台/CI 可能注入 commit SHA 的環境變數（Zeabur 等；Dockerfile 也會把 build-arg GIT_SHA 轉成 env）
const ENV_KEYS = [
  "GIT_SHA",
  "ZEABUR_GIT_COMMIT_SHA",
  "ZEABUR_GIT_COMMIT",
  "SOURCE_COMMIT",
  "COMMIT_SHA",
];

function resolveSha() {
  for (const key of ENV_KEYS) {
    const v = process.env[key];
    if (v && v.trim()) return v.trim();
  }
  try {
    // 本地 build：從 git 取得（Docker build stage 內無 .git 會 throw，落到 catch）
    return execSync("git rev-parse HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return "unknown";
  }
}

const payload = { sha: resolveSha(), builtAt: new Date().toISOString() };
writeFileSync(outPath, JSON.stringify(payload) + "\n");
console.log(`[gen-version] ${outPath}: ${JSON.stringify(payload)}`);
