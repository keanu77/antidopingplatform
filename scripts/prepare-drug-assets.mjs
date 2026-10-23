import { readFile, writeFile, mkdir, rename, rm } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { productShard } from "../frontend/src/utils/drugCatalog.js";
import { measureDrugCoverage } from "./lib/drug-coverage.mjs";
import { build } from "../frontend/node_modules/esbuild/lib/main.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const ruleBundle = await build({ entryPoints: [join(root, "frontend/src/utils/drugAssessment.js")], bundle: true, write: false, format: "esm", platform: "node" });
const { matchDrugIngredient, DRUG_RULE_COUNT, DRUG_RULE_FINGERPRINT_INPUT } = await import(`data:text/javascript;base64,${Buffer.from(ruleBundle.outputFiles[0].text).toString("base64")}`);
async function prepareCatalog(input, output) {
  const archive = await readFile(join(input, "catalog.json.gz"));
  const source = JSON.parse(await readFile(join(input, "manifest.json"), "utf8"));
  if (sha256(archive) !== source.catalogSha256) throw new Error("TFDA catalog checksum mismatch; run drugs:import to restore a complete snapshot.");
  const catalog = JSON.parse(gunzipSync(archive));
  if (catalog.schemaVersion !== 1 || catalog.products.length !== source.counts.products) throw new Error("TFDA catalog schema/count mismatch.");

  // Increment the asset schema suffix when changing index/record serialization.
  const version = `${source.catalogSha256.slice(0, 16)}-v1`;
  const staging = join(output, `${version}.tmp`);
  await mkdir(staging, { recursive: true });
  const ingredients = [], ingredientIds = new Map(), shards = new Map();
  const rows = catalog.products.map((p) => {
    const shard = productShard(p.id);
    if (!shards.has(shard)) shards.set(shard, {});
    shards.get(shard)[p.id] = p;
    const ids = p.ingredientNames.map((name) => {
      if (!ingredientIds.has(name)) { ingredientIds.set(name, ingredients.length); ingredients.push(name); }
      return ingredientIds.get(name);
    });
    return [p.id, p.license, p.nameZh, p.nameEn, p.dosageForm, p.cancellation, p.validUntil, ids];
  });

  const files = {};
  async function save(name, value) {
    const bytes = Buffer.from(JSON.stringify(value));
    if (bytes.length > 24_000_000) throw new Error(`${name} exceeds the static-asset size budget`);
    await writeFile(join(staging, name), bytes);
    files[name] = { sha256: sha256(bytes), bytes: bytes.length };
  }
  await save("index.json", { schemaVersion: 1, ingredients, rows });
  for (const [shard, products] of shards) await save(`${shard}.json`, products);
  const target = join(output, version);
  // This directory is generated, ignored build output. Rebuilds are deterministic.
  await rm(target, { recursive: true, force: true });
  await rename(staging, target);
  const coverage = !source.category || source.category === "drugs" ? measureDrugCoverage(catalog.products, matchDrugIngredient) : null;
  const manifest = { ...source, assetVersion: version, files,
    ...(coverage ? { coverage: { target: coverage.target, allUncancelled: coverage.cohorts.uncancelled,
      rules: DRUG_RULE_COUNT, ruleCodeSha256: sha256(ruleBundle.outputFiles[0].text), ruleDataSha256: sha256(DRUG_RULE_FINGERPRINT_INPUT), catalogSha256: source.catalogSha256 } } : {}),
  };
  await writeFile(join(output, "manifest.json.tmp"), JSON.stringify(manifest));
  await rename(join(output, "manifest.json.tmp"), join(output, "manifest.json"));
  console.log(`${source.category || "drugs"} assets: ${rows.length} products, ${ingredients.length} ingredient names, index ${(files["index.json"].bytes / 1e6).toFixed(2)} MB, ${shards.size} detail shards.`);
}
await prepareCatalog(join(root, "data/drugs"), join(root, "frontend/public/drug-data"));
for (const category of ["herbal", "supplements"]) {
  const input = join(root, "data/products", category);
  await prepareCatalog(input, join(root, "frontend/public/product-data", category));
}
