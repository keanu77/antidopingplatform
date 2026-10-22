import { describe, expect, it } from "vitest";
import { reviewProductEvidence } from "./productEvidence.js";

describe("food and herbal evidence never becomes a product clearance", () => {
  it("keeps missing and apparently unrestricted ingredients unverified", () => {
    for (const ingredientNames of [[], ["CREATINE"], ["PARACETAMOL"], ["UNLISTED EXTRACT"]]) {
      const result = reviewProductEvidence({ ingredientNames, compositionScope: "source-declared" }, "2026-10-23");
      expect(result.status).toBe("unverified");
      expect(result.label).toBe("尚不能判定運動員可用");
      expect(result.batchLabel).toContain("沒有");
    }
  });
  it("flags exact prohibited chemical names without guessing a botanical formula", () => {
    const result = reviewProductEvidence({ ingredientNames: ["DHEA", "PSEUDOEPHEDRINE HCL", "麻黃湯"] }, "2026-10-23");
    expect(result.status).toBe("unverified");
    expect(result.flags.map((flag) => flag.code)).toEqual(["S1.1", "S6"]);
    expect(result.flags.some((flag) => flag.name === "麻黃湯")).toBe(false);
  });
  it("distinguishes partial health effect composition from a full ingredient list", () => {
    expect(reviewProductEvidence({ compositionScope: "health-effect-components" }).compositionLabel).toContain("不是完整配方");
    expect(reviewProductEvidence({ compositionScope: "not-provided" }).compositionLabel).toContain("未提供完整處方");
  });
  it("stops chemical flags for future, prior and invalid dates", () => {
    for (const date of ["2027-01-01", "2025-12-31", "2026-02-31", "bad"]) {
      const result = reviewProductEvidence({ ingredientNames: ["DHEA"] }, date);
      expect(result.rulesCurrent).toBe(false);
      expect(result.flags).toEqual([]);
      expect(result.status).toBe("unverified");
    }
  });
});
