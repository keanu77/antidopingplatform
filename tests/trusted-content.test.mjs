import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { scenarioQuestions, knowledgeQuestions } from '../frontend/src/data/quiz.js';
const read = (p) => JSON.parse(readFileSync(new URL('../' + p, import.meta.url)));
const registryPath = new URL('../backend/data/content-registry.json', import.meta.url);
test('every substance and both quiz inventories resolve to traceable evidence with honest review states', () => {
  assert.ok(existsSync(registryPath), 'shared source registry must exist');
  const registry = JSON.parse(readFileSync(registryPath));
  const substances = read('backend/data/substances.json').substances;
  const quizzes = read('backend/data/quizzes.json');
  const ids = [...Object.keys(substances).map(k => `drug:${k}`), ...[...scenarioQuestions,...knowledgeQuestions].map(q => `quiz:${q.id}`), ...quizzes.map(q => `legacy-quiz:${q.id}`)];
  assert.equal(ids.length, 136);
  for (const id of ids) {
    const e = registry.entries[id]; assert.ok(e, id);
    for (const key of ['ruleVersion','ownerRole','nextReviewAt','verificationStatus','history']) assert.ok(e[key], `${id} ${key}`);
    assert.ok(e.references.length, id);
    for (const ref of e.references) { assert.ok(registry.sources[ref.sourceId], id); assert.ok(ref.locator, id); }
    if (e.verificationStatus === 'source_checked') assert.match(e.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);
  }
});
test('teaching records retain existing facts, source locators and unknown outcomes', () => {
  assert.ok(existsSync(new URL('../data/case-teaching.json', import.meta.url)));
  const records = read('data/case-teaching.json').records;
  const cases = read('data/cases.json');
  assert.equal(records.length,30);
  assert.equal(new Set(records.map(r=>r.caseId)).size,30);
  for (const r of records) {
    const c=cases.find(c=>c.id===r.caseId); assert.ok(c);
    assert.equal(r.facts,c.eventBackground); assert.deepEqual(r.outcome,c.punishment);
    assert.equal(r.sourceCheckedAt,c.review.checkedAt);
    assert.deepEqual(r.sources,c.sourceLinks);
    assert.ok(r.uncertainty.length);assert.ok(r.roleActions.length>=3);assert.ok(r.discussionQuestions.length>=2);
    assert.match(r.ruleYearNote,/當年|當時/);
  }
});
test('evidence queue preserves unknown outcomes and pending source fields without inventing review', () => {
  assert.ok(existsSync(new URL('../data/case-evidence-queue.json', import.meta.url)));
  const queue=read('data/case-evidence-queue.json').records;
  const cases=read('data/cases.json');assert.equal(queue.length,cases.length);
  for(const q of queue) {
    const c=cases.find(c=>c.id===q.caseId);
    assert.equal(q.reviewStatus,c.review?.status??'unknown');
    assert.equal(q.medalStripped,c.punishment?.medalStripped??null);
    assert.equal(q.resultsCancelled,c.punishment?.resultsCancelled??null);
    assert.deepEqual(q.unresolvedSourceFields,c.review?.sourceComparison?.unresolvedSourceFields??[]);
    assert.ok(q.ownerRole);assert.ok(q.priority);assert.equal(q.newVerificationPerformed,false);
  }
});
