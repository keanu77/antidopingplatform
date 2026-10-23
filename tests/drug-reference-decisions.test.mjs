import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { applyReferenceDecisions, REVIEWED_GENERAL_WARNING_SHA256 } from "../scripts/lib/drug-reference-decisions.mjs";

const source = { url: "https://www.check-antidoping.org.tw/inquiry_page.php?id=1&category=2", sha256: "a".repeat(64) };
const entry = { ...source, rawName: "EXAMPLE HCL", key: "example", action: "named-unconditional", identityBasis: "Reviewed salt identity", rationale: "Named constituent in verified unrestricted formulation" };
function fixture() {
  return {
    decisions: { schemaVersion: 1, checkedAt: "2026-10-23", entries: [entry] },
    facts: [{ ...source, license: "L1", ingredientNames: ["EXAMPLE HCL"], inCompetition: "不禁止", outOfCompetition: "不禁止", hasSpecificUsage: false, specificUsage: "", warningSha256: REVIEWED_GENERAL_WARNING_SHA256, wadaCode: "", substanceField: "不含禁用物質", compositionMatchesTfda: true, sourceSummaryMatchesTfda: true, retrievedAt: "2026-10-23T00:00:00Z" }],
    products: [{ license: "L1", ingredientNames: ["EXAMPLE HCL"], ingredientSummary: "EXAMPLE HCL", cancellation: "", validUntil: "2028-01-01", licenseType: "製　劑" }],
    evidence: { sources: {}, groups: [] }, extension: { aliases: {} }, match: () => null,
  };
}

test("explicit named decision has pinned evidence and is idempotent", () => {
  const f = fixture(); const result = applyReferenceDecisions(f);
  assert.equal(result.evidence.groups[0].ingredientEvidence.example.sourceSha256, source.sha256);
  assert.equal(result.evidence.groups[0].ingredientEvidence.example.clinicalReview, "pending");
  assert.equal(result.extension.aliases["example hcl"], "example");
  assert.equal(f.evidence.groups.length, 0);
  assert.deepEqual(applyReferenceDecisions({ ...f, evidence: result.evidence, extension: result.extension }).changes, []);
});

test("search term, source mutation and composition mismatch cannot create a rule", () => {
  for (const mutate of [
    (f) => { f.decisions.entries = [{ ...entry, rawName: "OTHER" }]; },
    (f) => { f.facts[0].sha256 = "b".repeat(64); },
    (f) => { f.products[0].ingredientNames.push("UNKNOWN"); },
    (f) => { f.products[0].ingredientSummary += ";;UNKNOWN"; },
    (f) => { f.products[0].conflictingFields = ["ingredientSummary"]; },
    (f) => { f.products[0].validUntil = "2025-01-01"; },
    (f) => { f.products[0].licenseType = "原料藥"; },
    (f) => { f.decisions.checkedAt = "2026-02-30"; },
  ]) { const f = fixture(); mutate(f); assert.throws(() => applyReferenceDecisions(f)); }
});

test("green status never erases routes, federation conditions or known prohibition", () => {
  for (const mutate of [
    (f) => { f.facts[0].hasSpecificUsage = true; },
    (f) => { f.facts[0].specificUsage = "限眼部使用"; },
    (f) => { f.facts[0].wadaCode = "S6"; },
    (f) => { f.facts[0].substanceField = ""; },
    (f) => { f.facts[0].substanceField = "HIGENAMINE"; },
    (f) => { f.facts[0].warningSha256 = "b".repeat(64); },
    (f) => { f.match = () => ({ key: "example", rule: { prohibition: "in-competition" } }); },
    (f) => { f.match = () => ({ key: "example", rule: { prohibition: "not-prohibited", routes: { topical: {} } } }); },
    (f) => { f.match = () => ({ key: "example", rule: { prohibition: "not-prohibited", referenceRoutes: ["oral"] } }); },
    (f) => { f.match = () => ({ key: "example", rule: { prohibition: "not-prohibited", sportRestricted: ["sport"] } }); },
  ]) { const f = fixture(); mutate(f); assert.throws(() => applyReferenceDecisions(f)); }
});

test("another ingredient's limited reference scope is preserved without inventing a prohibition", () => {
  const f = fixture();
  f.facts[0].ingredientNames.push("ORAL ONLY");
  f.products[0].ingredientNames.push("ORAL ONLY");
  f.products[0].ingredientSummary += ";;ORAL ONLY";
  const scoped = { key: "oral only", rule: { prohibition: "not-prohibited", referenceRoutes: ["oral"] } };
  f.match = (name) => name === "ORAL ONLY" ? scoped : null;
  const result = applyReferenceDecisions(f);
  assert.deepEqual(result.evidence.groups.flatMap((g) => g.names), ["example"]);
  assert.deepEqual(scoped.rule.referenceRoutes, ["oral"]);
});

test("green opium or ephedra product references never create unrestricted material rules", () => {
  for (const rawName of ["OPIUM", "OPIUM CAMPHOR TINCTURE", "EPHEDRA HERBA EXTRACT", "CLOVE", "CARYOPHILLIN POWDER", "CARYOPHYLLUS", "EUGENIA POWDER"]) {
    const f = fixture();
    f.decisions.entries = [{ ...entry, rawName, key: rawName.toLowerCase() }];
    f.facts[0].ingredientNames = [rawName];
    Object.assign(f.products[0], { ingredientNames: [rawName], ingredientSummary: rawName });
    assert.throws(() => applyReferenceDecisions(f), /constituent review/);
  }
});

test("identity-only decisions require an existing target and retain its restriction", () => {
  const f = fixture(); f.decisions.entries = [{ ...entry, action: "identity-only" }];
  assert.throws(() => applyReferenceDecisions(f), /cannot create/);
  f.match = (name) => name === "example" ? { key: "example", rule: { prohibition: "in-and-out" } } : null;
  const result = applyReferenceDecisions(f);
  assert.equal(result.extension.aliases["example hcl"], "example");
  assert.equal(result.evidence.groups.length, 0);
  f.decisions.entries.push({ ...entry, key: "contradiction", action: "identity-only" });
  assert.throws(() => applyReferenceDecisions(f), /Contradictory/);
});

test("literal identities require pinned whole strings and cannot create or replace a rule", () => {
  const f = fixture(), rawName = "EXAMPLE HCL (SOURCE ANNOTATION";
  f.decisions.entries = [{ ...entry, rawName, action: "literal-identity-only" }];
  f.facts[0].ingredientNames = [rawName];
  Object.assign(f.products[0], { ingredientNames: [rawName], ingredientSummary: rawName });
  assert.throws(() => applyReferenceDecisions(f), /cannot create/);
  const rule = { prohibition: "in-and-out" };
  f.match = (name) => name === "example" ? { key: "example", rule } : null;
  const r = applyReferenceDecisions(f);
  assert.equal(r.evidence.groups.length, 0);
  assert.deepEqual(r.extension.aliases, {});
  assert.equal(r.extension.reviewedLiteralAliases[rawName.toLowerCase()].key, "example");
  assert.equal(r.extension.reviewedLiteralAliases[rawName.toLowerCase()].evidence.sourceSha256, source.sha256);
  assert.equal(rule.prohibition, "in-and-out");
  assert.deepEqual(applyReferenceDecisions({ ...f, extension: r.extension }).changes, []);
  const changed = structuredClone(r.extension);
  changed.reviewedLiteralAliases[rawName.toLowerCase()].key = "another ingredient";
  assert.throws(() => applyReferenceDecisions({ ...f, extension: changed }), /literal identity changed/);
  f.decisions.entries[0].rawName += " UNKNOWN";
  assert.throws(() => applyReferenceDecisions(f), /absent from actual result/);
});

test("CMAS references require exact reviewed conditions and an installed named federation rule", () => {
  const f = fixture(), usage = "特定運動項目賽內禁用，出賽前72小時至賽事與採樣結束";
  Object.assign(f.facts[0], { substanceField: "EXAMPLE", inCompetition: "部份運動禁止", outOfCompetition: "部份運動禁止", hasSpecificUsage: true, specificUsage: usage, wadaCode: "BZD僅限CMAS（世界潛水聯盟）所屬之運動項目禁用" });
  f.decisions.entries = [{ ...entry, action: "named-cmas-conditional", federationSourceSha256: "f".repeat(64), specificUsageSha256: createHash("sha256").update(usage).digest("hex") }];
  assert.throws(() => applyReferenceDecisions(f), /federation/);
  f.federation = { names: ["example"], source: { sha256: "f".repeat(64) } };
  assert.equal(applyReferenceDecisions(f).evidence.groups[0].ingredientEvidence.example.federationRule, "cmas");
  f.facts[0].substanceField = "UNRELATED";
  assert.throws(() => applyReferenceDecisions(f), /federation/);
  f.facts[0].substanceField = "EXAMPLE";
  f.facts[0].specificUsage += "，還有限制";
  assert.throws(() => applyReferenceDecisions(f), /federation/);
});

test("CMAS PDE5 decisions cannot borrow a benzodiazepine label or discard the 72-hour condition", () => {
  const f = fixture(), rawName = "VARDENAFIL HCL", usage = "賽內禁用，出賽前72小時至賽事與採樣結束";
  Object.assign(f.facts[0], { substanceField: "VARDENAFIL", ingredientNames: [rawName], inCompetition: "部份運動禁止", outOfCompetition: "部份運動禁止", hasSpecificUsage: true, specificUsage: usage, wadaCode: "BZD僅限CMAS（世界潛水聯盟）所屬之運動項目禁用" });
  Object.assign(f.products[0], { ingredientNames: [rawName], ingredientSummary: rawName });
  f.decisions.entries = [{ ...entry, rawName, key: "vardenafil", action: "named-cmas-conditional", federationSourceSha256: "f".repeat(64), specificUsageSha256: createHash("sha256").update(usage).digest("hex") }];
  f.federation = { names: ["vardenafil"], source: { sha256: "f".repeat(64) } };
  assert.throws(() => applyReferenceDecisions(f), /federation/);
  f.facts[0].wadaCode = "PDE 5 inhibitors 僅限CMAS（世界潛水聯盟）所屬之運動項目禁用";
  assert.equal(applyReferenceDecisions(f).evidence.groups[0].ingredientEvidence.vardenafil.federationRule, "cmas");
  f.facts[0].specificUsage = "一般賽內期間";
  assert.throws(() => applyReferenceDecisions(f), /federation/);
});
