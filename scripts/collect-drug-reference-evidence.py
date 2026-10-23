#!/usr/bin/env python3
"""Point-check public product facts; output is a review queue, never live medical rules."""
import argparse
import csv
from datetime import datetime, timezone
import gzip
import hashlib
import html
import json
from pathlib import Path
import re
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://www.check-antidoping.org.tw/"


def plain(value):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", value))).strip()


def norm(value):
    return re.sub(r"\s+", " ", unicodedata.normalize("NFKC", value)).strip().lower()


def title_key(value):
    return re.sub(r"[^\w]", "", norm(value))


def parse_detail(document):
    # Modal examples contain contradictory generic text. Never parse those as product status.
    section = document.split("<!-- 比賽期間Modal -->")[0]
    # A product-title h3 is not followed by a value column. Do not let its
    # match cross another heading and swallow the first actual field label.
    fields = dict((plain(k), plain(v)) for k, v in re.findall(r'<h3\b[^>]*>((?:(?!</?h3\b).)*?)</h3>\s*<div class="col">(.*?)</div>', section, re.S | re.I))
    statuses = [plain(s) for s in re.findall(r'<div class="w-100 text-center text-5 position-relative">(.*?)</div>', section, re.S)]
    warning_match = re.search(r'條件/警告\s*</div>\s*<div class="col">(.*?)</div>', section, re.S)
    warning = plain(warning_match.group(1)) if warning_match else None
    if len(statuses) != 2 or not fields.get("許可證字號") or not fields.get("主成分略述") or warning is None:
        raise ValueError("Unrecognized or incomplete product detail")
    return {
        "license": fields["許可證字號"], "ingredientNames": [n.strip() for n in fields["主成分略述"].split(";;") if n.strip()],
        "dosageForm": fields.get("劑型", ""), "inCompetition": statuses[0], "outOfCompetition": statuses[1],
        "substanceField": fields.get("禁用物質名", ""), "wadaCode": fields.get("禁用物質分類", ""),
        "hasSpecificUsage": bool(fields.get("使用規範")), "specificUsage": fields.get("使用規範", ""),
        "warningSha256": hashlib.sha256(warning.encode()).hexdigest(),
    }


def includes_ingredient(product, ingredient):
    return norm(ingredient) in {norm(n) for n in product.get("ingredientNames", [])}


def search_name(ingredient):
    whole = re.sub(r"\s+", " ", unicodedata.normalize("NFKC", ingredient)).strip()
    prefix = whole.split("(")[0].strip()
    # N(2)-... and similarly positioned chemical locants are part of the
    # name. Removing them would produce an unusable one-letter query.
    return prefix if len(prefix) >= 3 else whole


def write_json(path, value):
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    temporary.replace(path)


def verify_cached_fact(fact, cache):
    """Reparse the original bytes, rather than trusting mutable fact flags."""
    key = hashlib.sha256(fact["url"].encode()).hexdigest()
    raw = (cache / (key + ".html")).read_bytes()
    meta = json.loads((cache / (key + ".json")).read_text())
    if meta["url"] != fact["url"] or hashlib.sha256(raw).hexdigest() != fact["sha256"] or meta["sha256"] != fact["sha256"]:
        raise ValueError("Reference cache checksum mismatch")
    parsed = parse_detail(raw.decode("utf-8"))
    for name, value in parsed.items():
        if name == "specificUsage" and name not in fact:  # older facts kept its presence flag
            continue
        if fact.get(name) != value:
            raise ValueError("Reference fact differs from cached HTML: " + name)
    return {**fact, **parsed}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pending", type=Path, default=ROOT / "docs/research/2026-10-23-drug-system/unmapped-ingredients.csv")
    parser.add_argument("--output", type=Path, default=ROOT / "artifacts/drugs/reference-checks")
    parser.add_argument("--max-queries", type=int, default=30)
    parser.add_argument("--max-requests", type=int, default=90)
    parser.add_argument("--delay", type=float, default=1.25)
    parser.add_argument("--as-of", default=datetime.now(timezone.utc).date().isoformat())
    parser.add_argument("--verify-cache", action="store_true", help="Reparse cached facts and emit verified JSON without network access")
    parser.add_argument("--retry-incomplete", action="store_true", help="Retry old queries only when no stored fact contains the requested ingredient")
    parser.add_argument("--recheck", action="store_true", help="Revisit selected query results, still skipping already collected detail URLs")
    args = parser.parse_args()
    if args.delay < 1 or not 1 <= args.max_requests <= 300:
        parser.error("Use at least one second between requests and at most 300 requests per run")
    args.output.mkdir(parents=True, exist_ok=True)
    cache = args.output / "cache"
    cache.mkdir(exist_ok=True)
    if args.verify_cache:
        facts = json.loads((args.output / "facts.json").read_text())
        print(json.dumps([verify_cached_fact(f, cache) for f in facts], ensure_ascii=False))
        return
    products = json.load(gzip.open(ROOT / "data/drugs/catalog.json.gz"))["products"]
    by_license = {p["license"]: p for p in products}
    by_title = {}
    for p in products:
        if p["cancellation"] or p["validUntil"] < args.as_of:
            continue
        for key in [title_key(p["nameZh"]), title_key(p["nameEn"])]:
            if key:
                by_title.setdefault(key, []).append(p)
    pending = list(csv.DictReader(args.pending.open()))
    weights = {r["ingredient"]: int(r["uncancelled_product_count"]) for r in pending}
    evidence_path = args.output / "facts.json"
    facts = json.loads(evidence_path.read_text()) if evidence_path.exists() else []
    checked_urls = {f["url"] for f in facts}
    attempts_path = args.output / "attempts.json"
    attempts = json.loads(attempts_path.read_text()) if attempts_path.exists() else []
    tried = {a["query"] for a in attempts if not a.get("error")}
    request_count = 0
    last_request = 0

    def fetch(url):
        nonlocal request_count, last_request
        key = hashlib.sha256(url.encode()).hexdigest()
        raw_path, meta_path = cache / (key + ".html"), cache / (key + ".json")
        if raw_path.exists() and meta_path.exists():
            raw, meta = raw_path.read_bytes(), json.loads(meta_path.read_text())
            if hashlib.sha256(raw).hexdigest() != meta["sha256"]:
                raise ValueError("Reference cache checksum mismatch")
            return raw.decode("utf-8"), meta
        if request_count >= args.max_requests:
            raise RuntimeError("Request budget reached")
        time.sleep(max(0, args.delay - (time.monotonic() - last_request)))
        request_count += 1
        last_request = time.monotonic()
        req = urllib.request.Request(url, headers={"User-Agent": "AntidopingPlatform-ReferenceResearch/1.0"})
        with urllib.request.urlopen(req, timeout=25) as response:
            raw = response.read(5_000_001)
            if len(raw) > 5_000_000:
                raise ValueError("Oversized reference response")
        meta = {"url": url, "retrievedAt": datetime.now(timezone.utc).isoformat(), "sha256": hashlib.sha256(raw).hexdigest()}
        raw_path.write_bytes(raw)
        meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n")
        return raw.decode("utf-8"), meta

    queries = 0
    for row in pending:
        if queries >= args.max_queries:
            break
        query = search_name(row["ingredient"])
        incomplete = not any(includes_ingredient(f, row["ingredient"]) for f in facts)
        if (query in tried and not args.recheck and not (args.retry_incomplete and incomplete)) or len(query) < 3 or int(row["uncancelled_product_count"]) == 0:
            continue
        queries += 1
        tried.add(query)
        attempt = {"query": query, "ingredient": row["ingredient"], "factsAdded": 0}
        try:
            url = BASE + "inquiry.php?" + urllib.parse.urlencode({"category": 2, "part": 13, "sport": 102, "keyword": query, "pageSize": 1000})
            doc, _ = fetch(url)
            candidates = []
            for href, title in re.findall(r'<a href="(inquiry_page\.php\?id=\d+&category=2)"[^>]+title="([^"]+)"', doc):
                matches = []
                for part in html.unescape(title).split("┃"):
                    matches.extend(by_title.get(title_key(part), []))
                matches = [p for p in matches if includes_ingredient(p, row["ingredient"])]
                if not matches or BASE + href in checked_urls:
                    continue
                # Prefer a single ingredient reference over a complex combination with
                # route-specific steroids or unrelated components.
                score = max((100000 if len(set(p["ingredientNames"])) == 1 else 0)
                            + sum(weights.get(n, 0) for n in set(p["ingredientNames"])) / max(1, len(set(p["ingredientNames"])))
                            for p in matches)
                candidates.append((score, href))
            for _, href in sorted(set(candidates), reverse=True)[:2]:
                detail, meta = fetch(BASE + href)
                fact = parse_detail(detail)
                own = by_license.get(fact["license"])
                if own is None or not includes_ingredient(fact, row["ingredient"]):
                    continue
                source_set = {norm(n) for n in fact["ingredientNames"]}
                own_set = {norm(n) for n in own["ingredientNames"]}
                fact.update(meta)
                fact["compositionMatchesTfda"] = source_set == own_set
                fact["sourceSummaryMatchesTfda"] = source_set == {norm(n) for n in own["ingredientSummary"].split(";;") if n.strip()}
                fact["reviewStatus"] = "pending"
                facts.append(fact)
                checked_urls.add(fact["url"])
                attempt["factsAdded"] += 1
        except (urllib.error.HTTPError, urllib.error.URLError, RuntimeError, ValueError) as exc:
            attempt["error"] = str(exc)
            if isinstance(exc, urllib.error.HTTPError) and exc.code in (401, 403, 429):
                attempts.append(attempt)
                print("Access/rate limit; stopped without retry", flush=True)
                break
            if isinstance(exc, RuntimeError):
                attempts.append(attempt)
                break
        attempts.append(attempt)
        write_json(evidence_path, facts)
        write_json(attempts_path, attempts)
        print(json.dumps(attempt, ensure_ascii=False), flush=True)
    write_json(evidence_path, facts)
    write_json(attempts_path, attempts)
    print(json.dumps({"requests": request_count, "facts": len(facts), "clinicalRulesChanged": False}), flush=True)


if __name__ == "__main__":
    main()
