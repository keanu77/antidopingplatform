// A structural test pass is not evidence that the 500-case editorial audit is done.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => JSON.parse(readFileSync(root + path, 'utf8'));
const dir = 'docs/research/2026-09-22-expansion-500/';
const cases = read('data/curated-cases.json');
const first = read('docs/research/2026-09-22-case-corrections-batch-01/reviews.json');
const reviews = read(dir + 'individual-case-reviews.json');
const documents = new Map(read(dir + 'individual-source-manifest.json').map(d => [d.documentId, d]));
const findings = ['identity','nationality','event','rule','outcome','period','disqualification','proceduralStatus'];
const errors = [], pending = [], completed = [];
for (const c of cases) {
  if (c.review.status === 'registry_checked') { pending.push(c.id); continue; }
  if (c.review.batchId) {
    if (!first.some(r => r.batchId === c.review.batchId && r.disposition === 'accepted')) errors.push(`${c.id}: missing first-batch acceptance`);
    else completed.push(c.id);
    continue;
  }
  const r = reviews.find(r => r.caseId === c.id && r.disposition === 'accepted');
  if (!r || findings.some(f => !r.findings[f]) || !r.documents.length) { errors.push(`${c.id}: missing individual review`); continue; }
  if (r.documents.some(e => { const d = documents.get(e.documentId); return !d || !e.locator || !e.sha256 || e.sha256 !== d.sha256 || d.status !== 'downloaded_unreviewed'; })) errors.push(`${c.id}: invalid evidence provenance`);
  else completed.push(c.id);
}
for (const r of reviews.filter(r => r.disposition === 'held')) if (cases.some(c => c.id === r.caseId)) errors.push(`${r.caseId}: held case remains selected`);
if (cases.length !== 500) errors.push(`Expected 500 additions, got ${cases.length}`);
const complete = !errors.length && completed.length === 500 && !pending.length;
console.log(JSON.stringify({status:complete?'complete':'in_progress', required:500, individuallyReviewed:completed.length, registryOnlyPending:pending.length, heldIndividualReviews:reviews.filter(r=>r.disposition==='held').length, errors}, null, 2));
if (!complete) process.exitCode = 1;
