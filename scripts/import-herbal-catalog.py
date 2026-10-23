#!/usr/bin/env python3
"""Import downloaded NHI TCM ODS files without inventing formula ingredients."""
import argparse
from collections import Counter
from datetime import datetime, timezone
import gzip
import hashlib
import json
from pathlib import Path
import re
import shutil
import sqlite3
from xml.etree import ElementTree as ET
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
PAGE = "https://www.nhi.gov.tw/ch/cp-14300-03585-2467-1.html"
DOWNLOADS = {
    "complex": "https://nhi.gov.tw/ch/dl-93087-eef9f556e73a41398a90e3a0da5e9b6b-1.ods",
    "single": "https://nhi.gov.tw/ch/dl-93091-e6f546cd1356459ab0b256ef48abd097-1.ods",
}
NS = {"table": "urn:oasis:names:tc:opendocument:xmlns:table:1.0", "text": "urn:oasis:names:tc:opendocument:xmlns:text:1.0"}


def encoded(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True).encode()


def read_ods(path):
    with ZipFile(path) as archive:
        if archive.getinfo("content.xml").file_size > 100_000_000:
            raise ValueError("ODS XML exceeds 100 MB")
        xml = archive.read("content.xml")
    if b"<!DOCTYPE" in xml.upper() or b"<!ENTITY" in xml.upper():
        raise ValueError("ODS entities are not supported")
    root = ET.fromstring(xml)
    records = []
    for table in root.findall(".//table:table", NS):
        headers = None
        for number, row in enumerate(table.findall("table:table-row", NS), 1):
            cells = []
            # ODS often pads every row to 16,384 cells and repeats empty rows.
            # Read only the real header width; never expand empty padding.
            for cell in row:
                value = "\n".join("".join(p.itertext()) for p in cell.findall("text:p", NS)).strip()
                repeated = int(cell.get(f"{{{NS['table']}}}number-columns-repeated", "1"))
                width = len(headers) if headers else 64
                cells.extend([value] * min(repeated, max(0, width - len(cells))))
                if len(cells) >= width:
                    break
            if not any(cells):
                continue
            if headers is None:
                while cells and not cells[-1]:
                    cells.pop()
                if not {"藥品代碼", "藥品名稱", "製造廠名稱", "發證日期"}.issubset(cells):
                    raise ValueError("Unexpected NHI ODS header")
                headers = cells
                continue
            if int(row.get(f"{{{NS['table']}}}number-rows-repeated", "1")) != 1:
                raise ValueError("Repeated nonempty ODS row requires review")
            cells.extend([""] * (len(headers) - len(cells)))
            fields = {key or f"未命名欄位{i + 1}": cells[i] for i, key in enumerate(headers)}
            records.append({"sheet": table.get(f"{{{NS['table']}}}name"), "row": number, "fields": fields})
            if len(records) > 50_000:
                raise ValueError("Unexpectedly large NHI catalog")
    if not records:
        raise ValueError("ODS contains no product records")
    return records


def source_date(value, field, warnings):
    value = str(value or "").strip()
    if not value:
        return ""
    try:
        if not re.fullmatch(r"\d{6,7}", value):
            raise ValueError("Expected ROC date")
        return datetime.strptime(f"{int(value[:-4]) + 1911:04d}{value[-4:]}", "%Y%m%d").date().isoformat()
    except ValueError:
        warnings.append({"field": field, "value": value})
        return ""


def normalize_herb(record, kind):
    row = record["fields"]
    code, name = row.get("藥品代碼", "").strip(), row.get("藥品名稱", "").strip()
    if not code or not name:
        raise ValueError("Herbal record requires a code and product name")
    warnings = []
    # A code can be reused in conflicting source rows. Keep each distinct row;
    # a hash of the original record is safer than silently choosing one brand.
    identity = encoded({"kind": kind, "fields": row})
    return {
        "id": "tw-" + hashlib.sha256(identity).hexdigest()[:20],
        "category": "herbal", "sourceKey": kind,
        "license": code, "referenceLabel": "健保藥品代碼",
        "nameZh": name, "nameEn": "", "dosageForm": row.get("劑型", ""),
        "applicant": row.get("製造廠名稱", ""), "formulaName": row.get("方名", ""),
        "herbalType": "複方" if kind == "complex" else "單方",
        "issuedOn": source_date(row.get("發證日期"), "發證日期", warnings),
        "listedOn": source_date(row.get("收載日期"), "收載日期", warnings),
        "delistedOn": source_date(row.get("不再收載日期"), "不再收載日期", warnings),
        "cancellation": "", "validUntil": "", "registrationStatus": "此來源不提供藥證有效狀態",
        "ingredientNames": [], "ingredientSummary": "", "compositionScope": "not-provided",
        "dateWarnings": warnings, "rawFields": row,
        "sourceRecord": {"sheet": record["sheet"], "row": record["row"]},
    }


def build_catalog(inputs):
    records, sources = [], {}
    for kind, path, snapshot_date in inputs:
        rows = read_ods(path)
        if len(rows) < 100:
            raise ValueError("Incomplete NHI source")
        raw = path.read_bytes()
        sources[kind] = {
            "name": f"健保署中藥{'複方' if kind == 'complex' else '單方'}用藥品項表", "dataset": PAGE,
            "download": DOWNLOADS[kind], "snapshotDate": snapshot_date,
            "retrievedAt": datetime.fromtimestamp(path.stat().st_mtime, timezone.utc).isoformat(),
            "timestampBasis": "使用者協助瀏覽器下載；以本機檔案完成寫入時間記錄取得時間，非來源發布時間。",
            "rows": len(rows), "sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw),
        }
        records.extend(normalize_herb(row, kind) for row in rows)
    counts = Counter(p["license"] for p in records)
    for product in records:
        product["sourceConflict"] = counts[product["license"]] > 1
    # Identical rows are deduplicated, conflicting rows are retained separately.
    unique = {p["id"]: p for p in records}
    products = sorted(unique.values(), key=lambda p: (p["license"], p["id"]))
    stats = {
        "products": len(products), "sourceRows": len(records), "uniqueCodes": len(counts),
        "duplicateCodeGroups": sum(n > 1 for n in counts.values()), "identicalRowsRemoved": len(records) - len(products),
        "complex": sum(p["sourceKey"] == "complex" for p in products), "single": sum(p["sourceKey"] == "single" for p in products),
        "withoutComposition": len(products), "recordsWithDateWarnings": sum(bool(p["dateWarnings"]) for p in products),
    }
    return products, sources, stats


def write_snapshot(products, sources, counts, destination, sqlite_path):
    archive = gzip.compress(encoded({"schemaVersion": 1, "products": products}), mtime=0)
    manifest = {
        "schemaVersion": 1, "category": "herbal", "sources": sources, "counts": counts,
        "retrievedAt": max(s["retrievedAt"] for s in sources.values()), "importedAt": datetime.now(timezone.utc).isoformat(),
        "licenseUrl": "https://www.nhi.gov.tw/ch/cp-4379-5d212-3280-1.html",
        "attribution": "衛生福利部中央健康保險署：中藥用藥品項表。依政府網站資料開放宣告整理；來源機關未對本服務背書。",
        "scope": "健保中藥品項快照，含不再收載紀錄；不是全部中藥許可證。此來源未提供完整處方、藥證效期或運動禁藥判定。",
        "catalogSha256": hashlib.sha256(archive).hexdigest(),
    }
    destination.mkdir(parents=True, exist_ok=True)
    sqlite_path.parent.mkdir(parents=True, exist_ok=True)
    temporary = sqlite_path.with_suffix(".tmp.sqlite")
    temporary.unlink(missing_ok=True)
    with sqlite3.connect(temporary) as db:
        db.executescript("CREATE TABLE products(id TEXT PRIMARY KEY, source_key TEXT NOT NULL, reference TEXT NOT NULL, name_zh TEXT NOT NULL, product_json TEXT NOT NULL); CREATE TABLE source_records(product_id TEXT PRIMARY KEY REFERENCES products(id), sheet TEXT, row_number INTEGER, raw_json TEXT NOT NULL); CREATE TABLE metadata(key TEXT PRIMARY KEY,value TEXT NOT NULL); CREATE INDEX product_reference ON products(reference);")
        for p in products:
            db.execute("INSERT INTO products VALUES(?,?,?,?,?)", (p["id"], p["sourceKey"], p["license"], p["nameZh"], encoded(p).decode()))
            db.execute("INSERT INTO source_records VALUES(?,?,?,?)", (p["id"], p["sourceRecord"]["sheet"], p["sourceRecord"]["row"], encoded(p["rawFields"]).decode()))
        db.execute("INSERT INTO metadata VALUES('manifest',?)", (encoded(manifest).decode(),))
        if db.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
            raise ValueError("SQLite validation failed")
    temporary.replace(sqlite_path)
    with sqlite_path.open("rb") as source, gzip.open(str(sqlite_path) + ".gz", "wb") as target:
        shutil.copyfileobj(source, target)
    (destination / "catalog.json.gz.tmp").write_bytes(archive)
    (destination / "catalog.json.gz.tmp").replace(destination / "catalog.json.gz")
    (destination / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--complex-file", type=Path)
    parser.add_argument("--single-file", type=Path)
    parser.add_argument("--snapshot-date", required=True, help="Publication version YYYY-MM-DD shown on NHI download page")
    args = parser.parse_args()
    if not (args.complex_file or args.single_file):
        parser.error("Supply downloaded NHI --complex-file and/or --single-file")
    datetime.strptime(args.snapshot_date, "%Y-%m-%d")
    inputs = [(kind, getattr(args, kind + "_file"), args.snapshot_date) for kind in DOWNLOADS if getattr(args, kind + "_file")]
    products, sources, counts = build_catalog(inputs)
    write_snapshot(products, sources, counts, ROOT / "data/products/herbal", ROOT / "artifacts/drugs/herbal.sqlite")
    print(json.dumps(counts, ensure_ascii=False))


if __name__ == "__main__":
    main()
