import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { build } from '../frontend/node_modules/esbuild/lib/main.js';
import { publicSubstance, assessEvidence, registry, publicQuiz } from '../shared/content-evidence.mjs';
import { readFileSync } from 'node:fs';
const data=JSON.parse(readFileSync(new URL('../backend/data/substances.json',import.meta.url)));
const bundle=await build({entryPoints:[fileURLToPath(new URL('../functions/api/[[path]].js',import.meta.url))],bundle:true,write:false,platform:'node',format:'esm'});
const {onRequest}=await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
async function api(path,body) {
  const request=new Request(`https://example.test/api/${path}`,body ? {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{});
  const res=await onRequest({request,env:{},params:{path:path.split('/')}});
  assert.equal(res.status,200);
  return {data:await res.json(),headers:res.headers};
}
test('actual Pages responses expose source identity and prevent missing-evidence permission',async t=>{
  t.mock.timers.enable({apis:['Date'],now:new Date('2026-10-23T12:00:00Z')});
  const active=await api('tue/check',{drugName:'guanfacine'});
  assert.equal(active.data.evidence.valid,true);assert.equal(active.data.evidenceId,'drug:guanfacine');
  for(const key of ['glucagon','paracetamol','ibuprofen','aspirin','cetirizine','loratadine']) {
    const pending=await api('tue/check',{drugName:key});
    assert.equal(pending.data.needsTUE,null);assert.equal(pending.data.prohibition,'unverified');
    assert.equal(pending.data.evidence.valid,false);assert.equal(pending.data.routes,null);
    assert.doesNotMatch(pending.data.explanation,/一般允許|無需 TUE/);
  }
});
test('actual Pages endpoint expires all2026 decisions and legacy scores at2027 boundary',async t=>{
  t.mock.timers.enable({apis:['Date'],now:new Date('2027-01-01T12:00:00Z')});
  const all=await api('tue/substances');
  assert.equal(all.headers.get('Cache-Control'),'no-store');
  for(const drug of Object.values(all.data.substances)){assert.equal(drug.needsTUE,null);assert.equal(drug.evidence.valid,false);}
  const check=await api('tue/check',{drugName:'guanfacine'});assert.equal(check.data.prohibition,'unverified');
  const quiz=await api('education/quizzes/1/answer',{answer:1});assert.equal(quiz.data.correct,null);
});
test('legacy inventory remains available but pending questions have no answers or explanations',async t=>{
  t.mock.timers.enable({apis:['Date'],now:new Date('2026-10-23T12:00:00Z')});
  const quizzes=await api('education/quizzes');assert.equal(quizzes.data.length,70);
  assert.equal(quizzes.data.filter(q=>q.evidence.valid).length,1);
  for(const q of quizzes.data.filter(q=>q.id!==1)){assert.equal(q.correctAnswer,null);assert.equal(q.explanation,null);assert.equal(q.learningUrl,'/quiz');}
  const score=await api('education/quizzes/53/answer',{answer:1});assert.equal(score.data.correct,null);assert.equal(score.data.correctAnswer,null);
  const root=await api('education');assert.equal(root.headers.get('Cache-Control'),'no-store');assert.equal(root.data.quizzes.find(q=>q.id===53).correctAnswer,null);
});
test('overdue review or absent reference locator prevents permission without mutating original evidence',()=>{
  const copy=structuredClone(registry);copy.entries['drug:guanfacine'].nextReviewAt='2026-10-22';
  assert.equal(assessEvidence('drug:guanfacine','wada-2026','2026-10-23',copy).valid,false);
  copy.entries['drug:guanfacine'].nextReviewAt='2026-12-31';copy.entries['drug:guanfacine'].references[0].locator='';
  assert.equal(assessEvidence('drug:guanfacine','wada-2026','2026-10-23',copy).valid,false);
  const original=JSON.stringify(data.substances.guanfacine);publicSubstance(data.substances.guanfacine,'2027-01-01');assert.equal(JSON.stringify(data.substances.guanfacine),original);
  assert.equal(publicQuiz({id:999},'2026-10-23').correctAnswer,null);
});

test('missing or malformed registry dates fail closed for otherwise checked evidence', async t => {
  const fields = [
    ['entry', 'verifiedAt'], ['entry', 'nextReviewAt'],
    ['version', 'verifiedAt'], ['version', 'nextReviewAt'],
    ['version', 'effectiveFrom'], ['version', 'effectiveUntil'],
  ];
  for (const [scope, field] of fields) {
    for (const value of [undefined, null, '', 'not-a-date', '2026-02-30', '2026-13-01']) {
      await t.test(`${scope}.${field}=${String(value)}`, () => {
        const copy = structuredClone(registry);
        const record = scope === 'entry' ? copy.entries['drug:guanfacine'] : copy.versions['wada-2026'];
        if (value === undefined) delete record[field];
        else record[field] = value;
        assert.equal(assessEvidence('drug:guanfacine', 'wada-2026', '2026-10-23', copy).valid, false);
      });
    }
  }
});

test('review deadlines cannot precede their recorded verification dates', () => {
  for (const scope of ['entry', 'version']) {
    const copy = structuredClone(registry);
    const record = scope === 'entry' ? copy.entries['drug:guanfacine'] : copy.versions['wada-2026'];
    record.nextReviewAt = '2026-10-22';
    assert.equal(assessEvidence('drug:guanfacine', 'wada-2026', '2026-10-21', copy).valid, false);
  }
});
