import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { routesMeta, SITE_URL, caseMeta } from '../frontend/src/data/routeMeta.js';
const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const escape = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cases = JSON.parse(read('data/cases.json'));
for (const route of routesMeta) {
  const html = read(`frontend/dist${route.path === '/' ? '' : route.path}/index.html`);
  assert.ok(html.includes(`<title>${escape(route.title)}</title>`), route.path);
  assert.ok(html.includes(`rel="canonical" href="${SITE_URL}${route.path}"`), route.path);
  assert.ok(html.includes('<main'), route.path);
}
for (const item of cases) {
  const html = read(`frontend/dist/cases/${item.id}/index.html`);
  assert.ok(html.includes(`<title>${escape(caseMeta(item).title)}</title>`), item.id);
  assert.ok(html.includes(escape(item.review.scope)), `${item.id}: scope`);
  for (const note of item.review.auditNotes || []) assert.ok(html.includes(escape(note)), `${item.id}: audit note`);
  for (const field of item.review.sourceComparison?.unresolvedSourceFields || []) assert.ok(html.includes(escape(field)), `${item.id}: pending field`);
  if (item.review.sourceComparison?.claimsChangedAfterReview) assert.ok(html.includes('公開文字於來源對讀後有變更'), item.id);
}
for (const [path, texts] of [
  ['learning', ['我已完成', '準備清單', '個人健康資料']],
  ['editorial-policy', ['利益關係', '回報內容問題', '核對中']],
  ['tue', ['醫療必要', '替代治療']],
  ['testing-process', ['通知', '未成年', 'DCO']],
]) for (const text of texts) assert.ok(read(`frontend/dist/${path}/index.html`).includes(text), `${path}: ${text}`);
assert.ok(read('frontend/dist/404.html').includes('content="noindex, follow"'));
assert.doesNotMatch(read('frontend/dist/_redirects'), /\*.*200/);
for (const path of ['herbal-search', 'supplement-search', 'product-data']) {
  assert.ok(!existsSync(new URL(`frontend/dist/${path}`, root)), `${path}: retired catalog must not be deployed`);
}
console.log(`Built HTML: ${routesMeta.length} routes + ${cases.length} case scopes/notes + 404 passed.`);
