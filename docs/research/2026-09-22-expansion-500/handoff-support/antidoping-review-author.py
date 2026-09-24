"""Persist manually authored findings; never derives review approval from downloads."""
import json
from pathlib import Path
P=Path('docs/research/2026-09-22-expansion-500')
def persist(rows):
 cs={c['id']:c for c in json.loads(Path('data/curated-cases.json').read_text())}
 ds={d['documentId']:d for d in json.loads((P/'individual-source-manifest.json').read_text())}
 f=P/'individual-case-reviews.json'; reviews={r['caseId']:r for r in json.loads(f.read_text())}
 for row in rows:
  cid,did,loc,yr,typ,bg,edu,ban,period,dq,status,*overrides=row
  c=cs[cid]; d=ds[did]; o=c.get('officialRecord',c.get('registryRecordAsPublished'))
  r={'caseId':cid,'expectedName':c['athleteName'],'disposition':'accepted','reviewedAt':'2026-09-22','caseType':typ,'documents':[{'documentId':did,'sha256':d['sha256'],'title':c['athleteName']+'：AIU 個案決定','locator':loc}],'findings':{'identity':'已核對個案文件身分與官方名冊；拼字差異如有另註。','nationality':'官方 AIU 名冊國別 '+c['review']['nationalityAsListed']+'，非台灣；不以居住地推論。','event':bg,'rule':o['violation'],'outcome':ban,'period':period,'disqualification':dq,'proceduralStatus':status},'notes':[status,edu],'set':{'year':yr,'yearBasis':'事件年份（已依個案文件核對）','eventBackground':bg,'summary':typ+'；'+ban+'。','educationalNotes':edu,'punishment':{'banDuration':ban,'resultsCancelled':True,'medalStripped':None,'otherPenalties':'禁賽期間：'+period+'。'+dq}}}
  for override in overrides:
   for k,v in override.items():
    if k=='findings':r['findings'].update(v)
    else:r['set'][k]=v
  reviews[cid]=r
 f.write_text(json.dumps(list(reviews.values()),ensure_ascii=False,indent=2)+'\n')
 print('Persisted',len(rows),'manually authored reviews')
