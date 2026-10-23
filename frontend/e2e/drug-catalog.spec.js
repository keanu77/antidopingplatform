import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/feedback", (route) => route.abort());
});

async function openDrug(page, license) {
  await page.goto("/drug-search");
  await expect(page.getByRole("button", { name: "查詢", exact: true })).toBeEnabled();
  await page.getByLabel("商品名、成分或許可證字號", { exact: true }).fill(license);
  await page.getByRole("button", { name: "查詢", exact: true }).click();
  const results = page.getByRole("region", { name: "藥品搜尋結果" });
  await expect(results).toContainText("1 筆許可證");
  await results.getByRole("button").first().click();
  await expect(page.locator("#drug-detail-heading")).toBeVisible();
}

test("riociguat remains conditional for CMAS, preserves deep links, and expires by year", async ({ page }) => {
  await openDrug(page, "衛部藥輸字第026414號");
  const detail = page.locator('section[aria-labelledby="drug-detail-heading"]');
  await page.getByRole("combobox", { name: "給藥途徑", exact: true }).selectOption("oral");
  await expect(detail.getByText("有使用條件，尚不能判定可用", { exact: true })).toHaveCount(2);
  await page.getByRole("combobox", { name: "運動項目", exact: true }).selectOption("自由潛水（CMAS）");
  await expect(detail.getByText(/Riociguat 的 CMAS 賽事適用範圍仍待裁定/)).toHaveCount(2);
  const url = page.url();
  await page.reload();
  await expect(page.locator("#drug-detail-heading")).toHaveText("愛定保肺膜衣錠2.5毫克");
  await expect(page).toHaveURL(url);
  await page.getByLabel("使用日期", { exact: true }).fill("2027-01-01");
  await expect(detail.getByText("超出規則適用年份，請重新查證", { exact: true })).toHaveCount(2);
});

test("Western product search retains the full mixture and restriction reminder", async ({ page }) => {
  await openDrug(page, "衛署藥輸字第023917號");
  await expect(page.locator("#drug-detail-heading")).toBeVisible();
  const detail = page.locator('section[aria-labelledby="drug-detail-heading"]');
  await expect(detail).toContainText("TRAMADOL");
  await expect(detail).toContainText("ACETAMINOPHEN");
  await expect(detail.getByText("含禁用成分，需專業確認", { exact: true })).toHaveCount(1);
});

for (const [path, query, input, note] of [
  ["/herbal-search", "A038755", "商品名或健保藥品代碼", "處方成分未提供，需另行核對"],
  ["/supplement-search", "CREATINE", "商品名、登錄成分或許可／核備字號", "未提供運動禁藥批號檢測證明"],
]) {
  test(`catalog search preserves evidence limits: ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.getByLabel(input, { exact: true }).fill(query);
    const submit = page.getByRole("button", { name: "查詢", exact: true });
    await expect(submit).toBeEnabled();
    await submit.click();
    await expect(page.locator("article").first()).toContainText(note);
    await page.locator("article").first().getByRole("button").click();
    await expect(page.locator("main h2").first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}

test("drug search is accessible, responsive and missing results do not imply permission", async ({ page }, testInfo) => {
  await page.goto("/drug-search");
  await expect(page.getByRole("button", { name: "查詢", exact: true })).toBeEnabled();
  const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(scan.violations.filter((v) => ["serious", "critical"].includes(v.impact))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await testInfo.attach("drug-search", { body: await page.screenshot({ path: testInfo.outputPath("drug-search.png"), fullPage: true }), contentType: "image/png" });
  await page.getByLabel("商品名、成分或許可證字號", { exact: true }).fill("zzzzdoesnotexist");
  await page.getByRole("button", { name: "查詢", exact: true }).click();
  await expect(page.getByText(/查無資料不代表不含禁用物質/)).toBeVisible();
});
