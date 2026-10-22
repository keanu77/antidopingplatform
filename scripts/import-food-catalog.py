#!/usr/bin/env python3
"""Import official TFDA food records, preserving source rows and scope limits."""
import argparse
from datetime import datetime, timezone
import gzip
import hashlib
import json
from pathlib import Path
import re
import shutil
import sqlite3
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
    "health-foods": {"name": "TFDA 健康食品資料集", "dataset": "https://data.gov.tw/dataset/6951", "download": "https://data.fda.gov.tw/data/opendata/export/19/json", "minimumRows": 300},
    "imported-capsules": {"name": "TFDA 輸入錠狀膠囊狀食品查驗登記資料集", "dataset": "https://data.gov.tw/dataset/9047", "download": "https://data.fda.gov.tw/data/opendata/export/23/json", "minimumRows": 3000},
}


def clean(value):
    return "" if value is None else str(value).strip()


def encoded(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode()


def food_date(value):
    value = clean(value)
    if not value:
        return ""
    if re.fullmatch(r"\d{6,7}", value):
        value = f"{int(value[:-4]) + 1911:04d}-{value[-4:-2]}-{value[-2:]}"
    return datetime.strptime(value.replace("/", "-"), "%Y-%m-%d").date().isoformat()


def normalize_food(row, source):
    health = source == "health-foods"
    required = {"許可證字號", "中文品名", "證況", "保健功效相關成分", "核可日期"} if health else {"核備函字號", "中文品名", "英文品名", "成分", "有效日期", "發證日期"}
    if not required.issubset(row):
        raise ValueError(f"Changed schema in {source}")
    reference = clean(row["許可證字號" if health else "核備函字號"])
    if not reference or not clean(row["中文品名"]):
        raise ValueError("Food record requires an identifier and product name")
    composition = clean(row["保健功效相關成分" if health else "成分"])
    # Only the official ';;' delimiter is structural. Commas can occur inside names.
    names = list(dict.fromkeys(x.strip() for x in re.split(r";;|；；", composition) if x.strip()))
    registration = clean(row.get("證況")) if health else "來源未提供核備狀態"
    return {
        "id": "tw-" + hashlib.sha256(f"{source}:{reference}".encode()).hexdigest()[:20],
        "category": "supplements", "sourceKey": source,
        "license": reference, "referenceLabel": "健康食品許可證" if health else "核備函字號",
        "nameZh": clean(row["中文品名"]), "nameEn": clean(row.get("英文品名")),
        "dosageForm": "健康食品" if health else "輸入錠狀／膠囊狀食品",
        "registrationStatus": registration,
        "cancellation": registration if health and registration != "核可" else "",
        "validUntil": food_date(row.get("有效日期")),
        "issuedOn": food_date(row.get("核可日期" if health else "發證日期")),
        "applicant": clean(row.get("申請商" if health else "申請商名稱")),
        "ingredientSummary": composition, "ingredientNames": names,
        "compositionScope": "health-effect-components" if health else "source-declared",
        "batchVerification": "not-provided", "certifications": [],
        "rawFields": row,
    }


def write_snapshot(records, sources, destination, sqlite_path):
    if len({p["id"] for p in records}) != len(records):
        raise ValueError("Duplicate source identifier; refuse to merge conflicting food records")
    records.sort(key=lambda p: (p["sourceKey"], p["license"]))
    snapshot = gzip.compress(encoded({"schemaVersion": 1, "products": records}), mtime=0)
    manifest = {
        "schemaVersion": 1, "category": "supplements", "sources": sources,
        "retrievedAt": max(s["retrievedAt"] for s in sources.values()),
        "importedAt": datetime.now(timezone.utc).isoformat(),
        "licenseUrl": "https://data.gov.tw/license",
        "attribution": "衛生福利部食品藥物管理署：健康食品資料集、輸入錠狀膠囊狀食品查驗登記資料集。依政府資料開放授權條款第 1 版整理；來源機關未對本服務背書。",
        "scope": "台灣官方食品登錄資料，非所有市售或國際運動營養品；食品登錄不等於運動禁藥檢驗或認證。",
        "counts": {"products": len(records), "healthFoods": sum(p["sourceKey"] == "health-foods" for p in records),
                   "importedCapsules": sum(p["sourceKey"] == "imported-capsules" for p in records),
                   "withoutComposition": sum(not p["ingredientNames"] for p in records), "batchVerified": 0},
        "catalogSha256": hashlib.sha256(snapshot).hexdigest(),
    }
    destination.mkdir(parents=True, exist_ok=True)
    sqlite_path.parent.mkdir(parents=True, exist_ok=True)
    temporary = sqlite_path.with_suffix(".tmp.sqlite")
    if temporary.exists():
        temporary.unlink()
    with sqlite3.connect(temporary) as db:
        db.executescript("CREATE TABLE products(id TEXT PRIMARY KEY, source_key TEXT NOT NULL, reference TEXT NOT NULL, name_zh TEXT NOT NULL, name_en TEXT, valid_until TEXT, product_json TEXT NOT NULL); CREATE TABLE source_records(product_id TEXT PRIMARY KEY REFERENCES products(id), source_key TEXT NOT NULL, raw_json TEXT NOT NULL); CREATE TABLE metadata(key TEXT PRIMARY KEY,value TEXT NOT NULL); CREATE INDEX product_reference ON products(reference);")
        for p in records:
            db.execute("INSERT INTO products VALUES(?,?,?,?,?,?,?)", (p["id"], p["sourceKey"], p["license"], p["nameZh"], p["nameEn"], p["validUntil"], encoded(p).decode()))
            db.execute("INSERT INTO source_records VALUES(?,?,?)", (p["id"], p["sourceKey"], encoded(p["rawFields"]).decode()))
        db.execute("INSERT INTO metadata VALUES('manifest',?)", (encoded(manifest).decode(),))
        if db.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
            raise ValueError("SQLite validation failed")
    temporary.replace(sqlite_path)
    with sqlite_path.open("rb") as source, gzip.open(str(sqlite_path) + ".gz", "wb") as target:
        shutil.copyfileobj(source, target)
    (destination / "catalog.json.gz.tmp").write_bytes(snapshot)
    (destination / "catalog.json.gz.tmp").replace(destination / "catalog.json.gz")
    (destination / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--download", action="store_true")
    parser.add_argument("--health-foods-file", type=Path)
    parser.add_argument("--imported-capsules-file", type=Path)
    parser.add_argument("--retrieved-at", help="Required real retrieval timestamp for offline input")
    args = parser.parse_args()
    if not args.download and not (args.health_foods_file and args.imported_capsules_file and args.retrieved_at):
        parser.error("Supply --download or both source files and --retrieved-at")
    if args.retrieved_at:
        if datetime.fromisoformat(args.retrieved_at).tzinfo is None:
            parser.error("--retrieved-at must include a timezone")
    records, metadata = [], {}
    for key, spec in SOURCES.items():
        if args.download:
            with urllib.request.urlopen(spec["download"], timeout=60) as response:
                raw = response.read(40_000_001)
            retrieved = datetime.now(timezone.utc).isoformat()
            directory = ROOT / "artifacts/drugs/food-sources"
            directory.mkdir(parents=True, exist_ok=True)
            (directory / f"{key}.json").write_bytes(raw)
        else:
            raw = getattr(args, key.replace("-", "_") + "_file").read_bytes()
            retrieved = args.retrieved_at
        if len(raw) > 40_000_000:
            raise ValueError("Food source exceeds the 40 MB limit")
        rows = json.loads(raw.decode("utf-8-sig"))
        if not isinstance(rows, list) or len(rows) < spec["minimumRows"] or not all(isinstance(row, dict) for row in rows):
            raise ValueError(f"Incomplete {key} source")
        records.extend(normalize_food(row, key) for row in rows)
        metadata[key] = {**spec, "retrievedAt": retrieved, "rows": len(rows), "sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}
    manifest = write_snapshot(records, metadata, ROOT / "data/products/supplements", ROOT / "artifacts/drugs/supplements.sqlite")
    print(json.dumps(manifest["counts"], ensure_ascii=False))


if __name__ == "__main__":
    main()
