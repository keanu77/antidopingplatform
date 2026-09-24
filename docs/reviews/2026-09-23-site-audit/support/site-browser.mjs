import { chromium } from '/Users/ethanwu/.claude/skills/fb-post/node_modules/playwright/index.mjs';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4179';
const root = process.cwd();
const screenshots = resolve(root, '.cache/site-audit/screenshots');
const resultPath = resolve(root, 'docs/reviews/2026-09-23-site-audit/site-browser.json');
await mkdir(screenshots, { recursive: true });
await mkdir(resolve(root, 'docs/reviews/2026-09-23-site-audit'), { recursive: true });

async function focusedVisibleHeading(page, selector) {
  await page.waitForFunction(selector => {
    const heading = document.querySelector(selector);
    if (!heading) return false;
    const rect = heading.getBoundingClientRect();
    const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom || 0;
    return document.activeElement === heading && rect.top >= headerBottom && rect.bottom <= innerHeight;
  }, selector, { timeout: 5000 });
  return page.locator(selector).evaluate(heading => {
    const rect = heading.getBoundingClientRect();
    return { text: heading.textContent.trim(), focused: heading === document.activeElement, top: rect.top, bottom: rect.bottom, scrollY, height: innerHeight };
  });
}

async function completeQuiz(page, viewport) {
  await page.goto(`${base}/quiz`);
  await page.waitForLoadState('networkidle');
  // Reproducible question order includes a long final question that exposed VIS-01.
  await page.evaluate(() => {
    let state = 1;
    Math.random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
  });
  await page.getByRole('button', { name: /知識測驗（計分）/ }).click();
  let correct = 0;
  let beforeResult;
  const questions = [];
  for (let index = 1; index <= 10; index++) {
    const headingState = await focusedVisibleHeading(page, 'main h2');
    const buttons = page.locator('main h2').first().locator('..').getByRole('button');
    assert.ok(await buttons.count() >= 2);
    await buttons.first().click();
    const isCorrect = await page.getByText('正確！', { exact: true }).isVisible();
    if (isCorrect) correct++;
    assert.ok(await buttons.first().isDisabled());
    questions.push({ index, question: headingState.text, chosenOption: 0, correct: isCorrect, heading: headingState });
    const next = page.getByRole('button', { name: index === 10 ? '看結果' : '下一題', exact: true });
    await next.scrollIntoViewIfNeeded();
    if (index === 10) beforeResult = await page.evaluate(() => ({ scrollY, height: innerHeight }));
    await next.click();
  }
  const resultHeading = await focusedVisibleHeading(page, 'main h2');
  assert.equal(resultHeading.text, '測驗結果');
  const after = await page.evaluate(() => {
    const heading = document.querySelector('main h2');
    const score = heading.nextElementSibling;
    return { scrollY, height: innerHeight, focused: heading === document.activeElement, headerBottom: document.querySelector('header').getBoundingClientRect().bottom, headingTop: heading.getBoundingClientRect().top, scoreTop: score.getBoundingClientRect().top, scoreBottom: score.getBoundingClientRect().bottom, score: score.textContent.trim() };
  });
  assert.equal(after.score, `${correct}/10`);
  const screenshot = resolve(screenshots, `${viewport}-quiz-result-viewport.png`);
  await page.screenshot({ path: screenshot });
  await page.screenshot({ path: resolve(screenshots, `${viewport}-quiz-result.png`), fullPage: true });
  const scoreFullyVisible = after.scoreTop >= after.headerBottom && after.scoreBottom <= after.height;
  assert.ok(scoreFullyVisible, `Result score outside visible viewport: ${JSON.stringify(after)}`);
  const scrollVerification = { viewport, lastQuestion: questions.at(-1).question, before: beforeResult, after, screenshot, scoreFullyVisible };
  await page.getByRole('button', { name: '再測一次', exact: true }).click();
  const menuHeading = await focusedVisibleHeading(page, 'main h1');
  assert.equal(menuHeading.text, '互動測驗');
  await page.getByRole('button', { name: /知識測驗（計分）/ }).click();
  const restartHeading = await focusedVisibleHeading(page, 'main h2');
  assert.ok(await page.getByText('得分 0', { exact: true }).isVisible());
  return { questions, finalScore: correct, restartScore: 0, scrollVerification, menuHeading, restartHeading };
}

if (process.argv.includes('--quiz-scroll-only')) {
  const saved = JSON.parse(await readFile(resultPath, 'utf8'));
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await page.route('**/api/feedback', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"auditIntercepted":true}' }));
    const evidence = await completeQuiz(page, 'mobile');
    saved.quizScrollVerification = evidence.scrollVerification;
    saved.findings = saved.findings.filter(finding => finding.id !== 'VIS-01');
    saved.summary.findings = saved.findings.length;
    await writeFile(resultPath, JSON.stringify(saved, null, 2) + '\n');
    console.log(JSON.stringify(evidence, null, 2));
  } finally { await browser.close(); }
  process.exit(0);
}
if (process.argv.includes('--specialties-only')) {
  const saved = JSON.parse(await readFile(resultPath, 'utf8'));
  const checks = [];
  const errors = [];
  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of [{ name: 'desktop', width: 1280, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: 'reduce' });
      await context.route('**/api/feedback', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"auditIntercepted":true}' }));
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      const payload = await (await context.request.get(`${base}/api/education`)).json();
      assert.equal(payload.specialties.length, 8);
      await page.goto(`${base}/education`); await page.waitForLoadState('networkidle');
      await page.getByRole('tab', { name: '各科專區', exact: true }).click();
      const panel = page.getByRole('tabpanel');
      const names = await panel.locator('h3').allTextContents();
      assert.deepEqual(names, payload.specialties.map(item => item.specialty));
      const treatmentDirections = await panel.getByRole('heading', { level: 5, name: '與醫師討論的治療方向', exact: true }).evaluateAll(headings => headings.map(heading => heading.nextElementSibling.textContent));
      assert.deepEqual(treatmentDirections, payload.specialties.flatMap(item => item.medications.map(medication => medication.alternatives)));
      assert.ok(treatmentDirections.length > 0);
      assert.ok(treatmentDirections.every(text => !/clomifene|clomiphene|克羅米芬/i.test(text)));
      const panelText = await panel.innerText();
      assert.match(panelText, /Clomiphene、Anastrozole、Tamoxifen.*全時段禁用/);
      const width = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
      assert.ok(width.document <= width.viewport + 2);
      const screenshot = resolve(screenshots, `${viewport.name}-education-specialties.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      checks.push({ viewport: viewport.name, ok: true, names, specialtyCount: names.length, treatmentDirectionCount: treatmentDirections.length, treatmentDirections, matchesAPI: true, clomifeneAlternativeRecommendationFound: false, prohibitedClomipheneNotePresent: true, width, screenshot });
      await context.close();
    }
    assert.equal(errors.length, 0);
    saved.specialtiesVerification = { checkedAt: new Date().toISOString(), checks, pageErrors: errors };
    await writeFile(resultPath, JSON.stringify(saved, null, 2) + '\n');
    console.log(JSON.stringify({ version: saved.version, specialties: checks.map(({ viewport, ok, specialtyCount, treatmentDirectionCount, matchesAPI, clomifeneAlternativeRecommendationFound }) => ({ viewport, ok, specialtyCount, treatmentDirectionCount, matchesAPI, clomifeneAlternativeRecommendationFound })), pageErrors: errors }, null, 2));
  } finally { await browser.close(); }
  process.exit(0);
}
const report = {
  startedAt: new Date().toISOString(), base, mode: 'local browser read-only QA',
  routes: [], interactions: [], findings: [], interceptedFeedback: [], pageErrors: [], consoleErrors: [],
  limitations: ['No real feedback was submitted. All browser /api/feedback requests are intercepted.', 'External resource URLs are checked for usable HTTPS anchors and safe new-tab attributes; their remote availability/content is not revalidated.', 'Medical/regulatory facts are outside this interaction audit.', 'This report describes the served bundle at run time; rerun after rebuilding content changes.'],
};
try { report.version = JSON.parse(await readFile(resolve(root, 'frontend/dist/version.json'), 'utf8')); } catch { report.version = null; }

function fail(id, title, detail, route, viewport) {
  report.findings.push({ id, severity: 'P2', title, detail, route, viewport });
}
async function settled(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(250);
}
async function geometry(page) {
  return page.evaluate(() => {
    const width = innerWidth;
    const overflow = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - width;
    const offenders = overflow > 2 ? [...document.querySelectorAll('main *')].filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width && rect.height && (rect.right > width + 2 || rect.left < -2);
    }).slice(0, 15).map(el => ({ tag: el.tagName, text: el.textContent.trim().slice(0, 100), className: String(el.className), left: Math.round(el.getBoundingClientRect().left), right: Math.round(el.getBoundingClientRect().right) })) : [];
    return { width, scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth), overflow, offenders };
  });
}
async function interaction(name, viewport, page, fn) {
  const before = report.pageErrors.length;
  try {
    const evidence = await fn();
    const layout = await geometry(page);
    const ok = report.pageErrors.length === before && layout.overflow <= 2;
    report.interactions.push({ name, viewport, ok, evidence, layout });
    if (!ok) fail(`interaction-${name}`, '互動後出現錯誤或橫向溢位', { evidence, layout }, new URL(page.url()).pathname, viewport);
  } catch (error) {
    report.interactions.push({ name, viewport, ok: false, error: error.message });
    fail(`interaction-${name}`, '互動驗證未通過', error.message, new URL(page.url()).pathname, viewport);
  }
}

const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of [{ name: 'desktop', width: 1280, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: 'reduce' });
    await context.route('**/api/feedback', async route => {
      report.interceptedFeedback.push({ url: route.request().url(), method: route.request().method() });
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"auditIntercepted":true}' });
    });
    const page = await context.newPage();
    page.on('pageerror', error => report.pageErrors.push({ viewport: viewport.name, url: page.url(), message: error.message }));
    page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push({ viewport: viewport.name, url: page.url(), message: message.text() }); });
    const api = await context.request.get(`${base}/api/cases?limit=1`);
    const list = await api.json();
    const caseId = list.cases[0]._id || list.cases[0].id;
    report.caseCount = list.totalCases;
    const routes = ['/', '/cases', `/cases/${encodeURIComponent(caseId)}`, '/statistics', '/education', '/tue', '/prohibited-list', '/quiz', '/testing-process', '/news', '/resources', '/adel', '/audit-page-does-not-exist'];
    for (const route of routes) {
      const previousErrors = report.pageErrors.length;
      const response = await page.goto(`${base}${route}`);
      await settled(page);
      const headings = await page.locator('main h1').allTextContents();
      const mainText = (await page.locator('main').innerText()).trim();
      const layout = await geometry(page);
      const slug = route === '/' ? 'home' : route.slice(1).replaceAll('/', '-');
      const screenshot = resolve(screenshots, `${viewport.name}-${slug}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      const result = { route, viewport: viewport.name, status: response.status(), headings, title: await page.title(), mainTextLength: mainText.length, layout, screenshot, ok: headings.length === 1 && mainText.length >= 30 && layout.overflow <= 2 && report.pageErrors.length === previousErrors };
      report.routes.push(result);
      if (!result.ok) fail(`route-${slug}`, '頁面基礎檢查未通過', result, route, viewport.name);
    }
    console.log(`${viewport.name}: 13 routes scanned`);

    await interaction('statistics-chart-values', viewport.name, page, async () => {
      await page.goto(`${base}/statistics`); await settled(page);
      const text = await page.locator('main').innerText();
      assert.match(text, /517/);
      assert.match(text, /教學案例集，不是禁藥盛行率調查/);
      const summaries = page.locator('main details summary');
      assert.equal(await summaries.count(), 5);
      for (const summary of await summaries.all()) await summary.click();
      const charts = await page.locator('main details').evaluateAll(details => details.map(detail => ({
        title: detail.closest('section').querySelector('h2').textContent,
        note: detail.closest('section').querySelector('p').textContent,
        rows: [...detail.querySelectorAll('tbody tr')].map(row => ({ label: row.querySelector('th').textContent, count: Number(row.querySelector('td').textContent) })),
        ariaLabel: detail.closest('section').querySelector('[role="img"]').getAttribute('aria-label'),
        open: detail.open,
      })));
      for (const chart of charts) {
        assert.equal(chart.open, true);
        assert.ok(chart.ariaLabel.includes(chart.title));
        chart.total = chart.rows.reduce((sum, row) => sum + row.count, 0);
        if (chart.title.includes('前十項')) {
          assert.ok(chart.total > 0 && chart.total <= 517);
          assert.ok(chart.note.includes(`${chart.total}／517`));
        } else assert.equal(chart.total, 517, chart.title);
      }
      const outcomes = await page.locator('main table').first().locator('tbody tr').evaluateAll(rows => rows.map(row => ({ label: row.querySelector('th').textContent, total: [...row.querySelectorAll('td')].reduce((sum, cell) => sum + Number(cell.textContent), 0) })));
      assert.ok(outcomes.every(row => row.total === 517));
      assert.equal(await page.locator('main canvas').count(), 5);
      await page.screenshot({ path: resolve(screenshots, `${viewport.name}-statistics-expanded.png`), fullPage: true });
      return { charts, outcomes, canvasCount: 5 };
    });

    await interaction('prohibited-list-filter-search-accordion', viewport.name, page, async () => {
      await page.goto(`${base}/prohibited-list`); await settled(page);
      const counts = {};
      for (const [label, expected] of [['全部', 14], ['隨時禁用', 6], ['僅賽內禁用', 4], ['特定運動禁用', 1], ['禁用方法', 3]]) {
        await page.getByRole('button', { name: label, exact: true }).click();
        const count = await page.locator('main button[aria-expanded]').count();
        assert.equal(count, expected, label); counts[label] = count;
      }
      await page.getByRole('button', { name: '全部', exact: true }).click();
      await page.getByRole('textbox', { name: '搜尋禁用物質' }).fill('S3');
      assert.equal(await page.locator('main button[aria-expanded]').count(), 1);
      const item = page.locator('main button[aria-expanded]');
      await item.click(); assert.equal(await item.getAttribute('aria-expanded'), 'true');
      assert.ok((await page.locator('main').innerText()).includes('Salbutamol'));
      await item.click(); assert.equal(await item.getAttribute('aria-expanded'), 'false');
      await page.getByRole('textbox', { name: '搜尋禁用物質' }).fill('zzzz-no-substance');
      assert.ok(await page.getByText('找不到符合條件的項目', { exact: true }).isVisible());
      return { counts, searchS3: 1, emptyState: true, accordion: true };
    });

    await interaction('quiz-ten-questions-result-restart', viewport.name, page, async () => {
      return completeQuiz(page, viewport.name);
    });

    await interaction('testing-four-steps', viewport.name, page, async () => {
      await page.goto(`${base}/testing-process`); await settled(page);
      assert.ok(await page.getByRole('button', { name: '上一步', exact: true }).isDisabled());
      const seen = [];
      for (const [index, title] of ['通知', '報到', '採樣', '完成表單'].entries()) {
        assert.ok(await page.getByRole('heading', { level: 2, name: title, exact: true }).isVisible()); seen.push(title);
        if (index < 3) await page.getByRole('button', { name: '下一步', exact: true }).click();
      }
      assert.ok(await page.getByRole('button', { name: '下一步', exact: true }).isDisabled());
      await page.getByRole('button', { name: '步驟 1: 通知', exact: true }).click();
      assert.ok(await page.getByRole('heading', { level: 2, name: '通知', exact: true }).isVisible());
      return { seen, boundaryButtonsDisabled: true, directStepNavigation: true };
    });

    await interaction('education-tabs-and-resource-anchors', viewport.name, page, async () => {
      await page.goto(`${base}/education`); await settled(page);
      const tabs = ['禁藥知識', '常見誤區', '違規類型', '補充劑安全', '案例學習', '各科專區'];
      const panels = [];
      for (const label of tabs) {
        const tab = page.getByRole('tab', { name: label, exact: true }); await tab.click(); await settled(page);
        assert.equal(await tab.getAttribute('aria-selected'), 'true');
        const text = await page.getByRole('tabpanel').innerText(); assert.ok(text.length > 50, label);
        panels.push({ label, textLength: text.length });
      }
      await page.goto(`${base}/resources`); await settled(page);
      const links = await page.locator('main a').evaluateAll(anchors => anchors.map(anchor => ({ text: anchor.textContent.trim(), href: anchor.href, target: anchor.target, rel: anchor.rel })));
      assert.ok(links.length >= 10);
      for (const link of links) {
        assert.equal(new URL(link.href).protocol, 'https:'); assert.ok(link.text); assert.equal(link.target, '_blank'); assert.ok(link.rel.includes('noopener'));
      }
      return { panels, resourceLinks: links, externalAvailabilityChecked: false };
    });

    await interaction('navigation-keyboard-and-mobile-menu', viewport.name, page, async () => {
      await page.goto(`${base}/`); await settled(page);
      if (viewport.name === 'desktop') {
        const trigger = page.getByRole('button', { name: '學習專區', exact: true }); await trigger.focus(); await page.keyboard.press('ArrowDown');
        assert.ok(await page.getByRole('menu').isVisible());
        await page.keyboard.press('Escape');
        assert.equal(await trigger.evaluate(el => el === document.activeElement), true);
        return { escapeRestoresTrigger: true };
      }
      await page.getByRole('button', { name: '開啟選單', exact: true }).click();
      assert.ok(await page.getByRole('button', { name: '關閉選單', exact: true }).isVisible());
      await page.locator('header').getByRole('link', { name: '實用連結', exact: true }).click(); await settled(page);
      assert.equal(new URL(page.url()).pathname, '/resources');
      assert.ok(await page.getByRole('button', { name: '開啟選單', exact: true }).isVisible());
      return { mobileMenuRoute: '/resources', menuClosesAfterNavigate: true };
    });

    console.log(`${viewport.name}: interactions complete`);
    await context.close();
  }
} catch (error) {
  report.fatalError = error.stack;
} finally {
  await browser.close();
  report.finishedAt = new Date().toISOString();
  report.summary = { routes: report.routes.length, routePass: report.routes.filter(r => r.ok).length, interactions: report.interactions.length, interactionPass: report.interactions.filter(r => r.ok).length, findings: report.findings.length, pageErrors: report.pageErrors.length, interceptedFeedback: report.interceptedFeedback.length };
  await writeFile(resultPath, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ resultPath, summary: report.summary, findings: report.findings, fatalError: report.fatalError }, null, 2));
}
process.exitCode = report.fatalError || report.findings.length || report.pageErrors.length ? 1 : 0;
