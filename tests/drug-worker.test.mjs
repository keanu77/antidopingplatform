import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { webcrypto } from "node:crypto";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { build } from "../frontend/node_modules/esbuild/lib/main.js";

const root = fileURLToPath(new URL("../", import.meta.url));
execFileSync(process.execPath, ["scripts/prepare-drug-assets.mjs"], { cwd: root });
const expectedCount = JSON.parse(await readFile(root + "data/drugs/manifest.json", "utf8")).counts.products;
const bundle = await build({ entryPoints: [root + "frontend/src/workers/drugSearch.worker.js"], bundle: true, write: false, format: "iife", platform: "browser" });

function workerHarness(transform = (bytes) => bytes) {
  const responses = new Map();
  let id = 0;
  const self = { postMessage(data) { responses.get(data.id)(data); } };
  const context = vm.createContext({
    self, crypto: webcrypto, TextDecoder, TextEncoder, Uint8Array, AbortSignal,
    fetch: async (path) => {
      try {
        const bytes = await readFile(root + "frontend/public" + path);
        return new Response(transform(bytes, path));
      } catch { return new Response("not found", { status: 404 }); }
    },
  });
  vm.runInContext(bundle.outputFiles[0].text, context);
  return (type, payload, catalog = "drugs") => new Promise((resolve) => {
    const requestId = ++id;
    responses.set(requestId, (data) => { responses.delete(requestId); resolve(data); });
    self.onmessage({ data: { id: requestId, type, payload, catalog } });
  });
}

test("actual worker searches snapshot, resolves aliases, paginates and loads verified details", async () => {
  const request = workerHarness();
  const init = await request("init");
  assert.equal(init.result.counts.products, expectedCount);
  assert.equal(init.result.coverage.target.total, init.result.counts.uncancelledProducts - init.result.coverage.allUncancelled.missingComposition);
  assert.equal(init.result.coverage.target.percent, 95);
  const search = await request("search", { query: "衛署藥輸字第023917號" });
  assert.equal(search.result.total, 1);
  const detail = await request("detail", search.result.results[0].id);
  assert.equal(detail.result.nameEn, "ULTRACET TABLETS");
  assert.equal(detail.result.ingredients.length, 2);
  assert.ok((await request("search", { query: "paracetamol" })).result.total > 100);
  assert.ok((await request("search", { query: "沙丁胺醇" })).result.total > 10);
  const branded = (await request("search", { query: "普拿疼", limit: 100 })).result;
  assert.ok(branded.total > 0);
  assert.ok(branded.results.every((product) => product.nameZh.includes("普拿疼")));
  const englishBrand = (await request("search", { query: "panadol", limit: 100 })).result;
  assert.ok(englishBrand.total > 0);
  assert.ok(englishBrand.results.every((product) => product.nameEn.toLowerCase().includes("panadol")));
  const page1 = (await request("search", { query: "tramadol", limit: 10 })).result;
  const page2 = (await request("search", { query: "tramadol", limit: 10, page: 2 })).result;
  assert.equal(new Set([...page1.results, ...page2.results].map((p) => p.id)).size, 20);
  assert.equal((await request("search", { query: "zzzzdoesnotexist" })).result.total, 0);
  assert.match((await request("detail", "../../secret")).error, /格式/);
  assert.match((await request("detail", "tw-00000000000000000000")).error, /查無/);
});

test("herbal and food workers retain source-specific evidence and cannot mix categories", async () => {
  for (const [category, query] of [["herbal", "A038755"], ["supplements", "CREATINE"]]) {
    const request = workerHarness();
    const info = (await request("init", null, category)).result;
    assert.equal(info.category, category);
    const result = (await request("search", { query }, category)).result;
    assert.ok(result.total > 0);
    const product = (await request("detail", result.results[0].id, category)).result;
    assert.equal(product.category, category);
    assert.ok(product.rawFields);
    if (category === "herbal") {
      assert.equal(result.total, 2);
      assert.equal(product.sourceConflict, true);
      assert.equal(product.ingredientNames.length, 0);
      assert.equal(product.referenceLabel, "健保藥品代碼");
    } else {
      assert.equal(product.batchVerification, "not-provided");
      assert.equal(product.certifications.length, 0);
      assert.equal(product.referenceLabel, "核備函字號");
    }
    assert.match((await request("search", { query: "tramadol" }, "drugs")).error, /分類不一致/);
  }
});

test("a catalog manifest from another category fails closed", async () => {
  const request = workerHarness((bytes, path) => {
    if (!path.endsWith("/manifest.json")) return bytes;
    const info = JSON.parse(bytes); info.category = "herbal";
    return JSON.stringify(info);
  });
  assert.match((await request("init", null, "supplements")).error, /分類不一致/);
});

test("coverage from a different rule version is hidden while catalog search remains usable", async () => {
  const request = workerHarness((bytes, path) => {
    if (!path.endsWith("/manifest.json")) return bytes;
    const info = JSON.parse(bytes);
    info.coverage.ruleDataSha256 = "0".repeat(64);
    return JSON.stringify(info);
  });
  const info = (await request("init")).result;
  assert.equal(info.coverage, undefined);
  assert.ok((await request("search", { query: "tramadol" })).result.total > 0);
});

test("tampered index blocks results and retry loads a clean snapshot", async () => {
  let corrupt = true;
  const request = workerHarness((bytes, path) => corrupt && path.endsWith("/index.json") ? Buffer.from("{}") : bytes);
  assert.match((await request("init")).error, /版本不一致/);
  corrupt = false;
  assert.equal((await request("init")).result.counts.products, expectedCount);
});

test("missing checksum and tampered details never produce a drug assessment input", async () => {
  const missing = workerHarness((bytes, path) => {
    if (!path.endsWith("/manifest.json")) return bytes;
    const info = JSON.parse(bytes); delete info.files["index.json"].sha256;
    return JSON.stringify(info);
  });
  assert.match((await missing("init")).error, /驗證資訊/);
  const tampered = workerHarness((bytes, path) => path.endsWith("/08.json") ? Buffer.from("{}") : bytes);
  await tampered("init");
  assert.match((await tampered("detail", "tw-082ed017b404f96f7e39")).error, /版本不一致/);
});
