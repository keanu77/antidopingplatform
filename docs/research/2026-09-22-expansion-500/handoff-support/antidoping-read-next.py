import json,sys
from pathlib import Path
p=Path('docs/research/2026-09-22-expansion-500');q=json.loads((p/'usada-source-queue.json').read_text());ds=json.loads((p/'individual-source-manifest.json').read_text());rr=json.loads((p/'usada-records.json').read_text())['records'];done={r['caseId'] for r in json.loads((p/'individual-case-reviews.json').read_text()) if r['disposition'] in ['accepted','held','needs_final_source']};n=0
for c in q:
 if c['id'] in done:continue
 docs=[d for d in ds if c['id'] in d['caseIds'] and d['status']=='downloaded_unreviewed' and 'usada.org/' in d['sourceUrl'] and d.get('textPath')]
 if not any(Path(d['textPath']).read_text().startswith('U.S.') for d in docs):continue
 print('\nCASE',c['name'],c['id'],'REGISTRY',rr[c['sourceRow']-1])
 for d in docs:
  print('DOCUMENT',d['documentId']);print(Path(d['textPath']).read_text().split('In an effort to aid athletes')[0])
 n+=1
 if n==int(sys.argv[1] if len(sys.argv)>1 else 10):break
