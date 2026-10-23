import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { createDrugIndex, productShard, searchDrugIndex } from "../frontend/src/utils/drugCatalog.js";

const source = JSON.parse(readFileSync(new URL("../data/drugs/manifest.json", import.meta.url)));
const archive = readFileSync(new URL("../data/drugs/catalog.json.gz", import.meta.url));
const { products } = JSON.parse(gunzipSync(archive));
const index = createDrugIndex(products);
const search = (query, options = {}) => searchDrugIndex(index, { query, today: "2026-10-23", ...options });

test("source checksum, unique identities and import accounting reconcile", () => {
  assert.equal(createHash("sha256").update(archive).digest("hex"), source.catalogSha256);
  assert.equal(products.length, source.counts.products);
  assert.equal(new Set(products.map((p) => p.license)).size, products.length);
  assert.equal(new Set(products.map((p) => p.id)).size, products.length);
  assert.equal(products.reduce((sum, p) => sum + p.sourceRowCount, 0), source.counts.licenseRows);
  assert.equal(products.filter((p) => !p.ingredientNames.length).length, source.counts.withoutComposition);
  assert.equal(products.filter((p) => !p.cancellation).length, source.counts.uncancelledProducts);
});

test("real catalog supports Chinese brand, English component and exact license lookup", () => {
  assert.ok(search("普拿疼").total > 10);
  assert.ok(search("tramadol").total > 20);
  assert.equal(search("ＴＲＡＭＡＤＯＬ").total, search("tramadol").total);
  const result = search("衛署藥製字第036167號");
  assert.equal(result.total, 1);
  const product = products.find((p) => p.id === result.results[0].id);
  assert.match(product.nameZh, /斯眠靜/);
  assert.ok(product.ingredientNames.includes("TRAMADOL HCL"));
});

test("combination ingredients are searchable without losing the second component", () => {
  const mixed = products.find((p) => p.license === "衛署藥輸字第023917號");
  assert.ok(mixed);
  const found = search(mixed.license).results[0];
  assert.ok(found.ingredientNames.includes("ACETAMINOPHEN (EQ TO PARACETAMOL)"));
  assert.ok(found.ingredientNames.includes("TRAMADOL HCL"));
});

test("historical licenses remain searchable with explicit optional filters", () => {
  const all = search("tramadol", { limit: 100 });
  const active = search("tramadol", { status: "uncancelled", limit: 100 });
  assert.ok(all.total > active.total);
  assert.ok(active.results.every((r) => !r.cancellation));
  assert.ok(search("tramadol", { status: "current", limit: 100 }).results.every((r) => !r.cancellation && r.validUntil >= "2026-10-23"));
});

test("pagination is deterministic and input is literal text, not regular expressions", () => {
  const first = search("錠", { query: "錠劑", page: 1, limit: 10 });
  const second = search("錠劑", { page: 2, limit: 10 });
  assert.ok(first.total > 10);
  assert.equal(first.total, second.total);
  assert.equal(new Set([...first.results, ...second.results].map((r) => r.id)).size, 20);
  assert.equal(search(".*").total, 0);
  assert.equal(search("zz_no_such_drug_zz").total, 0);
  assert.throws(() => search("a"));
  assert.throws(() => search("ab", { page: -1 }));
  assert.throws(() => search("ab", { status: "approved" }));
  assert.throws(() => productShard("../../etc/passwd"));
});
