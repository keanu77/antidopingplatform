#!/usr/bin/env python3
"""Import the two TFDA open datasets; never fetch or copy TADA's database.

Python standard library only. Original rows are preserved in the SQLite export.
The compressed, normalized catalog is portable and used by the web asset build.
"""
import argparse
from collections import Counter, defaultdict
from datetime import datetime, timezone
import gzip
import hashlib
import io
import json
from pathlib import Path
import re
import shutil
import sqlite3
import tempfile
import unicodedata
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
    "licenses": {"dataset": "https://data.gov.tw/dataset/9122", "download": "https://data.fda.gov.tw/data/opendata/export/36/json"},
    "ingredients": {"dataset": "https://data.gov.tw/dataset/9121", "download": "https://data.fda.gov.tw/data/opendata/export/43/json"},
}


def compact(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def clean(value):
    return "" if value is None else str(value).strip()


def normalize(value):
    return re.sub(r"\s+", " ", unicodedata.normalize("NFKC", clean(value))).strip().lower()


def iso_date(value):
    text = clean(value).replace("/", "-")
    if not text:
        return ""
    try:
        return datetime.strptime(text, "%Y-%m-%d").date().isoformat()
    except ValueError:
        raise ValueError(f"Invalid TFDA date: {text}") from None


def read_source(path):
    raw = Path(path).read_bytes()
    if zipfile.is_zipfile(io.BytesIO(raw)):
        with zipfile.ZipFile(io.BytesIO(raw)) as archive:
            entries = [x for x in archive.infolist() if x.filename.endswith(".json")]
            if len(entries) != 1 or entries[0].file_size > 300_000_000:
                raise ValueError("Expected one JSON member smaller than 300 MB")
            content = archive.read(entries[0])
    else:
        content = raw
    rows = json.loads(content.decode("utf-8-sig"))
    if not isinstance(rows, list) or not rows or not all(isinstance(x, dict) for x in rows):
        raise ValueError("Expected a nonempty list of TFDA records")
    return rows, {"sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw), "rows": len(rows)}


def build_catalog(licenses, ingredients):
    required = {"許可證字號", "中文品名", "英文品名", "主成分略述", "註銷狀態", "有效日期", "劑型"}
    if any(not required.issubset(row) for row in licenses):
        raise ValueError("TFDA license schema changed; refusing partial import")
    if any(not {"許可證字號", "成分名稱", "成分代碼", "含量單位"}.issubset(row) for row in ingredients):
        raise ValueError("TFDA ingredient schema changed; refusing partial import")
    by_license = defaultdict(list)
    for row in licenses:
        license_id = clean(row["許可證字號"])
        if not license_id:
            raise ValueError("Empty license identifier")
        by_license[license_id].append(row)
    detail_by_license = defaultdict(list)
    for row in ingredients:
        detail_by_license[clean(row["許可證字號"])].append(row)
    products, conflicts = [], []
    for license_id, rows in sorted(by_license.items()):
        # Multiple rows usually represent manufacturers/processes for one license.
        # Conflicting non-manufacturer fields are preserved and explicitly flagged.
        rows = sorted(rows, key=lambda row: iso_date(row.get("異動日期")), reverse=True)
        row = rows[0]
        conflict_fields = [key for key in required if len({clean(r.get(key)) for r in rows}) > 1]
        if conflict_fields:
            conflicts.append({"license": license_id, "fields": sorted(conflict_fields)})
        details, seen = [], set()
        for item in detail_by_license[license_id]:
            detail = {
                "name": clean(item["成分名稱"]), "code": clean(item["成分代碼"]),
                "basis": clean(item.get("處方標示")), "amount": clean(item.get("含量")),
                "amountText": clean(item.get("含量描述")), "unit": clean(item["含量單位"]),
            }
            identity = compact(detail)
            if detail["name"] and identity not in seen:
                details.append(detail)
                seen.add(identity)
        summaries = list(dict.fromkeys(clean(r.get("主成分略述")) for r in rows if clean(r.get("主成分略述"))))
        names = list(dict.fromkeys(name.strip() for summary in summaries for name in re.split(r";;|；；", summary) if name.strip()))
        # Preserve both datasets' component names: an absent join never means safe.
        names = list(dict.fromkeys(names + [d["name"] for d in details]))
        product = {
            "id": "tw-" + hashlib.sha256(license_id.encode()).hexdigest()[:20],
            "license": license_id, "nameZh": clean(row["中文品名"]), "nameEn": clean(row["英文品名"]),
            "licenseType": clean(row.get("許可證種類")), "cancellation": clean(row["註銷狀態"]),
            "cancelledOn": iso_date(row.get("註銷日期")), "cancellationReason": clean(row.get("註銷理由")),
            "validUntil": iso_date(row["有效日期"]), "issuedOn": iso_date(row.get("發證日期")),
            "changedOn": iso_date(row.get("異動日期")), "dosageForm": clean(row["劑型"]),
            "drugCategory": clean(row.get("藥品類別")), "controlledSchedule": clean(row.get("管制藥品分類級別")),
            "indication": clean(row.get("適應症")), "applicant": clean(row.get("申請商名稱")),
            "manufacturers": list(dict.fromkeys(clean(r.get("製造商名稱")) for r in rows if clean(r.get("製造商名稱")))),
            "ingredientSummary": ";;".join(summaries), "ingredientNames": names, "ingredients": details,
            "sourceRowCount": len(rows), "conflictingFields": sorted(conflict_fields),
        }
        products.append(product)
    if len({p["id"] for p in products}) != len(products):
        raise ValueError("Product identifier collision")
    stats = {
        "licenseRows": len(licenses), "ingredientRows": len(ingredients), "products": len(products),
        "duplicateLicenseRows": len(licenses) - len(products), "conflictingProducts": len(conflicts),
        "uncancelledProducts": sum(not p["cancellation"] for p in products),
        "withoutComposition": sum(not p["ingredientNames"] for p in products),
        "withoutDetailedIngredients": sum(not p["ingredients"] for p in products),
        "orphanIngredientRows": sum(len(items) for key, items in detail_by_license.items() if key not in by_license),
        "uniqueIngredientNames": len({n for p in products for n in p["ingredientNames"]}),
        "cancellationCounts": dict(Counter(p["cancellation"] or "未註銷" for p in products)),
    }
    return products, stats, conflicts


def write_sqlite(path, products, licenses, ingredients, manifest):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, suffix=".sqlite", delete=False) as temp:
        temp_path = Path(temp.name)
    try:
        with sqlite3.connect(temp_path) as db:
            db.executescript("""
                CREATE TABLE metadata(key TEXT PRIMARY KEY, value TEXT NOT NULL);
                CREATE TABLE products(id TEXT PRIMARY KEY, license TEXT UNIQUE NOT NULL, name_zh TEXT, name_en TEXT,
                    cancellation TEXT, valid_until TEXT, dosage_form TEXT, ingredients_text TEXT, data_json TEXT NOT NULL);
                CREATE TABLE ingredient_details(product_id TEXT REFERENCES products(id), name TEXT, code TEXT,
                    basis TEXT, amount TEXT, amount_text TEXT, unit TEXT);
                CREATE INDEX ingredient_name ON ingredient_details(name);
                CREATE INDEX ingredient_product ON ingredient_details(product_id);
                CREATE TABLE source_licenses(source_row INTEGER PRIMARY KEY, license TEXT NOT NULL, data_json TEXT NOT NULL);
                CREATE TABLE source_ingredients(source_row INTEGER PRIMARY KEY, license TEXT NOT NULL, data_json TEXT NOT NULL);
            """)
            db.execute("INSERT INTO metadata VALUES (?, ?)", ("manifest", compact(manifest)))
            db.executemany("INSERT INTO products VALUES (?,?,?,?,?,?,?,?,?)", [(
                p["id"], p["license"], p["nameZh"], p["nameEn"], p["cancellation"], p["validUntil"],
                p["dosageForm"], ";;".join(p["ingredientNames"]), compact(p),
            ) for p in products])
            db.executemany("INSERT INTO ingredient_details VALUES (?,?,?,?,?,?,?)", [(
                p["id"], d["name"], d["code"], d["basis"], d["amount"], d["amountText"], d["unit"],
            ) for p in products for d in p["ingredients"]])
            for table, rows in [("source_licenses", licenses), ("source_ingredients", ingredients)]:
                db.executemany(f"INSERT INTO {table} VALUES (?,?,?)", [(i + 1, clean(r["許可證字號"]), compact(r)) for i, r in enumerate(rows)])
            if db.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
                raise ValueError("SQLite integrity check failed")
        temp_path.replace(path)
    finally:
        temp_path.unlink(missing_ok=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--download", action="store_true", help="Download the two official TFDA ZIP exports")
    parser.add_argument("--licenses-file", type=Path)
    parser.add_argument("--ingredients-file", type=Path)
    parser.add_argument("--retrieved-at", help="Actual source retrieval time (ISO 8601 with timezone); required for offline source files")
    parser.add_argument("--output", type=Path, default=ROOT / "data/drugs")
    parser.add_argument("--sqlite", type=Path, default=ROOT / "artifacts/drugs/taiwan-drugs.sqlite")
    args = parser.parse_args()
    if not args.download and not args.retrieved_at:
        parser.error("Offline import requires --retrieved-at; do not label an old source snapshot as freshly downloaded")
    if args.retrieved_at:
        retrieved = datetime.fromisoformat(args.retrieved_at.replace("Z", "+00:00"))
        if retrieved.tzinfo is None:
            parser.error("--retrieved-at must include a timezone")
    args.output.mkdir(parents=True, exist_ok=True)
    source_meta, datasets = {}, {}
    for key, info in SOURCES.items():
        path = getattr(args, key + "_file")
        if args.download:
            path = ROOT / ".cache/tfda" / f"{key}.zip"
            path.parent.mkdir(parents=True, exist_ok=True)
            req = urllib.request.Request(info["download"], headers={"User-Agent": "AntidopingPlatform-OpenDataImporter/1.0"})
            with urllib.request.urlopen(req, timeout=60) as response:
                raw = response.read(100_000_001)
                if len(raw) > 100_000_000:
                    raise ValueError("Source download exceeds 100 MB")
                path.write_bytes(raw)
        if path is None:
            parser.error("Use --download or provide both source files")
        datasets[key], meta = read_source(path)
        source_meta[key] = {**info, **meta}
    # Guard against an error page, partial response or unexpectedly truncated export.
    if len(datasets["licenses"]) < 50_000 or len(datasets["ingredients"]) < 80_000:
        raise ValueError("Unexpected source row count; previous catalog was not changed")
    products, stats, conflicts = build_catalog(datasets["licenses"], datasets["ingredients"])
    catalog = gzip.compress(compact({"schemaVersion": 1, "products": products}).encode(), mtime=0)
    manifest = {
        "schemaVersion": 1,
        "retrievedAt": datetime.now(timezone.utc).isoformat() if args.download else retrieved.isoformat(),
        "importedAt": datetime.now(timezone.utc).isoformat(),
        "provider": "衛生福利部食品藥物管理署", "license": "政府資料開放授權條款－第1版",
        "licenseUrl": "https://data.gov.tw/license", "sources": source_meta, "counts": stats,
        "catalogSha256": hashlib.sha256(catalog).hexdigest(),
        "attribution": "衛生福利部食品藥物管理署：全部藥品許可證資料集、藥品詳細處方成分資料集。本衍生資料依政府資料開放授權條款第1版利用，已進行去重、欄位整理與資料關聯；原機關未對本服務背書。",
        "scope": "TFDA 西藥許可證與處方資料；不含 TADA 人工分類、中藥、營養品或檢驗認證。",
    }
    write_sqlite(args.sqlite, products, datasets["licenses"], datasets["ingredients"], manifest)
    sqlite_archive = Path(str(args.sqlite) + ".gz")
    sqlite_temp = Path(str(sqlite_archive) + ".tmp")
    with args.sqlite.open("rb") as source_file, sqlite_temp.open("wb") as destination:
        with gzip.GzipFile(fileobj=destination, mode="wb", filename="", mtime=0) as compressed:
            shutil.copyfileobj(source_file, compressed)
    sqlite_temp.replace(sqlite_archive)
    # Publish only after all parsing/validation/export work succeeds.
    for name, content in [
        ("catalog.json.gz", catalog),
        ("manifest.json", (json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode()),
        ("conflicts.json", (json.dumps(conflicts, ensure_ascii=False, indent=2) + "\n").encode()),
    ]:
        temp_path = args.output / (name + ".tmp")
        temp_path.write_bytes(content)
        temp_path.replace(args.output / name)
    print(json.dumps({**stats, "catalogBytes": len(catalog), "sqlite": str(args.sqlite), "sqliteArchive": str(sqlite_archive)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
