/** Local-only UI regression. Run: node .cache/site-audit/ux-regression.mjs [baseURL] [reportPath] */
import { chromium } from '/Users/ethanwu/.claude/skills/fb-post/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const baseURL = (process.argv[2] || 'http://127.0.0.1:4179').replace(/\/$/, '');
const base = new URL(baseURL);
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(base.hostname), 'This regression only targets localhost');
const reportPath = resolve(process.argv[3] || 'docs/reviews/2026-09-23-site-audit/ux-regression.json');
const screenshotDir = resolve('.cache/site-audit/ux-screenshots');
mkdirSync(dirname(reportPath), { recursive: true });
mkdirSync(screenshotDir, { recursive: true });
const report = {
  startedAt: new Date().toISOString(), baseURL,
  buildIndexSha256: createHash('sha256').update(readFileSync('frontend/dist/index.html')).digest('hex'),
  method: 'Chromium headless; actual local build; API errors and response ordering injected in browser routes',
  feedbackRequestsBlocked: 0, externalRequestsBlocked: 0, results: [],
};
const save = () => writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const withTimeout = async (promise, label) => {
  let timer;
  try {
    return await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`Timed out: ${label}`)), 10000); })]);
  } finally { clearTimeout(timer); }
};
const json = (route, body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
const waitUntil = async (fn, message, timeout = 6500) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await fn()) return;
    await new Promise(r => setTimeout(r, 40));
  }
  throw new Error(message);
};
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const browser = await chromium.launch({ headless: true });
const baselineResponse = await browser.newContext().then(async ctx => {
  try { return await (await ctx.request.get(baseURL + '/api/cases?limit=12')).json(); }
  finally { await ctx.close(); }
});
const firstCase = baselineResponse.cases[0];
const listFixture = name => ({ cases: [{ ...firstCase, id: name, _id: name, athleteName: name }], totalCases: 1, currentPage: 1, totalPages: 1, limit: 12 });
const totalText = `找到 ${baselineResponse.totalCases} 個案例`;
const contexts = [
  { name: 'desktop', viewport: { width: 1440, height: 1000 } },
  { name: 'mobile390', viewport: { width: 390, height: 844 } },
];

async function check(view, id, description, fn) {
  const ctx = await browser.newContext({ viewport: view.viewport });
  const page = await ctx.newPage();
  page.setDefaultTimeout(6500);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await ctx.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== base.origin) { report.externalRequestsBlocked++; return route.abort(); }
    if (url.pathname === '/api/feedback') {
      report.feedbackRequestsBlocked++;
      return json(route, { error: 'Regression blocks all feedback persistence' }, 503);
    }
    return route.continue();
  });
  const started = Date.now();
  const result = { id: `${view.name}:${id}`, description, viewport: view.viewport, status: 'pass', pageErrors };
  try {
    result.evidence = await fn(page, ctx);
    assert.deepEqual(pageErrors, [], 'Unexpected browser JavaScript exception');
  } catch (error) {
    result.status = 'fail';
    result.error = error.message;
    result.screenshot = resolve(screenshotDir, `${view.name}-${id}-fail.png`);
    await page.screenshot({ path: result.screenshot, fullPage: true }).catch(() => {});
  } finally {
    result.durationMs = Date.now() - started;
    report.results.push(result);
    save();
    console.log(JSON.stringify({ id: result.id, status: result.status, error: result.error, evidence: result.evidence }));
    await ctx.close();
  }
}

try {
  for (const view of contexts) {
    await check(view, 'cases-search-pagination-clear', 'Actual API: paginate, search, clear pending search, restore all cases', async page => {
      await page.goto(baseURL + '/cases', { waitUntil: 'networkidle' });
      await page.getByText(totalText, { exact: true }).waitFor();
      const firstNames = await page.locator('main h3').allTextContents();
      await page.getByRole('button', { name: '下一頁', exact: true }).click();
      await waitUntil(async () => {
        const names = await page.locator('main h3').allTextContents();
        return names.length > 0 && JSON.stringify(names) !== JSON.stringify(firstNames);
      }, 'Pagination did not finish with different cases');
      const secondNames = await page.locator('main h3').allTextContents();
      assert.ok(secondNames.length > 0 && !firstNames.includes(secondNames[0]));
      const input = page.getByRole('textbox', { name: '搜尋案例', exact: true });
      await input.fill(firstCase.athleteName);
      await input.press('Enter');
      await page.getByRole('heading', { name: firstCase.athleteName, exact: true }).waitFor();
      await waitUntil(async () => (await page.locator('main h3').count()) < firstNames.length, 'Search did not filter');
      await page.getByRole('button', { name: '切換篩選選項', exact: true }).click();
      assert.ok(await page.getByLabel('來源所列國家／地區', { exact: true }).count());
      await input.fill('RegressionPendingNoResults');
      await page.getByRole('button', { name: '清除所有篩選', exact: true }).click();
      await page.getByText(totalText, { exact: true }).waitFor();
      await page.waitForTimeout(450);
      assert.equal(await input.inputValue(), '');
      assert.ok(await page.getByText(totalText, { exact: true }).isVisible());
      assert.deepEqual(await page.locator('main h3').allTextContents(), firstNames);
      await page.screenshot({ path: resolve(screenshotDir, `${view.name}-cases.png`), fullPage: true });
      return { firstPageCount: firstNames.length, differentSecondPage: true, restoredTotal: baselineResponse.totalCases, pendingSearchCancelled: true };
    });

    await check(view, 'cases-error-recovery', 'A failed search is followed by a successful search without a stale error banner', async page => {
      await page.route('**/api/cases?**', route => {
        const search = new URL(route.request().url()).searchParams.get('search');
        if (search === 'RegressionFailure') return json(route, { error: 'injected failure' }, 500);
        if (search === 'RegressionRecovery') return json(route, listFixture('Recovered Search'));
        return route.continue();
      });
      await page.goto(baseURL + '/cases', { waitUntil: 'networkidle' });
      const input = page.getByRole('textbox', { name: '搜尋案例', exact: true });
      await input.fill('RegressionFailure'); await input.press('Enter');
      const error = page.getByText('載入案例資料失敗，請稍後再試。', { exact: true });
      await error.waitFor();
      await input.fill('RegressionRecovery'); await input.press('Enter');
      await page.getByRole('heading', { name: 'Recovered Search', exact: true }).waitFor();
      assert.equal(await error.count(), 0);
      return { injectedStatus: 500, successfulRetryClearsError: true };
    });

    await check(view, 'cases-response-race', 'Late search A cannot replace already-rendered search B', async page => {
      const seenA = deferred(), releaseA = deferred(), doneA = deferred();
      await page.route('**/api/cases?**', async route => {
        const search = new URL(route.request().url()).searchParams.get('search');
        if (search === 'RaceA') {
          seenA.resolve(); await releaseA.promise;
          await json(route, listFixture('Race Result A')); doneA.resolve(); return;
        }
        if (search === 'RaceB') return json(route, listFixture('Race Result B'));
        return route.continue();
      });
      try {
        await page.goto(baseURL + '/cases', { waitUntil: 'networkidle' });
        const input = page.getByRole('textbox', { name: '搜尋案例', exact: true });
        await input.fill('RaceA'); await input.press('Enter'); await withTimeout(seenA.promise, 'search A request');
        await input.fill('RaceB'); await input.press('Enter');
        await page.getByRole('heading', { name: 'Race Result B', exact: true }).waitFor();
        const finishedA = page.waitForResponse(r => new URL(r.url()).searchParams.get('search') === 'RaceA');
        releaseA.resolve(); await withTimeout(doneA.promise, 'search A response'); await (await finishedA).finished(); await settle(page);
        assert.equal(await input.inputValue(), 'RaceB');
        assert.equal(await page.getByRole('heading', { name: 'Race Result A', exact: true }).count(), 0);
        assert.ok(await page.getByRole('heading', { name: 'Race Result B', exact: true }).isVisible());
        return { responseOrder: ['B', 'A'], finalResult: 'B' };
      } finally { releaseA.resolve(); }
    });

    await check(view, 'detail-404', 'Missing case receives the 404-specific message', async page => {
      await page.goto(baseURL + '/cases/regression-does-not-exist', { waitUntil: 'networkidle' });
      await page.getByText('案例不存在', { exact: true }).waitFor();
      assert.equal(await page.getByRole('button', { name: '重新載入', exact: true }).count(), 0);
      return { notFoundShown: true, transportErrorNotShown: true };
    });

    await check(view, 'detail-500-retry', 'Existing case 500 is shown as loading failure and can be retried', async page => {
      let hits = 0;
      await page.route(`**/api/cases/${firstCase.id}`, route => ++hits === 1 ? json(route, { error: 'injected failure' }, 500) : route.continue());
      await page.goto(baseURL + '/cases/' + firstCase.id, { waitUntil: 'networkidle' });
      await page.getByRole('alert').filter({ hasText: '載入案例失敗' }).waitFor();
      assert.equal(await page.getByText('案例不存在', { exact: true }).count(), 0);
      await page.getByRole('button', { name: '重新載入', exact: true }).click();
      await page.getByRole('heading', { name: firstCase.athleteName, exact: true }).waitFor();
      assert.equal(await page.getByRole('alert').filter({ hasText: '載入案例失敗' }).count(), 0);
      return { requestCount: hits, restoredCase: firstCase.id };
    });

    await check(view, 'tue-enter-query-race', 'Repeated Enter is deduplicated; editing query invalidates older response', async page => {
      const seenA = deferred(), releaseA = deferred(), doneA = deferred(); let aCount = 0, bCount = 0;
      const answer = query => ({ drugName: query, displayName: query, matchedKey: null, needsTUE: null, wadaCategory: '測試', explanation: 'Regression fixture only' });
      await page.route('**/api/tue/check', async route => {
        const { drugName } = route.request().postDataJSON();
        if (drugName === 'Query A') {
          aCount++; seenA.resolve(); await releaseA.promise;
          await json(route, answer('Query A')); doneA.resolve(); return;
        }
        bCount++; return json(route, answer('Query B'));
      });
      try {
        await page.goto(baseURL + '/tue', { waitUntil: 'networkidle' });
        await page.getByRole('button', { name: '實用工具', exact: true }).click();
        const input = page.getByRole('textbox', { name: '藥物名稱', exact: true });
        await input.fill('Query A'); await input.press('Enter'); await withTimeout(seenA.promise, 'drug A request');
        await input.press('Enter'); await input.press('Enter'); await settle(page);
        assert.equal(aCount, 1);
        await input.fill('Query B');
        assert.equal(await page.getByRole('status').filter({ hasText: 'Query A' }).count(), 0);
        await input.press('Enter');
        await page.getByRole('status').filter({ hasText: 'Query B' }).waitFor();
        const finishedA = page.waitForResponse(r => r.url().endsWith('/api/tue/check') && r.request().postDataJSON().drugName === 'Query A');
        releaseA.resolve(); await withTimeout(doneA.promise, 'drug A response'); await (await finishedA).finished(); await settle(page);
        assert.equal(await input.inputValue(), 'Query B');
        assert.equal(await page.getByRole('status').filter({ hasText: 'Query A' }).count(), 0);
        assert.ok(await page.getByRole('status').filter({ hasText: 'Query B' }).isVisible());
        assert.equal(bCount, 1);
        return { duplicateEnterRequests: aCount, newQueryRequests: bCount, finalQuery: 'Query B' };
      } finally { releaseA.resolve(); }
    });

    await check(view, 'tue-control-labels', 'Decision selects are named and competition buttons expose selected state', async page => {
      await page.goto(baseURL + '/tue', { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: '實用工具', exact: true }).click();
      const drug = page.getByLabel('選擇藥物', { exact: true });
      await drug.selectOption('prednisolone');
      await page.getByLabel('給藥途徑', { exact: true }).selectOption('oral');
      const inComp = page.getByRole('button', { name: '賽內（比賽期間）', exact: true });
      const outComp = page.getByRole('button', { name: '賽外（訓練期間）', exact: true });
      assert.equal(await inComp.getAttribute('aria-pressed'), 'true');
      await outComp.click(); assert.equal(await outComp.getAttribute('aria-pressed'), 'true'); assert.equal(await inComp.getAttribute('aria-pressed'), 'false');
      const sportOption = await drug.locator('option').evaluateAll(options => options.find(o => /propranolol/i.test(o.value))?.value);
      assert.ok(sportOption, 'Expected a sport-restricted beta-blocker option');
      await drug.selectOption(sportOption);
      await page.getByLabel('運動項目', { exact: true }).waitFor();
      return { namedControls: ['選擇藥物', '給藥途徑', '運動項目'], competitionStateExposed: true };
    });

    await check(view, 'education-adrv-retry', 'ADRV failure stops the spinner and its retry loads data', async page => {
      let hits = 0;
      await page.route('**/api/education/adrv', route => ++hits === 1 ? json(route, { error: 'injected failure' }, 500) : route.continue());
      await page.goto(baseURL + '/education', { waitUntil: 'networkidle' });
      await page.getByRole('tab', { name: '違規類型', exact: true }).click();
      await page.getByRole('alert').filter({ hasText: '載入違規類型失敗' }).waitFor();
      assert.equal(await page.locator('[role="tabpanel"] .animate-spin').count(), 0);
      await page.getByRole('button', { name: '重新載入', exact: true }).click();
      await page.getByRole('heading', { name: /十一項反禁藥規則違反/ }).waitFor();
      assert.equal(await page.getByRole('alert').filter({ hasText: '載入違規類型失敗' }).count(), 0);
      return { requestCount: hits, retryRestoresPanel: true };
    });

    if (view.name === 'desktop') {
      await check(view, 'dropdown-escape-focus', 'Desktop dropdown Escape closes and restores trigger focus', async page => {
        await page.goto(baseURL + '/cases', { waitUntil: 'networkidle' });
        const trigger = page.getByRole('button', { name: '學習專區', exact: true });
        await trigger.focus(); await trigger.press('ArrowDown');
        const first = page.getByRole('menuitem').first();
        await waitUntil(() => first.evaluate(el => el === document.activeElement), 'First menu link was not focused');
        await first.press('Escape');
        assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
        assert.ok(await trigger.evaluate(el => el === document.activeElement));
        return { closed: true, focusRestored: true };
      });
    } else {
      await check(view, 'mobile-menu-navigation', '390px navigation opens and selecting a destination closes it', async page => {
        await page.goto(baseURL + '/cases', { waitUntil: 'networkidle' });
        await page.getByRole('button', { name: '開啟選單', exact: true }).click();
        await page.locator('header nav:visible').getByRole('link', { name: '教育專區', exact: true }).click();
        await page.getByRole('heading', { name: '教育專區', exact: true }).waitFor();
        await page.getByRole('button', { name: '開啟選單', exact: true }).waitFor();
        return { navigatedTo: '/education', menuClosed: true };
      });
      await check(view, 'mobile-menu-escape-focus', '390px navigation Escape closes and restores its toggle focus', async page => {
        await page.goto(baseURL + '/cases', { waitUntil: 'networkidle' });
        await page.getByRole('button', { name: '開啟選單', exact: true }).click();
        const first = page.locator('header nav:visible').getByRole('link').first();
        await first.focus(); await first.press('Escape'); await settle(page);
        const toggle = page.getByRole('button', { name: '開啟選單', exact: true });
        assert.equal(await toggle.count(), 1, 'Mobile menu remains open after Escape');
        assert.ok(await toggle.evaluate(el => el === document.activeElement), 'Focus did not return to mobile toggle');
        return { closed: true, focusRestored: true };
      });
    }
  }
} finally {
  await browser.close();
  report.finishedAt = new Date().toISOString();
  report.passed = report.results.filter(r => r.status === 'pass').length;
  report.failed = report.results.filter(r => r.status === 'fail').length;
  save();
  console.log(JSON.stringify({ reportPath, passed: report.passed, failed: report.failed, feedbackRequestsBlocked: report.feedbackRequestsBlocked }));
  process.exitCode = report.failed ? 1 : 0;
}
