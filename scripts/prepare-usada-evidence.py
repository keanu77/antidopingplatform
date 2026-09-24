#!/usr/bin/env python3
"""Freeze an acquired USADA index and queue articles; this grants no acceptance."""
import collections
import hashlib
import importlib.util
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/research/2026-09-22-expansion-500'
spec = importlib.util.spec_from_file_location('reviewed', ROOT / 'scripts/build-reviewed-cases.py')
reviewed = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reviewed)

class Register(HTMLParser):
    def __init__(self):
        super().__init__(); self.active=False; self.cell=None; self.rows=[]; self.cells=[]; self.links=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='table' and a.get('id')=='tablepress-1': self.active=True
        if not self.active: return
        if tag=='tr': self.cells=[]; self.links=[]
        if tag=='td': self.cell=[]
        if tag=='a' and a.get('href'): self.links.append(urljoin('https://www.usada.org/',a['href']))
        if tag=='br' and self.cell is not None: self.cell.append(' ')
    def handle_data(self, value):
        if self.active and self.cell is not None: self.cell.append(value)
    def handle_endtag(self, tag):
        if not self.active: return
        if tag=='td' and self.cell is not None:
            self.cells.append(' '.join(''.join(self.cell).split())); self.cell=None
        if tag=='tr' and len(self.cells)==5: self.rows.append({'cells':self.cells,'links':self.links})
        if tag=='table': self.active=False

def main():
    raw=Path('/private/tmp/antidoping-usada-sanctions.html').read_bytes()
    parser=Register(); parser.feed(raw.decode())
    assert len(parser.rows)>300, 'Incomplete sanctions index'
    reviewed.write(OUT/'usada-records.json', {'sourceUrl':'https://www.usada.org/results/sanctions/', 'retrievedAt':'2026-09-22', 'sha256':hashlib.sha256(raw).hexdigest(),'records':parser.rows})
    used={reviewed.key(c['athleteName']) for f in [ROOT/'data/curated-cases.json', OUT/'registry-candidates.json', ROOT/'docs/research/2026-09-22-case-corrections-batch-01/baseline-cases.json'] for c in reviewed.read(f)}
    counts=collections.Counter(reviewed.key(r['cells'][0]) for r in parser.rows)
    queue=[]; excluded=[]
    for index,r in enumerate(parser.rows,1):
        name=r['cells'][0]; nk=reviewed.key(name)
        if not nk or any(v in name.lower() for v in ['removed','redacted','anonymous']): reason='姓名未公開'
        elif nk in used: reason='既有候選或基底已有人名，保守排除重複'
        elif counts[nk]>1: reason='多筆同名，須先整合最新程序'
        elif not r['links']: reason='沒有個案公告連結'
        else: reason=None
        if reason: excluded.append({'row':index,'name':name,'reason':reason}); continue
        cid='usada-'+hashlib.sha256(('USADA|'+nk).encode()).hexdigest()[:12]
        queue.append({'id':cid,'name':reviewed.display_name(name),'sourceRow':index,'sourceUrls':r['links'],'status':'pending_individual_review','nationality':'unknown_until_individual_review'})
    reviewed.write(OUT/'usada-source-queue.json',queue)
    reviewed.write(OUT/'usada-selection-exclusions.json',excluded)
    print(f'{len(parser.rows)} rows; {len(queue)} article candidates; no acceptance or nationality inferred.')

if __name__=='__main__': main()
