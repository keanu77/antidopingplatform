#!/usr/bin/env python3
"""Retain previously identified title-only country evidence as unresolved.

This is a transparent policy application, not new nationality verification.
It never changes a country's value or resolves a contrary nationality claim.
"""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];REPORT=ROOT/'docs/research/2026-09-23-full-audit'
def read(p):return json.loads(p.read_text())
def main():
 baseline=read(ROOT/'docs/research/2026-09-23-multi-llm-audit/independent-structural-check.json')
 known=set(baseline['usCountrySupportedByArticleTitleIds']);coverage=read(REPORT/'case-coverage.json')
 path=REPORT/'adjudicated-findings.json';decisions=read(path);by_id={c['id']:c for c in read(ROOT/'data/cases.json')}
 decisions=[d for d in decisions if d.get('decision')!='insufficient_country_evidence_retained']
 count=0
 for c in coverage:
  findings=[(r['seat'],f) for r in c['reviews'] for f in r['findings'] if f['field']=='country' and f['kind']=='insufficient_evidence']
  if c['id'] not in known or not findings:continue
  assert by_id[c['id']]['review']['countryEvidence']['status']=='title_only'
  refs=[]
  for seat,f in findings:
   for ref in f['sourceRefs']:
    if ref not in refs:refs.append(ref)
  decisions.append({'caseId':c['id'],'athleteName':by_id[c['id']]['athleteName'],'fields':['country'],'modelSeats':sorted({s for s,f in findings}),'findingKinds':['insufficient_evidence'],'decision':'insufficient_country_evidence_retained','decisionMethod':'policy_application_to_preidentified_source_limit','conclusion':'與先前逐項結構查核所列僅標題U.S.依據一致。公告標題、居住地及USADA管轄不足以獨立核實代表國；維持待補證，既不認定美國國家標籤已證實，也不因此判定案例虛構或證實為台灣選手。','sourceRefs':refs,'unresolvedFields':['country'],'proposedChange':{},'applied':False})
  count+=1
 path.write_text(json.dumps(decisions,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'knownSourceLimitationsRetained':count,'newCountryVerification':0}))
if __name__=='__main__':main()
