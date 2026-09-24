#!/usr/bin/env python3
"""Revalidate stored model answers; count coverage without treating votes as facts."""
import collections,datetime,hashlib,importlib.util,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];REPORT=ROOT/'docs/research/2026-09-23-full-audit';CACHE=ROOT/'.cache/full-audit-20260923'
spec=importlib.util.spec_from_file_location('runner',ROOT/'scripts/run-full-case-audit.py');runner=importlib.util.module_from_spec(spec);spec.loader.exec_module(runner)
def read(p):return json.loads(p.read_text())
def write(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def main():
 manifest=read(REPORT/'packet-manifest.json');cases={i:{'id':i,'batch':b['batch'],'reviews':[]} for b in manifest['batches'] for i in b['caseIds']}
 runs=[];errors=[];latest={}
 for path in sorted((CACHE/'runs').glob('*/*/attempt-*/run.json')):
  meta=read(path);record={k:meta.get(k) for k in ['batch','seat','requestedModel','attempt','startedAt','finishedAt','status','exitCode','valid','elapsedSeconds','answerCharacters','validationError','datasetSha256','promptSha256','packetSha256','providerMetadata']}
  if meta.get('valid'):
   try:
    packet=read(CACHE/'packets'/f"{meta['batch']}.json")
    assert meta['datasetSha256']==manifest['datasetSha256']==packet['datasetSha256'],'Different audited dataset'
    packet_hash=hashlib.sha256((CACHE/'packets'/f"{meta['batch']}.json").read_bytes()).hexdigest()
    assert packet_hash==next(b['sha256'] for b in manifest['batches'] if b['batch']==meta['batch']),'Packet changed'
    if meta.get('packetSha256'):assert meta['packetSha256']==packet_hash,'Packet mismatch'
    rows=runner.validate_rows(runner.parse_json((path.parent/'answer.txt').read_text()),packet)
    latest[(meta['batch'],meta['seat'])]=(meta,rows)
   except (ValueError,AssertionError,KeyError,TypeError,OSError) as e:
    record['valid']=False;record['revalidationError']=str(e);errors.append(record)
  runs.append(record)
 for (batch,seat),(meta,rows) in latest.items():
  for row in rows:cases[row['id']]['reviews'].append({'seat':seat,'requestedModel':meta['requestedModel'],'attempt':meta['attempt'],'status':row['status'],'checks':row['checks'],'findings':row['findings'],'evidence':row['evidence'],'sourcesRead':row['sourcesRead']})
 adjudicated=read(REPORT/'adjudicated-findings.json') if (REPORT/'adjudicated-findings.json').exists() else []
 counts=collections.Counter();flags=collections.Counter();field_flags=collections.Counter();queue=[]
 for case in cases.values():
  reviews=case['reviews'];case['modelCount']=len(reviews);case['coverageComplete']=len(reviews)>=2
  for r in reviews:
   counts[r['seat']]+=1
   for f in r['findings']:field_flags[f['field']]+=1
  statuses={r['status'] for r in reviews}
  case['allModelsSupported']=bool(reviews) and statuses=={'supported'}
  case['modelFlagged']=bool(reviews) and statuses!={'supported'}
  case['fieldDisagreements']=[field for field in ['identity','country','event','substance','sanction','dates','outcomes','education'] if len({r['checks'][field] for r in reviews})>1]
  decisions=[d for d in adjudicated if d['caseId']==case['id']]
  case['editorialDecisions']=decisions
  case['unadjudicatedFindings']=[{'seat':r['seat'],**f} for r in reviews for f in r['findings'] if not any(r['seat'] in d['modelSeats'] and f['field'] in d['fields'] and (not d.get('findingKinds') or f['kind'] in d['findingKinds']) for d in decisions)]
  case['needsSourceAdjudication']=bool(case['unadjudicatedFindings'])
  case['adjudicationStatus']='finding_review_pending' if case['unadjudicatedFindings'] else 'correction_pending' if any(d.get('proposedChange') and not d.get('applied') for d in decisions) else 'model_flags_adjudicated' if decisions else 'no_model_flags' if reviews else 'not_reviewed'
  if case['needsSourceAdjudication']:queue.append(case)
  if any(r['status']=='issue' for r in reviews):flags['withModelIssue']+=1
  if any(r['status']=='uncertain' for r in reviews):flags['withModelUncertainty']+=1
  if case['fieldDisagreements']:flags['withFieldDisagreement']+=1
 summary={'updatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'datasetSha256':manifest['datasetSha256'],'targetCases':500,'casesWithAnyModel':sum(bool(c['reviews']) for c in cases.values()),'casesWithAtLeastTwoModels':sum(c['coverageComplete'] for c in cases.values()),'casesWithAllFourModels':sum(c['modelCount']==4 for c in cases.values()),'bySeat':dict(counts),'flags':dict(flags),'findingCountByField':dict(field_flags),'validBatchResponses':len(latest),'runningBatchCalls':sum(r['status']=='running' for r in runs),'failedBatchCalls':sum(r['status']!='running' and not r['valid'] for r in runs),'revalidationErrors':errors,'all500CoverageComplete':all(c['coverageComplete'] for c in cases.values()),'scope':'Source-bundle review coverage only. Model support/agreement is not factual certification. Findings require source adjudication. Frozen-source audit does not guarantee latest appeals.'}
 write(REPORT/'progress.json',summary);write(REPORT/'case-coverage.json',list(cases.values()));write(REPORT/'adjudication-queue.json',queue);write(REPORT/'run-index.json',runs)
 print(json.dumps(summary,ensure_ascii=False))
if __name__=='__main__':main()
