"""Persist manually written, evidence-linked announcement reviews. Never approves downloads."""
import json
from pathlib import Path
P=Path('docs/research/2026-09-22-expansion-500')
def read(n):return json.loads((P/n).read_text())
def write(n,v):(P/n).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def persist(rows):
 q={c['id']:c for c in read('usada-source-queue.json')}; docs={d['documentId']:d for d in read('individual-source-manifest.json')}; reg=read('usada-records.json')['records']; reviews={r['caseId']:r for r in read('individual-case-reviews.json')}; f=P/'announcement-reviewed-cases.json'; cases={c['id']:c for c in json.loads(f.read_text())} if f.exists() else {}
 for r in rows:
  cid=r['id']; item=q[cid]; row=reg[item['sourceRow']-1]; name=item['name'];
  evidence=[]
  for did,loc in r['documents']:
   d=docs[did];assert d['status']=='downloaded_unreviewed'
   evidence.append({'documentId':did,'sha256':d['sha256'],'title':Path(d['textPath']).read_text().splitlines()[0],'locator':loc})
  assert r['nationalityFinding'] and r['nationalitySource'] and r['country']
  punishment={'banDuration':r['ban'],'resultsCancelled':r['dq'],'medalStripped':None,'otherPenalties':r['period']+'。'+r['dqText']}
  cases[cid]={'id':cid,'athleteName':name,'year':r['year'],'yearBasis':'事件年份（依官方個案公告核對）','sport':r['sport'],'nationality':r['country'],'substance':r['substance'],'substanceCategory':r['category'],'eventBackground':r['background'],'punishment':punishment,'summary':r['type']+'；'+r['ban']+'。','educationalNotes':r['education'],'sourceLinks':[{'title':'USADA 官方處分名冊','url':'https://www.usada.org/results/sanctions/','type':'官方名冊'}],'review':{'status':'announcement_pending_integration','caseType':r['type'],'checkedAt':'2026-09-23','sourceLocator':f'USADA 名冊第 {item["sourceRow"]} 筆：{row["cells"][0]}','nationalitySource':r['nationalitySource'],'nationalityAsListed':r.get('countryAsListed',r['country']),'personType':r.get('personType','Athlete'),'sourceRow':item['sourceRow']},'officialRecord':{'authority':'USADA','athlete':row['cells'][0],'sport':row['cells'][1],'violation':row['cells'][2],'sanction':row['cells'][3],'announcementDate':row['cells'][4],'linkedDocuments':row['links']}}
  if r.get('yearBasis'):cases[cid]['yearBasis']=r['yearBasis']
  reviews[cid]={'caseId':cid,'expectedName':name,'disposition':'accepted','reviewedAt':'2026-09-23','caseType':r['type'],'documents':evidence,'findings':{'identity':r.get('identityFinding','已核對個案公告姓名、運動項目及目前 USADA 名冊，同一人不拆成多案計數。'),'nationality':r['nationalityFinding'],'event':r['background'],'rule':r['substance'],'outcome':r['ban'],'period':r['period'],'disqualification':r['dqText'],'proceduralStatus':r['status']},'notes':[r['status'],r['education']]+r.get('notes',[]),'set':r.get('set',{})}
 write('announcement-reviewed-cases.json',list(cases.values()));write('individual-case-reviews.json',list(reviews.values()));print('Persisted',len(rows),'manual USADA reviews')
