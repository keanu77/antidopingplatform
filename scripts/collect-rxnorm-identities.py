#!/usr/bin/env python3
"""Collect typed NLM ingredient relationships. No clinical classification is inferred."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import time
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=ROOT / "artifacts/drugs/evidence-2026/rxnorm-pins-pending.json")
    parser.add_argument("--output", type=Path, default=ROOT / "artifacts/drugs/evidence-2026/rxnorm-parents.json")
    parser.add_argument("--max-requests", type=int, default=300)
    args = parser.parse_args()
    rows = json.loads(args.input.read_text())
    facts = json.loads(args.output.read_text()) if args.output.exists() else []
    seen = {f["precise"]["rxcui"] for f in facts}
    used = 0
    for row in rows:
        if row["tty"] != "PIN" or row["rxcui"] in seen:
            continue
        if used >= args.max_requests:
            break
        url = f"https://rxnav.nlm.nih.gov/REST/rxcui/{row['rxcui']}/related.json?tty=IN"
        used += 1
        try:
            with urllib.request.urlopen(url, timeout=30) as response:
                raw = response.read(1_000_001)
            if len(raw) > 1_000_000:
                raise ValueError("Oversized NLM response")
            groups = json.loads(raw).get("relatedGroup", {}).get("conceptGroup", [])
            parents = [p for g in groups if g["tty"] == "IN" for p in g.get("conceptProperties", []) if p["tty"] == "IN" and p.get("suppress") == "N"]
            facts.append({"precise": row, "parents": parents, "url": url, "sha256": hashlib.sha256(raw).hexdigest(), "retrievedAt": datetime.now(timezone.utc).isoformat()})
            args.output.parent.mkdir(parents=True, exist_ok=True)
            temp = args.output.with_suffix(".tmp")
            temp.write_text(json.dumps(facts, ensure_ascii=False, indent=2) + "\n")
            temp.replace(args.output)
            if used % 25 == 0:
                print(json.dumps({"requests": used, "relationships": len(facts)}), flush=True)
        except urllib.error.HTTPError as error:
            if error.code in (401, 403, 429):
                raise
            print(f"HTTP {error.code}: RxCUI {row['rxcui']}", flush=True)
        time.sleep(1)
    print(json.dumps({"requests": used, "relationships": len(facts), "clinicalRulesChanged": False}))


if __name__ == "__main__":
    main()
