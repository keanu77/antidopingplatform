#!/usr/bin/env python3
"""Export adjudicated follow-ups separately from frozen audit conclusions."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / 'docs/research/2026-09-24-source-followup'
CACHE = ROOT / '.cache/source-followups-20260924'

def read(p): return json.loads(p.read_text())
def save(p, value): p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

if __name__ == '__main__':
    coverage = {c['id']: c for c in read(REPORT / 'case-coverage.json')}
    decisions = read(REPORT / 'editorial-decisions.json')
    proposals = {c['id']: c for p in (CACHE / 'packets').glob('*.json') for c in read(p)['cases']}
    meta = {m['url']: m for p in CACHE.glob('*.json') if (m := read(p)).get('status') == 'downloaded_unreviewed'}
    labels = {'codex': 'GPT', 'gemini': 'Gemini', 'grok': 'Grok', 'claude': 'Claude'}
    changes, held, adjudicated = [], [], []
    for id, row in coverage.items():
        assert row['coverageComplete'], f'Insufficient independent country review for {id}'
        proposal = proposals[id]
        decision = decisions.get(id, {'disposition': 'accepted_as_proposed', 'reason': '官方國家／代表隊資料與身分配對已核對，保留來源時期及法律國籍限制。'})
        assert not row['findings'] or id in decisions, f'Unadjudicated findings: {id}'
        adjudicated.append({'id': id, 'athleteName': row['athleteName'], **decision,
                            'modelFindingsConsidered': len(row['findings'])})
        if decision['disposition'] == 'held':
            held.append({'id': id, 'reason': decision['reason']}); continue
        url = decision.get('sourceUrl', proposal['sourceUrl'])
        urls = list(dict.fromkeys([url, proposal['sourceUrl'], *decision.get('additionalSources', [])]))
        refs = []
        for source in urls:
            m = meta[source]
            assert hashlib.sha256((ROOT / m['textPath']).read_bytes()).hexdigest() == m['textSha256']
            refs.append({k: m[k] for k in ['url', 'retrievedAt', 'rawSha256', 'textSha256']})
        if decision.get('rawLocator'): refs[0]['rawLocator'] = decision['rawLocator']
        country = 'United States' if 'worldathletics.org/athletes/' in url else 'United States of America' if 'paralympic.org/' in url else 'Team USA' if 'teamusa.com/' in url else 'USA'
        changes.append({'id': id, 'athleteName': row['athleteName'], 'nationality': '美國',
                        'sourceUrl': url, 'countryAsListed': country,
                        'scope': decision.get('scope', proposal['scope']),
                        'note': decision.get('note', proposal['temporalNote']),
                        'sourceRefs': refs,
                        'modelReview': {'checkedAt': '2026-09-24', 'scope': 'country_and_identity_only',
                                        'modelSeats': [labels[s] for s in row['modelSeats']],
                                        'requestedModels': sorted(set(r['requestedModel'] for r in row['modelReviews'])),
                                        'packetSha256': row['modelReviews'][0]['packetSha256'],
                                        'annotationUpdatedAfterReview': decision['disposition'] != 'accepted_as_proposed'}})
    overlay = {'schemaVersion': 1, 'checkedAt': '2026-09-24', 'countryChanges': changes,
               'heldCountryChecks': held, 'dateChecks': read(REPORT / 'date-checks.json')}
    save(ROOT / 'data/case-source-followups.json', overlay)
    save(REPORT / 'adjudications.json', adjudicated)
    save(REPORT / 'source-manifest.json', list(meta.values()))
    print(json.dumps({'countryApplied': len(changes), 'held': len(held), 'datesStillUnresolved': len(overlay['dateChecks'])}))
