#!/usr/bin/env python3
"""Stage, compare and validate a TFDA refresh. Never publish or deploy a website."""
import argparse
from datetime import date, datetime, timezone
import gzip
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
FILES = ("catalog.json.gz", "manifest.json", "conflicts.json")


def read_json(path):
    return json.loads(Path(path).read_text())


def save_json(path, value):
    Path(path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def load_snapshot(folder):
    folder = Path(folder)
    manifest = read_json(folder / "manifest.json")
    raw = (folder / "catalog.json.gz").read_bytes()
    if hashlib.sha256(raw).hexdigest() != manifest["catalogSha256"]:
        raise ValueError("Catalog checksum mismatch")
    catalog = json.loads(gzip.decompress(raw))
    products = catalog["products"]
    if catalog["schemaVersion"] != 1 or len(products) != manifest["counts"]["products"] or not products:
        raise ValueError("Catalog schema/count mismatch")
    if len({p["license"] for p in products}) != len(products):
        raise ValueError("Duplicate license identifiers")
    return manifest, {p["license"]: p for p in products}


def snapshot_diff(before, after):
    changes = []
    fields = ("ingredientNames", "ingredients", "cancellation", "validUntil", "nameZh", "nameEn", "dosageForm", "conflictingFields")
    for license_id in sorted(before.keys() & after.keys()):
        changed = [f for f in fields if before[license_id].get(f) != after[license_id].get(f)]
        if changed:
            changes.append({"license": license_id, "fields": changed,
                            "before": {f: before[license_id].get(f) for f in changed},
                            "after": {f: after[license_id].get(f) for f in changed}})
    return {"added": sorted(after.keys() - before.keys()), "removed": sorted(before.keys() - after.keys()), "changed": changes}


def due_on(day, cadence):
    if cadence not in ("monthly", "quarterly"):
        raise ValueError("cadence must be monthly or quarterly")
    return day.day == 1 and (cadence == "monthly" or day.month in (1, 4, 7, 10))


def quality_gate(before_manifest, after_manifest, before, after, rules, config, today):
    reasons, warnings = [], []
    for field in ("products", "uncancelledProducts"):
        old, new = before_manifest["counts"][field], after_manifest["counts"][field]
        if not old or new < old * (1 - config["maximumProductDropPercent"] / 100):
            reasons.append(f"unexpected-{field}-drop")
    old, new = before["cohorts"]["uncancelled"], after["cohorts"]["uncancelled"]
    old_missing = old["missingComposition"] / max(1, old["total"]) * 100
    new_missing = new["missingComposition"] / max(1, new["total"]) * 100
    if new_missing - old_missing > config["maximumMissingCompositionIncreasePoints"]:
        reasons.append("missing-composition-increase")
    if after_manifest["counts"]["conflictingProducts"] > before_manifest["counts"]["conflictingProducts"]:
        reasons.append("new-source-conflicts")
    if after["target"]["coveragePercent"] < before["target"]["coveragePercent"] - config["maximumCoverageRegressionPoints"]:
        reasons.append("coverage-regression")
    if after["target"]["percent"] != config["targetCoveragePercent"] or not after["target"]["targetMet"]:
        reasons.append("coverage-target-not-met")
    for manifest, report in ((before_manifest, before), (after_manifest, after)):
        if manifest["catalogSha256"] != report["catalogSha256"]:
            reasons.append("audit-snapshot-mismatch")
    if before["ruleCodeSha256"] != after["ruleCodeSha256"]:
        reasons.append("rule-code-changed-during-audit")
    retrieved = datetime.fromisoformat(after_manifest["retrievedAt"].replace("Z", "+00:00"))
    previous = datetime.fromisoformat(before_manifest["retrievedAt"].replace("Z", "+00:00"))
    if retrieved.tzinfo is None or previous.tzinfo is None:
        raise ValueError("Source retrieval times must include a timezone")
    if retrieved < previous:
        reasons.append("source-older-than-current")
    age = (today - retrieved.astimezone(ZoneInfo(config["timezone"])).date()).days
    if age < -1 or age > config["maximumSourceAgeDays"]:
        reasons.append("source-date-out-of-range")
    for rule in rules:
        start, end = date.fromisoformat(rule["effectiveFrom"]), date.fromisoformat(rule["effectiveThrough"])
        if not start <= today <= end:
            reasons.append("rules-expired-or-not-yet-effective")
        elif (end - today).days <= config["ruleExpiryWarningDays"]:
            warnings.append(f"WADA {rule['listVersion']} rules expire on {end}; annual review required")
    return {"passed": not reasons, "reasons": sorted(set(reasons)), "warnings": sorted(set(warnings))}


def approval_evidence_issues(rules, products, today):
    issues = []
    for group in rules.get("groups", []):
        for name, evidence in group.get("classificationEvidence", {}).items():
            approval = evidence.get("humanApprovalEvidence")
            if not approval:
                continue
            product = products.get(approval["license"])
            if not product or product["cancellation"] or product["validUntil"] < today.isoformat() or approval["ingredient"] not in product["ingredientNames"]:
                issues.append({"ingredient": name, "supportingLicense": approval["license"], "reason": "current-human-approval-evidence-needs-review"})
    return issues


def promote_snapshot(candidate, current, backup, expected_hash, expected_candidate_hash, replace=os.replace):
    """Require the same reviewed inputs; retain a backup and roll back every file on error."""
    current, candidate, backup = Path(current), Path(candidate), Path(backup)
    lock = current.parent / ".drug-update.lock"
    with lock.open("x") as handle:
        handle.write(str(os.getpid()))
    try:
        if load_snapshot(current)[0]["catalogSha256"] != expected_hash:
            raise ValueError("Current snapshot changed after audit")
        if load_snapshot(candidate)[0]["catalogSha256"] != expected_candidate_hash:
            raise ValueError("Candidate changed after audit")
        # Read all inputs before changing anything, including the auxiliary conflict file.
        payloads = {name: (candidate / name).read_bytes() for name in FILES}
        shutil.copytree(current, backup)
        try:
            for name, raw in payloads.items():
                with tempfile.NamedTemporaryFile(dir=current, delete=False) as temp:
                    temp.write(raw)
                    temp.flush()
                    os.fsync(temp.fileno())
                    temp_path = Path(temp.name)
                try:
                    replace(temp_path, current / name)
                finally:
                    temp_path.unlink(missing_ok=True)
            load_snapshot(current)
        except BaseException:
            for name in FILES:
                shutil.copy2(backup / name, current / name)
            raise
    finally:
        lock.unlink(missing_ok=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=Path, default=ROOT / "config/drug-update.json")
    parser.add_argument("--check-due", action="store_true")
    parser.add_argument("--date", help="Calendar day for a schedule check only")
    parser.add_argument("--download", action="store_true")
    parser.add_argument("--licenses-file", type=Path)
    parser.add_argument("--ingredients-file", type=Path)
    parser.add_argument("--retrieved-at")
    parser.add_argument("--current", type=Path, default=ROOT / "data/drugs")
    parser.add_argument("--candidate", type=Path, help="Validate an already imported candidate")
    parser.add_argument("--output", type=Path)
    parser.add_argument("--apply", action="store_true", help="Replace the local snapshot only if every gate passes")
    args = parser.parse_args()
    config = read_json(args.config)
    today = datetime.now(ZoneInfo(config["timezone"])).date()
    if args.check_due:
        print("true" if due_on(date.fromisoformat(args.date) if args.date else today, config["cadence"]) else "false")
        return 0
    if args.date:
        parser.error("--date cannot bypass rule expiry or source freshness checks")
    run = args.output or ROOT / "artifacts/drugs/updates" / datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    run.mkdir(parents=True, exist_ok=False)
    candidate = args.candidate or run / "candidate"
    if candidate.resolve() == args.current.resolve():
        parser.error("Candidate must be separate from the current snapshot")
    report = {"startedAt": datetime.now(timezone.utc).isoformat(), "cadence": config["cadence"], "applied": False, "productionDeployed": False}
    try:
        before_manifest, before_products = load_snapshot(args.current)
        if not args.candidate:
            command = [sys.executable, str(ROOT / "scripts/import-tfda-drugs.py"), "--output", str(candidate), "--sqlite", str(run / "taiwan-drugs.sqlite")]
            if args.download:
                command.append("--download")
            elif args.licenses_file and args.ingredients_file and args.retrieved_at:
                command += ["--licenses-file", str(args.licenses_file), "--ingredients-file", str(args.ingredients_file), "--retrieved-at", args.retrieved_at]
            else:
                raise ValueError("Choose --download, --candidate, or both offline files with --retrieved-at")
            subprocess.run(command, check=True, cwd=ROOT)
        after_manifest, after_products = load_snapshot(candidate)
        save_json(run / "diff.json", snapshot_diff(before_products, after_products))
        for name, folder in (("before", args.current), ("after", candidate)):
            subprocess.run(["node", str(ROOT / "scripts/audit-drug-coverage.mjs"), "--catalog-dir", str(folder), "--output", str(run / name), "--target", str(config["targetCoveragePercent"])], check=True, stdout=subprocess.DEVNULL, cwd=ROOT)
        before, after = read_json(run / "before/coverage.json"), read_json(run / "after/coverage.json")
        rules = [read_json(ROOT / "backend/data" / name) for name in ("drug-ingredient-rules.json", "drug-evidence-rules.json")]
        report.update({"beforeSha256": before_manifest["catalogSha256"], "candidateSha256": after_manifest["catalogSha256"], "sourceRetrievedAt": after_manifest["retrievedAt"], "target": after["target"], "gate": quality_gate(before_manifest, after_manifest, before, after, rules, config, today)})
        report["approvalEvidenceIssues"] = approval_evidence_issues(rules[1], after_products, today)
        if report["approvalEvidenceIssues"]:
            report["gate"]["passed"] = False
            report["gate"]["reasons"].append("human-approval-evidence-needs-review")
        if args.apply and report["gate"]["passed"]:
            promote_snapshot(candidate, args.current, run / "previous-snapshot", report["beforeSha256"], report["candidateSha256"])
            report["applied"] = True
        report["status"] = "ready-for-review" if report["gate"]["passed"] else "needs-review"
    except Exception as error:
        report.update({"status": "failed", "error": str(error)})
    report["finishedAt"] = datetime.now(timezone.utc).isoformat()
    save_json(run / "update-report.json", report)
    print(json.dumps({"report": str(run / "update-report.json"), **report}, ensure_ascii=False, indent=2))
    return 0 if report["status"] == "ready-for-review" else 2 if report["status"] == "needs-review" else 1


if __name__ == "__main__":
    sys.exit(main())
