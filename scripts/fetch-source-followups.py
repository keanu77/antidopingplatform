#!/usr/bin/env python3
"""Cache official follow-up evidence without altering the frozen model packets.

Downloads are unreviewed until an editor records a case-specific decision.
"""
import concurrent.futures
import hashlib
import json
import subprocess
import sys
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / '.cache/source-followups-20260924'
ALLOWED = {'worldathletics.org', 'athleticsintegrity.org', 'usada.org', 'ita.sport',
           'teamusa.com', 'usatf.org', 'paralympic.org', 'fis-ski.com', 'uci.org',
           'worldaquatics.com', 'usaswimming.org', 'iwf.sport', 'usab.com'}

class TextParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.skip = 0
        self.parts = []
    def handle_starttag(self, tag, attrs):
        if tag in {'script', 'style', 'noscript'}: self.skip += 1
        if not self.skip: self.parts.append('\n')
        # Client-rendered pages (e.g. UCI rider details) keep their data in a JSON attribute.
        props = dict(attrs).get('data-props')
        if props and not self.skip:
            try:
                self.parts.append('\n' + json.dumps(json.loads(props), ensure_ascii=False, indent=1) + '\n')
            except ValueError:
                pass
    def handle_endtag(self, tag):
        if tag in {'script', 'style', 'noscript'} and self.skip: self.skip -= 1
        if not self.skip: self.parts.append('\n')
    def handle_data(self, data):
        if not self.skip: self.parts.append(data)

def fetch(url):
    host = urlparse(url).hostname or ''
    if urlparse(url).scheme != 'https' or not any(host == d or host.endswith('.' + d) for d in ALLOWED):
        raise ValueError(f'Not an allowed official HTTPS source: {url}')
    key = hashlib.sha256(url.encode()).hexdigest()[:20]
    meta_path = CACHE / f'{key}.json'
    if meta_path.exists(): return json.loads(meta_path.read_text())
    raw = CACHE / f'{key}.raw'
    proc = subprocess.run(['curl', '-fsSL', '--max-time', '40', '--max-filesize', '25000000',
                           url, '-o', str(raw)], capture_output=True, text=True, timeout=45)
    meta = {'url': url, 'retrievedAt': datetime.now(timezone.utc).isoformat(), 'status': 'fetch_failed'}
    if proc.returncode:
        meta['error'] = proc.stderr[:200]
        return meta
    content = raw.read_bytes()
    txt = CACHE / f'{key}.txt'
    if content.startswith(b'%PDF'):
        subprocess.run(['pdftotext', '-layout', str(raw), str(txt)], check=True, timeout=30)
    else:
        parser = TextParser()
        parser.feed(content.decode('utf-8', errors='replace'))
        txt.write_text('\n'.join(s.strip() for s in ''.join(parser.parts).splitlines() if s.strip()) + '\n')
    meta.update(status='downloaded_unreviewed', rawPath=str(raw.relative_to(ROOT)),
                textPath=str(txt.relative_to(ROOT)), rawSha256=hashlib.sha256(content).hexdigest(),
                textSha256=hashlib.sha256(txt.read_bytes()).hexdigest())
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + '\n')
    return meta

if __name__ == '__main__':
    CACHE.mkdir(parents=True, exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for result in pool.map(fetch, sys.argv[1:]):
            print(json.dumps({k: result[k] for k in ('url', 'status', 'error') if k in result}, ensure_ascii=False))
