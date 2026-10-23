// Reuses the first-round condition protocol without changing the frozen rules.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
const { values } = parseArgs({ options: { checkpoint: { type: 'string' }, results: { type: 'string' }, output: { type: 'string' } } });
if (!values.checkpoint || !values.results || !values.output) throw new Error('Supply --checkpoint, --results and a new --output file');
const checkpoint = resolve(values.checkpoint);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const manifestBytes = await readFile(join(checkpoint,'manifest.json')), manifest = JSON.parse(manifestBytes);
for (const [file, sha] of Object.entries(manifest.files)) if (hash(await readFile(join(checkpoint,file))) !== sha) throw new Error('Frozen input changed: '+file);
const inputBytes = await readFile(values.results), source = JSON.parse(inputBytes);
if (source.checkpoint !== manifest.id || source.checkpointManifestSha256 !== hash(manifestBytes)) throw new Error('Results belong to another checkpoint');
const { assessDrugProduct } = await import(pathToFileURL(join(checkpoint,'assessment.mjs')).href);
const reviewed = [], held = [];
const positive = 'no-listed-restriction', negative = 'restricted';
for (const cohort of ['random','highRisk']) for (const row of source[cohort].rows) {
  if (row.status !== 'reference-conditions-need-review') continue;
  const f=row.reference, cases=[];
  const add=(label,options,expected)=>cases.push({label,context:{date:'2026-10-23',...row.context,...options},expected});
  const pair=(label,options,inside,outside)=>{add(label+'：賽內',{...options,inCompetition:true},inside);add(label+'：賽外',{...options,inCompetition:false},outside);};
  if (f.specificUsage==='賽內賽外禁用' && ['S1','S3','S5'].includes(f.wadaCode)) pair('具名全年禁用條款',{},negative,negative);
  else if (f.wadaCode==='S4' && ['賽內賽外禁用','全時段禁用（賽內與賽外）'].includes(f.specificUsage)) {
    // v2: S4.2 names fulvestrant and clomifene; WADA 2026 printed p10.
    pair('S4 明確全年禁用條款',{},negative,negative);
  }
  else if (f.specificUsage==='賽內禁用' && f.wadaCode==='S7') pair('具名賽內禁用條款',{},negative,positive);
  else if (f.specificUsage==='賽內禁用' && f.wadaCode==='S6' && f.ingredientNames.length===1 && ['MIDODRINE HYDROCHLORIDE','METHYLPHENIDATE HCL'].includes(f.ingredientNames[0])) {
    pair('WADA S6 具名刺激劑賽內條款',{},negative,positive);
  } else if (f.wadaCode==='S6' && f.specificUsage==='可外用。賽內禁止以口服使用' && f.ingredientNames.length===1 && f.ingredientNames[0]==='NAPHAZOLINE NITRATE') {
    pair('WADA S6 眼部局部例外',{route:'ophthalmic'},positive,positive);
    pair('WADA S6 口服情境',{route:'oral'},negative,positive);
  } else if (f.wadaCode==='P1' && f.specificUsage==='特定運動項目賽內賽外禁用，如射箭 (WA)、射擊 (ISSF, IPC)、水中運動 (CMAS)；特定運動賽內禁用，如汽車賽車 (FIA)、撞球 (WCBS)、飛鏢 (WDF)、高爾夫 (IGF)、迷你高爾夫 (WMF)') {
    // WADA 2026 p20 narrows CMAS to these three disciplines. Do not treat
    // TADA's broad summary as a ban on every underwater activity.
    for (const sport of ['射箭','射擊','自由潛水（CMAS）','魚槍捕魚（CMAS）','水下標靶射擊（CMAS）']) pair('P1 '+sport,{sport},negative,negative);
    for (const sport of ['汽車運動','撞球','飛鏢','高爾夫','迷你高爾夫']) pair('P1 '+sport,{sport},negative,positive);
    pair('P1 非列名運動：游泳',{sport:'游泳'},positive,positive);
  }
  else if (f.wadaCode.includes('CMAS') && f.specificUsage.includes('72小時')) {
    add('CMAS自由潛水比賽當時',{sport:'自由潛水（CMAS）',inCompetition:true},negative);
    // The general out-of-competition switch cannot establish whether a use
    // falls outside the longer CMAS 72-hour window. Do not score that as safe.
  } else if (f.wadaCode==='S9' && ['可外用。賽內禁止以口服、經直腸或所有注射途徑使用','賽內禁止以口服、經直腸或所有注射途徑使用'].includes(f.specificUsage)) {
    pair('明確注射使用的條款測試',{route:'injection'},negative,positive);
    if (f.specificUsage.startsWith('可外用。')) {
      const route = row.dosageForm==='鼻用噴液劑'?'topical':row.dosageForm==='點眼懸液劑'?'ophthalmic':row.context.route;
      if (['dermal','ophthalmic','topical'].includes(route)) pair('明確鼻／眼／皮膚外用的條款測試',{route},positive,positive);
    }
  } else if (f.wadaCode==='S5' && f.specificUsage==='賽內賽外禁止以靜脈注射使用') pair('明確靜脈注射的條款測試',{route:'intravenous'},negative,negative);
  else if (f.wadaCode==='S2' && f.specificUsage==='賽內賽外男性禁用') {
    pair('男性限定',{sex:'male'},negative,negative); pair('女性不適用男性條款',{sex:'female'},positive,positive);
  } else {
    held.push({ cohort, license:row.license, reference:f, local:row.predictions, reason:'尿液閾值、複合植物／污染警語或局部麻醉例外需要另外裁定，不能直接用狀態色塊評分。' }); continue;
  }
  for (const c of cases) {
    const result=assessDrugProduct({ingredientNames:row.ingredientNames,conflictingFields:[]},c.context);
    c.predicted=result.verdict;
    c.outcome=[positive,negative].includes(c.predicted)?(c.predicted===c.expected?'agreement':c.predicted===positive?'potential-false-clear':'more-restrictive-than-reference'):'abstained';
    c.conditions=result.ingredients.filter((i)=>!['permitted','prohibited','needs-tue'].includes(i.assessment.verdict)).map((i)=>({name:i.name,verdict:i.assessment.verdict,reasons:i.assessment.reasons}));
  }
  reviewed.push({cohort,license:row.license,nameZh:row.nameZh,ingredientNames:row.ingredientNames,reference:f,cases,
    scope:'逐項讀取完整使用規範後的明確條件情境；反事實途徑僅測規則，並非實際用藥方式或給藥建議。不能併入無條件產品一致率。',
    reviewStatus:cases.some((c)=>c.outcome==='potential-false-clear')?'priority-adjudication-required':cases.some((c)=>c.outcome==='abstained')?'incomplete':'scenario-agreement'});
}
const allCases=reviewed.flatMap((r)=>r.cases),counts={};for(const c of allCases)counts[c.outcome]=(counts[c.outcome]||0)+1;
const report={reviewedAt:new Date().toISOString(),inputSha256:createHash('sha256').update(inputBytes).digest('hex'),frozenRulesChanged:false,clinicalReview:'pending',reviewedProducts:reviewed.length,heldProducts:held.length,scenarios:allCases.length,outcomes:counts,reviewed,held};
await writeFile(values.output, JSON.stringify(report,null,2)+'\n', {flag:'wx'});
console.log(JSON.stringify({reviewedProducts:report.reviewedProducts,heldProducts:report.heldProducts,scenarios:report.scenarios,outcomes:report.outcomes,priority:reviewed.filter(r=>r.reviewStatus==='priority-adjudication-required').map(r=>({license:r.license,name:r.nameZh,reference:r.reference.url}))},null,2));
