import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { build } from '../frontend/node_modules/esbuild/lib/main.js';
import { assessLiveSubstances } from '../scripts/lib/live-evidence.mjs';
import { assessEvidence, registry } from '../shared/content-evidence.mjs';

const bundle = await build({ entryPoints: [fileURLToPath(new URL('../functions/api/[[path]].js', import.meta.url))], bundle: true, write: false, platform: 'node', format: 'esm' });
const { onRequest } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
async function servedSubstances(t, iso) {
  t.mock.timers.enable({ apis: ['Date'], now: new Date(iso) });
  const request = new Request('https://example.test/api/tue/substances');
  const res = await onRequest({ request, env: {}, params: { path: ['tue', 'substances'] } });
  assert.equal(res.status, 200);
  const data = await res.json();
  t.mock.timers.reset();
  return data;
}

test('verification dates later than asOf fail closed for entry and version', () => {
  const entryVerified = registry.entries['drug:guanfacine'].verifiedAt;
  assert.equal(assessEvidence('drug:guanfacine', 'wada-2026', entryVerified).valid, true);
  const dayBefore = new Date(Date.parse(entryVerified) - 86400000).toISOString().slice(0, 10);
  const result = assessEvidence('drug:guanfacine', 'wada-2026', dayBefore);
  assert.equal(result.valid, false);
  assert.match(result.reason, /核對日期晚於目前日期/);
  for (const scope of ['entry', 'version']) {
    const copy = structuredClone(registry);
    const record = scope === 'entry' ? copy.entries['drug:guanfacine'] : copy.versions['wada-2026'];
    record.verifiedAt = '2026-11-01';
    assert.equal(assessEvidence('drug:guanfacine', 'wada-2026', '2026-10-31', copy).valid, false, scope);
    assert.equal(assessEvidence('drug:guanfacine', 'wada-2026', '2026-11-01', copy).valid, true, scope);
  }
});

test('live check passes quietly while 2026 rules are current', async t => {
  const result = assessLiveSubstances(await servedSubstances(t, '2026-10-23T12:00:00Z'));
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.warnings, []);
  assert.ok(result.valid > 0);
  assert.equal(result.lastValidDate, '2026-12-31');
});

test('live check warns when rules or reviews are about to expire', async t => {
  const result = assessLiveSubstances(await servedSubstances(t, '2026-12-15T12:00:00Z'));
  assert.deepEqual(result.errors, []);
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /2026-12-31 \(16 day\(s\) left\)/);
});

test('live check fails after the 2027-01-01 rule expiry even though s5ThresholdRule is still served', async t => {
  const payload = await servedSubstances(t, '2027-01-01T12:00:00Z');
  assert.equal(payload.substances.salbutamol.s5ThresholdRule, true);
  const result = assessLiveSubstances(payload);
  assert.ok(result.errors.some(e => /salbutamol evidence invalid/.test(e)));
  assert.ok(result.errors.some(e => /No served drug decision has valid evidence/.test(e)));
});

test('live check fails when served evidence is past its local deadline or data is missing', () => {
  const served = { substances: { salbutamol: { s5ThresholdRule: true, evidence: { valid: true, evidenceId: 'drug:salbutamol', ruleVersion: 'wada-2026', asOf: '2027-01-02' } } } };
  assert.ok(assessLiveSubstances(served).errors.some(e => /expired after 2026-12-31/.test(e)));
  assert.deepEqual(assessLiveSubstances({}).errors, ['Substance data not served']);
  assert.ok(assessLiveSubstances({ substances: { other: {} } }).errors.includes('Current S5 data not served'));
});
