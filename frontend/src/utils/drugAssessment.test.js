import { describe, it, expect } from "vitest";
import { assessDrugProduct, matchDrugIngredient, DRUG_RULE_COUNT } from "./drugAssessment.js";
import { taiwanDate } from "./drugCatalog.js";

const product = (...ingredientNames) => ({ ingredientNames, conflictingFields: [] });
const context = { date: "2026-10-23", inCompetition: true };
const assess = (p, options = {}) => assessDrugProduct(p, { ...context, ...options });

describe("TFDA ingredient matching and whole-product assessment", () => {
  it("keeps pending riociguat CMAS scope conditional without declaring a prohibition", () => {
    for (const inCompetition of [true, false]) {
      for (const sport of [null, "自由潛水（CMAS）", "其他 CMAS 賽事"]) {
        const result = assess(product("RIOCIGUAT"), { route: "oral", sport, inCompetition });
        expect(result.verdict).toBe("conditional");
        expect(result.ingredients[0].assessment.reasons.join(" ")).toContain("仍待裁定");
        expect(result.ingredients[0].federationEvidence.url).toContain("20743");
      }
      expect(assess(product("RIOCIGUAT"), { route: "oral", sport: "其他運動", inCompetition }).verdict).toBe("no-listed-restriction");
      expect(assess(product("RIOCIGUAT", "MANNITOL"), { route: "intravenous", inCompetition }).verdict).toBe("restricted");
    }
    expect(assess(product("RIOCIGUAT"), { route: "oral", date: "2027-01-01" }).verdict).toBe("outdated-rules");
  });
  it("retains source-backed catalog rules and the base evidence expiry guard", () => {
    // The production registry keeps this base source pending; catalog identity is not evidence approval.
    expect(assess(product("ACETAMINOPHEN"), { route: "oral" }).verdict).toBe("unresolved");
    expect(assess(product("TRAMADOL"), { route: "oral" }).verdict).toBe("restricted");
    expect(assess(product("ACETAMINOPHEN"), { date: "2027-01-01" }).verdict).toBe("outdated-rules");
  });
  it("named clove materials retain S3 without treating oils or all Eugenia species as the same material", () => {
    for (const name of ["CLOVE", "CLOVE POWDER", "CLOVE FLOWER", "CARYOPHILLI FLOS POWDER", "CARYOPHILLI FLORES", "FLOS CARYOPHYLLI", "CARYOPHILLIN POWDER", "CARYOPHYLLUS", "EUGENIA POWDER"]) {
      expect(matchDrugIngredient(name).rule.wadaCode).toBe("S3");
      expect(matchDrugIngredient(name).key).not.toBe("higenamine");
      for (const inCompetition of [true, false]) expect(assess(product(name, "GLYCYRRHIZA POWDER"), { route: "oral", inCompetition }).verdict).toBe("restricted");
      expect(assess(product(name), { date: "2027-01-01" }).verdict).toBe("outdated-rules");
    }
    for (const name of ["CLOVE UNKNOWN EXTRACT", "EUGENIA", "EUGENIA UNKNOWN SPECIES", "CITRUS SINENSIS POWDER", "MYRISTICA POWDER", "CNIDIUM RHIZOME", "COPTIS RHIZOME", "CYPERUS RHIZOME", "JAPANESE ANGELICA ROOT", "REHMANNIA ROOT"]) expect(matchDrugIngredient(name)).toBeNull();
    expect(assess(product("CLOVE OIL"), { route: "oral" }).verdict).toBe("unresolved");
    expect(assess(product("CLOVE OIL"), { route: "dermal" }).verdict).toBe("no-listed-restriction");
  });
  it("reviewed coagulation proteins and microbubble agents retain exact identities and IV scope", () => {
    for (const name of ["Antihemophilic Factor (Recombinant), Fc Fusion Protein", "Perfluorobutane microbubbles", "Sulphur hexafluoride microbubbles"]) {
      expect(assess(product(name)).verdict).toBe("conditional");
      const iv = assess(product(name), { route: "intravenous" });
      expect(iv.verdict).toBe("no-listed-restriction");
      expect(iv.notices.join(" ")).toContain("M2");
      expect(assess(product(name), { route: "oral" }).verdict).toBe("unresolved");
      expect(assess(product(name), { route: "intravenous", date: "2027-01-01" }).verdict).toBe("outdated-rules");
      expect(assess(product(name, "MANNITOL"), { route: "intravenous" }).verdict).toBe("restricted");
    }
    for (const name of ["Perfluorobutane", "Antihemophilic Factor (Recombinant), Unknown Fusion Protein", "HUMAN PLASMA PROTEINS"]) expect(matchDrugIngredient(name)).toBeNull();
  });
  it("succinyl gelatin does not inherit the oral gelatin reference", () => {
    expect(matchDrugIngredient("SUCCINYL GELATIN").rule.wadaCode).toBe("S5");
    expect(matchDrugIngredient("SUCCINYL GELATIN").key).not.toBe("gelatin");
    for (const inCompetition of [true, false]) {
      const result = assess(product("SUCCINYL GELATIN", "SODIUM CHLORIDE"), { route: "intravenous", inCompetition });
      expect(result.verdict).toBe("restricted");
      expect(result.containsS5).toBe(true);
    }
    expect(assess(product("SUCCINYL GELATIN")).verdict).toBe("conditional");
    expect(assess(product("GELATIN"), { route: "oral" }).verdict).toBe("no-listed-restriction");
    expect(assess(product("GELATIN"), { route: "intravenous" }).verdict).toBe("unresolved");
  });
  it("whole medicinal botanical references cannot erase route limits or restricted partners", () => {
    for (const name of ["POLYMAGAL", "Micronized purified flavonoid fraction", "APRICOT KERNEL POWDER", "GINSENG POWDER", "POWDERED PLATYCODON ROOT", "GLYCYRRHIZA RADIX", "Sennosides 80% (with maltodextrin)"]) {
      expect(assess(product(name)).verdict).toBe("conditional");
      expect(assess(product(name), { route: "oral" }).verdict).toBe("no-listed-restriction");
      expect(assess(product(name), { route: "intravenous" }).verdict).toBe("unresolved");
      expect(assess(product(name, "OPIUM"), { route: "oral" }).verdict).toBe("restricted");
    }
    for (const name of ["GINSENG WITH UNKNOWN", "APRICOT KERNEL UNKNOWN EXTRACT", "Sennosides 80% (with unknown)", "BIFIDOBACTERIUM", "VITAMIN K ACTIVITY"]) expect(matchDrugIngredient(name)).toBeNull();
    expect(matchDrugIngredient("Micronized purified flavonoid fraction").key).not.toBe("diosmin");
    expect(matchDrugIngredient("PASINIAZIDE (ISONIAZIDE 4-AMINOSALICYLATE)").key).not.toBe("isoniazid");
  });
  it("new identity reviews retain S2, S4, S5 and S9 conditions and isotope identity", () => {
    for (const name of ["BIOSYNTHETIC HUMAN GROWTH HORMONE", "INSULIN MONOCOMPONENT, HUMAN"]) expect(assess(product(name), { inCompetition: false }).verdict).toBe("restricted");
    expect(assess(product("HYDROCORTISONE 17-BUTYRATE"), { route: "oral" }).verdict).toBe("restricted");
    expect(assess(product("HYDROCORTISONE 17-BUTYRATE"), { route: "dermal" }).verdict).toBe("conditional");
    const hes = "POLY(O-2 HYDROXYETHYL)STARCH (MOLAR SUBS 0.38-0.45; AVERAGE MOLECULAR WEIGHT 130000)";
    expect(assess(product(hes), { route: "intravenous" }).verdict).toBe("restricted");
    expect(matchDrugIngredient("Radioactive sodium molybdate （99Mo）solution").key).toBe("sodium molybdate mo-99");
    expect(matchDrugIngredient("Radioactive sodium molybdate （98Mo）solution")).toBeNull();
    expect(matchDrugIngredient("Radium-223 chloride").key).toBe("radium-223 dichloride");
    expect(matchDrugIngredient("Radium-226 chloride")).toBeNull();
  });
  it("single-ingredient medicinal materials keep their reviewed route and exact identity", () => {
    const oral = ["DIASTASE", "SEAPROSE S", "PLATYCODON FLUID EXTRACT", "GLYCYRRHIZA POWDER", "GLYCYRRHIZA (LIQUORICE)", "CASCARA SAGRADA EXTRACT", "CASCARA DRY EXTRACT", "CLOSTRIDIUM BUTYRICUM MIYAIRI", "BACILLUS COAGULANS", "LACTOBACILLI ACIDOPHILUS", "LACTOBACILLUS RHAMNOSUS", "SACCHAROMYCES BOULARDII CNCM I-745", "DIASTASE ASPERGILLUS ORYZAE(DIASTASE TAKA)"];
    const dermal = ["CAPSICUM EXTRACT", "CENTELLA ASIATICA TITRATED EXTRACT", "CENTELLA ASIATICA PURIFIED EXTRACT", "CENTELLA ASIATICA TRITERPENES"];
    for (const [names, route] of [[oral, "oral"], [dermal, "dermal"]]) {
      for (const name of names) {
        expect(assess(product(name)).verdict).toBe("conditional");
        expect(assess(product(name), { route }).verdict).toBe("no-listed-restriction");
        expect(assess(product(name), { route: "intravenous" }).verdict).toBe("unresolved");
        expect(assess(product(name), { route: "ophthalmic" }).verdict).toBe("unresolved");
        expect(assess(product(name), { route, date: "2027-01-01" }).verdict).toBe("outdated-rules");
        expect(assess(product(name, "MORPHINE"), { route }).verdict).toBe("restricted");
      }
    }
    for (const name of dermal) expect(assess(product(name), { route: "topical" }).verdict).toBe("unresolved");
    expect(matchDrugIngredient("CLOSTRIDIUM BUTYRICUM").key).toBe("clostridium butyricum");
    expect(matchDrugIngredient("CLOSTRIDIUM BUTYRICUM MIYAIRI").key).toBe("clostridium butyricum miyairi");
    for (const name of ["CENTELLA ASIATICA", "SACCHAROMYCES BOULARDII", "BIODIASTASE 9999", "NEWLASE WITH UNKNOWN", "PLATYCODON UNKNOWN EXTRACT"]) {
      expect(matchDrugIngredient(name)).toBeNull();
    }
  });
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
    expect(matchDrugIngredient("ALBUMIN TANNATE (TANNALBIN)").key).toBe("albumin tannate");
    expect(matchDrugIngredient("SODIUM IODIDE I-131").key).toBe("sodium iodide i-131");
    for (const name of ["POVIDONE IODINE", "POVIDONE-IODINE", "IODINE POVIDONE", "Povidone lodine"]) {
      const key = matchDrugIngredient(name).key;
      expect(key).toBe("povidone iodine");
      expect(matchDrugIngredient(key).key).toBe(key);
    }
    expect(matchDrugIngredient("ALBUMIN TANNATE WITH UNKNOWN")).toBeNull();
    expect(matchDrugIngredient("prednisolone-like unknown compound")).toBeNull();
    expect(matchDrugIngredient("舒喘寧")).toBeNull();
    expect(matchDrugIngredient("TRAMADOL WITH UNKNOWN")).toBeNull();
  });
  it("reviewed mixtures retain their whole identity, route scope and restricted partners", () => {
    for (const name of ["GLYCYRRHIZA EXTRACT", "SCOPOLIA EXTRACT", "BELLADONNA EXTRACT", "GELATIN", "NEWLASE", "BIODIASTASE 1000", "LIPASE AP6", "PLATYCODON EXTRACT", "POLYGALA EXTRACT"]) {
      expect(assess(product(name)).verdict).toBe("conditional");
      expect(assess(product(name), { route: "oral" }).verdict).toBe("no-listed-restriction");
      expect(assess(product(name), { route: "intravenous" }).verdict).toBe("unresolved");
      expect(assess(product(name, "MORPHINE"), { route: "oral" }).verdict).toBe("restricted");
    }
    expect(assess(product("GLYCYRRHIZA EXTRACT", "OPIUM"), { route: "oral" }).verdict).toBe("restricted");
    for (const name of ["CLOVE OIL", "CINNAMON OIL (OLEUM CINNAMOMI)", "EUCALYPTUS OIL (OLEUM EUCALYPTI)", "CAJUPUT OIL", "CASSIA OIL", "TURPENTINE OIL"]) {
      expect(assess(product(name), { route: "dermal" }).verdict).toBe("no-listed-restriction");
      for (const route of ["oral", "topical", "ophthalmic", "inhaled"]) expect(assess(product(name), { route }).verdict).toBe("unresolved");
    }
    expect(matchDrugIngredient("Sacubitril/Valsartan as Sacubitril Valsartan sodium salt complex").key).toBe("sacubitril valsartan sodium salt complex");
    expect(matchDrugIngredient("METFORMIN HYDROCHLORIDE WITH 0.5% MAGNESIUM STEARATE").key).toBe("metformin hydrochloride with magnesium stearate");
    expect(matchDrugIngredient("METFORMIN HYDROCHLORIDE WITH UNKNOWN")).toBeNull();
    expect(matchDrugIngredient("SCOPOLIA WITH UNKNOWN")).toBeNull();
    expect(assess(product("GELATIN"), { route: "oral", date: "2027-01-01" }).verdict).toBe("outdated-rules");
  });
  it("morphine-containing opium materials retain S7 and do not match opium-free preparations", () => {
    const names = ["OPIUM", "OPIUM POWDER", "OPIUM TINCTURE", "OPIUM CAMPHOR TINCTURE", "CAMPHORATED OPIUM TINCTURE", "OPIUM (EQUIVALENT TO 100MG ANHYDROUS MORPHINE)"];
    for (const name of names) {
      const match = matchDrugIngredient(name);
      expect(match.rule.wadaCode).toBe("S7");
      expect(match.key).not.toBe("morphine");
      expect(match.rule.evidence.identity.clinicalReview).toBe("pending");
      expect(assess(product(name), { route: "oral" }).verdict).toBe("restricted");
      expect(assess(product(name), { route: "oral", inCompetition: false }).verdict).toBe("no-listed-restriction");
      expect(assess(product(name, "GLYCYRRHIZA EXTRACT"), { route: "oral" }).verdict).toBe("restricted");
      expect(assess(product(name), { route: "oral", date: "2027-01-01" }).verdict).toBe("outdated-rules");
    }
    expect(matchDrugIngredient("CAMPHORATE TINCTURE, WITHOUT OPIUM")).toBeNull();
    expect(matchDrugIngredient("OPIUM WITH UNKNOWN")).toBeNull();
    expect(assess(product("RIOCIGUAT")).verdict).toBe("conditional");
    expect(assess(product("RIOCIGUAT"), { route: "oral" }).verdict).toBe("conditional");
    expect(assess(product("RIOCIGUAT"), { route: "intravenous" }).verdict).toBe("unresolved");
  });
  it("additional enzyme and botanical references preserve routes, mixtures and chemical identities", () => {
    for (const name of ["SENEGA POWDER", "COPTIS POWDER", "PEPSIN", "PEPSIN SACCHARATED", "CASTOR OIL (OLEUM RICIN)(RICINUS OIL)"]) {
      expect(assess(product(name)).verdict).toBe("conditional");
      expect(assess(product(name), { route: "oral" }).verdict).toBe("no-listed-restriction");
      expect(assess(product(name), { route: "intravenous" }).verdict).toBe("unresolved");
      expect(assess(product(name, "OPIUM POWDER"), { route: "oral" }).verdict).toBe("restricted");
    }
    const seed = "AESCULUS HIPPOCASTANUM L SEED EXTRACT";
    expect(assess(product(seed), { route: "dermal" }).verdict).toBe("no-listed-restriction");
    expect(assess(product(seed), { route: "oral" }).verdict).toBe("unresolved");
    expect(matchDrugIngredient("AESCULUS HIPPOCASTANUM UNKNOWN EXTRACT")).toBeNull();
    const coated = "ACETAMINOPHEN COATED WITH HPMC 2910 AND STEARIC ACID (100:1.06:5.32)";
    expect(matchDrugIngredient(coated).key).toBe("paracetamol hpmc 2910 stearic acid mixture");
    expect(matchDrugIngredient(coated.replace("STEARIC ACID", "UNKNOWN"))).toBeNull();
    expect(matchDrugIngredient("GUAIACOL GLYCERIN ETHER").key).toBe("guaifenesin");
    expect(matchDrugIngredient("INDIUM IN-111 CHLORIDE").key).toBe("indium in-111 chloride");
    expect(matchDrugIngredient("DL-MENTHOL").key).toBe("dl-menthol");
    expect(matchDrugIngredient("CLOPIDOGREL HYDROGENSULFATE").key).toBe("clopidogrel");
  });
  it("noradrenaline preserves S6 timing without borrowing adrenaline's local exceptions", () => {
    for (const name of ["NOREPINEPHRINE BITARTRATE", "NOREPINEPHRINE", "noradrenaline"]) {
      expect(matchDrugIngredient(name).rule.wadaCode).toBe("S6");
      expect(assess(product(name)).verdict).toBe("conditional");
      for (const route of ["oral", "injection", "intravenous", "non-intravenous-injection", "inhaled"]) {
        expect(assess(product(name), { route }).verdict).toBe("restricted");
        expect(assess(product(name), { route, epinephrineUse: "local-anesthetic" }).verdict).toBe("restricted");
        expect(assess(product(name), { route, inCompetition: false }).verdict).toBe("no-listed-restriction");
      }
      for (const route of ["topical", "dermal", "ophthalmic"]) expect(assess(product(name), { route }).verdict).toBe("conditional");
      expect(assess(product(name), { route: "intravenous", date: "2027-01-01" }).verdict).toBe("outdated-rules");
    }
    expect(assess(product("NOREPINEPHRINE", "MANNITOL"), { route: "intravenous", inCompetition: false }).verdict).toBe("restricted");
  });
  it("never treats a missing component or an unknown mixture as permission", () => {
    expect(assess(product()).verdict).toBe("unresolved");
    expect(assess(product("unknown drug")).verdict).toBe("unresolved");
    expect(assess(product("PARACETAMOL", "unknown drug")).verdict).toBe("unresolved");
    expect(assess(product("TRAMADOL HCL", "unknown drug")).verdict).toBe("restricted");
    expect(assess(product("TRAMADOL HCL", "unknown drug")).incomplete).toBe(true);
  });
  it("oral digestive-enzyme evidence does not authorize injection or an unknown route", () => {
    for (const name of ["PANCREATIN (PANCREAS POWDER)", "PANCREATIN (DIASTASE VERA)", "PROTEASE", "AMYLASE", "LIPASE", "PANCRELIPASE"]) {
      expect(assess(product(name)).verdict, name).toBe("conditional");
      for (const inCompetition of [true, false]) {
        expect(assess(product(name), { route: "oral", inCompetition }).verdict).toBe("no-listed-restriction");
        expect(assess(product(name), { route: "intravenous", inCompetition }).verdict).toBe("unresolved");
        expect(assess(product(name), { route: "topical", inCompetition }).verdict).toBe("unresolved");
      }
    }
    expect(assess(product("PANCRELIPASE", "UNKNOWN ENZYME"), { route: "oral" }).verdict).toBe("unresolved");
    expect(assess(product("LIPASE", "TRAMADOL HCL"), { route: "oral" }).verdict).toBe("restricted");
  });
  it("defined botanical medicine references retain route and whole-name boundaries", () => {
    for (const name of ["GINKGO BILOBA EXTRACT", "GINKGO BILOBA FOLIUM EXTRACT", "SILYMARIN", "SILYMARIN (EXSICCATED FRUCTUS CARDUI MARIANUS EXTRACT)", "ESCIN", "ORYZANOL GAMMA-"]) {
      expect(assess(product(name)).verdict).toBe("conditional");
      expect(assess(product(name), { route: "oral" }).verdict).toBe("no-listed-restriction");
      expect(assess(product(name), { route: "injection" }).verdict).toBe("unresolved");
      expect(assess(product(name), { route: "oral", date: "2027-01-01" }).verdict).toBe("outdated-rules");
    }
    expect(assess(product("ESCIN", "DIETHYLAMINE SALICYLATE"), { route: "dermal" }).verdict).toBe("no-listed-restriction");
    expect(matchDrugIngredient("EXSICCATED FRUCTUS CARDUI MARIAE EXTRACT").key).toBe("exsiccated fructus cardui mariae extract");
    expect(assess(product("EXSICCATED FRUCTUS CARDUI MARIAE EXTRACT"), { route: "oral" }).verdict).toBe("no-listed-restriction");
    expect(assess(product("EXSICCATED FRUCTUS CARDUI MARIAE EXTRACT"), { route: "intravenous" }).verdict).toBe("unresolved");
    for (const name of ["GINKGO BILOBA", "GINKGO BILOBA SEED", "FRUCTUS CARDUI MARIAE", "SILYMARIN SULFATE", "PANCREATIN WITH UNKNOWN"]) expect(matchDrugIngredient(name), name).toBeNull();
    // A truncated source string is still incomplete even if its prefix is familiar.
    const reviewed = "GINKGO BILOBA EXTRACT((9.6mg GINKGO FLAVONGLYCOSIDES CALCULATED AS QUERCETIN,KAEMPFEROL AND ISORHAMNETIN,2.4mg TERPENLACTONES )";
    expect(matchDrugIngredient(reviewed).key).toBe("ginkgo biloba extract");
    expect(matchDrugIngredient(reviewed).identityEvidence.type).toBe("reviewed-literal-name");
    expect(assess(product(reviewed), { route: "oral" }).verdict).toBe("no-listed-restriction");
    expect(assess(product(reviewed), { route: "intravenous" }).verdict).toBe("unresolved");
    for (const unreviewed of [reviewed + ")", reviewed + " UNKNOWN", reviewed.replace("9.6mg", "19.6mg")]) {
      expect(matchDrugIngredient(unreviewed)).toBeNull();
    }
  });
  it("individually sourced medicines never clear a prohibited co-ingredient", () => {
    for (const name of ["burosumab", "Pitolisant hydrochloride"]) {
      expect(assess(product(name)).verdict).toBe("no-listed-restriction");
      expect(matchDrugIngredient(name).rule.evidence.url).toContain("felleskatalogen.no");
      expect(assess(product(name, "HYDROCHLOROTHIAZIDE")).verdict).toBe("restricted");
    }
  });
  it("new material references preserve the exact material and supported route", () => {
    for (const name of ["PSYLLIUM HUSK POWDER", "ISPAGHULA HUSK", "ISPAGHULA HUSK POWDER"]) {
      expect(assess(product(name)).verdict).toBe("conditional");
      expect(assess(product(name), { route: "oral" }).verdict).toBe("no-listed-restriction");
      expect(assess(product(name), { route: "intravenous" }).verdict).toBe("unresolved");
    }
    expect(assess(product("ICHTHAMMOL", "ZINC OXIDE"), { route: "dermal" }).verdict).toBe("no-listed-restriction");
    expect(assess(product("ICHTHAMMOL"), { route: "oral" }).verdict).toBe("unresolved");
    expect(assess(product("ICHTHAMMOL", "UNKNOWN TAR"), { route: "dermal" }).verdict).toBe("unresolved");
    for (const name of ["ICHTHAMMOL", "ESCIN"]) {
      for (const route of ["topical", "ophthalmic"]) expect(assess(product(name), { route }).verdict).toBe("unresolved");
    }
    expect(assess(product("FLUTICASONE PROPIONATE"), { route: "dermal" }).verdict).toBe("conditional");
    expect(assess(product("EPINEPHRINE"), { route: "dermal" }).verdict).toBe("no-listed-restriction");
    expect(assess(product("DORZOLAMIDE"), { route: "dermal" }).verdict).toBe("restricted");
    expect(assess(product("DORZOLAMIDE"), { route: "dermal" }).containsS5).toBe(true);
    for (const name of ["PLANTAGO", "PSYLLIUM WITH UNKNOWN", "ICHTHAMMOL WITH UNKNOWN"]) expect(matchDrugIngredient(name), name).toBeNull();
  });
  it("new exact identities retain S3, S5, M2 warnings and unknown gene therapies", () => {
    for (const inCompetition of [true, false]) {
      expect(assess(product("ISOPROTERENOL HCL"), { route: "intravenous", inCompetition }).verdict).toBe("restricted");
      expect(assess(product("HETASTARCH", "SODIUM CHLORIDE"), { route: "intravenous", inCompetition }).verdict).toBe("restricted");
    }
    expect(assess(product("HETASTARCH")).verdict).toBe("conditional");
    expect(matchDrugIngredient("CARNITINE CHLORIDE").key).toBe("carnitine chloride");
    const peptide = assess(product("N(2)-L-ALANYL-L-GLUTAMINE"), { route: "intravenous" });
    expect(peptide.verdict).toBe("no-listed-restriction");
    expect(peptide.notices.join(" ")).toMatch(/M2.*100 mL/);
    expect(assess(product("N(2)-L-ALANYL-L-GLUTAMINE", "MANNITOL"), { route: "intravenous" }).verdict).toBe("restricted");
    for (const name of ["N(3)-L-ALANYL-L-GLUTAMINE", "Onasemnogene abeparvovec", "VUTRISIRAN", "TOFERSEN"]) expect(matchDrugIngredient(name), name).toBeNull();
  });
  it("named lipid and peppermint references do not expand to unspecified oils or override M2 and S5", () => {
    const lipid = product("SOYBEAN OIL REFINED", "TRIGLYCERIDES MEDIUM CHAIN", "OLIVE OIL", "FISH-OIL RICH IN OMEGA-3 ACIDS");
    expect(assess(lipid).verdict).toBe("conditional");
    const iv = assess(lipid, { route: "intravenous" });
    expect(iv.verdict).toBe("no-listed-restriction");
    expect(iv.ingredients.every((item) => item.assessment.reasons.join(" ").includes("M2"))).toBe(true);
    expect(assess(lipid, { route: "oral" }).verdict).toBe("unresolved");
    expect(assess(product(...lipid.ingredientNames, "MANNITOL"), { route: "intravenous" }).verdict).toBe("restricted");
    expect(assess(product("REFINE SOYA + OLIVE OIL", "UNKNOWN LIPID"), { route: "intravenous" }).verdict).toBe("unresolved");
    expect(assess(product("PEPPERMINT OIL (OLEUM MENTH PIP)"), { route: "oral" }).verdict).toBe("no-listed-restriction");
    expect(assess(product("PEPPERMINT OIL (OLEUM MENTH PIP)"), { route: "dermal" }).verdict).toBe("unresolved");
    for (const name of ["MENTHOL OIL", "MENTHA OIL", "PHOSPHOLIPID", "OLIVE OIL WITH UNKNOWN"]) expect(matchDrugIngredient(name), name).toBeNull();
  });
  it("a nonrestricted constituent never hides the restricted constituent", () => {
    const p = product("PARACETAMOL", "TRAMADOL HCL");
    expect(assess(p).verdict).toBe("restricted");
    expect(assess(p, { inCompetition: false }).verdict).toBe("unresolved");
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
    const salt = product("SALMETEROL XINAFOATE MICRONIZED");
    expect(assess(salt, { route: "oral" }).verdict).toBe("restricted");
    expect(assess(salt, { route: "inhaled", s5Concomitant: "none" }).verdict).toBe("conditional");
    // Salmeterol is not one of the six substances in S5's threshold-substance clause.
    expect(assess(salt, { route: "inhaled", s5Concomitant: "prohibited" }).verdict).toBe("conditional");
    expect(assess(product("SALMETEROL XINAFOATE MICRONIZED", "HYDROCHLOROTHIAZIDE"), { route: "inhaled" }).verdict).toBe("restricted");
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
    expect(assess(p, { route: "inhaled" }).verdict).toBe("conditional");
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
    expect(matchDrugIngredient("DORZOLAMIDE").rule.wadaCode).toBe("S5");
  });
  it("future and previous year queries suppress individual permissions too", () => {
    for (const date of ["2027-01-01", "2025-12-31", "", "not-a-date", "2026-02-30"]) {
      const r = assess(product("PARACETAMOL"), { date });
      expect(r.verdict).toBe("outdated-rules");
      expect(r.ingredients[0].assessment.verdict).toBe("unknown");
    }
    expect(assess(product("PARACETAMOL"), { date: "2026-12-31" }).verdict).toBe("unresolved");
  });
  it("uses the Taiwan calendar day at the annual rule boundary", () => {
    expect(taiwanDate(new Date("2026-12-31T17:00:00Z"))).toBe("2027-01-01");
  });
  it("source conflicts cannot yield a whole-product unrestricted result", () => {
    expect(assess({ ...product("PARACETAMOL"), conflictingFields: ["主成分略述"] }).verdict).toBe("unresolved");
  });
  it("new permitted rules retain named primary evidence and exact equivalence", () => {
    expect(matchDrugIngredient("AMOXICILLIN TRIHYDRATE").rule.prohibition).toBe("not-prohibited");
    expect(matchDrugIngredient("PYRIDOXINE HCL").rule.evidence.url).toMatch(/^https:\/\//);
    expect(matchDrugIngredient("HYDROCHLOROTHIAZIDE (EQ TO 3,4-DIHYDROCHLOROTHIAZIDE)").rule.wadaCode).toBe("S5");
    expect(matchDrugIngredient("TRAMADOL HCL(")).toBeNull();
    expect(matchDrugIngredient("ACETAMINOPHEN (EQ TO PARACETAMOL")).toBeNull();
    expect(matchDrugIngredient("PARACETAMOL (EQ TO TRAMADOL)")).toBeNull();
    expect(matchDrugIngredient("AMOXICILLIN AND UNKNOWN")).toBeNull();
  });
  it("class inference does not permit non-NSAID members or withdrawn products without approval evidence", () => {
    expect(matchDrugIngredient("ORGOTEIN")).toBeNull();
    expect(matchDrugIngredient("ROFECOXIB")).toBeNull();
    expect(matchDrugIngredient("COCAINE").rule.prohibition).toBe("in-competition");
  });
  it("a green reference product cannot override a primary S6 or S9 restriction", () => {
    expect(assess(product("METHOXYPHENAMINE HCL")).verdict).toBe("restricted");
    expect(assess(product("ETILEFRIN HCL")).verdict).toBe("restricted");
    expect(assess(product("ETILEFRIN HCL"), { inCompetition: false }).verdict).toBe("no-listed-restriction");
    expect(assess(product("FLUOCINOLONE ACETONIDE"), { route: "oral" }).verdict).toBe("restricted");
    expect(assess(product("FLUOCINOLONE ACETONIDE"), { route: "topical" }).verdict).toBe("conditional");
    expect(assess(product("FLUOCINOLONE ACETONIDE")).verdict).toBe("conditional");
  });
  it("benzodiazepines retain CMAS conditions beyond the ordinary WADA in-competition period", () => {
    expect(assess(product("DIAZEPAM")).verdict).toBe("conditional");
    expect(assess(product("DIAZEPAM"), { sport: "其他運動" }).verdict).toBe("no-listed-restriction");
    expect(assess(product("DIAZEPAM"), { sport: "自由潛水（CMAS）" }).verdict).toBe("restricted");
    const outside = assess(product("DIAZEPAM"), { sport: "自由潛水（CMAS）", inCompetition: false });
    expect(outside.verdict).toBe("conditional");
    expect(outside.ingredients[0].assessment.reasons.join(" ")).toContain("72 小時");
    expect(outside.ingredients[0].federationEvidence.url).toContain("cmas.org");
    for (const name of ["CHLORDIAZEPOXIDE HCL", "OXAZOLAM", "MIDAZOLAM", "OXAZEPAM", "FLUDIAZEPAM", "NIMETAZEPAM", "VARDENAFIL HYDROCHLORIDE TRIHYDRATE", "avanafil", "FLUMAZENIL", "MEDAZEPAM", "NORDAZEPAM", "PRAZEPAM", "Remimazolam besylate"]) {
      expect(assess(product(name)).verdict).toBe("conditional");
      expect(assess(product(name), { sport: "自由潛水（CMAS）" }).verdict).toBe("restricted");
      expect(assess(product(name), { sport: "其他運動" }).verdict).toBe("no-listed-restriction");
      const outside = assess(product(name), { sport: "自由潛水（CMAS）", inCompetition: false });
      expect(outside.verdict).toBe("conditional");
      expect(outside.ingredients[0].assessment.reasons.join(" ")).toContain("72 小時");
      expect(assess(product(name), { sport: "自由潛水（CMAS）", date: "2027-01-01" }).verdict).toBe("outdated-rules");
    }
  });
  it("S2 male-only rules never guess missing applicability or override another ingredient", () => {
    for (const name of ["LEUPRORELIN ACETATE", "GOSERELIN", "CHORIOGONADOTROPIN ALFA", "Menotrophin HP", "GONADOTROPIN CHORIONIC", "Human Menopausal Gonadotrophin (Menotrophin)", "Menotrophin"]) {
      const p = product(name);
      expect(assess(p).verdict).toBe("conditional");
      expect(assess(p, { sex: "invalid" }).verdict).toBe("conditional");
      expect(assess(p, { sex: "male", inCompetition: false }).verdict).toBe("restricted");
      expect(assess(p, { sex: "female" }).verdict).toBe("no-listed-restriction");
      expect(assess(p, { sex: "female", date: "2027-01-01" }).verdict).toBe("outdated-rules");
    }
    expect(assess(product("GOSERELIN", "TRAMADOL"), { sex: "female" }).verdict).toBe("restricted");
    expect(assess(product("SOMATROPIN"), { sex: "female" }).verdict).toBe("restricted");
  });
  it("new named references preserve distinct identities and restricted combination partners", () => {
    expect(matchDrugIngredient("BENZYLHYDROCHLOROTHIAZIDE").key).toBe("benzylhydrochlorothiazide");
    expect(matchDrugIngredient("BENZTHIAZIDE").key).toBe("benzthiazide");
    for (const name of ["BENZYLHYDROCHLOROTHIAZIDE", "TERLIPRESSIN ACETATE", "insulin degludec"]) {
      expect(assess(product(name), { inCompetition: false }).verdict).toBe("restricted");
    }
    const naloxoneCombination = product("NALOXONE HCL DIHYDRATE", "BUPRENORPHINE HYDROCHLORIDE");
    expect(assess(naloxoneCombination).incomplete).toBe(false);
    expect(assess(naloxoneCombination).verdict).toBe("restricted");
    expect(assess(product("Follitropin delta", "Lutropin alfa (r-hLH)"), { sex: "male" }).verdict).toBe("restricted");
    expect(assess(product("Follitropin delta", "Lutropin alfa (r-hLH)"), { sex: "female" }).verdict).toBe("no-listed-restriction");
    expect(assess(product("Mirabegron", "TERBUTALINE"), { route: "oral" }).verdict).toBe("restricted");
    expect(assess(product("Abiraterone Acetate", "PREDNISOLONE"), { route: "oral" }).verdict).toBe("restricted");
    expect(assess(product("Abiraterone Acetate", "PREDNISOLONE"), { route: "oral", inCompetition: false }).verdict).toBe("no-listed-restriction");
    expect(assess(product("LOTEPREDNOL ETABONATE"), { route: "ophthalmic" }).verdict).toBe("conditional");
    expect(assess(product("LOTEPREDNOL ETABONATE"), { route: "intravenous" }).verdict).toBe("restricted");
  });
  it("new named primary restrictions preserve competition and route differences", () => {
    for (const name of ["TRICHLORMETHIAZIDE", "CICLETANINE", "FINERENONE"]) {
      expect(assess(product(name), { inCompetition: false }).verdict).toBe("restricted");
      expect(assess(product(name)).containsS5).toBe(true);
    }
    const diuretic = assess(product("TRICHLORMETHIAZIDE", "SALBUTAMOL"), { route: "inhaled", s5Concomitant: "none" });
    expect(diuretic.ingredients[1].assessment.verdict).toBe("needs-tue");
    expect(assess(product("BETAMETHASONE DISODIUM PHOSPHATE"), { route: "ophthalmic" }).verdict).toBe("conditional");
    expect(assess(product("BETAMETHASONE DISODIUM PHOSPHATE"), { route: "injection" }).verdict).toBe("restricted");
    for (const name of ["TESTOSTERONE CYPIONATE ( CYCLOPENTYLPROPIONATE)", "SOMATROPIN (BIOSYNTHETIC HUMAN GROWTH HORMONE)"]) {
      expect(assess(product(name), { inCompetition: false }).verdict).toBe("restricted");
    }
    expect(assess(product("RITODRINE HCL"), { inCompetition: false }).verdict).toBe("restricted");
    expect(assess(product("DOPAMINE HCL")).verdict).toBe("restricted");
    expect(assess(product("DOPAMINE HCL"), { inCompetition: false }).verdict).toBe("no-listed-restriction");
    expect(assess(product("FLUMETHASONE PIVALATE"), { route: "oral" }).verdict).toBe("restricted");
    expect(assess(product("FLUMETHASONE PIVALATE"), { route: "topical" }).verdict).toBe("conditional");
    expect(assess(product("DIFLUCORTOLONE 21-VALERATE"), { route: "injection" }).verdict).toBe("restricted");
    expect(assess(product("GLYCYRRHIZA EXTRACT")).verdict).toBe("conditional");
    expect(assess(product("GELATIN")).verdict).toBe("conditional");
  });
  it("S6 imidazoline exceptions require the listed local routes", () => {
    for (const name of ["BRIMONIDINE TARTRATE", "NAPHAZOLINE HCL", "TETRAHYDROZOLINE HCL"]) {
      expect(assess(product(name)).verdict).toBe("conditional");
      expect(assess(product(name), { route: "oral" }).verdict).toBe("restricted");
      expect(assess(product(name), { route: "inhaled" }).verdict).toBe("restricted");
      expect(assess(product(name), { route: "ophthalmic" }).verdict).toBe("no-listed-restriction");
      expect(assess(product(name), { route: "topical" }).verdict).toBe("no-listed-restriction");
    }
    expect(assess(product("SELEGILINE HCL")).verdict).toBe("restricted");
  });
  it("S5 carbonic anhydrase exceptions require ocular use and preserve other restrictions", () => {
    const p = product("DORZOLAMIDE HCL");
    expect(assess(p).verdict).toBe("conditional");
    expect(assess(p).containsS5).toBe(false);
    expect(assess(p).ingredients[0].assessment.reasons.join(" ")).toContain("只限眼部");
    const uncertain = assess(product("DORZOLAMIDE", "PSEUDOEPHEDRINE"), { s5Concomitant: "none" });
    expect(uncertain.ingredients[1].assessment.verdict).toBe("conditions-required");
    expect(uncertain.containsS5).toBe(false);
    expect(assess(p, { route: "topical" }).verdict).toBe("conditional");
    expect(assess(p, { route: "oral" }).verdict).toBe("restricted");
    const ocular = assess(p, { route: "ophthalmic" });
    expect(ocular.verdict).toBe("no-listed-restriction");
    expect(ocular.containsS5).toBe(false);
    expect(assess(product("DORZOLAMIDE", "TIMOLOL"), { route: "ophthalmic", sport: "射箭" }).verdict).toBe("restricted");
    expect(assess(product("DEXAMETHASONE"), { route: "ophthalmic" }).verdict).toBe("conditional");
  });
  it("S5 plasma expanders require an explicitly confirmed intravenous route", () => {
    for (const name of ["HUMAN ALBUMIN", "DEXTRAN 40", "DEXTRAN 70", "HYDROXYETHYL STARCH (200/0.5)", "D-MANNITOL"]) {
      const p = { ...product(name), dosageForm: "注射劑" };
      expect(assess(p).verdict).toBe("conditional");
      expect(assess(p).containsS5).toBe(false);
      expect(assess(p).ingredients[0].assessment.reasons.join(" ")).toContain("是否經靜脈");
      expect(assess(p, { route: "injection" }).verdict).toBe("conditional");
      expect(assess(p, { route: "intravenous" }).containsS5).toBe(true);
      expect(assess(p, { route: "intravenous", inCompetition: false }).verdict).toBe("restricted");
      expect(assess(p, { route: "intravenous" }).ingredients[0].assessment.reasons.join(" ")).toContain("M2");
      for (const route of ["oral", "inhaled", "ophthalmic", "non-intravenous-injection"]) {
        expect(assess(p, { route }).verdict).toBe("no-listed-restriction");
        expect(assess(p, { route }).containsS5).toBe(false);
      }
      expect(assess(p, { route: "unconfirmed-route" }).verdict).toBe("unresolved");
      expect(assess(p, { route: "oral", date: "2027-01-01" }).verdict).toBe("outdated-rules");
    }
  });
  it("plasma-expander names never absorb chemically distinct polymer derivatives", () => {
    expect(matchDrugIngredient("ALBUMIN TANNATE (TANNALBIN)").key).toBe("albumin tannate");
    expect(matchDrugIngredient("GELATIN").key).toBe("gelatin");
    expect(assess(product("GELATIN"), { route: "intravenous" }).verdict).toBe("unresolved");
    for (const name of ["DEXTRAN SULFATE SODIUM", "GELATIN POLYSUCCINATE", "ALBUMIN WITH UNKNOWN", "MANNITOL PHOSPHATE"]) {
      expect(matchDrugIngredient(name)).toBeNull();
    }
  });
  it("named iron complexes remain distinct from S5 dextran and preserve M2 reminders", () => {
    for (const [name, key] of [["IRON DEXTRAN", "iron dextran"], ["IRON CARBOXYMALTOSE", "ferric carboxymaltose"]]) {
      expect(matchDrugIngredient(name).key).toBe(key);
      const result = assess(product(name), { route: "intravenous" });
      expect(result.verdict).toBe("no-listed-restriction");
      expect(result.containsS5).toBe(false);
      expect(result.notices.join(" ")).toContain("M2");
      expect(assess(product(name, "DEXTRAN 40"), { route: "intravenous" }).verdict).toBe("restricted");
      expect(assess(product(name), { date: "2027-01-01" }).verdict).toBe("outdated-rules");
    }
  });
  it("new primary classifications retain S4 timing and S9 route boundaries", () => {
    const estrogen = product("IMLUNESTRANT TOSYLATE");
    expect(matchDrugIngredient(estrogen.ingredientNames[0]).rule.wadaCode).toBe("S4.2");
    expect(assess(estrogen, { inCompetition: false }).verdict).toBe("restricted");
    expect(assess(estrogen, { route: "oral" }).verdict).toBe("restricted");
    for (const name of ["FLUCLORONIDE", "MEPREDNISONE 21- ACETATE (METHYLPREDNISONE ACETATE)", "HALCINONIDE MICRO"]) {
      expect(assess(product(name)).verdict).toBe("conditional");
      for (const route of ["oral", "intravenous", "rectal"]) expect(assess(product(name), { route }).verdict).toBe("restricted");
      expect(assess(product(name), { route: "dermal" }).verdict).toBe("conditional");
      expect(assess(product(name), { route: "oral", inCompetition: false }).verdict).toBe("no-listed-restriction");
      expect(assess(product(name), { date: "2027-01-01" }).verdict).toBe("outdated-rules");
    }
    expect(matchDrugIngredient("FLUCLORONIDE").key).toBe("fluclorolone");
    expect(matchDrugIngredient("FLUCLORONIDE").key).not.toBe("fluocinonide");
  });
  it("new chemical identities preserve isotopes and reject incomplete or conflicting materials", () => {
    expect(matchDrugIngredient("GALLIUM CITRATE (GA-67)").key).toBe("gallium ga-67 citrate");
    expect(matchDrugIngredient("GALLIUM CHLORIDE GA-67").key).toBe("gallium ga-67 chloride");
    expect(matchDrugIngredient("Esketamine HCl").key).toBe("esketamine");
    expect(matchDrugIngredient("EDETATE DISODIUM DIHYDRATE (EQ TO DISODIUM EDETATE DIHYDRATE)").key).toBe("edetate disodium");
    expect(matchDrugIngredient("DIETHYLAMINOETHYL PHENYLETHYL ACETATE CITRATE").key).toBe("diethylaminoethyl phenylethyl acetate citrate");
    for (const name of ["GALLIUM CITRATE (GA-68)", "SODIUM EDETATE", "SODIUM EDETATE (EQ TO TETRASODIUM EDETATE)(EQ TO TETRASODIUM EDTA)", "MAGNESIUM OXIDE (MG. TRISILICATE)", "NIACIN (NIACINAMIDE)", "AMINO ACID", "VITAMIN K ACTIVITY", "BIFIDOBACTERIUM", "FINGOLIMOD WITH UNKNOWN"]) {
      expect(matchDrugIngredient(name)).toBeNull();
    }
    expect(assess(product("Dextrose (Glucose) Anhydrous", "MANNITOL"), { route: "intravenous" }).verdict).toBe("restricted");
    expect(assess(product("GENTAMYCIN (AS SULFATE)", "BETAMETHASONE DIPROPIONATE"), { route: "oral" }).verdict).toBe("restricted");
  });
  it("S5 route uncertainty remains unknown for threshold coingredients", () => {
    const p = product("MANNITOL", "PSEUDOEPHEDRINE");
    for (const route of [null, "injection", "invalid"]) {
      const r = assess(p, { route, s5Concomitant: "none" });
      expect(r.containsS5).toBe(false);
      expect(r.ingredients[1].assessment.verdict).toBe(route === null ? "conditions-required" : "unknown");
    }
    expect(assess(p, { route: "oral", s5Concomitant: "none" }).ingredients[1].assessment.verdict).toBe("permitted-threshold");
    const intravenous = assess(p, { route: "intravenous", s5Concomitant: "none" });
    expect(intravenous.containsS5).toBe(true);
    expect(intravenous.verdict).toBe("restricted");
    // The existing pseudoephedrine rule only specifies oral use. A confirmed
    // S5 constituent must not invent a rule for an unsupported route.
    expect(intravenous.ingredients[1].assessment.verdict).toBe("unknown");
    const inhaled = assess(product("MANNITOL", "SALBUTAMOL"), { route: "inhaled", s5Concomitant: "none" });
    expect(inhaled.containsS5).toBe(false);
    expect(inhaled.ingredients[1].assessment.verdict).toBe("permitted-threshold");
    expect(assess(p, { route: "oral", s5Concomitant: "prohibited" }).ingredients[1].assessment.verdict).toBe("needs-tue");
  });
  it("the more precise injection choices preserve existing injection assessments", () => {
    for (const route of ["intravenous", "non-intravenous-injection"]) {
      for (const name of ["SALBUTAMOL", "DORZOLAMIDE", "BRIMONIDINE", "DEXAMETHASONE"]) {
        expect(assess(product(name), { route }).verdict).toBe(assess(product(name), { route: "injection" }).verdict);
      }
      expect(assess(product("DORZOLAMIDE"), { route }).containsS5).toBe(true);
    }
  });
  it("epinephrine exceptions require confirmed local use without hiding other ingredients", () => {
    const p = product("EPINEPHRINE (ADRENALINEPIRENAMINE)", "LIDOCAINE HCL");
    expect(assess(p).verdict).toBe("conditional");
    expect(assess(p, { route: "non-intravenous-injection" }).verdict).toBe("conditional");
    expect(assess(p, { route: "non-intravenous-injection", epinephrineUse: "systemic" }).verdict).toBe("restricted");
    expect(assess(p, { route: "non-intravenous-injection", epinephrineUse: "local-anesthetic" }).verdict).toBe("no-listed-restriction");
    expect(assess(p, { route: "injection", epinephrineUse: "local-anesthetic" }).verdict).toBe("conditional");
    expect(assess(p, { route: "intravenous", epinephrineUse: "local-anesthetic" }).verdict).toBe("conditional");
    expect(assess(p, { route: "intravenous", epinephrineUse: "systemic" }).verdict).toBe("restricted");
    for (const route of ["oral", "inhaled", "rectal"]) {
      expect(assess(p, { route, epinephrineUse: "systemic" }).verdict).toBe("restricted");
      expect(assess(p, { route, epinephrineUse: "local-anesthetic" }).verdict).toBe("conditional");
    }
    for (const route of ["ophthalmic", "topical"]) expect(assess(p, { route }).verdict).toBe("no-listed-restriction");
    expect(assess(p, { inCompetition: false }).verdict).toBe("no-listed-restriction");
    expect(assess(p, { route: "invalid", epinephrineUse: "local-anesthetic" }).verdict).toBe("unresolved");
    expect(assess(product("EPINEPHRINE", "TRAMADOL"), { route: "non-intravenous-injection", epinephrineUse: "local-anesthetic" }).verdict).toBe("restricted");
    expect(assess(p, { route: "ophthalmic", date: "2027-01-01" }).verdict).toBe("outdated-rules");
    expect(matchDrugIngredient("NOREPINEPHRINE")?.key).not.toBe("epinephrine");
  });
});
