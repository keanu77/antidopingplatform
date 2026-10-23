import { test } from "node:test";
import assert from "node:assert/strict";
import { tfdaEquivalentKey, tfdaPhysicalSpelling, rxnormPreciseIngredientKey } from "../scripts/lib/ingredient-identities.mjs";

test("only a complete official EQ TO assertion can supply an exact alias", () => {
  const keys = new Map([["PARACETAMOL", "paracetamol"], ["TRAMADOL", "tramadol"]]);
  const match = (n) => keys.get(n);
  assert.equal(tfdaEquivalentKey("ACETAMINOPHEN (EQ TO PARACETAMOL)", match), "paracetamol");
  for (const name of ["PARACETAMOL (EQ TO TRAMADOL)", "PARACETAMOL (EQ TO UNKNOWN", "PARACETAMOL (EQ TO NAME) WITH UNKNOWN", "PARACETAMOL + UNKNOWN (EQ TO NAME)", "PARACETAMOL (UNKNOWN)", "UNKNOWN (EQ TO NAME)"]) {
    assert.equal(tfdaEquivalentKey(name, match), null, name);
  }
});

test("solvate descriptors do not remove a second ingredient", () => {
  assert.equal(tfdaPhysicalSpelling("MAGNESIUM CHLORIDE HEXAHYDRATE"), "MAGNESIUM CHLORIDE");
  assert.equal(tfdaPhysicalSpelling("LINCOMYCIN (HCL H2O)"), "LINCOMYCIN (HCL )");
  assert.equal(tfdaPhysicalSpelling("ZINC SULFATE 7H₂O"), "ZINC SULFATE");
  assert.equal(tfdaPhysicalSpelling("Fluticasone furoate (micronised)"), "Fluticasone furoate ( )");
  assert.equal(tfdaPhysicalSpelling("MAGNESIUM SULFATE 7H2O + UNKNOWN"), "MAGNESIUM SULFATE + UNKNOWN");
  assert.equal(tfdaPhysicalSpelling("TRAMADOLH2O"), "TRAMADOLH2O");
  assert.equal(tfdaPhysicalSpelling("PARACETAMOL WITH UNKNOWN"), "PARACETAMOL WITH UNKNOWN");
});

test("NLM identity imports require a single active IN parent of a PIN, never brands or combinations", () => {
  const parent = { name: "known", tty: "IN", suppress: "N" };
  const fact = { precise: { tty: "PIN" }, parents: [parent] };
  const match = (n) => n === "known" ? "key" : null;
  assert.equal(rxnormPreciseIngredientKey(fact, match), "key");
  assert.equal(rxnormPreciseIngredientKey({ ...fact, precise: { tty: "BN" } }, match), null);
  assert.equal(rxnormPreciseIngredientKey({ ...fact, parents: [parent, { ...parent, name: "unknown" }] }, match), null);
  assert.equal(rxnormPreciseIngredientKey({ ...fact, parents: [{ ...parent, suppress: "Y" }] }, match), null);
  assert.equal(rxnormPreciseIngredientKey({ ...fact, parents: [{ ...parent, name: "unknown" }] }, match), null);
});
