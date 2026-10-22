import { test, expect } from '@playwright/test';

test('source links and browser history keep the selected evidence visible', async ({ page }) => {
  await page.route('**/api/feedback', route => route.abort());
  await page.goto('/sources?id=drug%3Asalbutamol');
  const search = page.getByRole('textbox', { name: '搜尋藥物、題目或來源識別碼' });
  await expect(search).toHaveValue('drug:salbutamol');

  await search.fill('guanfacine');
  await page.locator('details summary').click();
  await page.getByRole('link', { name: '查看核對範圍、有效期與修訂紀錄' }).click();
  await expect(page).toHaveURL(/id=drug%3Aguanfacine/);
  await expect(search).toHaveValue('drug:guanfacine');

  await page.goBack();
  await expect(page).toHaveURL(/id=drug%3Asalbutamol/);
  await expect(search).toHaveValue('drug:salbutamol');
  await expect(page.locator('details')).toHaveCount(1);
  await expect(page.locator('details[open] summary')).toContainText('Salbutamol');

  await page.goForward();
  await expect(search).toHaveValue('drug:guanfacine');
  await expect(page.locator('details')).toHaveCount(1);
  await expect(page.locator('details[open] summary')).toContainText('Guanfacine');
});
