// Reorders review work only. No ingredients, rules or coverage counts are changed.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import { build } from "../frontend/node_modules/esbuild/lib/main.js";
import { measureDrugCoverage } from "./lib/drug-coverage.mjs";
import { tfdaPhysicalSpelling } from "./lib/ingredient-identities.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const { values } = parseArgs({ options: { output: { type: "string", default: join(root, "artifacts/drugs/review-queue") } } });
const output = resolve(values.output);
const bundle = await build({ entryPoints: [join(root, "frontend/src/utils/drugAssessment.js")], bundle: true, write: false, format: "esm", platform: "node" });
const { matchDrugIngredient, normalizeDrugIngredientName: norm } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const source = JSON.parse(await readFile(join(root, "data/drugs/manifest.json"), "utf8"));
const archive = await readFile(join(root, "data/drugs/catalog.json.gz"));
if (createHash("sha256").update(archive).digest("hex") !== source.catalogSha256) throw new Error("Catalog checksum mismatch");
const { products } = JSON.parse(gunzipSync(archive));
const conceptsRaw = await readFile(join(root, "artifacts/drugs/evidence-2026/rxnorm-concepts.json"));
const conceptsMeta = JSON.parse(await readFile(join(root, "artifacts/drugs/evidence-2026/rxnorm-concepts.meta.json"), "utf8"));
if (createHash("sha256").update(conceptsRaw).digest("hex") !== conceptsMeta.sha256) throw new Error("RxNorm checksum mismatch");
const typedNames = new Set(JSON.parse(conceptsRaw).minConceptGroup.minConcept.filter((r) => ["IN", "PIN"].includes(r.tty)).map((r) => norm(r.name)));
const coverage = measureDrugCoverage(products, matchDrugIngredient);
const rows = new Map(coverage.pending.filter((r) => r.uncancelled > 0).map((r) => [r.name, {
  ...r, typedIngredient: typedNames.has(norm(tfdaPhysicalSpelling(r.name))), singleMissingProducts: 0,
  // A fractional score prioritizes the remaining names in a combination too.
  fractionalCompletion: 0,
}]));
for (const p of products.filter((p) => !p.cancellation && !p.conflictingFields?.length)) {
  const missing = [...new Set(p.ingredientNames)].filter((n) => rows.has(n));
  for (const n of missing) {
    const r = rows.get(n);
    if (missing.length === 1) r.singleMissingProducts++;
    r.fractionalCompletion += 1 / missing.length;
  }
}
const ranked = [...rows.values()].sort((a, b) => b.singleMissingProducts - a.singleMissingProducts
  || Number(b.typedIngredient) - Number(a.typedIngredient) || b.fractionalCompletion - a.fractionalCompletion || a.name.localeCompare(b.name, "en"));
const quote = (v) => `"${String(v).replaceAll('"', '""')}"`;
await mkdir(output, { recursive: true });
await writeFile(join(output, "pending.csv"), "ingredient,product_count,uncancelled_product_count,example_license,single_missing_products,nlm_typed_ingredient\n"
  + ranked.map((r) => [r.name, r.products, r.uncancelled, r.exampleLicense, r.singleMissingProducts, r.typedIngredient].map(quote).join(",")).join("\n") + "\n");
await writeFile(join(output, "report.json"), JSON.stringify({ generatedAt: new Date().toISOString(), catalogSha256: source.catalogSha256,
  interpretation: "只調整查核順序；單一缺口數是假設該名稱之後取得可靠規則的潛在效益，不能加入已完成覆蓋率。NLM 型別只供辨識，不推論禁用狀態。所有目標族群未對應名稱均保留。",
  target: coverage.target, names: ranked.length, rows: ranked,
}, null, 2) + "\n");
console.log(JSON.stringify({ names: ranked.length, targetUnchanged: coverage.target.coveragePercent, output }));
