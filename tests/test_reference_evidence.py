import importlib.util
import hashlib
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("reference", Path(__file__).resolve().parents[1] / "scripts/collect-drug-reference-evidence.py")
reference = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reference)


def detail(usage=""):
    return f'''<h3>許可證字號</h3><div class="col">測試字第001號</div>
    <h3>主成分略述</h3><div class="col">TEST A;;TEST B</div>
    <h3>劑型</h3><div class="col">眼用製劑</div>
    <h3>使用規範</h3><div class="col">{usage}</div>
    <div class="w-100 text-center text-5 position-relative">不禁止</div>
    <div class="w-100 text-center text-5 position-relative">不禁止</div>
    <div>條件/警告</div><div class="col">測試警告</div>'''


class ReferenceParserTests(unittest.TestCase):
    def test_product_heading_does_not_consume_the_substance_field(self):
        for substance in ["丁香含HIGENAMINE", "不含禁用物質", "BZD"]:
            source = '<h3 class="title">商品名稱</h3><section>狀態區</section>'
            source += f'<h3>禁用物質名</h3><div class="col">{substance}</div>' + detail()
            result = reference.parse_detail(source)
            self.assertEqual(result["substanceField"], substance)
            self.assertEqual(result["license"], "測試字第001號")

    def test_generic_modal_statuses_are_not_product_evidence(self):
        source = detail() + '<!-- 比賽期間Modal --><div class="w-100 text-center text-5 position-relative">禁止</div>'
        result = reference.parse_detail(source)
        self.assertEqual(result["inCompetition"], "不禁止")
        self.assertEqual(result["ingredientNames"], ["TEST A", "TEST B"])

    def test_usage_restriction_survives_green_status(self):
        result = reference.parse_detail(detail("限眼部使用"))
        self.assertTrue(result["hasSpecificUsage"])
        self.assertEqual(result["specificUsage"], "限眼部使用")
        self.assertFalse(reference.parse_detail(detail())["hasSpecificUsage"])

    def test_search_result_must_contain_requested_whole_ingredient(self):
        product = {"ingredientNames": ["ENTACAPONE", "HYDROQUINONE"]}
        self.assertTrue(reference.includes_ingredient(product, " hydroquinone "))
        self.assertFalse(reference.includes_ingredient(product, "LEVODOPA"))
        self.assertFalse(reference.includes_ingredient(product, "QUINONE"))

    def test_cached_flags_are_verified_against_original_html(self):
        raw = detail("限眼部使用").encode()
        url = "https://www.check-antidoping.org.tw/inquiry_page.php?id=1&category=2"
        fact = {**reference.parse_detail(raw.decode()), "url": url, "sha256": hashlib.sha256(raw).hexdigest()}
        with tempfile.TemporaryDirectory() as tmp:
            cache = Path(tmp)
            key = hashlib.sha256(url.encode()).hexdigest()
            (cache / (key + ".html")).write_bytes(raw)
            (cache / (key + ".json")).write_text(json.dumps({"url": url, "sha256": fact["sha256"]}))
            self.assertTrue(reference.verify_cached_fact(fact, cache)["hasSpecificUsage"])
            with self.assertRaisesRegex(ValueError, "differs"):
                reference.verify_cached_fact({**fact, "hasSpecificUsage": False}, cache)
            (cache / (key + ".html")).write_bytes(b"altered")
            with self.assertRaisesRegex(ValueError, "checksum"):
                reference.verify_cached_fact(fact, cache)

    def test_short_chemical_locant_prefix_does_not_discard_full_name(self):
        name = "N(2)-L-ALANYL-L-GLUTAMINE"
        self.assertEqual(reference.search_name(name), name)
        self.assertEqual(reference.search_name("FLUPENTIXOL (2HCL)"), "FLUPENTIXOL")
        self.assertEqual(reference.search_name(" L-ORNITHINE  HCL "), "L-ORNITHINE HCL")
        # Search normalization never makes a partial ingredient match valid.
        self.assertFalse(reference.includes_ingredient({"ingredientNames": [name]}, "N"))

    def test_missing_or_ambiguous_status_fails_closed(self):
        for source in ["", detail().replace("主成分略述", "其他"), detail().replace("條件/警告", "未辨識"), detail() + '<div class="w-100 text-center text-5 position-relative">禁止</div>']:
            with self.assertRaises(ValueError):
                reference.parse_detail(source)


if __name__ == "__main__":
    unittest.main()
