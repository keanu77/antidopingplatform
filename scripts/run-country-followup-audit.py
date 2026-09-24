#!/usr/bin/env python3
"""Run bounded country-only follow-up reviews, separate from the 500-case audit."""
import argparse
import concurrent.futures
import importlib.util
import json
import os
import signal
import subprocess
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('audit_cli', ROOT / 'scripts/run-full-case-audit.py')
cli = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cli)
CACHE = ROOT / '.cache/source-followups-20260924'
REPORT = ROOT / 'docs/research/2026-09-24-source-followup'
cli.CACHE = CACHE
PROMPT = '''Independently evaluate proposed country-source annotations for a historical anti-doping teaching dataset. Use ONLY supplied official documents. Do not browse, call tools, read files, give reasoning traces, or infer citizenship from residence or a USADA title. Do not vote or assume the editor is right. This is a NEW country-only follow-up, not a repeat review of sanctions.
Assess whether each proposal can accurately quote the official sporting country with its explicit temporal scope. An official current profile may support a country-as-listed-at-lookup annotation but NOT historical eligibility or legal citizenship. A Team USA athlete/roster or a dated official international results table can establish sporting affiliation for its stated period. Check identity using name/aliases, sport, ages and locations; flag real ambiguity or mismatches. The identityRationaleToCheck is an editorial hypothesis, not evidence. Do not treat event country, club location, or nationality of a namesake as the athlete's country.
Return ONLY JSON: {"cases":[{"id":"...","status":"supported|issue|uncertain","identity":"supported|issue|uncertain","country":"supported|issue|uncertain","temporalScope":"supported|issue|uncertain","evidence":[{"documentId":"country|case","startLine":1,"endLine":2,"note":"brief explanation"}],"findings":[{"field":"identity|country|temporalScope","explanation":"...","suggestion":"..."}]}]}. Each supplied ID exactly once; cite actual supplied line numbers. Any issue or uncertain must have a finding. Status is issue if any field is issue, else uncertain if any uncertain, else supported. All cases need evidence for country AND case identity. Do not silently upgrade scope beyond the proposed temporalNote.
SOURCE PACKET:
'''

def validate(parsed, packet):
    rows = parsed.get('cases', [])
    ids = [c['id'] for c in packet['cases']]
    assert len(rows) == len(ids) and sorted(r.get('id', '') for r in rows) == sorted(ids), 'Case coverage mismatch'
    source = {c['id']: c for c in packet['cases']}
    for r in rows:
        flags = [r.get(k) for k in ('identity', 'country', 'temporalScope')]
        assert all(x in ('supported', 'issue', 'uncertain') for x in flags), 'Invalid fields'
        expected = 'issue' if 'issue' in flags else 'uncertain' if 'uncertain' in flags else 'supported'
        assert r.get('status') == expected, 'Overall status mismatch'
        assert isinstance(r.get('findings'), list), 'Missing findings'
        for k in ('identity', 'country', 'temporalScope'):
            if r[k] != 'supported': assert any(f.get('field') == k and f.get('explanation') and f.get('suggestion') for f in r['findings']), 'Unexplained flag'
        ds = {d['documentId']: len(d['lines']) for d in source[r['id']]['documents']}
        assert {e.get('documentId') for e in r.get('evidence', [])} == {'case', 'country'}, 'Missing source pairing'
        for e in r['evidence']:
            assert isinstance(e.get('startLine'), int) and isinstance(e.get('endLine'), int), 'Missing lines'
            assert 1 <= e['startLine'] <= e['endLine'] <= ds[e['documentId']] and e.get('note'), 'Invalid citation'
    return rows

def run(seat, batch, attempt):
    folder = CACHE / 'model-runs' / batch['batch'] / seat / f'attempt-{attempt}'
    folder.mkdir(parents=True, exist_ok=True)
    mp = folder / 'run.json'
    if mp.exists(): return json.loads(mp.read_text())
    pp = ROOT / batch['path']
    assert cli.digest(pp) == batch['sha256'], 'Frozen packet changed'
    packet = json.loads(pp.read_text())
    assert cli.digest(ROOT / 'data/cases.json') == packet['datasetSha256'], 'Dataset changed before review'
    prompt = PROMPT + json.dumps(packet, ensure_ascii=False, separators=(',', ':'))
    prompt_path = folder / 'prompt.txt'; prompt_path.write_text(prompt)
    answer_path = folder / 'answer.txt'; raw = folder / 'raw.json'; err = folder / 'stderr.txt'
    model = cli.MODELS[seat]
    command = cli.command(seat, prompt, prompt_path, answer_path, model)
    meta = {'seat': seat, 'requestedModel': model, 'batch': batch['batch'], 'caseIds': batch['caseIds'], 'attempt': attempt,
            'startedAt': cli.stamp(), 'timeoutSeconds': 600, 'packetSha256': batch['sha256'], 'promptSha256': cli.digest(prompt_path), 'status': 'running', 'valid': False}
    mp.write_text(json.dumps(meta, indent=2) + '\n')
    start = time.monotonic()
    with raw.open('w') as out, err.open('w') as errors:
        proc = subprocess.Popen(command, cwd=CACHE / 'isolated', stdin=subprocess.PIPE if seat == 'codex' else subprocess.DEVNULL,
                                stdout=out, stderr=errors, start_new_session=True)
        try:
            if seat == 'codex': proc.stdin.write(prompt.encode()); proc.stdin.close()
            meta['exitCode'] = proc.wait(timeout=600)
            meta['status'] = 'returned'
        except (subprocess.TimeoutExpired, KeyboardInterrupt):
            os.killpg(proc.pid, signal.SIGTERM)
            try: proc.wait(timeout=3)
            except subprocess.TimeoutExpired: os.killpg(proc.pid, signal.SIGKILL); proc.wait()
            meta['status'] = 'timeout_or_interrupted'; meta['exitCode'] = proc.returncode
    answer, usage = cli.read_answer(seat, raw, answer_path)
    meta.update(elapsedSeconds=round(time.monotonic()-start, 2), finishedAt=cli.stamp(), providerMetadata=usage, answerCharacters=len(answer))
    if answer: answer_path.write_text(answer)
    try:
        parsed = cli.parse_json(answer); validate(parsed, packet)
        meta['valid'] = meta['exitCode'] == 0
        if meta['valid']:
            (REPORT / 'reviews').mkdir(exist_ok=True)
            (REPORT / 'reviews' / f'{batch["batch"]}-{seat}-a{attempt}.json').write_text(json.dumps(parsed, ensure_ascii=False, indent=2)+'\n')
    except (ValueError, AssertionError, KeyError, TypeError) as error:
        meta['validationError'] = str(error)[:250]
    mp.write_text(json.dumps(meta, ensure_ascii=False, indent=2)+'\n')
    print(json.dumps({k: meta.get(k) for k in ('seat','batch','attempt','status','valid','elapsedSeconds','validationError')}, ensure_ascii=False), flush=True)
    return meta

if __name__ == '__main__':
    parser = argparse.ArgumentParser(); parser.add_argument('--seats', default='codex,gemini,grok,claude'); parser.add_argument('--attempt', type=int, choices=(1,2), default=1); parser.add_argument('--workers', type=int, default=4)
    args = parser.parse_args(); seats = args.seats.split(','); assert set(seats) <= set(cli.MODELS)
    batches = json.loads((REPORT / 'packet-manifest.json').read_text())['batches']
    (CACHE / 'isolated').mkdir(exist_ok=True)
    jobs = [(s,b) for b in batches for s in seats]
    if args.attempt == 2:
        jobs = [(s,b) for s,b in jobs if (p := CACHE / 'model-runs' / b['batch'] / s / 'attempt-1/run.json').exists()
                and (m := json.loads(p.read_text()))['status'] != 'running' and not m['valid']]
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = [pool.submit(run, s, b, args.attempt) for s,b in jobs]
        for f in concurrent.futures.as_completed(futures): f.result()
