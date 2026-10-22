import importlib.util
import json
from pathlib import Path
import sqlite3
import tempfile
import unittest
import zipfile

spec = importlib.util.spec_from_file_location("tfda_import", Path(__file__).parents[1] / "scripts/import-tfda-drugs.py")
tfda = importlib.util.module_from_spec(spec)
spec.loader.exec_module(tfda)


def license_row(**changes):
    return {"許可證字號": "衛署藥製字第036167號", "中文品名": "測試複方", "英文品名": "Test product",
            "主成分略述": "TRAMADOL HCL;;PARACETAMOL", "註銷狀態": "", "有效日期": "2028/01/01",
            "劑型": "錠劑", "異動日期": "2026/10/01", "製造商名稱": "工廠一", **changes}


def ingredient_row(**changes):
    return {"許可證字號": "衛署藥製字第036167號", "成分名稱": "TRAMADOL HCL", "成分代碼": "123",
            "處方標示": "EACH TABLET", "含量": "37.5", "含量單位": "MG", "含量描述": None, **changes}


class TFDAImportTests(unittest.TestCase):
    def test_deduplicates_licenses_preserving_manufacturers_and_ingredients(self):
        p, stats, conflicts = tfda.build_catalog([license_row(), license_row(製造商名稱="工廠二")], [ingredient_row(), ingredient_row()])
        self.assertEqual(len(p), 1)
        self.assertEqual(p[0]["manufacturers"], ["工廠一", "工廠二"])
        self.assertEqual(p[0]["ingredientNames"], ["TRAMADOL HCL", "PARACETAMOL"])
        self.assertEqual(len(p[0]["ingredients"]), 1)
        self.assertEqual(p[0]["ingredients"][0]["amount"], "37.5")
        self.assertEqual(p[0]["validUntil"], "2028-01-01")
        self.assertEqual(stats["duplicateLicenseRows"], 1)
        self.assertEqual(conflicts, [])

    def test_source_conflicts_are_explicit_and_never_drop_constituents(self):
        p, _, conflicts = tfda.build_catalog([license_row(), license_row(主成分略述="UNKNOWN", 異動日期="2026/10/02")], [ingredient_row()])
        self.assertIn("主成分略述", p[0]["conflictingFields"])
        self.assertIn("UNKNOWN", p[0]["ingredientNames"])
        self.assertIn("PARACETAMOL", p[0]["ingredientNames"])
        self.assertEqual(len(conflicts), 1)

    def test_missing_and_orphan_composition_is_counted(self):
        p, stats, _ = tfda.build_catalog([license_row(主成分略述=None)], [ingredient_row(許可證字號="unknown")])
        self.assertEqual(p[0]["ingredientNames"], [])
        self.assertEqual(stats["withoutComposition"], 1)
        self.assertEqual(stats["orphanIngredientRows"], 1)

    def test_identifiers_are_stable_and_cancelled_rows_retained(self):
        p1, _, _ = tfda.build_catalog([license_row()], [])
        p2, stats, _ = tfda.build_catalog([license_row(註銷狀態="已註銷", 中文品名="更名")], [])
        self.assertEqual(p1[0]["id"], p2[0]["id"])
        self.assertEqual(stats["uncancelledProducts"], 0)
        self.assertEqual(p2[0]["cancellation"], "已註銷")

    def test_rejects_schema_drift_and_bad_dates(self):
        with self.assertRaises(ValueError): tfda.build_catalog([{"許可證字號": "x"}], [])
        with self.assertRaises(ValueError): tfda.build_catalog([license_row(有效日期="invalid")], [])

    def test_zip_import_and_portable_sqlite_preserve_original_rows(self):
        licenses, ingredients = [license_row(), license_row(製造商名稱="工廠二")], [ingredient_row()]
        p, _, _ = tfda.build_catalog(licenses, ingredients)
        with tempfile.TemporaryDirectory() as directory:
            zip_path, db_path = Path(directory) / "source.zip", Path(directory) / "export.sqlite"
            with zipfile.ZipFile(zip_path, "w") as archive:
                archive.writestr("data.json", json.dumps(licenses).encode("utf-8-sig"))
            decoded, meta = tfda.read_source(zip_path)
            self.assertEqual(decoded, licenses)
            self.assertEqual(meta["rows"], 2)
            tfda.write_sqlite(db_path, p, licenses, ingredients, {"provider": "TFDA"})
            with sqlite3.connect(f"file:{db_path}?mode=ro", uri=True) as db:
                self.assertEqual(db.execute("select count(*) from products").fetchone()[0], 1)
                self.assertEqual(db.execute("select count(*) from source_licenses").fetchone()[0], 2)
                self.assertEqual(json.loads(db.execute("select data_json from source_licenses where source_row=2").fetchone()[0]), licenses[1])
                self.assertEqual(db.execute("pragma integrity_check").fetchone()[0], "ok")


if __name__ == "__main__": unittest.main()
