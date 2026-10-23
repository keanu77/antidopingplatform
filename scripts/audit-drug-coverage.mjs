import { readFile, writeFile, mkdir } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { measureDrugCoverage } from "./lib/drug-coverage.mjs";
import { build } from "../frontend/node_modules/esbuild/lib/main.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const { values } = parseArgs({ options: {
  "catalog-dir": { type: "string", default: join(root, "data/drugs") },
  output: { type: "string", default: join(root, "docs/research/2026-10-23-drug-system") },
  target: { type: "string", default: "95" }, "require-target": { type: "boolean", default: false },
} });
const output = resolve(values.output);
const bundle = await build({ entryPoints: [join(root, "frontend/src/utils/drugAssessment.js")], bundle: true, write: false, format: "esm", platform: "node" });
const { matchDrugIngredient, DRUG_RULE_COUNT } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const source = JSON.parse(await readFile(join(values["catalog-dir"], "manifest.json"), "utf8"));
const archive = await readFile(join(values["catalog-dir"], "catalog.json.gz"));
if (createHash("sha256").update(archive).digest("hex") !== source.catalogSha256) throw new Error("Catalog checksum mismatch");
const { products } = JSON.parse(gunzipSync(archive));
if (products.length !== source.counts.products) throw new Error("Catalog count mismatch");
const { pending, ...measured } = measureDrugCoverage(products, matchDrugIngredient, Number(values.target));
const legacyCounts = (c) => Object.fromEntries(["fullyNameMapped", "partiallyNameMapped", "noNamesMapped", "missingComposition"].map((k) => [k, c[k]]));
const counts = legacyCounts(measured.cohorts.all);
const uncancelled = legacyCounts(measured.cohorts.uncancelled);
const quote = (value) => `"${String(value).replaceAll('"', '""')}"`;
const report = {
  generatedAt: new Date().toISOString(), sourceRetrievedAt: source.retrievedAt, catalogSha256: source.catalogSha256,
  ruleCodeSha256: createHash("sha256").update(bundle.outputFiles[0].text).digest("hex"),
  rules: DRUG_RULE_COUNT, ...measured, allProducts: counts, uncancelledProducts: uncancelled,
  interpretation: "名稱可對應不等於整品已獲准使用，也不是醫療正確率。來源衝突不計入目標；缺成分品項另列並保留全體分母。未註銷不等於仍在市售或已核實藥證有效；仍須核對途徑、時段、運動項目、劑量、S5 併用、完整 WADA 藥理類別與最新資料。未對應不能解讀成未禁用。",
  topUnmapped: pending.slice(0, 20),
};
await mkdir(output, { recursive: true });
await writeFile(join(output, "coverage.json"), JSON.stringify(report, null, 2) + "\n");
await writeFile(join(output, "unmapped-ingredients.csv"), "ingredient,product_count,uncancelled_product_count,example_license\n" + pending.map((row) => [row.name, row.products, row.uncancelled, row.exampleLicense].map(quote).join(",")).join("\n") + "\n");
console.log(JSON.stringify({ rules: report.rules, target: report.target, allUncancelled: report.cohorts.uncancelled, workloadProjection: report.workloadProjection }, null, 2));
if (values["require-target"] && !report.target.targetMet) process.exitCode = 1;
