import { test, expect } from '@playwright/test';
import { scenarioQuestions, knowledgeQuestions } from '../src/data/quiz.js';
const questions = [...scenarioQuestions, ...knowledgeQuestions];

test.beforeEach(async ({ page }) => {
  await page.route('**/api/feedback', route => route.abort());
});

for (const [role, title] of [['athlete', '上場前，自己也會查核'], ['coach', '把查核習慣帶進團隊'], ['medical', '讓治療與規則查核接得上']]) {
  test(`${role} has actionable tasks, persistent local progress, and a printable checklist`, async ({ page }) => {
    await page.goto(`/learning?role=${role}`);
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
    const tasks = page.getByRole('checkbox', { name: /我已完成/ });
    await expect(tasks).toHaveCount(4);
    await tasks.first().check();
    await page.reload();
    await expect(tasks.first()).toBeChecked();
    await expect(page.locator('.learning-checklist li')).toHaveCount(5);
    await expect(page.getByRole('link', { name: '前往 ADEL 官方學習平台（官方網站，另開分頁）' })).toHaveAttribute('href', 'https://adel.wada-ama.org/learn');
    await page.getByRole('button', { name: '清除所有本機學習紀錄' }).click();
    await expect(tasks.first()).not.toBeChecked();
    expect(await page.evaluate(() => localStorage.getItem('clean-sport-learning-v1'))).toBeNull();
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.learning-checklist')).toBeVisible();
    await expect(page.getByRole('navigation', { name: '學習角色' })).not.toBeVisible();
  });
}

test('quiz keeps the drawn questions paired with answers, supports wrong-answer practice and clears progress', async ({ page }) => {
  await page.goto('/quiz');
  await page.getByRole('button', { name: /知識測驗（隨機/ }).click();
  const seen = [];
  for (let i = 0; i < 10; i++) {
    const title = await page.locator('main h1').innerText();
    const q = questions.find(question => question.question === title);
    expect(q).toBeTruthy();
    seen.push(title);
    await page.locator('[aria-label="答案選項"] button').nth((q.correctIndex + 1) % q.options.length).click();
    await expect(page.getByRole('link', { name: '回到對應內容學習' })).toBeVisible();
    await page.getByRole('button', { name: i === 9 ? '查看結果與錯題' : '下一題' }).click();
  }
  expect(new Set(seen).size).toBe(10);
  await expect(page.getByRole('heading', { name: '測驗結果' })).toBeVisible();
  await expect(page.locator('[aria-label="答對 0 題，共 10 題可計分"]')).toBeVisible();
  await expect(page.locator('section[aria-labelledby="wrong-question-heading"] h3')).toHaveText(seen);
  await page.getByLabel('下次複習日期').fill('2026-11-01');
  await page.getByRole('button', { name: '重做這 10 題' }).click();
  for (let i = 0; i < 10; i++) {
    const q = questions.find(question => question.question === seen[i]);
    await expect(page.locator('main h1')).toHaveText(q.question);
    await page.locator('[aria-label="答案選項"] button').nth(q.correctIndex).click();
    await page.getByRole('button', { name: i === 9 ? '查看結果與錯題' : '下一題' }).click();
  }
  await expect(page.getByRole('heading', { name: '錯題複習結果' })).toBeVisible();
  await expect(page.locator('[aria-label="答對 10 題，共 10 題可計分"]')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('下次複習日期')).toHaveValue('2026-11-01');
  await expect(page.getByRole('button', { name: /刻意練習：重做錯題/ })).toBeDisabled();
  await page.getByRole('button', { name: '清除所有本機學習紀錄' }).click();
  expect(await page.evaluate(() => localStorage.getItem('clean-sport-learning-v1'))).toBeNull();
});

test('Education deep links preserve tab selection and keyboard relationships', async ({ page }) => {
  await page.goto('/education?tab=supplements');
  const active = page.getByRole('tab', { selected: true });
  await expect(active).toContainText('補充劑');
  const panelId = await active.getAttribute('aria-controls');
  await expect(page.locator(`#${panelId}`)).toBeVisible();
  await active.focus();
  await page.keyboard.press('Home');
  await expect(page.getByRole('tab').first()).toBeFocused();
  await page.reload();
  await expect(page.getByRole('tab').first()).toHaveAttribute('aria-selected', 'true');
});
