import test from "node:test";
import assert from "node:assert/strict";
import { measureDrugCoverage } from "../scripts/lib/drug-coverage.mjs";
const match = (name) => name === "known" ? { key: "known" } : null;
const p = (names, extra = {}) => ({ license: "test", ingredientNames: names, cancellation: "", licenseType: "製　劑", ...extra });
test("missing compositions remain visible in all-product coverage", () => {
  const r = measureDrugCoverage([p(["known"]), p([]), p(["unknown"]), p(["known"], { cancellation: "已註銷" })], match);
  assert.equal(r.target.total, 2);
  assert.equal(r.target.coveragePercent, 50);
  assert.equal(r.cohorts.uncancelled.total, 3);
  assert.equal(r.cohorts.uncancelled.missingComposition, 1);
  assert.equal(r.target.targetMet, false);
  assert.equal(r.workloadProjection.additionalNamesByFrequencyForTarget, 1);
});
test("partial formulas, source conflicts and empty cohorts cannot pass", () => {
  const r = measureDrugCoverage([p(["known", "unknown"]), p(["known"], { conflictingFields: ["主成分略述"] })], match);
  assert.equal(r.target.fullyNameMapped, 1);
  assert.equal(r.target.fullyMappedWithoutSourceConflict, 0);
  assert.equal(r.workloadProjection.additionalNamesByFrequencyForTarget, null);
  assert.equal(measureDrugCoverage([], match).target.targetMet, false);
});
test("95 percent requires 19 of 20; never rounds a lower result up", () => {
  const rows = Array.from({ length: 20 }, (_, i) => p([i < 18 ? "known" : "unknown"]));
  assert.equal(measureDrugCoverage(rows, match).target.targetMet, false);
  rows[18] = p(["known"]);
  assert.equal(measureDrugCoverage(rows, match).target.targetMet, true);
  assert.throws(() => measureDrugCoverage(rows, match, 1000));
});
test("97, 98 and 99 percent milestones share the denominator and exclude source conflicts", () => {
  const rows = Array.from({ length: 100 }, (_, i) => p([i < 97 ? "known" : "unknown"]));
  rows[0].conflictingFields = ["主成分略述"];
  rows.push(p([]), p(["known"], { cancellation: "已註銷" }));
  const r = measureDrugCoverage(rows, match);
  assert.equal(r.target.percent, 95);
  assert.equal(r.target.total, 100);
  assert.deepEqual(r.milestones.map(({ percent, total, targetProducts, remainingProducts, targetMet }) =>
    ({ percent, total, targetProducts, remainingProducts, targetMet })), [
    { percent: 95, total: 100, targetProducts: 95, remainingProducts: 0, targetMet: true },
    { percent: 97, total: 100, targetProducts: 97, remainingProducts: 1, targetMet: false },
    { percent: 98, total: 100, targetProducts: 98, remainingProducts: 2, targetMet: false },
    { percent: 99, total: 100, targetProducts: 99, remainingProducts: 3, targetMet: false },
  ]);
  assert.ok(measureDrugCoverage([], match).milestones.every((m) => !m.targetMet));
  assert.equal(measureDrugCoverage(rows, match, 99).target.targetMet, false);
});
