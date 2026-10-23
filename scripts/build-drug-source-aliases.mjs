import { readFile, writeFile, readdir } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { build } from "../frontend/node_modules/esbuild/lib/main.js";
import { tfdaEquivalentKey, tfdaPhysicalSpelling, rxnormPreciseIngredientKey } from "./lib/ingredient-identities.mjs";

const root = new URL("../", import.meta.url);
const compiled = await build({ entryPoints: [fileURLToPath(new URL("frontend/src/utils/drugAssessment.js", root))], bundle: true, write: false, format: "esm", platform: "node" });
const { matchDrugIngredient, normalizeDrugIngredientName: norm } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString("base64")}`);
const match = (name) => matchDrugIngredient(name, { includeSourceAliases: false });
const dir = new URL("artifacts/drugs/evidence-2026/rxclass/", root);
const sources = JSON.parse(await readFile(new URL("manifest.json", dir), "utf8"));
const aliasCandidates = new Map();
function add(name, key, evidence) {
  const alias = norm(name);
  if (!aliasCandidates.has(alias)) aliasCandidates.set(alias, new Map());
  const targets = aliasCandidates.get(alias);
  if (!targets.has(key)) targets.set(key, []);
  targets.get(key).push(evidence);
}
for (const file of (await readdir(dir)).filter((f) => /^[A-Z]\.json$/.test(f)).sort()) {
  const source = sources.find((s) => s.file === file);
  const raw = await readFile(new URL(file, dir));
  if (!source || createHash("sha256").update(raw).digest("hex") !== source.sha256) throw new Error(`Unverified RxClass file: ${file}`);
  for (const row of JSON.parse(raw).drugMemberGroup.drugMember) {
    if (!["IN", "PIN"].includes(row.minConcept.tty)) continue;
    const attrs = Object.fromEntries(row.nodeAttr.map((a) => [a.attrName, a.attrValue]));
    const names = [row.minConcept.name, attrs.SourceName].filter(Boolean);
    // An ATC combination name is class membership, not a synonym of each constituent.
    if (names.some((n) => /\b(?:and|with|combinations?|various|other)\b|\//i.test(n))) continue;
    const keys = new Set(names.map((n) => match(n)?.key).filter(Boolean));
    if (keys.size !== 1) continue;
    const key = [...keys][0];
    // Extracts and polymers with reviewed whole names must not acquire a
    // broader plant/material synonym from an ATC class-member record.
    if (match(key)?.rule.exactNameOnly) continue;
    for (const name of names) add(name, key, { type: "rxnorm-equivalent-name", rxcui: row.minConcept.rxcui, url: source.url, sourceSha256: source.sha256 });
  }
}
const preciseIdentities = JSON.parse(await readFile(new URL("backend/data/drug-rxnorm-identities.json", root), "utf8"));
for (const fact of preciseIdentities.facts) {
  // A named precise substance rule takes precedence over its broader parent.
  // PIN->IN is a parent relationship, not permission to replace a reviewed rule.
  if (match(fact.precise.name)) continue;
  const key = rxnormPreciseIngredientKey(fact, (name) => match(name)?.key);
  // A PIN parent is not enough to collapse a polymer derivative into an
  // exact-name-only plasma expander; those identities require explicit review.
  if (key && !match(key)?.rule.exactNameOnly) add(fact.precise.name, key, { type: "rxnorm-precise-ingredient", rxcui: fact.precise.rxcui, parentRxcui: fact.parents[0].rxcui,
    url: fact.url, sourceSha256: fact.sha256, checkedAt: fact.retrievedAt });
}
const aliasMatch = (name) => {
  const m = match(name);
  if (m) return m.key;
  const candidates = aliasCandidates.get(norm(name));
  return candidates?.size === 1 ? [...candidates.keys()][0] : null;
};
const manifest = JSON.parse(await readFile(new URL("data/drugs/manifest.json", root), "utf8"));
const archive = await readFile(new URL("data/drugs/catalog.json.gz", root));
if (createHash("sha256").update(archive).digest("hex") !== manifest.catalogSha256) throw new Error("TFDA checksum mismatch");
const names = new Set(JSON.parse(gunzipSync(archive)).products.flatMap((p) => p.ingredientNames));
// Only expand exact names actually present in the source. Never drop unknown ingredients.
for (const name of names) {
  if (match(name)) continue;
  const canonical = tfdaPhysicalSpelling(name);
  const direct = aliasMatch(canonical);
  if (direct) add(name, direct, { type: "tfda-spelling", url: "https://data.gov.tw/dataset/9121", catalogSha256: manifest.catalogSha256 });
  const equivalent = tfdaEquivalentKey(name, (part) => aliasMatch(tfdaPhysicalSpelling(part)));
  if (equivalent) add(name, equivalent, { type: "tfda-explicit-equivalence", url: "https://data.gov.tw/dataset/9121", catalogSha256: manifest.catalogSha256 });
}
const aliases = {}, conflicts = [];
for (const [name, targets] of [...aliasCandidates].sort(([a], [b]) => a.localeCompare(b, "en"))) {
  if (targets.size !== 1) { conflicts.push({ name, targets: [...targets.keys()] }); continue; }
  const [key, evidence] = [...targets][0];
  const prior = match(name);
  if (prior && prior.key !== key) throw new Error(`Alias contradicts existing rule: ${name}`);
  if (!prior) aliases[name] = { key, evidence: evidence[0] };
}
await writeFile(new URL("backend/data/drug-source-aliases.json", root), JSON.stringify({ schemaVersion: 1, sources, catalogSha256: manifest.catalogSha256, aliases, conflicts }, null, 2) + "\n");
console.log(JSON.stringify({ aliases: Object.keys(aliases).length, conflicts: conflicts.length }));
