#!/usr/bin/env python3
"""Download public NLM identity/classification inputs; never generate clinical rules."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import time
import urllib.request

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "artifacts/drugs/evidence-2026")
    args = parser.parse_args()
    rxclass = args.output / "rxclass"
    rxclass.mkdir(parents=True, exist_ok=True)
    sources = []
    entries = [(rxclass / f"{c}.json", f"https://rxnav.nlm.nih.gov/REST/rxclass/classMembers.json?classId={c}&relaSource=ATC&trans=0&ttys=IN+PIN") for c in "ABCDGHJLMNPRSV"]
    entries.append((args.output / "rxnorm-concepts.json", "https://rxnav.nlm.nih.gov/REST/allconcepts.json?tty=IN+PIN"))
    for path, url in entries:
        with urllib.request.urlopen(url, timeout=45) as response:
            raw = response.read(20_000_001)
        if len(raw) > 20_000_000:
            raise ValueError("Oversized NLM response")
        body = json.loads(raw)
        if path.parent == rxclass:
            count = len(body["drugMemberGroup"]["drugMember"])
        else:
            count = len(body["minConceptGroup"]["minConcept"])
        if not count:
            raise ValueError("Empty identity source")
        meta = {"file": path.name, "url": url, "retrievedAt": datetime.now(timezone.utc).isoformat(), "sha256": hashlib.sha256(raw).hexdigest(), "rows": count}
        temp = path.with_suffix(".tmp")
        temp.write_bytes(raw)
        temp.replace(path)
        if path.parent == rxclass:
            sources.append(meta)
        else:
            path.with_suffix(".meta.json").write_text(json.dumps(meta, indent=2) + "\n")
        time.sleep(1)
    (rxclass / "manifest.json").write_text(json.dumps(sources, indent=2) + "\n")
    print(json.dumps({"sourceFiles": len(entries), "clinicalRulesChanged": False}))


if __name__ == "__main__":
    main()
