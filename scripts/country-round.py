#!/usr/bin/env python3
"""Round-scoped country-source follow-up: fetch → prepare → run → summarize → apply.

Each round writes only docs/research/<round>/, .cache/<round>/ and
data/country-followups/<round>.json, so earlier rounds (including the original
data/case-source-followups.json overlay) are never overwritten.

selection.json (editor-written, one object per case):
  {"id", "sourceUrl", "scope", "countryAsListed", "temporalNote",
   "identityRationale", "matchTerms": ["name", "alias", ...]}
"""
import argparse
import concurrent.futures
import hashlib
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BATCH_SIZE = 5
CONTEXT_LINES = 4
HEAD_LINES = 6
DEFAULT_SEATS = 'codex,claude'
LABELS = {'codex': 'GPT', 'gemini': 'Gemini', 'grok': 'Grok', 'claude': 'Claude'}
SCOPES = {'official_profile_at_lookup', 'official_team_or_event_record', 'national_federation_event_record'}
EXTRA_DOMAINS = {'usaweightlifting.org', 'iwf.net', 'usacycling.org', 'usatriathlon.org',
                 'teamusa.org', 'usapowerlifting.com', 'worldtriathlon.org', 'olympics.com',
                 'usahockey.com', 'triathlon.org', 'usabs.com', 'usrowing.org', 'usspeedskating.org',
                 'usafieldhockey.com', 'uipmworld.org', 'themat.com', 'worldrowing.com', 'eagles.rugby'}


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, ROOT / path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def read(p): return json.loads(Path(p).read_text())
def save(p, value): Path(p).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
def digest(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()


def paths(round_name):
    assert round_name and '/' not in round_name and round_name != '2026-09-24-source-followup', 'Use a new round name'
    return ROOT / 'docs/research' / round_name, ROOT / '.cache' / round_name


def excerpt(lines, terms):
    """Keep title lines plus context around identity terms, with original line numbers."""
    lowered = [t.lower() for t in terms]
    keep = set(range(min(HEAD_LINES, len(lines))))
    for i, text in enumerate(lines):
        if any(t in text.lower() for t in lowered):
            keep.update(range(max(0, i - CONTEXT_LINES), min(len(lines), i + CONTEXT_LINES + 1)))
    return [{'line': i + 1, 'text': lines[i]} for i in sorted(keep)]


def cmd_fetch(args):
    report, cache = paths(args.round)
    fetcher = load('fetcher', 'scripts/fetch-source-followups.py')
    fetcher.CACHE = cache
    fetcher.ALLOWED = fetcher.ALLOWED | EXTRA_DOMAINS
    cache.mkdir(parents=True, exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for result in pool.map(fetcher.fetch, args.urls):
            print(json.dumps({k: result[k] for k in ('url', 'status', 'error') if k in result}, ensure_ascii=False))


def cmd_prepare(args):
    report, cache = paths(args.round)
    # Frozen packets are never rewritten; only selections not yet frozen form new batches.
    manifest_path = report / 'packet-manifest.json'
    manifest = read(manifest_path) if manifest_path.exists() else {'batches': []}
    frozen = {id for b in manifest['batches'] for id in b['caseIds']}
    cases = {c['id']: c for c in read(ROOT / 'data/cases.json')}
    metas = {m['url']: m for p in cache.glob('*.json') if (m := read(p)).get('status') == 'downloaded_unreviewed'}
    old = {c['id']: c for p in (ROOT / '.cache/full-audit-20260923/packets').glob('batch-*.json') for c in read(p)['cases']}
    rows = []
    for s in read(report / 'selection.json'):
        if s['id'] in frozen:
            continue
        c = cases[s['id']]
        assert c['review']['countryEvidence']['status'] == 'title_only', f'Not pending: {s["id"]}'
        assert s['scope'] in SCOPES, f'Unknown scope: {s["scope"]}'
        m = metas[s['sourceUrl']]
        assert digest(ROOT / m['textPath']) == m['textSha256']
        lines = excerpt((ROOT / m['textPath']).read_text().splitlines(), s['matchTerms'])
        assert len(lines) > HEAD_LINES, f'No identity terms found in country source: {s["id"]}'
        case_doc = next(d for d in old[s['id']]['documents'] if 'usada.org/' in d['sourceUrl'])
        rows.append({'id': s['id'], 'athleteName': c['athleteName'], 'caseYear': c['year'], 'sport': c['sport'],
                     'proposedCountry': c['nationality'], 'countryAsListed': s['countryAsListed'],
                     'sourceUrl': s['sourceUrl'], 'scope': s['scope'], 'temporalNote': s['temporalNote'],
                     'identityRationaleToCheck': s['identityRationale'],
                     'documents': [
                         {'documentId': 'country', 'url': s['sourceUrl'], 'textSha256': m['textSha256'],
                          'extraction': 'excerpt_with_original_line_numbers', 'lines': lines},
                         {'documentId': 'case', 'url': case_doc['sourceUrl'], 'textSha256': case_doc['textSha256'],
                          'lines': case_doc['lines']}]})
    (cache / 'packets').mkdir(parents=True, exist_ok=True)
    if not rows:
        raise SystemExit('No new selections to freeze')
    batches = list(manifest['batches'])
    start = len(batches)
    for i in range(0, len(rows), BATCH_SIZE):
        name = f'country-{start + i // BATCH_SIZE + 1:03d}'
        p = cache / 'packets' / f'{name}.json'
        assert not p.exists(), f'Refusing to overwrite frozen packet {name}'
        save(p, {'batch': name, 'datasetSha256': digest(ROOT / 'data/cases.json'), 'cases': rows[i:i + BATCH_SIZE]})
        batches.append({'batch': name, 'path': str(p.relative_to(ROOT)), 'sha256': digest(p),
                        'caseIds': [r['id'] for r in rows[i:i + BATCH_SIZE]]})
    save(manifest_path, {'baselineSha256': manifest.get('baselineSha256', digest(ROOT / 'data/cases.json')),
                         'caseCount': sum(len(b['caseIds']) for b in batches), 'batches': batches})
    print(f'Frozen {len(rows)} new proposals in {len(batches) - start} packets')


def audit_module(args):
    report, cache = paths(args.round)
    audit = load('country_audit', 'scripts/run-country-followup-audit.py')
    audit.REPORT, audit.CACHE, audit.cli.CACHE = report, cache, cache
    base_validate = audit.validate

    def validate(parsed, packet):
        # Excerpts keep original line numbers, so citations must hit supplied lines.
        widened = {'cases': [{**c, 'documents': [{**d, 'lines': [None] * max(x['line'] for x in d['lines'])}
                                                 for d in c['documents']]} for c in packet['cases']]}
        rows = base_validate(parsed, widened)
        supplied = {c['id']: {d['documentId']: {x['line'] for x in d['lines']} for d in c['documents']}
                    for c in packet['cases']}
        for r in rows:
            for e in r['evidence']:
                have = supplied[r['id']][e['documentId']]
                assert e['startLine'] in have and e['endLine'] in have, 'Citation outside supplied excerpt'
        return rows
    audit.validate = validate
    return audit


def cmd_run(args):
    report, cache = paths(args.round)
    audit = audit_module(args)
    seats = args.seats.split(',')
    assert set(seats) <= set(audit.cli.MODELS)
    batches = read(report / 'packet-manifest.json')['batches']
    if args.batches:
        batches = [b for b in batches if b['batch'] in args.batches.split(',')]
    (cache / 'isolated').mkdir(exist_ok=True)
    jobs = [(s, b) for b in batches for s in seats]
    if args.attempt == 2:
        jobs = [(s, b) for s, b in jobs if (p := cache / 'model-runs' / b['batch'] / s / 'attempt-1/run.json').exists()
                and (m := read(p))['status'] != 'running' and not m['valid']]
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        for f in concurrent.futures.as_completed([pool.submit(audit.run, s, b, args.attempt) for s, b in jobs]):
            f.result()


def cmd_summarize(args):
    report, cache = paths(args.round)
    load('country_summary', 'scripts/summarize-country-followup.py').main(audit_module(args), report, cache)


def cmd_apply(args):
    report, cache = paths(args.round)
    coverage = {c['id']: c for c in read(report / 'case-coverage.json')}
    decisions = read(report / 'editorial-decisions.json') if (report / 'editorial-decisions.json').exists() else {}
    proposals = {c['id']: c for p in (cache / 'packets').glob('*.json') for c in read(p)['cases']}
    meta = {m['url']: m for p in cache.glob('*.json') if (m := read(p)).get('status') == 'downloaded_unreviewed'}
    changes, held, adjudicated = [], [], []
    for id, row in coverage.items():
        decision = decisions.get(id)
        if decision is None:
            assert row['coverageComplete'], f'Insufficient independent review for {id}'
            assert not row['findings'], f'Unadjudicated findings: {id}'
            decision = {'disposition': 'accepted_as_proposed',
                        'reason': '官方國家／代表隊資料與身分配對已核對，保留來源時期及法律國籍限制。'}
        adjudicated.append({'id': id, 'athleteName': row['athleteName'], **decision,
                            'modelFindingsConsidered': len(row['findings'])})
        if decision['disposition'] == 'held':
            held.append({'id': id, 'reason': decision['reason']})
            continue
        assert row['coverageComplete'], f'Insufficient independent review for {id}'
        proposal = proposals[id]
        urls = list(dict.fromkeys([decision.get('sourceUrl', proposal['sourceUrl']), proposal['sourceUrl'],
                                   *decision.get('additionalSources', [])]))
        refs = []
        for url in urls:
            m = meta[url]
            assert digest(ROOT / m['textPath']) == m['textSha256']
            refs.append({k: m[k] for k in ['url', 'retrievedAt', 'rawSha256', 'textSha256']})
        changes.append({'id': id, 'athleteName': row['athleteName'], 'nationality': proposal['proposedCountry'],
                        'sourceUrl': urls[0], 'countryAsListed': decision.get('countryAsListed', proposal['countryAsListed']),
                        'scope': decision.get('scope', proposal['scope']),
                        'note': decision.get('note', proposal['temporalNote']), 'sourceRefs': refs,
                        'modelReview': {'checkedAt': args.checked_at, 'scope': 'country_and_identity_only',
                                        'modelSeats': sorted(LABELS[s] for s in row['modelSeats']),
                                        'requestedModels': sorted({r['requestedModel'] for r in row['modelReviews']}),
                                        'packetSha256': row['modelReviews'][0]['packetSha256'],
                                        'annotationUpdatedAfterReview': decision['disposition'] != 'accepted_as_proposed'}})
    out = ROOT / 'data/country-followups' / f'{args.round}.json'
    out.parent.mkdir(exist_ok=True)
    save(out, {'schemaVersion': 1, 'round': args.round, 'checkedAt': args.checked_at,
               'countryChanges': changes, 'heldCountryChecks': held, 'dateChecks': []})
    save(report / 'adjudications.json', adjudicated)
    save(report / 'source-manifest.json', list(meta.values()))
    print(json.dumps({'countryApplied': len(changes), 'held': len(held), 'overlay': str(out.relative_to(ROOT))}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest='command', required=True)
    for name in ('fetch', 'prepare', 'run', 'summarize', 'apply'):
        p = sub.add_parser(name)
        p.add_argument('--round', required=True)
        if name == 'fetch':
            p.add_argument('urls', nargs='+')
        if name == 'run':
            p.add_argument('--seats', default=DEFAULT_SEATS)
            p.add_argument('--attempt', type=int, choices=(1, 2), default=1)
            p.add_argument('--workers', type=int, default=4)
            p.add_argument('--batches', default='')
        if name == 'apply':
            p.add_argument('--checked-at', required=True)
    args = parser.parse_args()
    globals()[f'cmd_{args.command}'](args)
