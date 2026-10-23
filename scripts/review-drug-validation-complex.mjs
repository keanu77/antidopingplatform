// Limited primary-source checks. These do not turn abstentions into successes.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: Object.fromEntries(['checkpoint', 'results', 'conditions', 'output'].map(k => [k, { type: 'string' }])) });
if (Object.values(values).length !== 4) throw new Error('Supply --checkpoint, --results, --conditions and a new --output file');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const checkpoint = resolve(values.checkpoint), manifestBytes = await readFile(join(checkpoint, 'manifest.json')), manifest = JSON.parse(manifestBytes);
for (const [file, digest] of Object.entries(manifest.files)) if (sha(await readFile(join(checkpoint, file))) !== digest) throw new Error('Frozen input changed: '+file);
const resultBytes = await readFile(values.results), results = JSON.parse(resultBytes);
const conditionBytes = await readFile(values.conditions), conditions = JSON.parse(conditionBytes);
if (results.checkpointManifestSha256 !== sha(manifestBytes) || conditions.inputSha256 !== sha(resultBytes)) throw new Error('Review inputs do not belong together');
const { assessDrugProduct } = await import(pathToFileURL(join(checkpoint, 'assessment.mjs')).href);
const rows = new Map([...results.random.rows, ...results.highRisk.rows].map(r => [r.license, r]));
const wada = 'https://www.wada-ama.org/sites/default/files/2025-09/2026list_en_final_clean_september_2025.pdf';
const thresholdClauses = new Map([
  ['賽內之甲基麻黃素尿液中濃度若高於10 MCG/ML則視為使用禁用物質', { key: 'methylephedrine', value: 10 }],
  ['賽內之麻黃素尿液中濃度若高於10 MCG/ML則視為使用禁用物質', { key: 'ephedrine', value: 10 }],
  ['賽內之假麻黃鹼尿液中濃度若高於150 MCG/ML則視為使用禁用物質', { key: 'pseudoephedrine', value: 150 }],
]);
const reviewed = [];
for (const held of conditions.held) {
  const row = rows.get(held.license), f = row.reference;
  const checks = [];
  const evaluate = (label, options, key, expected) => {
    const context = { date: '2026-10-23', ...row.context, inCompetition: true, ...options };
    const result = assessDrugProduct({ ingredientNames: row.ingredientNames, conflictingFields: [] }, context);
    const ingredient = result.ingredients.find(i => i.key === key);
    checks.push({ label, context, expectedIngredientVerdict: expected, ingredient: ingredient ?? null,
      ingredientVerdictMatches: ingredient?.assessment.verdict === expected, productVerdict: result.verdict,
      unknownNames: result.ingredients.filter(i => i.assessment.verdict === 'unknown').map(i => i.name),
      scope: '已知成分條文／守門測試；完整產品未定仍保持未定。此處反事實途徑不代表實際用法。' });
  };
  let category = 'unreviewed-condition', finding = '新條件尚未納入本輪主要來源覆核。', sections = [];
  if (f.wadaCode === 'S6' && thresholdClauses.has(f.specificUsage)) {
    const { key, value } = thresholdClauses.get(f.specificUsage);
    category = key+'-threshold'; sections = ['S6, printed p16', 'S5, printed p12'];
    evaluate('賽內，S5 併用未知', { route: 'oral', s5Concomitant: 'unknown' }, key, 'conditions-required');
    evaluate('賽內，確認無 S5 併用，仍保留濃度條件', { route: 'oral', s5Concomitant: 'none' }, key, 'permitted-threshold');
    evaluate('賽內，併用受禁 S5 物質', { route: 'oral', s5Concomitant: 'prohibited' }, key, 'needs-tue');
    evaluate('賽外條文情境', { route: 'oral', inCompetition: false }, key, 'permitted');
    for (const check of checks.filter(c => c.context.inCompetition)) {
      // S5 co-use removes the concentration exception; showing a threshold
      // there as permission would be misleading. Check that it is absent.
      check.thresholdTextMatches = check.context.s5Concomitant === 'prohibited'
        ? check.ingredient?.assessment.threshold === null
        : check.ingredient?.assessment.threshold === `尿液濃度 >${value}µg/mL 為陽性`;
    }
    finding = `TADA 與 WADA S6 對 ${key} 的 ${value} µg/mL 閾值一致；MCG/ML 與 µg/mL 為相同單位。本機應保留濃度與 S5 併用條件。沒有患者濃度、劑量或 TUE 資料，不能裁定實際用藥可用。`;
  } else if (f.wadaCode === 'S7' && f.specificUsage === '賽內之嗎啡尿液中濃度若高於1 MCG/ML則視為使用禁用物質') {
    category = 'opium-morphine'; sections = ['S7, printed p17'];
    const key = row.ingredientNames.includes('OPIUM POWDER') ? 'opium powder'
      : row.ingredientNames.includes('OPIUM') ? 'opium'
        : row.ingredientNames.includes('MORPHINE HCL') ? 'morphine' : null;
    if (key) {
      evaluate('賽內，嗎啡或含嗎啡材料的已知限制', {}, key, 'needs-tue');
      evaluate('賽外，保留其他未知成分', { inCompetition: false }, key, 'permitted');
    }
    finding = 'WADA S7 列名 morphine，沒有低於 1 µg/mL 即允許使用的條款。TADA 的檢體敘述不能直接轉成安全劑量或使用許可。若為鴉片材料，其含 morphine 的來源另保留在 ingredient.evidence；無法辨識的材料不自動指定為 opium。';
  } else if (f.wadaCode === 'S6' && f.specificUsage === '賽內禁用，但局部使用時不禁止，例如鼻用、眼用，或與局部麻醉劑共同使用。') {
    category = 'epinephrine-local-exception'; sections = ['S6, printed p16'];
    evaluate('皮膚局部例外', { route: 'dermal' }, 'epinephrine', 'permitted');
    evaluate('口服全身使用', { route: 'oral', epinephrineUse: 'systemic' }, 'epinephrine', 'needs-tue');
    evaluate('確認非靜脈局部麻醉用途', { route: 'non-intravenous-injection', epinephrineUse: 'local-anesthetic' }, 'epinephrine', 'permitted');
    finding = 'WADA 與 TADA 均保留局部使用／局部麻醉例外。本機能辨識本品的 epinephrine 名稱，但其他成分仍未知；不得把已知成分的例外當成整個產品可用。';
  } else if (f.substanceField?.includes('天竺葵') && f.substanceField.includes('可能')) {
    category = 'possible-geranium-adulteration'; sections = ['S6, printed p16'];
    finding = 'TADA 是可能摻入禁用刺激劑的警語，不是該批次已證實含有刺激劑。材料名稱不能證明純度或污染；須完整配方／批次證據，維持未定。';
  } else if (f.wadaCode === 'S6' && f.specificUsage.includes('去甲基假麻黃素') && f.specificUsage.includes('150 MCG/ML')) {
    category = 'ephedra-mixture-concentrations'; sections = ['S6, printed p16', 'S5, printed p12'];
    finding = 'TADA 所列 5／10／150 µg/mL 與 WADA 對應物質的閾值相容；植物混合物的名稱不能提供各生物鹼含量或尿液濃度，不能自動換算可用劑量。維持條件不足／未定。';
  }
  reviewed.push({ cohort: held.cohort, license: row.license, nameZh: row.nameZh, category, finding,
    primarySources: sections.map(section => ({ url: wada, section, reviewedAt: '2026-10-23' })),
    reference: f, baselinePredictions: row.predictions, checks,
    primaryRuleCheck: checks.length ? checks.every(c => c.ingredientVerdictMatches && c.thresholdTextMatches !== false) ? 'limited-clause-check-consistent' : 'discrepancy-needs-review' : 'product-evidence-still-needed',
    unresolvedMaterialSafetySignal: ['possible-geranium-adulteration', 'ephedra-mixture-concentrations'].includes(category)
      ? row.predictions.inCompetition.verdict === 'no-listed-restriction' ? 'potential-false-clear' : 'not-cleared' : null,
    productAdjudication: 'pending', countsTowardAccuracy: false });
}
const report = { reviewedAt: new Date().toISOString(), checkpoint: manifest.id, inputSha256: sha(resultBytes), conditionInputSha256: sha(conditionBytes),
  rulesChanged: false, clinicalReview: 'pending', externalAccuracyEstimate: null,
  summary: { products: reviewed.length, limitedClauseChecks: reviewed.filter(r => r.checks.length).length,
    ingredientScenarios: reviewed.reduce((n,r) => n+r.checks.length,0),
    discrepancies: reviewed.filter(r => r.primaryRuleCheck === 'discrepancy-needs-review').map(r => r.license),
    stillNeedsProductEvidence: reviewed.filter(r => !r.checks.length).length,
    potentialMaterialFalseClear: reviewed.filter(r => r.unresolvedMaterialSafetySignal === 'potential-false-clear').map(r => r.license) }, reviewed };
await writeFile(values.output, JSON.stringify(report, null, 2)+'\n', { flag: 'wx' });
console.log(JSON.stringify(report.summary, null, 2));
