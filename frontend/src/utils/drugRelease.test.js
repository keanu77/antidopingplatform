import { describe, it, expect } from "vitest";
import { evaluateDrug } from "./tueDecision.js";
import validation from "../data/drugValidation.json";

describe("catalog release evidence boundaries", () => {
  it("keeps public TUE evaluation closed when source identity is absent or expired", () => {
    const rule = { prohibition: "not-prohibited", needsTUE: false };
    expect(evaluateDrug(rule, { asOf: "2026-10-23" }).verdict).toBe("unknown");
    const sourced = { ...rule, evidenceId: "drug:guanfacine", ruleVersion: "wada-2026" };
    expect(evaluateDrug(sourced, { asOf: "2026-10-23" }).verdict).toBe("permitted");
    expect(evaluateDrug(sourced, { asOf: "2027-01-01" }).verdict).toBe("unknown");
  });
  it("does not drop unresolved, conditional, conflicting or missing samples from the denominator", () => {
    expect(validation.directAgreement + validation.localUnresolved + validation.referenceConditional + validation.sourceConflict).toBe(validation.referenceFound);
    expect(validation.referenceFound + validation.referenceMissing).toBe(validation.sampleSize);
    const c = validation.supplementalContexts;
    expect(c.agreement + c.unresolved + c.pendingConflict).toBe(c.total);
  });
});
