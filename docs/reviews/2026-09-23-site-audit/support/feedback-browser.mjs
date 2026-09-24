/** Local-only feedback UI regression. All feedback requests are intercepted; no feedback reaches a server. */
import { chromium } from '/Users/ethanwu/.claude/skills/fb-post/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const baseURL = (process.argv[2] || 'http://127.0.0.1:4179').replace(/\/$/, '');
const base = new URL(baseURL);
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(base.hostname), 'Feedback tests are restricted to localhost');
assert.equal(base.port, '4179', 'Feedback tests are restricted to the authorized local port 4179');
const reportPath = resolve(process.argv[3] || 'docs/reviews/2026-09-23-site-audit/feedback-browser.json');
const screenshotDir = resolve('.cache/site-audit/feedback-screenshots');
mkdirSync(dirname(reportPath), { recursive: true }); mkdirSync(screenshotDir, { recursive: true });
const report = {
  startedAt: new Date().toISOString(), baseURL,
  buildIndexSha256: createHash('sha256').update(readFileSync('frontend/dist/index.html')).digest('hex'),
  method: 'Chromium headless; feedback POSTs fulfilled in browser routing with injected 503, 429, and 200; no persistence',
  actualFeedbackServerRequests: 0, interceptedFeedbackRequests: 0, blockedExternalRequests: 0, results: [],
};
const save = () => writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const reply = (route, status, body) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
const marker = page => page.evaluate(() => localStorage.getItem('adp-fb-rated:/cases'));
const assertNotDelivered = async page => {
  assert.equal(await marker(page), null, 'Unsuccessful response must not mark the page rated');
  assert.equal(await page.locator('.adp-fb-toast.ok').count(), 0, 'Unsuccessful response must not show thanks/sent confirmation');
  assert.equal(await page.getByText('感謝你的回饋 ✓', { exact: true }).count(), 0);
};
const browser = await chromium.launch({ headless: true });
const views = [
  { name: 'desktop', viewport: { width: 1440, height: 1000 } },
  { name: 'mobile390', viewport: { width: 390, height: 844 } },
];

async function check(view, id, description, fn) {
  const context = await browser.newContext({ viewport: view.viewport });
  const page = await context.newPage(); page.setDefaultTimeout(6500);
  const pageErrors = [], payloads = [];
  let responder = route => reply(route, 503, { error: 'Test responder was not configured' });
  page.on('pageerror', error => pageErrors.push(error.message));
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin !== base.origin) { report.blockedExternalRequests++; return route.abort(); }
    if (url.pathname === '/api/feedback') {
      report.interceptedFeedbackRequests++;
      assert.equal(route.request().method(), 'POST');
      payloads.push(route.request().postDataJSON());
      return responder(route, payloads.length);
    }
    return route.continue();
  });
  const result = { id: `${view.name}:${id}`, description, viewport: view.viewport, status: 'pass', pageErrors };
  const started = Date.now();
  try {
    await page.goto(baseURL + '/cases', { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: '相關案例', exact: true }).waitFor();
    result.evidence = await fn({ page, payloads, respond: handler => { responder = handler; } });
    assert.deepEqual(pageErrors, [], 'Unexpected JavaScript exception');
  } catch (error) {
    result.status = 'fail'; result.error = error.message;
    result.screenshot = resolve(screenshotDir, `${view.name}-${id}-fail.png`);
    await page.screenshot({ path: result.screenshot, fullPage: true }).catch(() => {});
  } finally {
    result.durationMs = Date.now() - started;
    result.capturedPayloads = payloads; // Synthetic test data only; never a real user email.
    report.results.push(result); save();
    console.log(JSON.stringify({ id: result.id, status: result.status, error: result.error, evidence: result.evidence }));
    await context.close();
  }
}

try {
  for (const view of views) {
    await check(view, 'five-star-503-retry', 'Five-star 503 shows undelivered, keeps stars retryable, and marks rated only after 200 ok', async ({ page, payloads, respond }) => {
      const releaseSuccess = deferred();
      respond(async (route, count) => {
        if (count === 1) return reply(route, 503, {});
        await releaseSuccess.promise; return reply(route, 200, { ok: true });
      });
      try {
        const star = page.getByRole('button', { name: '5 星', exact: true });
        await star.click();
        await page.getByRole('alert').filter({ hasText: '回饋尚未送達' }).waitFor();
        await assertNotDelivered(page); assert.ok(await star.isEnabled());
        assert.equal(payloads[0].type, 'rating'); assert.equal(payloads[0].rating, 5); assert.equal(payloads[0].page, '/cases');
        await star.click();
        await page.waitForFunction(() => document.querySelector('button[aria-label="5 星"]')?.disabled);
        await assertNotDelivered(page);
        releaseSuccess.resolve();
        await page.getByText('謝謝你的回饋！', { exact: true }).waitFor();
        assert.ok(Number(await marker(page)) > 0); assert.equal(payloads.length, 2);
        return { statuses: [503, 200], failureMarkedRated: false, retryAvailable: true, successMarkedRated: true };
      } finally { releaseSuccess.resolve(); }
    });

    await check(view, 'rating-429-retry', 'Rate-limit response does not show success or consume local rating state', async ({ page, payloads, respond }) => {
      respond((route, count) => count === 1 ? reply(route, 429, { error: '送出太頻繁，請稍後再試' }) : reply(route, 200, { ok: true }));
      const star = page.getByRole('button', { name: '5 星', exact: true });
      await star.click();
      await page.getByRole('alert').filter({ hasText: '送出太頻繁' }).waitFor();
      await assertNotDelivered(page); assert.ok(await star.isEnabled());
      await star.click(); await page.getByText('謝謝你的回饋！', { exact: true }).waitFor();
      assert.ok(Number(await marker(page)) > 0);
      return { statuses: [429, 200], attemptedRequests: payloads.length, retryAvailable: true };
    });

    await check(view, 'error-form-payload-reply-retention', 'Error form preserves selected reply email and all fields across 503/429, confirming only after accepted 200', async ({ page, payloads, respond }) => {
      const releaseSuccess = deferred();
      respond(async (route, count) => {
        if (count === 1) return reply(route, 503, {});
        if (count === 2) return reply(route, 429, { error: '送出太頻繁，請稍後再試' });
        await releaseSuccess.promise; return reply(route, 200, { ok: true });
      });
      try {
        await page.getByRole('button', { name: '發現內容有誤？回報問題', exact: true }).click();
        await page.getByLabel('錯誤類型', { exact: false }).selectOption('案例資料錯誤');
        await page.getByLabel('錯在哪裡', { exact: false }).fill('  瀏覽器測試：案例資訊需要修正  ');
        await page.getByLabel('正確內容應該是（選填）', { exact: true }).fill('  測試建議內容  ');
        await page.getByLabel('參考來源（選填）', { exact: true }).fill('https://example.test/reference');
        await page.getByRole('button', { name: /更多（選填/ }).click();
        await page.getByLabel('你的身分（選填）', { exact: true }).selectOption('醫師/醫療人員');
        await page.getByRole('checkbox', { name: '希望收到回覆', exact: true }).check();
        const email = page.getByPlaceholder('your@email.com（留空即匿名送出）', { exact: true });
        await email.fill('regression@example.test');
        const send = page.getByRole('button', { name: '送出回報', exact: true });
        await send.click();
        await page.locator('.adp-fb-panel .adp-fb-err').filter({ hasText: '回饋尚未送達' }).waitFor();
        await assertNotDelivered(page);
        const expected = { type: 'error', errorType: '案例資料錯誤', description: '瀏覽器測試：案例資訊需要修正', suggestion: '測試建議內容', refs: 'https://example.test/reference', role: '醫師/醫療人員', email: 'regression@example.test', page: '/cases', toolSlug: '/cases', website: '' };
        for (const [key, value] of Object.entries(expected)) assert.equal(payloads[0][key], value, `Wrong error payload field ${key}`);
        assert.equal(payloads[0].url, baseURL + '/cases');
        assert.equal(payloads[0].viewport, `${view.viewport.width}x${view.viewport.height}`);
        assert.ok(Number.isFinite(payloads[0].loadedAt) && payloads[0].loadedAt > 0);
        assert.ok(payloads[0].resultSnapshot.includes(baseURL + '/cases'));
        assert.equal(await email.inputValue(), expected.email);
        assert.ok(await page.getByRole('checkbox', { name: '希望收到回覆', exact: true }).isChecked());
        await send.click();
        await page.locator('.adp-fb-panel .adp-fb-err').filter({ hasText: '送出太頻繁' }).waitFor();
        await assertNotDelivered(page); assert.equal(await email.inputValue(), expected.email);
        assert.deepEqual(payloads[1], payloads[0]);
        await send.click();
        await page.getByRole('button', { name: '送出中…', exact: true }).waitFor();
        await assertNotDelivered(page);
        releaseSuccess.resolve();
        await page.locator('.adp-fb-toast.ok').filter({ hasText: '已送出' }).waitFor();
        assert.ok(Number(await marker(page)) > 0); assert.equal(payloads.length, 3);
        assert.deepEqual(payloads[2], payloads[0]);
        return { statuses: [503, 429, 200], payloadFieldsChecked: Object.keys(expected), replyEmailPreserved: true, confirmationWaitsForSuccess: true };
      } finally { releaseSuccess.resolve(); }
    });

    await check(view, 'http-200-without-ok-is-not-delivery', 'HTTP 200 with ok:false does not trigger confirmation or a rated marker', async ({ page, payloads, respond }) => {
      respond(route => reply(route, 200, { ok: false }));
      await page.getByRole('button', { name: '5 星', exact: true }).click();
      await page.getByRole('alert').filter({ hasText: '回饋尚未送達' }).waitFor();
      await assertNotDelivered(page);
      assert.ok(await page.getByRole('button', { name: '5 星', exact: true }).isEnabled());
      return { status: 200, responseOk: false, deliveryConfirmed: false, attemptedRequests: payloads.length };
    });
  }
} finally {
  await browser.close();
  report.finishedAt = new Date().toISOString();
  report.passed = report.results.filter(r => r.status === 'pass').length;
  report.failed = report.results.filter(r => r.status === 'fail').length;
  save();
  console.log(JSON.stringify({ reportPath, passed: report.passed, failed: report.failed, actualFeedbackServerRequests: report.actualFeedbackServerRequests, interceptedFeedbackRequests: report.interceptedFeedbackRequests }));
  process.exitCode = report.failed ? 1 : 0;
}
