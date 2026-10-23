import { chromium } from "../../frontend/node_modules/playwright/index.mjs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const output = resolve(process.env.LAUNCH_OUTPUT || "docs/launch");
const videoDir = resolve(process.env.LAUNCH_RAW_VIDEO || "/tmp/antidoping-launch-video");
const site = "https://antidopingplatform.sportsmedicine.tw";
await mkdir(output, { recursive: true });
await mkdir(videoDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  deviceScaleFactor: 1,
  locale: "zh-TW",
  recordVideo: { dir: videoDir, size: { width: 1280, height: 720 } },
});
await context.route("**/api/feedback", route => route.abort());
const page = await context.newPage();
const errors = [];
page.on("pageerror", error => errors.push(error.message));
const card = (title, subtitle, end = false) => `<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><style>body{margin:0;width:1280px;height:720px;background:#0c1d24;color:#f4faf8;font-family:"PingFang TC",sans-serif;padding:115px 90px;box-sizing:border-box}small{font-size:22px;color:#80dbc0}h1{font-size:64px;line-height:1.3;margin:45px 0 28px}p{font-size:29px;line-height:1.7;color:#b8d2d0}footer{font-size:19px;margin-top:65px;color:#90b3b2}</style><small>運動禁藥教學平台 · 操作示範</small><h1>${title}</h1><p>${subtitle}</p><footer>${end ? "github.com/keanu77/antidopingplatform" : "公開商品資料示範 · 教學與初步查核用途"}</footer></html>`;
try {
  await page.setContent(card("從商品，找到完整成分", "輸入許可證字號 → 查看複方 → 確認使用條件"));
  await page.waitForTimeout(2400);
  await page.goto(site + "/drug-search", { waitUntil: "networkidle" });
  const search = page.getByRole("button", { name: "查詢", exact: true });
  await search.waitFor({ state: "visible" });
  await page.getByLabel("商品名、成分或許可證字號", { exact: true }).pressSequentially("衛署藥製字第056706號", { delay: 85 });
  await page.waitForTimeout(700);
  await search.click();
  const results = page.getByRole("region", { name: "藥品搜尋結果" });
  await results.getByRole("button").first().waitFor();
  await page.waitForTimeout(1600);
  await results.getByRole("button").first().click();
  const detail = page.locator('section[aria-labelledby="drug-detail-heading"]');
  await detail.waitFor();
  await page.locator("#drug-detail-heading").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1900);
  await page.getByRole("combobox", { name: "給藥途徑", exact: true }).selectOption("oral");
  await page.waitForTimeout(2300);
  await detail.getByRole("heading", { name: "成分判讀", exact: true }).evaluate(element => element.scrollIntoView({ block: "start" }));
  await page.evaluate(() => window.scrollBy(0, -100));
  await page.waitForTimeout(2900);
  await page.screenshot({ path: resolve(output, "demo-product.png") });
  const tada = detail.getByRole("link", { name: "前往 TADA 核對商品", exact: false });
  await tada.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2100);
  const metadata = {
    capturedAt: new Date().toISOString(),
    source: site + "/drug-search",
    license: "衛署藥製字第056706號",
    product: await page.locator("#drug-detail-heading").textContent(),
    version: await (await context.request.get(site + "/version.json")).json(),
    tadaHref: await tada.getAttribute("href"),
    pageErrors: errors,
    feedbackWritesBlocked: true,
  };
  if (errors.length) throw new Error(errors.join("\n"));
  await writeFile(resolve(output, "demo-capture.json"), JSON.stringify(metadata, null, 2) + "\n");
  await page.setContent(card("查詢之後，繼續查證與學習", "antidopingplatform.sportsmedicine.tw<br>西藥查詢 · 案例搜尋 · TUE 情境", true));
  await page.waitForTimeout(2900);
  const video = page.video();
  await context.close();
  const recordedPath = await video.path();
  await writeFile(resolve(videoDir, "recorded-path.txt"), recordedPath + "\n");
  const previewContext = await browser.newContext({viewport:{width:1280,height:640},deviceScaleFactor:1});
  const previewPage = await previewContext.newPage();
  await previewPage.setContent(await readFile(resolve("docs/launch/social-preview.html"), "utf8"));
  await previewPage.evaluate(() => document.fonts.ready);
  await previewPage.screenshot({ path: resolve(output, "social-preview.png") });
  await previewContext.close();
  console.log(JSON.stringify({ recordedPath, output, pageErrors: errors }));
} finally {
  await browser.close();
}
