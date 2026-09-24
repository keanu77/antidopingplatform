#!/usr/bin/env python3
"""Freeze only the new country-source follow-up for independent review."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / 'docs/research/2026-09-24-source-followup'
CACHE = ROOT / '.cache/source-followups-20260924'
digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

if __name__ == '__main__':
    if (REPORT / 'packet-manifest.json').exists():
        raise SystemExit('Refusing to overwrite frozen country packets')
    cases = json.loads((ROOT / 'data/cases.json').read_text())
    selection = json.loads((REPORT / 'selection.json').read_text())
    metas = {d['url']: d for p in CACHE.glob('*.json') if (d := json.loads(p.read_text())).get('status') == 'downloaded_unreviewed'}
    old = {c['id']: c for p in (ROOT / '.cache/full-audit-20260923/packets').glob('batch-*.json') for c in json.loads(p.read_text())['cases']}
    rows = []
    for name, url, identity in selection:
        c = next(c for c in cases if c['athleteName'] == name)
        m = metas[url]
        assert digest(ROOT / m['textPath']) == m['textSha256']
        assert c['review']['countryEvidence']['status'] == 'title_only'
        lines = (ROOT / m['textPath']).read_text().splitlines()
        # Full extracted official page supplied, not a search snippet.
        docs = [{'documentId': 'country', 'url': url, 'textSha256': m['textSha256'],
                 'lines': [{'line': i+1, 'text': t} for i, t in enumerate(lines)]}]
        for d in old[c['id']]['documents']:
            if 'usada.org/sanction' in d['sourceUrl']:
                docs.append({'documentId': 'case', 'url': d['sourceUrl'], 'textSha256': d['textSha256'], 'lines': d['lines']})
                break
        assert len(docs) == 2
        scope = ('official_profile_at_lookup' if '/athletes/' in url or 'paralympic.org/' in url else 'official_team_or_event_record')
        temporal = ('補充來源為本次查閱的官方選手資料所列國家；不據此認證法律國籍、事件當時代表資格或完整代表國變更史。'
                    if scope == 'official_profile_at_lookup' else '依該來源所載代表隊／賽事時期辨識國家；不表示所有年份均代表同一國家，也非法律國籍認證。')
        if name == 'Imani Oliver':
            temporal = '本案依 2016 年 World Athletics 成績表列美國（USA）；較新紀錄列牙買加，不回填本案，也不推定轉籍生效日。'
        rows.append({'id': c['id'], 'athleteName': name, 'caseYear': c['year'], 'sport': c['sport'],
                     'proposedCountry': '美國', 'countryAsListed': 'USA', 'sourceUrl': url,
                     'scope': scope, 'temporalNote': temporal, 'identityRationaleToCheck': identity,
                     'documents': docs})
    (CACHE / 'packets').mkdir(exist_ok=True)
    packets = []
    for i in range(0, len(rows), 11):
        name = f'country-{i//11+1:03d}'
        packet = {'batch': name, 'datasetSha256': digest(ROOT / 'data/cases.json'), 'cases': rows[i:i+11]}
        p = CACHE / 'packets' / f'{name}.json'
        p.write_text(json.dumps(packet, ensure_ascii=False, indent=2) + '\n')
        packets.append({'batch': name, 'path': str(p.relative_to(ROOT)), 'sha256': digest(p), 'caseIds': [c['id'] for c in packet['cases']]})
    (REPORT / 'packet-manifest.json').write_text(json.dumps({'baselineSha256': digest(ROOT / 'data/cases.json'), 'caseCount': len(rows), 'batches': packets}, ensure_ascii=False, indent=2) + '\n')
    print(f'Frozen {len(rows)} country proposals in {len(packets)} independent packets')
