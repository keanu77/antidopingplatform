from importlib.machinery import SourceFileLoader
from pathlib import Path
m=SourceFileLoader('usada','/private/tmp/antidoping-usada-author.py').load_module()
def persist(rows):
 q={c['name']:c for c in m.read('usada-source-queue.json')};ds={d['documentId']:d for d in m.read('individual-source-manifest.json')}; out=[]
 for name,did,sport,yr,typ,sub,cat,bg,ban,period,dq,edu,date,*extras in rows:
  d=ds[did];text=Path(d['textPath']).read_text();title=text.splitlines()[0];assert title.startswith(('U.S.','US ')), 'Must independently establish national identity'
  r={'id':q[name]['id'],'country':'美國','countryAsListed':title.split(' Athlete')[0],'sport':sport,'year':yr,'type':typ,'substance':sub,'category':cat,'background':bg,'ban':ban,'period':period,'dq':True,'dqText':dq,'education':edu,'status':date+' USADA 個案公告，並核對目前官方處分名冊；未聲稱完整仲裁全文或後續救濟均已審閱。','nationalityFinding':'官方個案公告標題明示 '+title.split(' Athlete')[0]+' Athlete；以官方國家身分描述收錄，不以居住地址或由 USADA 辦案推定。','nationalitySource':d['finalUrl'],'documents':[(did,'個案公告標題及全部個案實質段落；含物質／規則、處分、日期與成績後果，止於通用教育資訊前')]}
  for e in extras:r.update(e)
  out.append(r)
 m.persist(out)
