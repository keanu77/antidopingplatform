import gzip
import importlib.util
import json
from pathlib import Path
import sqlite3
import tempfile
import unittest
from zipfile import ZipFile


def load(name):
    spec = importlib.util.spec_from_file_location(name, Path(__file__).parents[1] / f"scripts/import-{name}-catalog.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


food, herbal = load("food"), load("herbal")


def health_row(**changes):
    return {"許可證字號": "衛部健食字第000001號", "中文品名": "示例魚油", "證況": "核可", "保健功效相關成分": "EPA、DHA", "核可日期": "2026/10/01", **changes}


def capsule_row(**changes):
    return {"核備函字號": "000123", "中文品名": "示例膠囊", "英文品名": "Example", "成分": "CREATINE;;VITAMIN C", "有效日期": "1161001", "發證日期": "991001", **changes}


def herbal_row(**changes):
    return {"sheet": "中藥複方", "row": 2, "fields": {"藥品代碼": "A123456", "藥品名稱": "示例麻黃湯", "製造廠名稱": "示例製造廠", "發證日期": "1151001", "不再收載日期": "1151101", "方名": "麻黃湯", **changes}}


class ProductImportTests(unittest.TestCase):
    def test_food_identity_dates_and_historical_records_are_preserved(self):
        result = food.normalize_food(capsule_row(), "imported-capsules")
        self.assertEqual(result["license"], "000123")
        self.assertEqual(result["validUntil"], "2027-10-01")
        self.assertEqual(result["issuedOn"], "2010-10-01")
        self.assertEqual(result["ingredientNames"], ["CREATINE", "VITAMIN C"])
        self.assertEqual(food.normalize_food(health_row(證況="廢止"), "health-foods")["cancellation"], "廢止")

    def test_food_source_cannot_imply_full_composition_or_batch_certification(self):
        product = food.normalize_food(health_row(), "health-foods")
        self.assertEqual(product["compositionScope"], "health-effect-components")
        self.assertEqual(product["ingredientNames"], ["EPA、DHA"])
        self.assertEqual(product["batchVerification"], "not-provided")
        self.assertEqual(product["certifications"], [])
        self.assertEqual(food.normalize_food(capsule_row(成分=""), "imported-capsules")["ingredientNames"], [])

    def test_food_rejects_changed_schema_dates_and_duplicate_identifiers(self):
        with self.assertRaises(ValueError): food.normalize_food({"中文品名": "x"}, "health-foods")
        with self.assertRaises(ValueError): food.food_date("1150231")
        product = food.normalize_food(health_row(), "health-foods")
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaises(ValueError): food.write_snapshot([product, product], {}, Path(directory), Path(directory) / "test.sqlite")

    def test_food_database_roundtrip_retains_original_source(self):
        original = capsule_row()
        product = food.normalize_food(original, "imported-capsules")
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory)
            manifest = food.write_snapshot([product], {"capsules": {"retrievedAt": "2026-10-23T00:00:00+08:00"}}, folder, folder / "test.sqlite")
            self.assertEqual(manifest["counts"]["batchVerified"], 0)
            with sqlite3.connect(folder / "test.sqlite") as db:
                self.assertEqual(json.loads(db.execute("SELECT raw_json FROM source_records").fetchone()[0]), original)
                self.assertEqual(db.execute("PRAGMA integrity_check").fetchone()[0], "ok")
                self.assertEqual(db.execute("PRAGMA foreign_key_check").fetchall(), [])
            self.assertEqual(json.loads(gzip.decompress((folder / "catalog.json.gz").read_bytes()))["products"][0]["rawFields"], original)

    def test_herbal_codes_and_reimbursement_never_become_licenses_or_ingredients(self):
        result = herbal.normalize_herb(herbal_row(), "complex")
        self.assertEqual(result["referenceLabel"], "健保藥品代碼")
        self.assertEqual(result["ingredientNames"], [])
        self.assertEqual(result["compositionScope"], "not-provided")
        self.assertEqual(result["delistedOn"], "2026-11-01")
        self.assertEqual(result["cancellation"], "")
        self.assertEqual(result["validUntil"], "")

    def test_herbal_invalid_dates_and_conflicting_rows_remain_reviewable(self):
        original = herbal_row(發證日期="321")
        result = herbal.normalize_herb(original, "complex")
        self.assertEqual(result["issuedOn"], "")
        self.assertEqual(result["dateWarnings"], [{"field": "發證日期", "value": "321"}])
        self.assertEqual(result["rawFields"]["發證日期"], "321")
        self.assertNotEqual(result["id"], herbal.normalize_herb(herbal_row(藥品名稱="另一商品"), "complex")["id"])

    def test_ods_handles_blank_columns_and_repeated_padding_without_losing_alignment(self):
        xml = '''<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"><table:table table:name="test">'''
        for values in [["藥品代碼", "藥品名稱", "", "製造廠名稱", "發證日期"], ["A000001", "商品", "", "製造廠", "1151001"]]:
            xml += '<table:table-row>' + ''.join(f'<table:table-cell><text:p>{value}</text:p></table:table-cell>' for value in values) + '<table:table-cell table:number-columns-repeated="16379"/></table:table-row>'
        xml += '<table:table-row table:number-rows-repeated="1000000"><table:table-cell table:number-columns-repeated="16384"/></table:table-row></table:table></office:document-content>'
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "test.ods"
            with ZipFile(path, "w") as archive: archive.writestr("content.xml", xml)
            records = herbal.read_ods(path)
            self.assertEqual(len(records), 1)
            self.assertEqual(records[0]["fields"]["製造廠名稱"], "製造廠")
            self.assertEqual(records[0]["fields"]["未命名欄位3"], "")


if __name__ == "__main__": unittest.main()
