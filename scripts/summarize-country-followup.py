#!/usr/bin/env python3
"""Validate complete per-case answers; never invent a missing model row."""
import importlib.util
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('country_audit', ROOT / 'scripts/run-country-followup-audit.py')
audit = importlib.util.module_from_spec(spec); spec.loader.exec_module(audit)
REPORT, CACHE = audit.REPORT, audit.CACHE

if __name__ == '__main__':
    manifest = json.loads((REPORT / 'packet-manifest.json').read_text())
    packets = {b['batch']: json.loads((ROOT / b['path']).read_text()) for b in manifest['batches']}
    runs = [json.loads(p.read_text()) for p in (CACHE / 'model-runs').glob('*/*/attempt-*/run.json')]
    assert not any(r['status'] == 'running' for r in runs), 'Collect all model responses before summarizing'
    by_id = {c['id']: {'id': c['id'], 'athleteName': c['athleteName'], 'modelReviews': [], 'findings': []}
             for p in packets.values() for c in p['cases']}
    rejected = []
    for r in sorted(runs, key=lambda r: (r['batch'], r['seat'], r['attempt'])):
        folder = CACHE / 'model-runs' / r['batch'] / r['seat'] / f'attempt-{r["attempt"]}'
        answer = folder / 'answer.txt'
        if not answer.exists() or r.get('exitCode') != 0: continue
        raw = answer.read_text(); candidates = {}
        # A truncated/concatenated envelope can still contain complete JSON rows.
        # Preserve those bytes and offsets; no punctuation or conclusions repaired.
        decoder = json.JSONDecoder()
        for match in re.finditer(r'\{\s*"id"\s*:', raw):
            try: row, end = decoder.raw_decode(raw[match.start():])
            except ValueError: continue
            if row.get('id') in by_id:
                candidates.setdefault(row['id'], []).append((row, match.start(), match.start()+end))
        original = {c['id']: c for c in packets[r['batch']]['cases']}
        for id, found in candidates.items():
            unique = {json.dumps(row, sort_keys=True) for row, _, _ in found}
            valid = len(unique) == 1
            error = None if valid else 'Conflicting duplicate rows'
            row, start, end = found[-1]
            if valid:
                try: audit.validate({'cases': [row]}, {'cases': [original[id]]})
                except (AssertionError, KeyError, TypeError) as exc: valid = False; error = str(exc)
            provenance = {'seat': r['seat'], 'requestedModel': r['requestedModel'], 'batch': r['batch'], 'attempt': r['attempt'],
                          'packetSha256': r['packetSha256'], 'answerSha256': audit.cli.digest(answer), 'characterStart': start,
                          'characterEnd': end, 'wholeBatchValid': r['valid']}
            for finding in row.get('findings', []):
                by_id[id]['findings'].append({**provenance, 'countsForCoverage': valid, **finding})
            if valid:
                by_id[id]['modelReviews'].append({**provenance, 'answer': row})
            else: rejected.append({'id': id, **provenance, 'reason': error})
    rows = list(by_id.values())
    for row in rows:
        row['modelSeats'] = sorted(set(r['seat'] for r in row['modelReviews']))
        row['coverageComplete'] = len(row['modelSeats']) >= 2
    (REPORT / 'case-coverage.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2)+'\n')
    (REPORT / 'run-index.json').write_text(json.dumps(runs, ensure_ascii=False, indent=2)+'\n')
    (REPORT / 'rejected-case-rows.json').write_text(json.dumps(rejected, ensure_ascii=False, indent=2)+'\n')
    summary = {'casesAttempted': len(rows), 'atLeastTwoModels': sum(r['coverageComplete'] for r in rows),
               'allFourModels': sum(len(r['modelSeats']) == 4 for r in rows),
               'perModel': {s: sum(s in r['modelSeats'] for r in rows) for s in audit.cli.MODELS},
               'validWholeBatches': sum(r['valid'] for r in runs), 'nonvalidWholeBatches': sum(not r['valid'] for r in runs),
               'validCaseRowsFromIncompleteBatches': sum(not m['wholeBatchValid'] for r in rows for m in r['modelReviews']),
               'flaggedIds': [r['id'] for r in rows if r['findings']],
               'insufficientCoverageIds': [r['id'] for r in rows if not r['coverageComplete']]}
    (REPORT / 'model-summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2)+'\n')
    print(json.dumps(summary, ensure_ascii=False, indent=2))
