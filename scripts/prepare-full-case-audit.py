#!/usr/bin/env python3
"""Freeze current case claims and authentic source text for independent review."""
import hashlib, importlib.util, json, re, unicodedata
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
CACHE=ROOT/'.cache/full-audit-20260923'
REPORT=ROOT/'docs/research/2026-09-23-full-audit'
spec=importlib.util.spec_from_file_location('fetch',ROOT/'scripts/fetch-case-evidence.py')
fetch=importlib.util.module_from_spec(spec);spec.loader.exec_module(fetch)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text())
def write(p,d):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def plain(html):
 p=fetch.PageText();p.feed(re.sub(r'<!--.*?-->','',html,flags=re.S))
 return '\n'.join(' '.join(x.split()) for x in ''.join(p.parts).splitlines() if x.strip())
def key(s):
 s=re.sub(r'\([^)]*\)|（[^）]*）','',s)
 s=''.join(c for c in unicodedata.normalize('NFKD',s).lower() if not unicodedata.combining(c))
 return set(re.findall(r'[a-z0-9]+',s))
def lines(text):return [{'line':n,'text':s} for n,s in enumerate(text.splitlines(),1)]
def main():
 if (REPORT/'packet-manifest.json').exists():
  raise SystemExit('Frozen packet manifest already exists. Use a new audit directory for a new source snapshot.')
 data=read(ROOT/'data/cases.json');public={c['id']:c for c in data}
 evidence=read(ROOT/'docs/research/2026-09-23-multi-llm-audit/case-evidence-index.json')
 assert len(evidence)==len({c['id'] for c in evidence})==500
 assert {c['id'] for c in evidence}=={c['id'] for c in read(ROOT/'data/curated-cases.json')}
 manifests=read(ROOT/'docs/research/2026-09-22-expansion-500/individual-source-manifest.json')
 by_path={r['textPath']:r for r in manifests if r.get('textPath')}
 first=read(ROOT/'docs/research/2026-09-22-case-corrections-batch-01/source-manifest.json')
 first_by_url={r['source_url']:r for r in first}
 registry_config=[
  ('ita',Path('/private/tmp/antidoping-ita-adrv-20260922.html'),'https://ita.sport/anti-doping-rule-violations/'),
  ('aiu',Path('/private/tmp/antidoping-aiu-first-instance-20260922.html'),'https://www.athleticsintegrity.org/disciplinary-process/first-instance-decisions'),
  ('usada',Path('/private/tmp/antidoping-usada-sanctions-20260922.html'),'https://www.usada.org/news/sanctions/')]
 registries={}
 for label,p,url in registry_config:
  html=p.read_text()
  chunks=re.findall(r'<tr\b[^>]*>.*?</tr>',html,re.S|re.I)
  if label=='ita':chunks=[chunks[i]+chunks[i+1] for i in range(len(chunks)-1) if 'accordion sanction' in chunks[i].split('>')[0]]
  registries[label]=(p,url,sha(p),chunks)
 allcases=[];inventory=[];registry_matches=0
 for item in evidence:
  c=public[item['id']]
  claims={k:v for k,v in c.items() if k not in ['review','registryRecordAsPublished']}
  claims['caseType']=c.get('review',{}).get('caseType')
  claims['outcome']=c.get('review',{}).get('outcome')
  docs=[]
  for d in item['documents']:
   path=Path(d['textPath']) if d.get('textPath') else CACHE/'peter-bol-web-extract.txt'
   record=by_path.get(str(path));used_ocr=bool(record and record.get('ocrTextPath'))
   if used_ocr:path=Path(record['ocrTextPath'])
   text=path.read_text();assert text.strip(),path
   source={'documentId':'doc-'+sha(path)[:16],'sourceUrl':d['sourceUrl'],'textSha256':sha(path),'extractionScope':'complete available extracted text; not a claim that all case proceedings are included','lines':lines(text)}
   if record:
    expected=record.get('ocrTextSha256') if used_ocr else record.get('textSha256')
    if expected:assert sha(path)==expected,path
    raw=Path(record['rawPath']);assert sha(raw)==record['sha256'],raw
    source.update(rawSha256=record['sha256'],retrievedAt=record['retrievedAt'])
    if used_ocr:source['extractionScope']='full available OCR extraction; verify ambiguous glyphs against original PDF; '+record.get('ocrEngine','')
   elif not d.get('textPath'):
    source.update(retrievedAt='2026-09-23',extractionScope='web tool extracted official page body, original page lines 91-131 retained within text; direct HTML download failed; no raw HTML hash claimed')
   elif d['sourceUrl'] in first_by_url:
    record=first_by_url[d['sourceUrl']];raw=Path('/private/tmp')/('antidoping-'+record['batch_id']+'.html')
    assert sha(raw)==record['snapshot_sha256'],raw
    source.update(rawSha256=sha(raw),retrievedAt=record['retrieved_date'])
   docs.append(source)
   inventory.append({'caseId':c['id'],'documentId':source['documentId'],'sourceUrl':d['sourceUrl'],'textPath':str(path),'textSha256':source['textSha256'],'rawSha256':source.get('rawSha256'),'lineCount':len(source['lines'])})
  label=c['id'].split('-')[0]
  if label in registries:
   p,url,rawsha,chunks=registries[label]
   possible=[key(c['athleteName']),key(c.get('review',{}).get('registrySourceLocator','').split('|')[0]),key(c.get('review',{}).get('sourceLocator','').split('|')[0])]
   links=[d['sourceUrl'] for d in item['documents']]
   matches=[]
   for chunk in chunks:
    tds=re.findall(r'<td\b[^>]*>(.*?)</td>',chunk,re.S|re.I)
    name=plain(tds[1 if label=='aiu' else 0]) if len(tds)>1 else ''
    if any(k and k==key(name) for k in possible) or any(link in chunk for link in links):matches.append(chunk)
   if matches:
    text='\n\n'.join(plain(m) for m in matches)
    source={'documentId':'registry-'+hashlib.sha256(text.encode()).hexdigest()[:16],'sourceUrl':url,'rawSha256':rawsha,'textSha256':hashlib.sha256(text.encode()).hexdigest(),'extractionScope':'matching complete table row(s), ITA includes following detail row; original HTML snapshot','retrievedAt':'2026-09-22','lines':lines(text)}
    docs.append(source);registry_matches+=1
    inventory.append({'caseId':c['id'],'documentId':source['documentId'],'sourceUrl':url,'rawPath':str(p),'rawSha256':rawsha,'textSha256':source['textSha256'],'lineCount':len(source['lines'])})
  assert docs
  allcases.append({'id':c['id'],'claims':claims,'documents':docs})
 batches=[];chunk=[];chars=0
 for c in allcases:
  size=len(json.dumps(c,ensure_ascii=False))
  if chunk and (len(chunk)>=8 or chars+size>85000):batches.append(chunk);chunk=[];chars=0
  chunk.append(c);chars+=size
 if chunk:batches.append(chunk)
 index=[]
 for n,cases in enumerate(batches,1):
  batch=f'batch-{n:03d}';path=CACHE/'packets'/f'{batch}.json'
  write(path,{'batch':batch,'datasetSha256':sha(ROOT/'data/cases.json'),'cases':cases})
  index.append({'batch':batch,'caseIds':[c['id'] for c in cases],'sha256':sha(path),'characters':len(path.read_text()),'bytes':path.stat().st_size})
 write(REPORT/'packet-manifest.json',{'datasetSha256':sha(ROOT/'data/cases.json'),'caseCount':len(allcases),'batchCount':len(batches),'registryMatchedCases':registry_matches,'batches':index,'sources':inventory})
 print(json.dumps({'cases':len(allcases),'batches':len(batches),'registryMatchedCases':registry_matches,'sourceEntries':len(inventory),'largestPacketBytes':max(x['bytes'] for x in index)}))
if __name__=='__main__':main()
