import { readFile, writeFile, mkdir } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { build } from "../frontend/node_modules/esbuild/lib/main.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = join(root, "docs/research/2026-10-23-drug-system");
const bundle = await build({ entryPoints: [join(root, "frontend/src/utils/drugAssessment.js")], bundle: true, write: false, format: "esm", platform: "node" });
const { matchDrugIngredient, DRUG_RULE_COUNT } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const source = JSON.parse(await readFile(join(root, "data/drugs/manifest.json"), "utf8"));
const archive = await readFile(join(root, "data/drugs/catalog.json.gz"));
if (createHash("sha256").update(archive).digest("hex") !== source.catalogSha256) throw new Error("Catalog checksum mismatch");
const { products } = JSON.parse(gunzipSync(archive));
const names = new Map();
const counts = { fullyNameMapped: 0, partiallyNameMapped: 0, noNamesMapped: 0, missingComposition: 0 };
const uncancelled = { ...counts };
for (const p of products) {
  let matched = 0;
  for (const name of p.ingredientNames) {
    if (!names.has(name)) names.set(name, { name, key: matchDrugIngredient(name)?.key || null, products: 0, uncancelled: 0, exampleLicense: p.license });
    const entry = names.get(name);
    entry.products++;
    if (!p.cancellation) entry.uncancelled++;
    if (entry.key) matched++;
  }
  const key = !p.ingredientNames.length ? "missingComposition" : matched === p.ingredientNames.length ? "fullyNameMapped" : matched ? "partiallyNameMapped" : "noNamesMapped";
  counts[key]++;
  if (!p.cancellation) uncancelled[key]++;
}
const pending = [...names.values()].filter((row) => !row.key).sort((a, b) => b.uncancelled - a.uncancelled || b.products - a.products || a.name.localeCompare(b.name));
const quote = (value) => `"${String(value).replaceAll('"', '""')}"`;
const report = {
  generatedAt: new Date().toISOString(), sourceRetrievedAt: source.retrievedAt, catalogSha256: source.catalogSha256,
  ruleCodeSha256: createHash("sha256").update(bundle.outputFiles[0].text).digest("hex"),
  rules: DRUG_RULE_COUNT, ingredientNames: names.size, mappedIngredientNames: names.size - pending.length,
  unmappedIngredientNames: pending.length, allProducts: counts, uncancelledProducts: uncancelled,
  interpretation: "名稱可對應不等於整品已獲准使用；仍須核對途徑、時段、運動項目、劑量、S5 併用、完整 WADA 藥理類別與最新資料。未對應不能解讀成未禁用。",
  topUnmapped: pending.slice(0, 20),
};
await mkdir(output, { recursive: true });
await writeFile(join(output, "coverage.json"), JSON.stringify(report, null, 2) + "\n");
await writeFile(join(output, "unmapped-ingredients.csv"), "ingredient,product_count,uncancelled_product_count,example_license\n" + pending.map((row) => [row.name, row.products, row.uncancelled, row.exampleLicense].map(quote).join(",")).join("\n") + "\n");
console.log(JSON.stringify({ rules: report.rules, mappedIngredientNames: report.mappedIngredientNames, unmappedIngredientNames: report.unmappedIngredientNames, allProducts: counts, uncancelledProducts: uncancelled }, null, 2));
