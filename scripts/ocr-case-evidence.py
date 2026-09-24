#!/usr/bin/env python3
"""OCR downloaded scanned decisions locally. OCR never confers review approval."""
import argparse
import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'docs/research/2026-09-22-expansion-500/individual-source-manifest.json'
TMP = Path('/private/tmp/antidoping-individual-evidence')

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--limit', type=int, default=25)
    args = parser.parse_args()
    binary = TMP / 'local-vision-ocr'
    subprocess.run(['swiftc', '-module-cache-path', str(TMP / 'swift-cache'),
                    str(ROOT / 'scripts/ocr-case-evidence.swift'), '-o', str(binary)], check=True)
    manifest = json.loads(MANIFEST.read_text())
    selected = [d for d in manifest if d.get('format') == 'pdf'
                and d.get('status') == 'downloaded_unreviewed'
                and d.get('textCharacters', 0) < 200 and not d.get('ocrTextPath')][:args.limit]
    for doc in selected:
        raw = Path(doc['rawPath'])
        assert hashlib.sha256(raw.read_bytes()).hexdigest() == doc['sha256']
        target = TMP / (doc['documentId'] + '.ocr.txt')
        result = subprocess.run([str(binary), str(raw), str(target)], capture_output=True, text=True)
        if result.returncode:
            print(doc['documentId'], 'OCR failed', result.returncode, flush=True)
            continue
        content = target.read_bytes()
        doc.update(ocrTextPath=str(target), ocrTextSha256=hashlib.sha256(content).hexdigest(),
                   ocrEngine='Apple Vision accurate; en-US/fr-FR; no language correction',
                   ocrAt=datetime.now(timezone.utc).isoformat(),
                   ocrReviewStatus='not_reviewed')
        # Keep the original extraction, acquisition status and raw-file hash untouched.
        MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n')
        print(doc['documentId'], 'OCR acquired, not reviewed', len(content), flush=True)

if __name__ == '__main__':
    main()
