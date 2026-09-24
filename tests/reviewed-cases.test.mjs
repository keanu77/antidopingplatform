import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, rmSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { build } from "../frontend/node_modules/esbuild/lib/main.js";
import { hasBan, banDurationCategory } from "../functions/_lib/case-outcome.mjs";
import { primarySource } from "../functions/_lib/case-statistics.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));
const cases = read("data/cases.json");
const additions = read("data/curated-cases.json");
const expectedTotal = 517;
const normalizeName = (s) => (s.replace(/\([^)]*\)|（[^）]*）/g, "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().match(/[a-z0-9]+/g) ?? []).sort().join(" ");
const byId = (id) => cases.find((c) => c.id === id);
const byBatch = (id) => cases.find((c) => c.review.batchId === id);
const batch = "docs/research/2026-09-22-case-corrections-batch-01";
const expansion = "docs/research/2026-09-22-expansion-500";
const bundle = await build({ entryPoints: [join(root, "functions/api/[[path]].js")], bundle: true, write: false, platform: "node", format: "esm" });
const { onRequest } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
async function api(path) {
  const url = new URL(path, "https://local.test");
  const response = await onRequest({ request: new Request(url), env: {}, params: { path: url.pathname.slice(5).split("/") } });
  return { status: response.status, data: await response.json() };
}

test("500 additions exclude baseline identities and retain honest evidence levels", () => {
  assert.equal(cases.length, expectedTotal);
  assert.equal(additions.length, 500);
  const oldNames = new Set(read(`${batch}/baseline-cases.json`).map((c) => normalizeName(c.athleteName)));
  assert.ok(additions.every((c) => !oldNames.has(normalizeName(c.athleteName))));
  assert.equal(new Set(cases.map((c) => c.id)).size, expectedTotal);
  const counts = cases.reduce((a, c) => ({ ...a, [c.review.status]: (a[c.review.status] || 0) + 1 }), {});
  assert.equal(counts.primary_excerpt_checked, 2);
  assert.equal(counts.core_checked, 515);
  assert.equal(counts.registry_checked || 0, 0);
  assert.equal((counts.registry_checked || 0) + counts.core_checked + counts.primary_excerpt_checked, expectedTotal);
  for (const c of cases) {
    assert.ok(!/台灣|臺灣|中華台北|Chinese Taipei|Taiwan|^TPE$|^TWN$/i.test(c.nationality));
    assert.ok(c.sourceLinks.length > 0);
    for (const s of c.sourceLinks) assert.match(s.url, /^https:\/\//);
    assert.ok(Number.isInteger(c.year) && c.year <= 2026);
    if (c.review.status === "registry_checked") {
      assert.ok(c.review.sourceLocator && c.review.nationalitySource && c.review.nationalityAsListed);
      assert.match(c.review.scope, /未逐份審閱裁決全文/);
      assert.equal(c.punishment.medalStripped, null);
      assert.doesNotMatch(c.substance, /Integrity Standard/);
    }
  }
});

test("first batch accepts 50 of 52, holding unresolved primary-source date conflicts", () => {
  const reviews = read(`${batch}/reviews.json`);
  assert.equal(reviews.filter((r) => r.disposition === "accepted").length, 50);
  assert.deepEqual(reviews.filter((r) => r.disposition === "held").map((r) => r.batchId), ["B01-16", "B01-45"]);
  assert.equal(cases.filter((c) => c.review.batchId).length, 50);
  assert.equal(byBatch("B01-16"), undefined);
  assert.equal(byBatch("B01-45"), undefined);
  assert.match(byBatch("B01-15").punishment.otherPenalties, /2028-12-21/);
  assert.equal(byBatch("B01-51").punishment.banDuration, "2年");
  assert.equal(byBatch("B01-41").punishment.resultsCancelled, null);
  assert.equal(byBatch("B01-48").punishment.resultsCancelled, null);
});

test("individual corrections preserve original registry records for comparison", () => {
  const originals = new Map([
    ...read(`${expansion}/registry-candidates.json`),
    ...read(`${expansion}/announcement-reviewed-cases.json`),
  ].map(c => [c.id, c]));
  const individuallyReviewed = additions.filter(c => c.review.individualReviewId);
  assert.equal(individuallyReviewed.length, 450);
  for (const c of individuallyReviewed) {
    assert.deepEqual(c.registryRecordAsPublished, originals.get(c.id).officialRecord, c.id);
    assert.equal(c.review.status, "core_checked");
    assert.ok(c.review.registrySourceLocator && c.review.sourceLocator);
  }
});

test("no sanction, lawful TUE, overturned findings and no-fault ADRV remain distinct", () => {
  for (const id of ["41", "48", "58", "59"]) assert.equal(hasBan(byId(id)), false);
  assert.equal(hasBan(byBatch("B01-49")), false);
  assert.equal(hasBan(byBatch("B01-50")), false);
  assert.match(byBatch("B01-49").punishment.banDuration, /違規成立/);
  assert.match(byBatch("B01-50").review.caseType, /未提出違規指控/);
  assert.match(byId("48").review.caseType, /合法 TUE/);
  assert.match(byId("58").review.caseType, /處分撤銷/);
});

test("individual evidence overrides wrong links, provisional notices and outdated outcomes", () => {
  assert.equal(byId("ita-e7c9638b8a24"), undefined);
  assert.match(byId("ita-097e950d5957").sourceLinks[0].url, /mazhit-sardarov/);
  assert.match(byId("ita-51c526c62685").sourceLinks[0].url, /aidyn-tolepbayev/);
  assert.match(byId("ita-e480a4db0b21").sourceLinks[0].url, /accepted-a-two-year-sanction/);
  assert.equal(byId("ita-53e58cf7fa92").punishment.resultsCancelled, false);
  assert.match(byId("ita-53e58cf7fa92").punishment.otherPenalties, /2027-03-30/);
  assert.match(byId("ita-53e58cf7fa92").registryRecordAsPublished.disqualification, /11 October 2023/);
  assert.equal(byId("ita-f81d31071239").punishment.resultsCancelled, null);
});

test("official announcements retain accepted reviews and integrate later sanctions and prospective TUEs", () => {
  const accepted = read(`${expansion}/individual-case-reviews.json`).filter(r => r.disposition === "accepted");
  for (const review of accepted) assert.ok(additions.some(c => c.id === review.caseId), `Accepted review lost: ${review.caseId}`);
  assert.equal(byId("usada-ccd3766a65f8").punishment.banDuration, "18個月");
  assert.equal(byId("usada-7774f20822ed").punishment.banDuration, "39個月");
  const warning = byId("usada-30c9fa7aa386");
  assert.equal(hasBan(warning), false);
  assert.equal(warning.punishment.resultsCancelled, false);
  assert.match(warning.educationalNotes, /未來/);
  assert.match(warning.review.nationalitySource, /teamusa.com/);
});

test("later reductions, national identity and historical IV rules survive rebuilding", () => {
  const paparella = byId("usada-d8d5e2c3a318");
  assert.equal(paparella.nationality, "巴西");
  assert.match(paparella.punishment.otherPenalties, /2021-01-04 終止/);
  assert.equal(byId("usada-80101a12888d").punishment.banDuration, "3年（原4年）");
  assert.equal(byId("usada-5541522b98d9").athleteName, "Cory Scott Juneau");
  const iv = byId("usada-74c3aeb782a0");
  assert.match(iv.substance, /六小時.*50 mL/);
  assert.equal(iv.punishment.banDuration, "14個月");
});

test("public warnings do not become bans or unsupported positive tests and disqualifications", () => {
  const warnings = cases.filter(c => /公開警告/.test(c.punishment.banDuration));
  assert.ok(warnings.length > 20);
  for (const c of warnings) assert.equal(hasBan(c), false, c.athleteName);
  const licon = byId("usada-a00b98f42826");
  assert.equal(licon.punishment.resultsCancelled, null);
  assert.match(licon.eventBackground, /陰性/);
});

test("corrections preserve separate Sun Yang events and numeric duration categories", () => {
  assert.equal(byId("65").year, 2014);
  assert.equal(byId("sun-yang-2018").year, 2018);
  assert.match(byId("65").substanceCategory, /S6/);
  assert.equal(byId("65").punishment.resultsCancelled, null);
  assert.equal(banDurationCategory(byId("sun-yang-2018")), "4年以上");
  assert.equal(banDurationCategory(byId("9")), "4年以上");
  assert.equal(banDurationCategory(byId("8")), "7-12個月");
  assert.equal(banDurationCategory(byId("13")), "1-2年");
  assert.equal(banDurationCategory(byId("58")), "無禁賽／處分撤銷");
});

test("legacy records are accounted for without keeping unsupported narratives public", async () => {
  const baseline = read(`${batch}/baseline-cases.json`);
  const pending = read(`${expansion}/legacy-pending-cases.json`);
  const corrections = read("data/case-corrections.json");
  assert.equal(baseline.length, 171);
  assert.equal(pending.length, 141);
  assert.equal(corrections.quarantine.length, 13);
  const accounted = [...pending.map((c) => c.id), ...corrections.quarantine.map((c) => c.id), ...corrections.corrections.map((c) => c.id), ...Object.keys(corrections.redirects)];
  assert.equal(accounted.length, 171);
  assert.equal(new Set(accounted).size, 171);
  for (const c of [...pending, ...corrections.quarantine]) {
    assert.equal(byId(c.id), undefined);
    assert.equal((await api(`/api/cases/${c.id}`)).status, 404);
  }
  const merged = await api("/api/cases/135");
  assert.equal(merged.status, 200);
  assert.equal(merged.data.id, "134");
});

test("all detail routes and pagination reflect the 500 additions plus legacy corrections", async () => {
  const ids = [];
  for (let page = 1; page <= Math.ceil(expectedTotal / 50); page++) {
    const { status, data } = await api(`/api/cases?limit=50&page=${page}`);
    assert.equal(status, 200);
    assert.equal(data.totalCases, expectedTotal);
    assert.equal(data.totalPages, Math.ceil(expectedTotal / 50));
    assert.equal(data.cases.length, Math.min(50, expectedTotal - (page - 1) * 50));
    assert.ok(data.cases.every((c) => c.review && !("eventBackground" in c)));
    ids.push(...data.cases.map((c) => c.id));
  }
  assert.equal(new Set(ids).size, expectedTotal);
  for (const c of cases) {
    const { status, data } = await api(`/api/cases/${c.id}`);
    assert.equal(status, 200);
    assert.deepEqual(data, { ...c, _id: c.id });
  }
  assert.equal((await api("/api/cases?search=Peter%20Bol")).data.totalCases, 1);
  assert.equal((await api("/api/cases?search=Parveen%20Sharma")).data.totalCases, 0);
  const bans = (await api("/api/cases?punishmentType=%E7%A6%81%E8%B3%BD&limit=100")).data;
  assert.equal(bans.totalCases, cases.filter(hasBan).length);
  assert.ok(bans.cases.every(hasBan));
  assert.equal((await api("/api/stats/overview")).data.totalCases, expectedTotal);
  assert.equal((await api("/api/stats/ban-duration-distribution")).data.reduce((n, r) => n + r.count, 0), expectedTotal);
});

test("analysis keeps full denominators, unknown outcomes and actual independent coverage", async () => {
  const { status, data } = await api("/api/stats/review-summary");
  assert.equal(status, 200);
  assert.equal(data.totalCases, expectedTotal);
  assert.equal(data.newCases, 500);
  assert.equal(data.correctedLegacyCases, 17);
  assert.equal(data.coreChecked, 515);
  assert.equal(data.primaryExcerptChecked, 2);
  assert.equal(data.sourceCompared, 500);
  assert.equal(data.comparedByAtLeastTwo, 500);
  assert.equal(data.comparedByThree, cases.filter(c => c.review.sourceComparison.modelSeats.length >= 3).length);
  assert.equal(data.comparedByFour, cases.filter(c => c.review.sourceComparison.modelSeats.length === 4).length);
  const roundDir = join(root, "data/country-followups");
  const overlays = [read("data/case-source-followups.json"),
    ...(existsSync(roundDir) ? readdirSync(roundDir).filter(f => f.endsWith(".json")).map(f => read(`data/country-followups/${f}`)) : [])];
  const countryChanges = overlays.flatMap(o => o.countryChanges);
  assert.equal(new Set(countryChanges.map(c => c.id)).size, countryChanges.length, "A case may be resolved by only one round");
  assert.equal(data.countryEvidencePending, 258 - countryChanges.length,
    "Only individually accepted official-source follow-ups may resolve a title-only gap");
  assert.equal(data.countrySourceFollowups, countryChanges.length);
  assert.equal(data.countryEvidencePending, cases.filter(c => c.review.countryEvidence?.status === "title_only").length);
  const confirmedCountry = cases.filter(c => c.review.countryEvidence?.status !== "title_only");
  assert.equal(data.countryConfirmedDenominator, confirmedCountry.length);
  assert.equal(data.countryConfirmedDenominator + data.countryEvidencePending, expectedTotal);
  assert.equal(data.countryConfirmedDistribution.reduce((sum, row) => sum + row.count, 0), confirmedCountry.length,
    "Pending title-only countries must stay out of the confirmed-country denominator");
  assert.equal(data.countryConfirmedDistribution.find(row => row.country === "美國")?.count,
    confirmedCountry.filter(c => c.nationality === "美國").length);
  const countryRows = (await api("/api/stats/country-distribution")).data;
  const us = countryRows.find(row => row.country === "美國");
  assert.equal(us.confirmed + us.pending, us.count);
  assert.equal(us.pending, cases.filter(c => c.nationality === "美國" && c.review.countryEvidence?.status === "title_only").length);
  for (const seat of ["GPT", "Gemini", "Grok", "Claude"]) {
    assert.equal(data.modelCoverage[seat], cases.filter(c => c.review.sourceComparison.modelSeats.includes(seat)).length);
  }
  assert.equal(data.sourceDistribution.reduce((sum, row) => sum + row.count, 0), expectedTotal);
  assert.equal(primarySource(byId("ita-ac5538c7a75e")), "ITA", "IWF is the governing federation; ITA published the first source");
  assert.equal(data.sourceDistribution.find(row => row.source === "AIU")?.count,
    cases.filter(c => new URL(c.sourceLinks[0].url).hostname === "www.athleticsintegrity.org").length);
  assert.ok(!data.sourceDistribution.some(row => /World Athletics|IWF/.test(row.source)));
  for (const field of ["resultsCancelled", "medalStripped"]) {
    assert.equal(Object.values(data[field]).reduce((sum, n) => sum + n, 0), expectedTotal);
    assert.equal(data[field].unknown, cases.filter((c) => c.punishment[field] == null).length);
  }
  const categories = (await api("/api/stats/substance-distribution")).data;
  const unclassified = cases.filter(c => c.substanceCategory === "年度禁用清單分類未另核對");
  assert.equal(unclassified.length, 190);
  assert.equal(categories.reduce((sum, row) => sum + row.count, 0), expectedTotal - unclassified.length);
  assert.ok(!categories.some(row => /未.*核對|未標示/.test(row.category)));
  assert.equal((await api("/api/cases?limit=1")).data.totalCases, expectedTotal, "chart exclusions must not delete case records");
  assert.ok(categories.some((row) => row.category === "其他標籤" && row.count > 0));
  assert.equal(byId("usada-a00b98f42826").review.countryEvidence.status, "official_country_as_listed");
  assert.equal(byId("usada-d8d5e2c3a318").review.countryEvidence, undefined);
  assert.doesNotMatch(byId("usada-d8d5e2c3a318").punishment.banDuration, /服刑/);
});

test("all 500 source comparisons retain version boundaries and adjudicated source limits", () => {
  const audit = read("data/case-model-reviews.json");
  const coverage = read("docs/research/2026-09-23-full-audit/case-coverage.json");
  assert.equal(audit.cases.length, 500);
  assert.deepEqual(new Set(audit.cases.map(c => c.id)), new Set(additions.map(c => c.id)));
  assert.ok(coverage.every(c => c.coverageComplete && c.unadjudicatedFindings.length === 0));
  for (const c of audit.cases) {
    assert.ok(new Set(c.modelSeats).size >= 2);
    assert.deepEqual(byId(c.id).review.sourceComparison.modelSeats, c.modelSeats);
    assert.match(c.auditedClaimsSha256, /^[a-f0-9]{64}$/);
  }
  assert.doesNotMatch(byId("ita-cd187870e58d").summary, /污染/);
  assert.equal(byId("ita-3bea7cef0331").punishment.resultsCancelled, true);
  assert.ok(byId("aiu-dbc9a1f66bb9").review.sourceComparison.unresolvedSourceFields.includes("dates"));
  assert.equal(byId("usada-557b3d045e61").review.countryEvidence.status, "title_only");
  assert.equal(byId("ita-cd187870e58d").review.sourceComparison.claimsChangedAfterReview, true);
  assert.equal(byId("usada-671281fb69ce").review.sourceComparison.claimsChangedAfterReview, false,
    "Rejecting a self-contradictory model finding must not change a supported sanction");
});

test("country follow-ups keep historical scope, model boundaries and unresolved identities", () => {
  const followup = read("data/case-source-followups.json");
  const countryCoverage = read("docs/research/2026-09-24-source-followup/case-coverage.json");
  const fullAudit = read("data/case-model-reviews.json");
  assert.equal(countryCoverage.length, 44);
  assert.equal(followup.countryChanges.length, 43);
  for (const fix of followup.countryChanges) {
    const c = byId(fix.id);
    const answer = countryCoverage.find((r) => r.id === fix.id);
    assert.ok(answer.coverageComplete && new Set(answer.modelSeats).size >= 2);
    assert.equal(c.review.countryEvidence.status, "official_country_as_listed");
    assert.equal(c.review.nationalitySource, fix.sourceUrl);
    assert.ok(!c.review.sourceComparison.unresolvedSourceFields.includes("country"));
    assert.ok(c.review.sourceComparison.auditedUnresolvedSourceFields.includes("country"));
    assert.deepEqual(c.review.sourceComparison.modelSeats, fullAudit.cases.find((r) => r.id === fix.id).modelSeats,
      "Country-only model work must not inflate full-case audit coverage");
    for (const ref of fix.sourceRefs) {
      assert.match(ref.url, /^https:\/\//);
      assert.match(ref.rawSha256, /^[a-f0-9]{64}$/);
      assert.match(ref.textSha256, /^[a-f0-9]{64}$/);
    }
  }
  const scherf = byId("usada-091e5bf27388");
  assert.equal(scherf.review.countryEvidence.status, "title_only");
  assert.equal(scherf.review.countryFollowup.resolution, "held");
  const oliver = byId("usada-792c30cdc646");
  assert.equal(oliver.nationality, "美國");
  assert.match(oliver.review.countryEvidence.note, /2016.*USA.*2025.*JAM/);
  assert.ok(oliver.review.countryEvidence.modelReview.annotationUpdatedAfterReview);
  assert.equal(followup.dateChecks.length, 7);
  for (const check of followup.dateChecks) {
    assert.ok(byId(check.id).review.sourceComparison.unresolvedSourceFields.includes("dates"));
    assert.equal(byId(check.id).review.dateFollowup.checkedAt, "2026-09-24");
  }
});

test("baseline is immutable and production dataset rebuild is reproducible", () => {
  assert.equal(createHash("sha256").update(readFileSync(join(root, batch, "baseline-cases.json"))).digest("hex"), "a2b569c398bd0592522a008b67bcb3525de8e5192cca96378ec43a00e1401da6");
  const temp = mkdtempSync(join(tmpdir(), "antidoping-reviewed-test-"));
  try {
    const out = join(temp, "cases.json");
    execFileSync(process.execPath, [resolve(root, "scripts/rebuild-dataset.mjs"), "--out", out]);
    assert.deepEqual(JSON.parse(readFileSync(out, "utf8")), cases);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});

test("later country rounds apply only reviewed changes and keep held cases unresolved", () => {
  const roundDir = join(root, "data/country-followups");
  if (!existsSync(roundDir)) return;
  for (const file of readdirSync(roundDir).filter(f => f.endsWith(".json"))) {
    const overlay = read(`data/country-followups/${file}`);
    for (const fix of overlay.countryChanges) {
      const c = byId(fix.id);
      assert.equal(c.review.countryEvidence.status, "official_country_as_listed", fix.id);
      assert.ok(fix.modelReview.modelSeats.length >= 2, `${fix.id} needs two model families`);
      assert.ok(fix.sourceRefs.every(r => /^[0-9a-f]{64}$/.test(r.textSha256)), `${fix.id} source hash`);
      assert.equal(c.review.countryFollowup, undefined, `${fix.id} must not keep a held note`);
    }
    for (const held of overlay.heldCountryChecks) {
      const c = byId(held.id);
      assert.equal(c.review.countryEvidence.status, "title_only", held.id);
      assert.equal(c.review.countryFollowup.resolution, "held", held.id);
    }
  }
});
