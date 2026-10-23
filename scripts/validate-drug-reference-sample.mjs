import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash, createHmac, randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { gunzipSync } from 'node:zlib';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { compareReference, summarizeComparisons } from './lib/drug-reference-validation.mjs';
import { mergeValidationReferences } from './lib/drug-validation-inputs.mjs';
const { values } = parseArgs({ options: { checkpoint: { type: 'string' }, output: { type: 'string' }, sample: { type: 'string' }, references: { type: 'string' }, size: { type: 'string', default: '500' } } });
if (!values.checkpoint || !values.output) throw new Error('Supply --checkpoint and a new --output directory');
if (values.references && !values.sample) throw new Error('New references require the original --sample; do not resample');
const checkpoint = resolve(values.checkpoint), output = resolve(values.output), size = Number(values.size);
if (!Number.isInteger(size) || size < 1) throw new Error('Invalid sample size');
const sha = (data) => createHash('sha256').update(data).digest('hex');
const manifestBytes = await readFile(join(checkpoint, 'manifest.json')), manifest = JSON.parse(manifestBytes);
for (const [file, expected] of Object.entries(manifest.files)) if (sha(await readFile(join(checkpoint, file))) !== expected) throw new Error(`Checkpoint changed: ${file}`);
if (sha(await readFile('scripts/lib/drug-reference-validation.mjs')) !== manifest.files['scripts/lib/drug-reference-validation.mjs']) throw new Error('Comparator differs from frozen protocol');
const catalog = JSON.parse(gunzipSync(await readFile(join(checkpoint, 'data/drugs/catalog.json.gz'))));
const cohort = catalog.products.filter((p) => !p.cancellation && p.ingredientNames.length);
if (cohort.length !== manifest.coverage.total || cohort.length < size) throw new Error('Cohort differs from frozen denominator');
const byLicense = new Map(cohort.map((p) => [p.license, p]));
if (byLicense.size !== cohort.length) throw new Error('Ambiguous license identities');
const facts = JSON.parse(await readFile(join(checkpoint, 'artifacts/drugs/reference-checks/facts.json')));
let factMap = new Map();
for (const f of facts) { if (factMap.has(f.license)) throw new Error(`Duplicate reference license: ${f.license}`); factMap.set(f.license, f); }
await mkdir(output); // Do not silently resample or overwrite an earlier result.
const existingSample = values.sample ? JSON.parse(await readFile(values.sample)) : null;
if (existingSample && (existingSample.checkpointManifestSha256 !== sha(manifestBytes) || existingSample.size !== size || existingSample.population !== cohort.length || !/^[a-f0-9]{64}$/.test(existingSample.seed))) throw new Error('Saved sample does not belong to this checkpoint');
const seed = existingSample?.seed ?? randomBytes(32).toString('hex');
const rank = (population, salt) => population.map((p) => ({ license: p.license, rank: createHmac('sha256', seed).update(`${salt}\0${p.license}`).digest('hex') }))
  .sort((a, b) => a.rank.localeCompare(b.rank) || a.license.localeCompare(b.license)).map((p) => p.license);
const sampled = rank(cohort, 'population').slice(0, size), picked = new Set(sampled);
const riskPool = cohort.filter((p) => { const f = factMap.get(p.license); return !picked.has(p.license) && f && (f.wadaCode || f.hasSpecificUsage || f.inCompetition !== '不禁止' || f.outOfCompetition !== '不禁止'); });
const highRisk = rank(riskPool, 'cached-risk').slice(0, 50);
if (existingSample && (JSON.stringify(existingSample.randomLicenses) !== JSON.stringify(sampled) || JSON.stringify(existingSample.additionalCachedRiskLicenses) !== JSON.stringify(highRisk))) throw new Error('Saved sample differs from its seed');
const sample = existingSample ?? { generatedAt: new Date().toISOString(), checkpoint: manifest.id, checkpointManifestSha256: sha(manifestBytes), seed,
  method: 'HMAC-SHA256 random ranking without replacement; seed generated once before reading outcomes', population: cohort.length, size,
  randomLicenses: sampled, additionalCachedRiskLicenses: highRisk, cachedRiskPopulation: riskPool.length,
  scope: '主要樣本由固定19,876筆族群抽取500筆。另50筆來自有快取且帶限制／條件的產品，屬風險補充檢查，兩者不合併估計。查不到不換樣本。' };
let supplementalLicenses = new Set(), supplementalInput = null;
if (values.references) {
  const referenceDir = resolve(values.references);
  const identity = JSON.parse(await readFile(join(referenceDir, 'collection-identity.json')));
  const inputBytes = await readFile(join(referenceDir, 'facts.json'));
  const supplemental = JSON.parse(execFileSync('python3', ['scripts/collect-drug-validation-references.py', '--checkpoint', checkpoint, '--sample', resolve(values.sample), '--output', referenceDir, '--verify-cache'], { maxBuffer: 20 * 1024 * 1024 }));
  if (sha(await readFile(join(referenceDir, 'facts.json'))) !== sha(inputBytes)) throw new Error('Reference collection changed during verification; wait for the batch to finish');
  const merged = mergeValidationReferences({ baseline: facts, supplemental, allowedLicenses: new Set(sampled), frozenAt: manifest.frozenAt,
    checkpoint: manifest.id, identity, checkpointSha256: sha(manifestBytes), sampleSha256: sha(await readFile(values.sample)) });
  factMap = merged.facts; supplementalLicenses = merged.supplementalLicenses;
  supplementalInput = { directory: referenceDir, factsSha256: sha(inputBytes), count: supplemental.length, htmlReparsed: true };
}
await writeFile(join(output, 'sample.json'), JSON.stringify(sample, null, 2)+'\n');
// Selection is now saved. All predictions use the immutable assessment bundle.
const { assessDrugProduct } = await import(pathToFileURL(join(checkpoint, 'assessment.mjs')).href);
const ruleInputs = ['backend/data/drug-evidence-rules.json', 'backend/data/drug-ingredient-rules.json', 'config/drug-reference-decisions.json'];
const knownSourceText = (await Promise.all(ruleInputs.map((f) => readFile(join(checkpoint, f), 'utf8')))).join('\n');
const evaluate = (license) => {
  const fact = factMap.get(license), row = compareReference(byLicense.get(license), fact, assessDrugProduct);
  return { ...row, referenceOrigin: fact ? supplementalLicenses.has(license) ? 'post-freeze-product-reference' : 'pre-freeze-development-cache' : null,
    postFreezeProductReference: supplementalLicenses.has(license), independentHoldout: false, referenceUsedInRuleInputs: fact ? knownSourceText.includes(fact.url) : null };
};
const randomRows = sampled.map(evaluate), riskRows = highRisk.map(evaluate);
const report = { generatedAt: new Date().toISOString(), checkpoint: manifest.id, checkpointManifestSha256: sha(manifestBytes), sampleSha256: sha(await readFile(join(output, 'sample.json'))),
  coveragePercent: manifest.coverage.coveragePercent, stage: supplementalInput ? 'fixed-sample-with-supplemental-references' : 'cached-baseline-review', externalAccuracyEstimate: null, supplementalInput,
  postFreezeReferences: summarizeComparisons(randomRows.filter((r) => r.postFreezeProductReference)),
  limitations: ['凍結前開發快取與凍結後新增產品參考分開標示；新增參考尚未經獨立臨床裁定，不能直接宣稱準確率。', '缺少參考、配方不同、條件尚未核對或本機未定者不算正確，也不換樣本。', 'TADA為比較來源；分歧需依同年度WADA、完整配方與實際情境另作裁定。'],
  random: { summary: summarizeComparisons(randomRows), rows: randomRows }, highRisk: { summary: summarizeComparisons(riskRows), rows: riskRows } };
await writeFile(join(output, 'results.json'), JSON.stringify(report, null, 2)+'\n');
const pending = randomRows.filter((r) => r.status !== 'binary-status-agreement').map((r) => ({ license: r.license, nameZh: r.nameZh, status: r.status, referenceUrl: r.reference?.url || null, nextAction: r.reference ? '核對完整條件與主要來源；不可改寫凍結規則' : '待網站可正常查詢時按原樣本取得許可證相符的參考，不替換成好查的產品' }));
await writeFile(join(output, 'pending-review.json'), JSON.stringify(pending, null, 2)+'\n');
const csv = (v) => '"'+String(v ?? '').replaceAll('"', '""')+'"';
const headers = ['license', 'nameZh', 'dosageForm', 'status', 'routeScenario', 'localIn', 'localOut', 'tadaIn', 'tadaOut', 'referenceUrl', 'independentHoldout', 'referenceUsedInRuleInputs', 'postFreezeProductReference'];
const line = (r) => [r.license,r.nameZh,r.dosageForm,r.status,r.context.route,r.predictions.inCompetition.verdict,r.predictions.outOfCompetition.verdict,r.reference?.inCompetition,r.reference?.outOfCompetition,r.reference?.url,false,r.referenceUsedInRuleInputs,r.postFreezeProductReference].map(csv).join(',');
await writeFile(join(output, 'random-sample.csv'), headers.join(',')+'\n'+randomRows.map(line).join('\n')+'\n');
console.log(JSON.stringify({ random: report.random.summary, highRisk: report.highRisk.summary, externalAccuracyEstimate: null, output }, null, 2));
