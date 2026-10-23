import test from 'node:test';
import assert from 'node:assert/strict';
import { compareReference, summarizeComparisons, routeScenario } from '../scripts/lib/drug-reference-validation.mjs';
const p = { license: 'L1', ingredientNames: ['A', 'B'], ingredientSummary: 'A;;B', dosageForm: '膜衣錠' };
const f = { license: 'L1', ingredientNames: ['B', 'A'], compositionMatchesTfda: true, sourceSummaryMatchesTfda: true, inCompetition: '禁止', outOfCompetition: '不禁止', substanceField: 'A' };
const assess = (verdict) => () => ({ verdict, ingredients: [], unknownCount: verdict === 'unresolved' ? 1 : 0, incomplete: verdict === 'unresolved' });
test('a missing reference or a changed whole formula is never agreement', () => {
  assert.equal(compareReference(p, null, assess('no-listed-restriction')).status, 'reference-not-collected');
  assert.equal(compareReference(p, { ...f, ingredientNames: ['A'] }, assess('restricted')).status, 'identity-or-formula-conflict');
  assert.equal(compareReference(p, { ...f, license: 'L2' }, assess('restricted')).status, 'identity-or-formula-conflict');
});
test('potential false clearance and more restrictive differences stay distinct', () => {
  assert.equal(compareReference(p, f, assess('no-listed-restriction')).status, 'potential-false-clear');
  assert.equal(compareReference(p, f, assess('restricted')).status, 'more-restrictive-than-reference');
});
test('abstentions and absent references stay in the sample denominator', () => {
  const rows = [compareReference(p, f, assess('unresolved')), compareReference(p, null, assess('restricted'))];
  const s = summarizeComparisons(rows);
  assert.equal(s.sampledProducts, 2); assert.equal(s.fullyComparableProducts, 0); assert.equal(s.productAgreementPercent, null);
  assert.equal(s.periodOutcomes.abstained, 2);
});
test('green badges with route or federation conditions cannot become binary truth', () => {
  for (const changed of [{ specificUsage: '限眼用' }, { inCompetition: '部份運動禁止' }, { substanceField: '（雖含禁用物質但該藥品之給藥途徑可用）A' }, { substanceField: '' }]) {
    assert.equal(compareReference(p, { ...f, ...changed }, assess('no-listed-restriction')).status, 'reference-conditions-need-review');
  }
});
test('generic injection and unknown liquid never infer intravenous or oral use', () => {
  for (const form of ['注射劑', '注射液劑', '液劑', '栓劑', '外用液劑', '口內膏', '陰道錠']) assert.equal(routeScenario(form), null);
  assert.equal(routeScenario('點眼液劑'), 'ophthalmic');
});
