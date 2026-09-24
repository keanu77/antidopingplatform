#!/usr/bin/env python3
"""Prepare local audit overlays only after all 500 cases have two model families.

Does not deploy, commit, or edit frozen model inputs. Run rebuild-dataset.mjs
afterwards to materialize the reviewed changes in data/cases.json.
"""
import argparse,hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];REPORT=ROOT/'docs/research/2026-09-23-full-audit';CACHE=ROOT/'.cache/full-audit-20260923'
def read(p):return json.loads(p.read_text())
def write(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def digest(d):return hashlib.sha256(json.dumps(d,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def main():
 p=argparse.ArgumentParser();p.add_argument('--apply',action='store_true');args=p.parse_args()
 subprocess.run(['python3',str(ROOT/'scripts/summarize-full-case-audit.py')],check=True,stdout=subprocess.DEVNULL)
 progress=read(REPORT/'progress.json');coverage=read(REPORT/'case-coverage.json');decisions=read(REPORT/'adjudicated-findings.json')
 assert progress['all500CoverageComplete'] and progress['casesWithAtLeastTwoModels']==500,'Full coverage not complete'
 assert progress['runningBatchCalls']==0,'Wait for active model calls before changing audited dataset'
 assert not progress['revalidationErrors'],'Stored review validation failed'
 assert len(coverage)==len({c['id'] for c in coverage})==500
 assert not any(c['unadjudicatedFindings'] for c in coverage),'Unadjudicated model findings remain'
 snapshots={c['id']:c['claims'] for packet in (CACHE/'packets').glob('batch-*.json') for c in read(packet)['cases']}
 assert set(snapshots)=={c['id'] for c in coverage}
 title_only=set(read(ROOT/'docs/research/2026-09-23-multi-llm-audit/independent-structural-check.json')['usCountrySupportedByArticleTitleIds'])
 display={'codex':'GPT','gemini':'Gemini','grok':'Grok','claude':'Claude'}
 records=[];changes=[]
 for case in coverage:
  seats=sorted({r['seat'] for r in case['reviews']});assert len(seats)>=2
  unresolved={'country'} if case['id'] in title_only else set()
  for d in case['editorialDecisions']:unresolved.update(d.get('unresolvedFields',[]))
  records.append({'id':case['id'],'modelSeats':[display[s] for s in seats],'requestedModels':sorted({r['requestedModel'] for r in case['reviews']}),'auditedClaimsSha256':digest(snapshots[case['id']]),'unresolvedSourceFields':sorted(unresolved),'reviewState':'source_limitations' if unresolved else 'editorial_adjudicated' if case['editorialDecisions'] else 'no_model_flags'})
 for d in decisions:
  if d.get('proposedChange'):changes.append({'id':d['caseId'],'set':d['proposedChange'],'reason':d['conclusion'],'sourceRefs':d['sourceRefs']})
 assert len(changes)==len({c['id'] for c in changes}),'Combine multiple patches for the same case first'
 common={'checkedAt':progress['updatedAt'][:10],'auditedDatasetSha256':progress['datasetSha256'],'scope':'Frozen official-source bundle comparison; received model answers are not factual certification or a search for all subsequent appeals.'}
 print(json.dumps({'cases':len(records),'correctionCases':len(changes),'casesWithSourceLimitations':sum(bool(c['unresolvedSourceFields']) for c in records),'apply':args.apply}))
 if args.apply:
  write(ROOT/'data/case-model-reviews.json',{**common,'cases':records})
  write(ROOT/'data/case-audit-corrections.json',{**common,'changes':changes})
if __name__=='__main__':main()
