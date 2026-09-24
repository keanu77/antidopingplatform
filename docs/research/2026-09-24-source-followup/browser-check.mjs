import { chromium } from '/Users/ethanwu/.claude/skills/fb-post/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const base = 'http://127.0.0.1:4179';
const report = { checkedAt: new Date().toISOString(), base, checks: [], errors: [],
  datasetSha256: createHash('sha256').update(await readFile('data/cases.json')).digest('hex'),
  buildIndexSha256: createHash('sha256').update(await readFile('frontend/dist/index.html')).digest('hex') };
await mkdir('.cache/source-followups-20260924/screenshots', { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.origin !== base || url.pathname === '/api/feedback') return route.abort();
      return route.continue();
    });
    const page = await context.newPage();
    page.on('pageerror', e => report.errors.push(e.message));
    const stats = await (await context.request.get(`${base}/api/stats/review-summary`)).json();
    assert.equal(stats.countryEvidencePending, 215);
    assert.equal(stats.countrySourceFollowups, 43);
    assert.equal(stats.countryProfileAtLookup, 27);
    assert.equal(stats.sourceCompared, 500);
    for (const [path, expected, absent] of [
      ['/statistics', ['215 件', '43 件', '27 件', '7 件', 'GPT 463 件'], []],
      ['/cases/usada-792c30cdc646', ['2016', 'USA', '2025', 'JAM', '其後補入的來源或註記尚未再次送交模型'], ['國家身分待補證']],
      ['/cases/usada-091e5bf27388', ['國家身分待補證', '2022-11-29', '36 歲', '37 歲'], []],
      ['/cases/usada-36b25b3d84e6', ['Lubbock', '1981', '國家資料補查：2026-09-24'], ['國家身分待補證']],
      ['/cases/aiu-dbc9a1f66bb9', ['日期補查（2026-09-24）', '2024-08-11', '2026-02-05'], []],
      ['/cases/usada-f49825dfb87e', ['日期補查（2026-09-24）', '處分公告日期', '部分事件細節未見於公開來源'], []],
    ]) {
      await page.goto(base + path); await page.waitForLoadState('networkidle');
      const text = await page.locator('main').innerText();
      for (const x of expected) assert.ok(text.includes(x), `${path}: missing ${x}`);
      for (const x of absent) assert.ok(!text.includes(x), `${path}: unexpected ${x}`);
      const overflow = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth);
      assert.ok(overflow <= 2, `${path}: overflow ${overflow}`);
      if (path === '/cases/usada-36b25b3d84e6') {
        const source = page.getByRole('link', { name: /官方來源（原文/ });
        assert.equal(await source.getAttribute('href'), 'https://worldathletics.org/athletes/united-states/jason-young-14255732');
      }
      report.checks.push({ width: viewport.width, path, passed: true, overflow });
      if (path === '/statistics' || path === '/cases/usada-792c30cdc646') {
        await page.screenshot({ path: `.cache/source-followups-20260924/screenshots/${viewport.width}-${path.split('/').at(-1)}.png`, fullPage: true });
      }
    }
    await context.close();
  }
  assert.equal(report.errors.length, 0);
  await writeFile('docs/research/2026-09-24-source-followup/browser-validation.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ checks: report.checks.length, errors: report.errors }));
} finally { await browser.close(); }
