import { readFile, writeFile, mkdir, rename, access } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { resolve, join } from "node:path";
import { build } from "../frontend/node_modules/esbuild/lib/main.js";
import { applyReferenceDecisions } from "./lib/drug-reference-decisions.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const { values } = parseArgs({ options: {
  decisions: { type: "string", default: join(root, "config/drug-reference-decisions.json") },
  references: { type: "string", default: join(root, "artifacts/drugs/reference-checks") },
  output: { type: "string", default: join(root, "artifacts/drugs/reference-import") },
  apply: { type: "boolean", default: false },
} });
// Verify each fact against original cached HTML before trusting its status flags.
const facts = JSON.parse(execFileSync("python3", [join(root, "scripts/collect-drug-reference-evidence.py"), "--output", resolve(values.references), "--verify-cache"], { maxBuffer: 20 * 1024 * 1024 }));
const files = ["drug-evidence-rules.json", "drug-ingredient-rules.json"].map((f) => join(root, "backend/data", f));
const original = await Promise.all(files.map((f) => readFile(f, "utf8")));
const [evidence, extension] = original.map(JSON.parse);
const federation = JSON.parse(await readFile(join(root, "backend/data/drug-federation-rules.json"), "utf8"));
const decisions = JSON.parse(await readFile(values.decisions, "utf8"));
const manifest = JSON.parse(await readFile(join(root, "data/drugs/manifest.json"), "utf8"));
const archive = await readFile(join(root, "data/drugs/catalog.json.gz"));
if (createHash("sha256").update(archive).digest("hex") !== manifest.catalogSha256) throw new Error("TFDA checksum mismatch");
if (decisions.checkedAt < evidence.effectiveFrom || decisions.checkedAt > evidence.effectiveThrough) throw new Error("Decision date outside rule year");
const { products } = JSON.parse(gunzipSync(archive));
const bundle = await build({ entryPoints: [join(root, "frontend/src/utils/drugAssessment.js")], bundle: true, write: false, format: "esm", platform: "node" });
const { matchDrugIngredient: match } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const result = applyReferenceDecisions({ decisions, facts, products, evidence, extension, federation, match });
const payloads = [result.evidence, result.extension].map((v) => JSON.stringify(v, null, 2) + "\n");
await mkdir(values.output, { recursive: true });
if (values.apply && result.changes.length) {
  for (let i = 0; i < files.length; i++) {
    const exists = await access(join(values.output, `before-${i}.json`)).then(() => true, (error) => { if (error.code === "ENOENT") return false; throw error; });
    if (exists) throw new Error("Use a new output directory; an earlier import backup must not be overwritten");
  }
}
for (let i = 0; i < files.length; i++) await writeFile(join(values.output, i ? "drug-ingredient-rules.json" : "drug-evidence-rules.json"), payloads[i]);
if (values.apply && result.changes.length) {
  for (let i = 0; i < files.length; i++) if (await readFile(files[i], "utf8") !== original[i]) throw new Error("Rules changed during import");
  for (let i = 0; i < files.length; i++) await writeFile(join(values.output, `before-${i}.json`), original[i]);
  try {
    for (let i = 0; i < files.length; i++) { await writeFile(`${files[i]}.tmp`, payloads[i]); await rename(`${files[i]}.tmp`, files[i]); }
  } catch (error) {
    for (let i = 0; i < files.length; i++) await writeFile(files[i], original[i]);
    throw error;
  }
}
await writeFile(join(values.output, "import-report.json"), JSON.stringify({ checkedAt: decisions.checkedAt, clinicalReview: "pending", catalogSha256: manifest.catalogSha256, applied: values.apply, changes: result.changes }, null, 2) + "\n");
console.log(JSON.stringify({ decisions: decisions.entries.length, rulesAdded: result.changes.filter((c) => c.type === "rule").length, aliasesAdded: result.changes.filter((c) => c.type === "alias").length, literalAliasesAdded: result.changes.filter((c) => c.type === "literal-alias").length, applied: values.apply }));
