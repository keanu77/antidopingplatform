import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { build } from "../frontend/node_modules/esbuild/lib/main.js";
import { requiresConstituentReview } from "./lib/drug-reference-decisions.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const { values } = parseArgs({ options: {
  facts: { type: "string", default: join(root, "artifacts/drugs/reference-checks/facts.json") },
  output: { type: "string", default: join(root, "docs/research/2026-10-23-drug-system") },
} });
const facts = JSON.parse(await readFile(values.facts, "utf8"));
const bundle = await build({ entryPoints: [join(root, "frontend/src/utils/drugAssessment.js")], bundle: true, write: false, format: "esm", platform: "node" });
const { matchDrugIngredient } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const conflicts = [], excluded = [], candidates = [];
for (const fact of facts) {
  const ref = { license: fact.license, url: fact.url, retrievedAt: fact.retrievedAt, sha256: fact.sha256 };
  if (!fact.compositionMatchesTfda) { excluded.push({ ...ref, reason: "composition-differs-from-TFDA" }); continue; }
  const knownRestrictions = fact.ingredientNames.map((n) => ({ name: n, match: matchDrugIngredient(n) }))
    .filter(({ match }) => match && !match.rule.routes && !match.rule.sexRestriction && ["in-competition", "in-and-out"].includes(match.rule.prohibition));
  const contradictory = knownRestrictions.filter(({ match }) => fact.inCompetition === "不禁止" || (match.rule.prohibition === "in-and-out" && fact.outOfCompetition === "不禁止"));
  if (contradictory.length) {
    conflicts.push({ ...ref, outcome: "retain-restricted-primary-rule", ingredients: contradictory.map(({ name, match }) => ({ name, rule: match.key, code: match.rule.wadaCode, primary: match.rule.evidence })) });
  } else if (fact.ingredientNames.some(requiresConstituentReview)) {
    excluded.push({ ...ref, reason: "material-requires-constituent-review" });
  } else if (fact.hasSpecificUsage || fact.specificUsage || fact.wadaCode || fact.substanceField !== "不含禁用物質" || fact.inCompetition !== "不禁止" || fact.outOfCompetition !== "不禁止") {
    excluded.push({ ...ref, reason: "requires-condition-or-federation-review" });
  } else {
    candidates.push({ ...ref, ingredientNames: fact.ingredientNames, status: "reference-only-not-auto-approved" });
  }
}
await mkdir(values.output, { recursive: true });
await writeFile(join(values.output, "reference-review.json"), JSON.stringify({ generatedAt: new Date().toISOString(), checkedProducts: facts.length,
  interpretation: "公開查詢的逐品項查核，不是 TADA 資料庫匯出或授權取得證明；候選不自動改寫醫療規則。來源差異及條件欄必須覆核。", conflicts, excluded, candidates }, null, 2) + "\n");
console.log(JSON.stringify({ checkedProducts: facts.length, conflicts: conflicts.length, excluded: excluded.length, referenceOnly: candidates.length }));
