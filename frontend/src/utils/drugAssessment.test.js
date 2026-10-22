import { describe, it, expect } from "vitest";
import { assessDrugProduct, matchDrugIngredient, DRUG_RULE_COUNT } from "./drugAssessment.js";
import { taiwanDate } from "./drugCatalog.js";

const product = (...ingredientNames) => ({ ingredientNames, conflictingFields: [] });
const context = { date: "2026-10-23", inCompetition: true };
const assess = (p, options = {}) => assessDrugProduct(p, { ...context, ...options });

describe("TFDA ingredient matching and whole-product assessment", () => {
  it("uses exact ingredient names, explicit aliases and whole salt suffixes", () => {
    expect(matchDrugIngredient("TRAMADOL HCL").key).toBe("tramadol");
    expect(matchDrugIngredient("ＦＯＲＭＯＴＥＲＯＬ FUMARATE DIHYDRATE").key).toBe("formoterol");
    expect(matchDrugIngredient("SALBUTAMOL (SULFATE)").key).toBe("salbutamol");
    expect(matchDrugIngredient("ACETAMINOPHEN").key).toBe("paracetamol");
    expect(matchDrugIngredient("ACETAMINOPHEN (EQ TO PARACETAMOL)").key).toBe("paracetamol");
    expect(matchDrugIngredient("DL-METHYLEPHEDRINE HCL").key).toBe("methylephedrine");
    expect(matchDrugIngredient("INSULIN GLARGINE").rule.wadaCode).toBe("S4.4.2");
    expect(matchDrugIngredient("EPOETIN ALFA").rule.wadaCode).toBe("S2.1.1");
    expect(matchDrugIngredient("METHYLPREDNISOLONE").key).toBe("methylprednisolone");
    expect(matchDrugIngredient("PSEUDOEPHEDRINE HCL").key).toBe("pseudoephedrine");
    expect(matchDrugIngredient("prednisolone-like unknown compound")).toBeNull();
    expect(matchDrugIngredient("舒喘寧")).toBeNull();
    expect(matchDrugIngredient("TRAMADOL WITH UNKNOWN")).toBeNull();
  });
  it("never treats a missing component or an unknown mixture as permission", () => {
    expect(assess(product()).verdict).toBe("unresolved");
    expect(assess(product("unknown drug")).verdict).toBe("unresolved");
    expect(assess(product("PARACETAMOL", "unknown drug")).verdict).toBe("unresolved");
    expect(assess(product("TRAMADOL HCL", "unknown drug")).verdict).toBe("restricted");
    expect(assess(product("TRAMADOL HCL", "unknown drug")).incomplete).toBe(true);
  });
  it("a nonrestricted constituent never hides the restricted constituent", () => {
    const p = product("PARACETAMOL", "TRAMADOL HCL");
    expect(assess(p).verdict).toBe("restricted");
    expect(assess(p, { inCompetition: false }).verdict).toBe("no-listed-restriction");
    expect(assess(p, { inCompetition: false }).notices.join(" ")).toContain("賽內檢體");
  });
  it("S3 inhalation remains conditional and carries both dose windows", () => {
    const p = product("FORMOTEROL FUMARATE DIHYDRATE");
    expect(assess(p).verdict).toBe("conditional");
    expect(assess(p, { route: "oral" }).verdict).toBe("restricted");
    const r = assess(p, { route: "inhaled", s5Concomitant: "none" });
    expect(r.verdict).toBe("conditional");
    expect(r.ingredients[0].assessment.threshold).toMatch(/54.*12.*36/);
    expect(assess(p, { route: "inhaled" }).ingredients[0].assessment.verdict).toBe("conditions-required");
  });
  it("S5 contained in the same combination overrides the inhalation exception", () => {
    const r = assess(product("SALBUTAMOL SULFATE", "HYDROCHLOROTHIAZIDE"), { route: "inhaled", s5Concomitant: "none" });
    expect(r.containsS5).toBe(true);
    expect(r.ingredients[0].assessment.verdict).toBe("needs-tue");
    expect(r.ingredients[0].assessment.threshold).toBeNull();
    expect(r.verdict).toBe("restricted");
  });
  it("S9 route distinctions apply without guessing route from dosage form", () => {
    const p = { ...product("FLUTICASONE PROPIONATE"), dosageForm: "口腔吸入劑" };
    expect(assess(p).verdict).toBe("conditional");
    expect(assess(p, { route: "injection" }).verdict).toBe("restricted");
    expect(assess(p, { route: "inhaled" }).verdict).toBe("no-listed-restriction");
    expect(assess(p, { route: "inhaled" }).ingredients[0].assessment.reasons.join(" ")).toContain("核准劑量");
    expect(assess(p, { inCompetition: false }).notices.join(" ")).toContain("賽內檢體");
  });
  it("P1 applies to ophthalmic timolol and current CMAS/mini-golf rules", () => {
    const p = product("TIMOLOL MALEATE");
    expect(assess(p, { route: "topical" }).verdict).toBe("conditional");
    expect(assess(p, { sport: "射箭", route: "topical", inCompetition: false }).verdict).toBe("restricted");
    expect(assess(p, { sport: "自由潛水（CMAS）", inCompetition: false }).verdict).toBe("restricted");
    expect(assess(p, { sport: "迷你高爾夫", inCompetition: false }).verdict).toBe("no-listed-restriction");
    expect(assess(p, { sport: "迷你高爾夫", inCompetition: true }).verdict).toBe("restricted");
  });
  it("supplemental named examples preserve correct categories and do not override base rules", () => {
    expect(DRUG_RULE_COUNT).toBeGreaterThan(140);
    expect(matchDrugIngredient("BUPRENORPHINE HCL").rule.wadaCode).toBe("S7");
    expect(matchDrugIngredient("TAMOXIFEN CITRATE").rule.wadaCode).toBe("S4.2");
    expect(matchDrugIngredient("ACETAZOLAMIDE").rule.wadaCode).toBe("S5");
    expect(matchDrugIngredient("CLENBUTEROL HCL").rule.wadaCode).toBe("S1.2");
    expect(matchDrugIngredient("DORZOLAMIDE")).toBeNull();
  });
  it("future and previous year queries suppress individual permissions too", () => {
    for (const date of ["2027-01-01", "2025-12-31", "", "not-a-date", "2026-02-30"]) {
      const r = assess(product("PARACETAMOL"), { date });
      expect(r.verdict).toBe("outdated-rules");
      expect(r.ingredients[0].assessment.verdict).toBe("unknown");
    }
    expect(assess(product("PARACETAMOL"), { date: "2026-12-31" }).verdict).toBe("no-listed-restriction");
  });
  it("uses the Taiwan calendar day at the annual rule boundary", () => {
    expect(taiwanDate(new Date("2026-12-31T17:00:00Z"))).toBe("2027-01-01");
  });
  it("source conflicts cannot yield a whole-product unrestricted result", () => {
    expect(assess({ ...product("PARACETAMOL"), conflictingFields: ["主成分略述"] }).verdict).toBe("unresolved");
  });
});
