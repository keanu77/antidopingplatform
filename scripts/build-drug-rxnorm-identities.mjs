import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const root = new URL("../", import.meta.url);
const source = new URL("artifacts/drugs/evidence-2026/", root);
const conceptsRaw = await readFile(new URL("rxnorm-concepts.json", source));
const metadata = JSON.parse(await readFile(new URL("rxnorm-concepts.meta.json", source), "utf8"));
if (createHash("sha256").update(conceptsRaw).digest("hex") !== metadata.sha256) throw new Error("NLM concept checksum mismatch");
const concepts = new Map(JSON.parse(conceptsRaw).minConceptGroup.minConcept.map((c) => [c.rxcui, c]));
const collected = JSON.parse(await readFile(new URL("rxnorm-parents.json", source), "utf8"));
const facts = collected.filter((f) => f.precise.tty === "PIN" && f.parents.length === 1 && f.parents[0].tty === "IN" && f.parents[0].suppress === "N");
const seen = new Set();
for (const fact of facts) {
  const concept = concepts.get(fact.precise.rxcui);
  if (concept?.name !== fact.precise.name || concept.tty !== "PIN" || seen.has(concept.rxcui)) throw new Error("Invalid or duplicate precise ingredient");
  if (fact.url !== `https://rxnav.nlm.nih.gov/REST/rxcui/${concept.rxcui}/related.json?tty=IN` || !/^[a-f0-9]{64}$/.test(fact.sha256)) throw new Error("Missing relationship provenance");
  seen.add(concept.rxcui);
}
await writeFile(new URL("backend/data/drug-rxnorm-identities.json", root), JSON.stringify({
  schemaVersion: 1,
  scope: "NLM PIN→IN 單一成分關係；只供名稱辨識，不推論禁用狀態。父成分沒有規則時仍不對應。",
  conceptSource: metadata,
  facts,
}, null, 2) + "\n");
console.log(JSON.stringify({ collected: collected.length, unambiguousIdentities: facts.length, clinicalRulesChanged: false }));
