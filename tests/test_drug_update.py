import copy
from datetime import date
import gzip
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("drug_update", ROOT / "scripts/update-drug-catalog.py")
update = importlib.util.module_from_spec(spec)
spec.loader.exec_module(update)


class DrugUpdateTests(unittest.TestCase):
    def setUp(self):
        self.config = update.read_json(ROOT / "config/drug-update.json")
        self.manifest = {"catalogSha256": "abc", "retrievedAt": "2026-10-23T00:00:00+00:00", "counts": {"products": 100, "uncancelledProducts": 100, "conflictingProducts": 0}}
        self.audit = {"catalogSha256": "abc", "ruleCodeSha256": "rule", "target": {"percent": 95, "coveragePercent": 95, "targetMet": True}, "cohorts": {"uncancelled": {"missingComposition": 0, "total": 100}}}
        self.rules = [{"effectiveFrom": "2026-01-01", "effectiveThrough": "2026-12-31", "listVersion": "2026"}]

    def gate(self, manifest=None, audit=None, today=date(2026, 10, 23)):
        return update.quality_gate(self.manifest, manifest or self.manifest, self.audit, audit or self.audit, self.rules, self.config, today)

    def test_schedule_monthly_and_quarterly(self):
        self.assertTrue(update.due_on(date(2026, 11, 1), "monthly"))
        self.assertFalse(update.due_on(date(2026, 11, 1), "quarterly"))
        self.assertTrue(update.due_on(date(2027, 1, 1), "quarterly"))
        self.assertFalse(update.due_on(date(2027, 1, 2), "monthly"))
        with self.assertRaises(ValueError):
            update.due_on(date(2027, 1, 1), "never")

    def test_subthreshold_and_regression_require_review(self):
        after = copy.deepcopy(self.audit)
        after["target"].update(coveragePercent=94.999, targetMet=False)
        self.assertEqual(self.gate(audit=after)["reasons"], ["coverage-regression", "coverage-target-not-met"])
        self.assertTrue(self.gate()["passed"])

    def test_truncation_conflicts_and_missing_composition(self):
        manifest = copy.deepcopy(self.manifest)
        manifest["counts"].update(products=90, conflictingProducts=1)
        after = copy.deepcopy(self.audit)
        after["cohorts"]["uncancelled"]["missingComposition"] = 1
        self.assertEqual(self.gate(manifest, after)["reasons"], ["missing-composition-increase", "new-source-conflicts", "unexpected-products-drop"])

    def test_rule_year_and_stale_sources_fail_closed(self):
        reasons = self.gate(today=date(2027, 1, 1))["reasons"]
        self.assertIn("rules-expired-or-not-yet-effective", reasons)
        self.assertIn("source-date-out-of-range", reasons)
        self.assertTrue(self.gate(today=date(2026, 11, 5))["warnings"])

    def test_unrelated_audit_is_rejected(self):
        after = copy.deepcopy(self.audit)
        after.update(catalogSha256="wrong", ruleCodeSha256="new rules")
        self.assertIn("audit-snapshot-mismatch", self.gate(audit=after)["reasons"])
        self.assertIn("rule-code-changed-during-audit", self.gate(audit=after)["reasons"])

    def test_changes_include_ingredients_and_cancellations(self):
        old = {"a": {"ingredientNames": ["known"], "cancellation": ""}, "gone": {}}
        new = {"a": {"ingredientNames": ["known", "unknown"], "cancellation": "cancelled"}, "new": {}}
        diff = update.snapshot_diff(old, new)
        self.assertEqual(diff["added"], ["new"])
        self.assertEqual(diff["removed"], ["gone"])
        self.assertEqual(diff["changed"][0]["fields"], ["ingredientNames", "cancellation"])

    def test_classification_approval_must_still_match_current_license(self):
        rules = {"groups": [{"classificationEvidence": {"example": {"humanApprovalEvidence": {"license": "a", "ingredient": "Example"}}}}]}
        products = {"a": {"cancellation": "", "validUntil": "2027-01-01", "ingredientNames": ["Example"]}}
        self.assertEqual(update.approval_evidence_issues(rules, products, date(2026, 10, 23)), [])
        products["a"]["ingredientNames"] = ["Changed"]
        self.assertEqual(len(update.approval_evidence_issues(rules, products, date(2026, 10, 23))), 1)

    def write_snapshot(self, path, license_id):
        path.mkdir()
        raw = gzip.compress(json.dumps({"schemaVersion": 1, "products": [{"license": license_id}]}).encode())
        (path / "catalog.json.gz").write_bytes(raw)
        sha = hashlib.sha256(raw).hexdigest()
        update.save_json(path / "manifest.json", {"catalogSha256": sha, "counts": {"products": 1}})
        update.save_json(path / "conflicts.json", [])
        return sha

    def test_failed_promotion_restores_all_previous_files(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            current, candidate = root / "current", root / "candidate"
            old_sha = self.write_snapshot(current, "old")
            new_sha = self.write_snapshot(candidate, "new")
            original = {p.name: p.read_bytes() for p in current.iterdir()}
            calls = 0

            def fail_on_manifest(src, dst):
                nonlocal calls
                calls += 1
                if calls == 2:
                    raise OSError("disk failure")
                update.os.replace(src, dst)

            with self.assertRaisesRegex(OSError, "disk failure"):
                update.promote_snapshot(candidate, current, root / "backup", old_sha, new_sha, replace=fail_on_manifest)
            self.assertEqual({p.name: p.read_bytes() for p in current.iterdir()}, original)
            self.assertFalse((root / ".drug-update.lock").exists())
            self.assertEqual(update.load_snapshot(current)[0]["catalogSha256"], old_sha)

    def test_concurrent_candidate_change_prevents_overwrite(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            current, candidate = root / "current", root / "candidate"
            old_sha = self.write_snapshot(current, "old")
            new_sha = self.write_snapshot(candidate, "new")
            with self.assertRaisesRegex(ValueError, "Current snapshot changed"):
                update.promote_snapshot(candidate, current, root / "backup", "stale-hash", new_sha)
            self.assertEqual(update.load_snapshot(current)[0]["catalogSha256"], old_sha)
            with self.assertRaisesRegex(ValueError, "Candidate changed"):
                update.promote_snapshot(candidate, current, root / "backup", old_sha, "stale-candidate")

    def test_successful_promotion_keeps_recoverable_backup(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            current, candidate = root / "current", root / "candidate"
            old_sha = self.write_snapshot(current, "old")
            new_sha = self.write_snapshot(candidate, "new")
            update.promote_snapshot(candidate, current, root / "backup", old_sha, new_sha)
            self.assertEqual(update.load_snapshot(current)[0]["catalogSha256"], new_sha)
            self.assertEqual(update.load_snapshot(root / "backup")[0]["catalogSha256"], old_sha)


if __name__ == "__main__":
    unittest.main()
