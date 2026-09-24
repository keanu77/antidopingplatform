#!/usr/bin/env python3
"""Download the official links already present in the frozen review queue.

Acquisition is NOT review. Never promotes a case or changes published evidence
levels. Raw documents stay in /private/tmp; only hashes and locators are tracked.
"""
import argparse
import concurrent.futures
import datetime
import hashlib
import json
import re
import subprocess
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/research/2026-09-22-expansion-500'
CACHE = Path('/private/tmp/antidoping-individual-evidence')
MANIFEST = OUT / 'individual-source-manifest.json'

class PageText(HTMLParser):
    def __init__(self):
        super().__init__(); self.parts=[]; self.skip=0
    def handle_starttag(self, tag, attrs):
        if tag in ('script','style','noscript'): self.skip+=1
        if tag in ('p','h1','h2','h3','h4','li','br','div','section','article'): self.parts.append('\n')
    def handle_endtag(self, tag):
        if tag in ('script','style','noscript'): self.skip=max(0,self.skip-1)
        if tag in ('p','h1','h2','h3','h4','li','div','section','article'): self.parts.append('\n')
    def handle_data(self, text):
        if not self.skip:self.parts.append(text)

def fetch(job):
    doc_id,url,names=job
    raw=CACHE/(doc_id+'.raw'); txt=CACHE/(doc_id+'.txt')
    result={'documentId':doc_id,'sourceUrl':url,'caseIds':names,'retrievedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reviewStatus':'not_reviewed'}
    cmd=['curl','-fsSL','--connect-timeout','8','--max-time','35','--max-filesize','25000000','-o',str(raw),'-w','%{url_effective}\n%{content_type}',url]
    r=subprocess.run(cmd,capture_output=True,text=True)
    if r.returncode:
        result.update(status='download_failed',exitCode=r.returncode,error=r.stderr.strip()[:500]);return result
    data=raw.read_bytes(); meta=r.stdout.splitlines()
    result.update(finalUrl=meta[0] if meta else url,contentType=meta[1] if len(meta)>1 else None,sha256=hashlib.sha256(data).hexdigest(),bytes=len(data),rawPath=str(raw))
    if data.startswith(b'%PDF'):
        p=subprocess.run(['pdftotext','-layout',str(raw),str(txt)],capture_output=True,text=True)
        if p.returncode:result.update(status='extraction_failed',error=p.stderr[:500]);return result
        result['format']='pdf'
    elif urlparse(url).path.lower().endswith('.pdf') or urlparse(result['finalUrl']).path.lower().endswith('.pdf'):
        result.update(status='unexpected_content',format='non_pdf',error='PDF URL returned a non-PDF response; no decision text acquired.')
        return result
    else:
        html=data.decode('utf-8',errors='replace')
        # Preserve article body; discard navigation when an h1 is available.
        if '<h1' in html:html=html[html.find('<h1'):]
        html=re.split(r'<h4[^>]*>Share</h4>|<footer',html)[0]
        parser=PageText();parser.feed(html)
        txt.write_text('\n'.join(' '.join(s.split()) for s in ''.join(parser.parts).splitlines() if s.strip())+'\n')
        result['format']='html'
    text=txt.read_text()
    result.update(status='downloaded_unreviewed',textPath=str(txt),textSha256=hashlib.sha256(txt.read_bytes()).hexdigest(),textCharacters=len(text),pages=text.count('\f') if result['format']=='pdf' else None)
    return result

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--limit',type=int,default=25);ap.add_argument('--source',choices=['all','ita','aiu','usada'],default='all');ap.add_argument('--retry-failed',action='store_true');ap.add_argument('--case-id',action='append',default=[]);args=ap.parse_args()
    CACHE.mkdir(exist_ok=True)
    prior=json.loads(MANIFEST.read_text()) if MANIFEST.exists() else []
    saved={r['documentId']:r for r in prior}
    queue=json.loads((OUT/'individual-review-queue.json').read_text())
    usada_queue=OUT/'usada-source-queue.json'
    if usada_queue.exists(): queue+=json.loads(usada_queue.read_text())
    supplement=OUT/'supplemental-source-links.json'
    extras=json.loads(supplement.read_text()) if supplement.exists() else {}
    jobs={}
    for item in queue:
        if args.source!='all' and not item['id'].startswith(args.source+'-'):continue
        if args.case_id and item['id'] not in args.case_id:continue
        for url in list(dict.fromkeys([*extras.get(item['id'],[]),*item['sourceUrls']])):
            host=urlparse(url).hostname or ''
            if not (host.endswith('.sport') or host in ['www.athleticsintegrity.org','www.uci.org','ita.sport','bit.ly','www.tas-cas.org','tas-cas.org','jurisprudence.tas-cas.org','www.usada.org','aquaticsintegrity.com','cdn.uww.org','www.fil-luge.org','www.teamusa.com','worldathletics.org','www.milsport.one','egs-eventi.s3.amazonaws.com']):continue
            doc_id=hashlib.sha256(url.encode()).hexdigest()[:16]
            if doc_id in saved and (saved[doc_id]['status']=='downloaded_unreviewed' or not args.retry_failed):continue
            jobs.setdefault(doc_id,[doc_id,url,[]])[2].append(item['id'])
    selected=list(jobs.values())[:args.limit]
    print('Acquiring',len(selected),'official documents; no case approval will be inferred.',flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for r in pool.map(fetch,selected):
            saved[r['documentId']]=r
            MANIFEST.write_text(json.dumps(list(saved.values()),ensure_ascii=False,indent=2)+'\n')
            print(r['documentId'],r['status'],r.get('format',''),r.get('textCharacters',r.get('error','')),flush=True)
    if any(r.get('exitCode')==6 for r in saved.values() if r['documentId'] in {j[0] for j in selected}):
        raise SystemExit('DNS failure: retry the same bounded command with approved network access.')

if __name__=='__main__':main()
