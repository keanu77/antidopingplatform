import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  // All browser release checks are read-only, including when targeting a preview.
  await page.route("**/api/feedback", (route) => route.abort());
});

test("drug lookup remains conditional, exposes sources, and tabs support keyboard/deep links", async ({ page }) => {
  await page.goto("/tue?tab=tools");
  await expect(page.getByRole("tab", { name: "實用工具" })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("textbox", { name: "藥物名稱", exact: true }).fill("salbutamol");
  await page.getByRole("button", { name: "查詢", exact: true }).click();
  const result = page.getByRole("status").filter({ hasText: "Salbutamol" });
  await expect(result).toContainText("需確認使用條件");
  await expect(result.getByRole("link", { name: /2026 禁用清單/ }).first()).toHaveAttribute("href", /wada-ama/);
  await page.getByRole("tab", { name: "實用工具" }).focus();
  await page.keyboard.press("Home");
  await expect(page.getByRole("tab", { name: "基礎知識" })).toBeFocused();
  await expect(page).toHaveURL(/tab=basic/);
  await page.reload();
  await expect(page.getByRole("tab", { name: "基礎知識" })).toHaveAttribute("aria-selected", "true");
});

test("normalized search and missing results do not imply permission", async ({ page }) => {
  await page.goto("/prohibited-list");
  await page.getByRole("textbox", { name: "搜尋禁用物質" }).fill(" VILANTEROL ");
  await expect(page.getByRole("status")).toContainText("1 / 14");
  await page.getByRole("textbox", { name: "搜尋禁用物質" }).fill("unknown-medication-123");
  await expect(page.getByRole("status")).toContainText("0 / 14");
  await expect(page.getByText(/查無.*不代表允許/).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /TADA/ }).first()).toBeVisible();
});

test("a failed drug request can be retried without showing stale success", async ({ page }) => {
  let fail = true;
  await page.route("**/api/tue/check", async (route) => {
    if (fail) { fail = false; await route.fulfill({ status: 503, contentType: "application/json", body: '{"error":"synthetic outage"}' }); }
    else await route.continue();
  });
  await page.goto("/tue?tab=tools");
  await page.getByRole("textbox", { name: "藥物名稱", exact: true }).fill("salbutamol");
  await page.getByRole("button", { name: "查詢", exact: true }).click();
  await expect(page.getByText("查詢失敗，請檢查網路連線後再試")).toBeVisible();
  await page.getByRole("button", { name: "查詢", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Salbutamol" })).toContainText("需確認使用條件");
});

test("initial case HTML includes facts and canonical; unknown pages return 404", async ({ page, request }) => {
  const response = await request.get("/cases/1");
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('href="https://antidopingplatform.sportsmedicine.tw/cases/1"');
  expect(html).toContain("已知事實");
  expect(html).toContain("來源");
  await page.goto("/cases/1");
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/cases\/1$/);
  expect((await request.get("/not-a-real-page-123")).status()).toBe(404);
  expect((await request.get("/cases/not-a-real-case-123")).status()).toBe(404);
});

test("client navigation keeps title, canonical and social metadata consistent", async ({ page }) => {
  await page.goto('/adel');
  await expect(page).toHaveTitle('ADEL 官方學習資源 | 乾淨運動從你我開始');
  await page.locator('header a[href="/"]').first().click();
  await expect(page).toHaveTitle('乾淨運動從你我開始 | 運動禁藥案例資料庫');
  await page.locator('a[href="/learning?role=coach"]').first().click();
  await expect(page).toHaveTitle('選手、教練與醫療人員學習路徑 | 乾淨運動從你我開始');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://antidopingplatform.sportsmedicine.tw/learning');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', await page.title());
});

for (const path of ["/", "/tue?tab=tools", "/sources?id=drug:salbutamol", "/quiz", "/learning?role=coach", "/education?tab=supplements"]) {
  test(`accessibility and responsive smoke: ${path}`, async ({ page }, testInfo) => {
    await page.goto(path);
    await expect(page.locator("main h1")).toBeVisible();
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    await testInfo.attach("accessibility", { body: JSON.stringify(result.violations, null, 2), contentType: "application/json" });
    expect(result.violations.filter((v) => ["serious", "critical"].includes(v.impact))).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await testInfo.attach("viewport", { body: await page.screenshot({ path: testInfo.outputPath("viewport.png"), fullPage: false }), contentType: "image/png" });
    const navigation = await page.evaluate(() => performance.getEntriesByType("navigation")[0]?.toJSON());
    await testInfo.attach("lab-navigation-not-field-cwv", { body: JSON.stringify(navigation), contentType: "application/json" });
  });
}
