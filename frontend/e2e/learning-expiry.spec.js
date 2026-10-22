import { test, expect } from '@playwright/test';

const key = 'clean-sport-learning-v1';
test.beforeEach(async ({ page }) => {
  await page.route('**/api/feedback', route => route.abort());
});

test('an open learning page removes progress at the Taiwan rule boundary without reload', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-12-31T23:59:00+08:00') });
  await page.goto('/learning?role=athlete');
  const task = page.getByRole('checkbox', { name: /我已完成/ }).first();
  await task.check();
  await expect(task).toBeChecked();
  await page.clock.fastForward(61000);
  await expect(task).not.toBeChecked();
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBeNull();
});

test('browser focus revalidates saved progress after a suspended timer', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-12-31T23:59:00+08:00') });
  await page.goto('/learning?role=coach');
  const task = page.getByRole('checkbox', { name: /我已完成/ }).first();
  await task.check();
  // Changing system time leaves timeout callbacks pending, like a sleeping tab.
  await page.clock.setSystemTime(new Date('2027-01-01T00:00:01+08:00'));
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(task).not.toBeChecked();
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBeNull();
});

for (const mode of ['unavailable', 'write-blocked']) {
  test(`${mode} browser storage preserves temporary progress when returning to the page`, async ({ page }) => {
    await page.addInitScript(mode => {
      if (mode === 'unavailable') {
        Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage disabled', 'SecurityError'); } });
      } else {
        Storage.prototype.setItem = () => { throw new DOMException('Storage full', 'QuotaExceededError'); };
      }
    }, mode);
    await page.goto('/learning?role=medical');
    const task = page.getByRole('checkbox', { name: /我已完成/ }).first();
    await task.check();
    await expect(page.getByRole('status')).toContainText('目前無法儲存進度');
    await page.evaluate(() => {
      window.dispatchEvent(new Event('focus'));
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(task).toBeChecked();
  });
}
