import baseData from "../../../backend/data/substances.json";
import extension from "../../../backend/data/drug-ingredient-rules.json";
import evidenceRules from "../../../backend/data/drug-evidence-rules.json";
import sourceAliases from "../../../backend/data/drug-source-aliases.json";
import federationRules from "../../../backend/data/drug-federation-rules.json";
import { evaluateDrug, evaluateDrugConditions } from "./tueDecision.js";
import { normalizeDrugText, taiwanDate } from "./drugCatalog.js";

export const DRUG_RULE_VERSION = extension;
export const DRUG_SPORTS = baseData.substances.propranolol.sportRestricted;
export const DRUG_RULE_FINGERPRINT_INPUT = JSON.stringify({ baseData, extension, evidenceRules, sourceAliases, federationRules });

const steroidRoutes = {
  oral: { status: "needs-tue", note: "糖皮質激素經口服或口腔黏膜使用，賽內禁用。" },
  injection: { status: "needs-tue", note: "糖皮質激素經任何注射途徑使用，賽內禁用。" },
  rectal: { status: "needs-tue", note: "糖皮質激素經直腸使用，賽內禁用。" },
  inhaled: { status: "conditions-required", note: "僅於核准劑量與治療適應症內可適用吸入例外；本工具未核對個別製劑、劑量與適應症，須由醫師或藥師確認。" },
  topical: { status: "conditions-required", note: "限皮膚、鼻、眼、耳等清單所列局部途徑，以及核准劑量與治療適應症；本工具未核對個別製劑、劑量與適應症。口腔黏膜不屬此例外。" },
};
const imidazolineRoutes = {
  oral: { status: "needs-tue", note: "S6 興奮劑賽內禁用；口服不屬局部途徑例外。" },
  injection: { status: "needs-tue", note: "S6 興奮劑賽內禁用；注射不屬局部途徑例外。" },
  rectal: { status: "needs-tue", note: "S6 興奮劑賽內禁用；直腸不屬局部途徑例外。" },
  inhaled: { status: "needs-tue", note: "肺部吸入不屬 S6 所列皮膚、鼻、眼、耳例外。" },
  topical: { status: "permitted", note: "僅限皮膚、鼻、眼、耳使用；口腔黏膜不屬例外。" },
  ophthalmic: { status: "permitted", note: "眼部局部使用屬 S6 咪唑啉衍生物例外。" },
};
const ophthalmicCarbonicRoutes = {
  ...Object.fromEntries(["oral", "injection", "rectal", "inhaled", "dermal"].map((route) => [route, { status: "needs-tue", note: "碳酸酐酶抑制劑的 S5 例外僅限眼部局部使用。" }])),
  topical: { status: "conditions-required", note: "請確認是否為眼部局部使用；皮膚、鼻、耳不適用此例外。" },
  ophthalmic: { status: "permitted", note: "眼部局部使用屬 S5 例外，也不觸發 S5 閾值物質併用限制。" },
};
const plasmaExpanderRoutes = {
  intravenous: { status: "needs-tue", note: "此血漿增容劑經靜脈使用，賽內、賽外均屬 S5 禁用；M2 的醫院治療等例外不會解除物質本身的 S5 限制。" },
  injection: { status: "conditions-required", note: "請確認注射是否經靜脈；尚未確認時不能套用非靜脈途徑的判定。" },
  ...Object.fromEntries(["oral", "rectal", "inhaled", "topical", "ophthalmic", "non-intravenous-injection"].map((route) => [route, {
    status: "permitted", note: "已選非靜脈途徑，不適用此項 S5 靜脈血漿增容劑限制；這不是用藥途徑建議，仍須核對實際用法與其他成分。",
  }])),
};
const epinephrineRoutes = {
  ...Object.fromEntries(["oral", "rectal", "inhaled", "injection", "intravenous", "non-intravenous-injection"].map((route) => [route, {
    status: "needs-tue", note: "腎上腺素用於全身給藥，賽內屬 S6 禁用；局部給藥或與局部麻醉藥共同使用的例外須另行確認。",
  }])),
  topical: { status: "permitted", note: "腎上腺素局部給藥（例如鼻用）屬 S6 例外；此處不包含肺部吸入或全身給藥。" },
  ophthalmic: { status: "permitted", note: "腎上腺素眼部局部使用屬 S6 例外。" },
};
const noradrenalineRoutes = {
  ...Object.fromEntries(["oral", "rectal", "inhaled", "injection"].map((route) => [route, {
    status: "needs-tue", note: "Noradrenaline／norepinephrine 的全身給藥在賽內屬 S6 禁用；靜脈輸注還須另核對 M2 方法限制。",
  }])),
  topical: { status: "conditions-required", note: "此具名來源的局部用法附註仍須專業查核；不可直接套用 adrenaline／epinephrine 的例外。" },
  ophthalmic: { status: "conditions-required", note: "Noradrenaline 的眼部用法仍須專業查核；不能借用另一成分 adrenaline 的例外。" },
};

const rules = { ...baseData.substances };
if (evidenceRules.listVersion !== extension.listVersion || baseData._meta.listVersion !== extension.listVersion) throw new Error("Drug rule years do not agree");
for (const group of evidenceRules.groups) {
  const source = evidenceRules.sources[group.source];
  if (!source?.url || !group.pages) throw new Error("Missing drug rule evidence");
  // A medicine reference may establish only particular routes. Keep this
  // scope separate from a WADA prohibition with an explicit route exception.
  if (Object.hasOwn(group, "referenceRoutes") && (group.prohibition !== "not-prohibited" || !group.scopeNote
    || !Array.isArray(group.referenceRoutes) || !group.referenceRoutes.length
    || group.referenceRoutes.some((route) => !["oral", "dermal", "intravenous"].includes(route))
    || group.names.some((name) => federationRules.names.includes(name)))) throw new Error("Invalid route-limited medicine evidence");
  for (const name of group.names) {
    if (rules[name]) throw new Error(`Duplicate evidence rule: ${name}`);
    rules[name] = {
      displayName: name, prohibition: group.prohibition, wadaCode: group.wadaCode ?? null,
      tueEligible: ["in-competition", "in-and-out"].includes(group.prohibition),
      ...(group.sexRestriction ? { sexRestriction: group.sexRestriction } : {}),
      ...(group.referenceRoutes ? { referenceRoutes: group.referenceRoutes, scopeNote: group.scopeNote } : {}),
      ...(group.exactNameOnly ? { exactNameOnly: true } : {}),
      evidence: { ...source, pages: group.pages, clinicalReview: evidenceRules.clinicalReview,
        derivation: group.derivation ?? group.ingredientEvidence?.[name]?.derivation,
        identity: group.classificationEvidence?.[name] ?? group.ingredientEvidence?.[name] },
    };
  }
}
for (const group of extension.groups) {
  for (const name of group.names) {
    if (rules[name]) throw new Error(`Duplicate substance rule: ${name}`);
    rules[name] = {
      displayName: name, wadaCode: group.code, prohibition: group.timing,
      tueEligible: true, needsTUE: true, sourcePage: group.page,
      evidence: { title: `WADA ${extension.listVersion}`, url: extension.sourceUrl, pages: String(group.page), checkedAt: extension.checkedAt, clinicalReview: "pending", ...group.source,
        derivation: group.derivation, identity: group.classificationEvidence?.[name] },
      ...(group.template === "glucocorticoid" ? { routes: steroidRoutes } : {}),
      ...(group.template === "imidazoline" ? { routes: imidazolineRoutes, localImidazolineException: true } : {}),
      ...(group.template === "ophthalmic-carbonic" ? { routes: ophthalmicCarbonicRoutes, s5OphthalmicException: true } : {}),
      ...(group.template === "intravenous-plasma-expander" ? { routes: plasmaExpanderRoutes, s5IntravenousOnly: true } : {}),
      ...(group.template === "epinephrine" ? { routes: epinephrineRoutes, epinephrineException: true } : {}),
      ...(group.template === "noradrenaline" ? { routes: noradrenalineRoutes } : {}),
      ...(group.exactNameOnly ? { exactNameOnly: true } : {}),
      ...(group.template === "beta-blocker" ? {
        sportRestricted: baseData.substances.propranolol.sportRestricted,
        sportRestrictedOutOfComp: baseData.substances.propranolol.sportRestrictedOutOfComp,
      } : {}),
    };
  }
}
export const DRUG_RULE_COUNT = Object.keys(rules).length;
const federationNames = new Set(federationRules.names);

function assessmentRoute(rule, route) {
  if (route === "dermal" && rule.routes?.topical && !rule.routes.dermal) return "topical";
  if (["intravenous", "non-intravenous-injection"].includes(route) && !rule.routes?.[route]) return "injection";
  if (route === "ophthalmic" && rule.routes?.topical && !rule.routes.ophthalmic) return "topical";
  return route;
}

function s5State(rule, route) {
  if (!rule.s5OphthalmicException && !rule.s5IntravenousOnly) return "prohibited";
  const status = rule.routes?.[assessmentRoute(rule, route)]?.status;
  return status === "needs-tue" ? "prohibited" : status === "permitted" ? "exception" : "unknown";
}

function evaluateIngredient(match, options) {
  const result = evaluateMatchedIngredient(match, options);
  const pending = federationRules.pendingReviews?.[match.key];
  if (pending && (!options.sport || options.sport.includes(pending.federation))
    && !["unknown", "prohibited", "needs-tue"].includes(result.verdict)) {
    return { verdict: "conditions-required", reasons: [pending.note, ...result.reasons] };
  }
  return result;
}

function evaluateMatchedIngredient(match, options) {
  if (match.rule.referenceRoutes) {
    if (!options.route) return { verdict: "conditions-required", reasons: ["此具名成分的來源只支持特定給藥途徑，請先確認實際用法。", match.rule.scopeNote] };
    if (!match.rule.referenceRoutes.includes(options.route)) return { verdict: "unknown", reasons: ["所選途徑超出此成分已查證的來源範圍；不能沿用其他途徑的判定。", match.rule.scopeNote] };
    return { verdict: "permitted", reasons: [match.rule.scopeNote] };
  }
  if (match.rule.sexRestriction === "male") {
    if (!["male", "female"].includes(options.sex)) return { verdict: "conditions-required", reasons: ["此項 S2 規則僅對男性禁用；請先由專業人員確認性別適用條件，不能因未提供資料就判定可用。"] };
    if (options.sex === "female") return { verdict: "permitted", reasons: ["此項 S2 的男性禁用條款不適用於女性；仍須逐一核對其他成分與使用方法。"] };
  }
  // Preserve the narrower S5 routes while existing rules still accept any injection.
  const route = assessmentRoute(match.rule, options.route);
  if (match.rule.epinephrineException && options.inCompetition === true) {
    if (options.epinephrineUse === "local-anesthetic" && route === "non-intravenous-injection") {
      return { verdict: "permitted", reasons: ["已確認為非靜脈、與局部麻醉藥共同進行局部麻醉，適用腎上腺素的 S6 例外；不從複方中含有 lidocaine 等成分推定此用途，其他成分仍須逐一核對。"] };
    }
    if (["oral", "rectal", "inhaled", "injection", "intravenous", "non-intravenous-injection"].includes(route) && options.epinephrineUse !== "systemic") {
      return { verdict: "conditions-required", reasons: ["請確認腎上腺素是否為全身用途，或由醫療人員確認與局部麻醉藥共同使用的例外；這個途徑選項本身不足以判定可用。本工具可判讀明確非靜脈的局部麻醉注射，其他情境需由專業人員進一步確認。"] };
    }
  }
  const evaluate = match.rule.evidenceId ? evaluateDrug : evaluateDrugConditions;
  const result = evaluate(match.rule, { ...options, route });
  if (match.rule.s5OphthalmicException && !route) result.reasons[0] = "S5 的此項例外只限眼部局部使用；請確認實際途徑，不能套用吸入或其他局部途徑例外。";
  if (match.rule.s5IntravenousOnly && !route) result.reasons[0] = "此項 S5 血漿增容劑限制取決於是否經靜脈使用；請先確認實際給藥途徑。";
  if (match.rule.epinephrineException && options.inCompetition === true && !route) result.reasons[0] = "腎上腺素賽內禁用，但局部給藥或與局部麻醉藥共同使用可能適用例外；請先確認實際途徑與用途。";
  if (match.rule.localImidazolineException && options.inCompetition === true && !route) result.reasons[0] = "賽內只有皮膚、鼻、眼、耳使用符合此項 S6 例外；請確認實際途徑。肺部吸入、口服／口腔黏膜及注射不屬例外。";
  if (route === "ophthalmic") result.reasons = result.reasons.map((reason) => reason.replace("ophthalmic", "眼部局部使用"));
  if (route === "intravenous") result.reasons = result.reasons.map((reason) => reason.replace("intravenous", "靜脈輸注／注射"));
  if (route === "non-intravenous-injection") result.reasons = result.reasons.map((reason) => reason.replace("non-intravenous-injection", "非靜脈注射"));
  if (!federationNames.has(match.key) || ["prohibited", "needs-tue"].includes(result.verdict)) return result;
  const reason = `CMAS 另有苯二氮平類／PDE5 抑制劑的賽事規則，期間為${federationRules.competitionWindow}請向賽事醫療主管確認；這不是 WADA P1 分類，也不推定一般 TUE 可豁免。`;
  if (!options.sport) return { verdict: "conditions-required", reasons: ["請先確認運動項目與所屬聯盟。", reason] };
  if (options.sport.includes("CMAS")) return {
    verdict: options.inCompetition === true && options.sport === "自由潛水（CMAS）" ? "prohibited" : "conditions-required",
    reasons: [reason, "一般 WADA 賽外時段仍可能落在 CMAS 的 72 小時賽內期間；本工具未計算賽事開始時間或體內殘留。"],
  };
  return result;
}

export const normalizeDrugIngredientName = (name) => normalizeDrugText(name).replace(/[()[\]]/g, " ").replace(/\s+/g, " ").trim();
const normalizedName = normalizeDrugIngredientName;
const aliases = new Map(Object.keys(rules).map((key) => [normalizedName(key), key]));
for (const [alias, key] of Object.entries(extension.aliases)) {
  if (!rules[key]) throw new Error(`Unknown ingredient alias target: ${key}`);
  aliases.set(normalizedName(alias), key);
}
const literalAliases = extension.reviewedLiteralAliases ?? {};
if (Object.hasOwn(extension, "reviewedLiteralAliases")
  && (!extension.reviewedLiteralAliases || typeof extension.reviewedLiteralAliases !== "object" || Array.isArray(extension.reviewedLiteralAliases))) {
  throw new Error("Invalid reviewed literal identity");
}
for (const [raw, record] of Object.entries(literalAliases)) {
  const prior = aliases.get(normalizedName(raw));
  if (normalizeDrugText(raw) !== raw || !rules[record?.key] || (prior && prior !== record.key)
    || record.evidence?.type !== "reviewed-literal-name"
    || !/^https:\/\/www\.check-antidoping\.org\.tw\/inquiry_page\.php\?id=\d+&category=2$/.test(record.evidence?.url || "")
    || !/^[a-f0-9]{64}$/.test(record.evidence?.sourceSha256 || "")
    || !record.evidence?.identityBasis || !record.evidence?.referenceLicense) {
    throw new Error("Invalid reviewed literal identity");
  }
}
// Exact whole-name matching only. Do not use brand aliases or substring matching.
// E.g. methylprednisolone must never become prednisolone; pseudoephedrine != ephedrine.
const suffixes = [...extension.saltSuffixes].sort((a, b) => b.length - a.length);
export function matchDrugIngredient(name, { includeSourceAliases = true } = {}) {
  const literal = normalizeDrugText(name);
  if (Object.hasOwn(literalAliases, literal)) {
    const { key, evidence: identityEvidence } = literalAliases[literal];
    return { key, rule: rules[key], match: literal, identityEvidence };
  }
  const stack = [];
  for (const char of String(name ?? "").normalize("NFKC")) {
    if (char === "(" || char === "[") stack.push(char);
    if ((char === ")" && stack.pop() !== "(") || (char === "]" && stack.pop() !== "[")) return null;
  }
  if (stack.length) return null;
  const original = normalizedName(name);
  let candidate = original;
  const sourceAlias = includeSourceAliases && sourceAliases.aliases[candidate];
  if (sourceAlias) {
    if (!rules[sourceAlias.key]) throw new Error(`Unknown source alias target: ${sourceAlias.key}`);
    return { key: sourceAlias.key, rule: rules[sourceAlias.key], match: candidate, identityEvidence: sourceAlias.evidence };
  }
  for (let i = 0; i < 6; i++) {
    if (aliases.has(candidate)) {
      const key = aliases.get(candidate);
      // Polymer derivatives (e.g. dextran sulfate) are not ordinary salt forms
      // of the named plasma expander. Only its exact, curated names may match.
      if (rules[key].exactNameOnly && candidate !== original) return null;
      return { key, rule: rules[key], match: candidate };
    }
    const suffix = suffixes.find((salt) => candidate.endsWith(` ${salt}`));
    if (!suffix) return null;
    candidate = candidate.slice(0, -(suffix.length + 1)).trim();
  }
  return null;
}

const LABELS = {
  restricted: "含禁用成分，需專業確認",
  conditional: "有使用條件，尚不能判定可用",
  unresolved: "成分判讀未完整，請查證",
  "no-listed-restriction": "已對應成分未見禁用限制",
  "outdated-rules": "超出規則適用年份，請重新查證",
};

export function assessDrugProduct(product, { route = null, sport = null, sex = null, epinephrineUse = null, inCompetition = true, s5Concomitant = "unknown", date = taiwanDate() } = {}) {
  const parsedDate = new Date(`${date}T00:00:00Z`);
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === date;
  const stale = !validDate || date < extension.effectiveFrom || date > extension.effectiveThrough || date < evidenceRules.effectiveFrom || date > evidenceRules.effectiveThrough;
  const names = product.ingredientNames ?? [];
  const matched = names.map((name) => ({ name, match: matchDrugIngredient(name) }));
  // An unconfirmed route exception must neither grant permission nor assert
  // confirmed use of a prohibited S5 substance. Preserve its unknown state.
  const s5States = matched.filter(({ match }) => match?.rule.wadaCode === "S5").map(({ match }) => s5State(match.rule, route));
  const containsS5 = s5States.includes("prohibited");
  const combinedS5 = containsS5 || s5Concomitant === "prohibited" ? "prohibited" : s5States.includes("unknown") ? "unknown" : s5Concomitant;
  const ingredients = matched.map(({ name, match }) => ({
    name, key: match?.key ?? null, wadaCode: match?.rule.wadaCode ?? null,
    sexRestriction: match?.rule.sexRestriction ?? null,
    epinephrineException: match?.rule.epinephrineException === true,
    evidence: match?.rule.evidence ?? null, identityEvidence: match?.identityEvidence ?? null,
    federationEvidence: federationNames.has(match?.key) ? federationRules.source : federationRules.pendingReviews?.[match?.key]?.source ?? null,
    assessment: stale ? { verdict: "unknown", reasons: ["日期不在 2026 年規則適用範圍內；停止顯示此成分的允許或禁用判定。"] }
      : match ? evaluateIngredient(match, { route, sport, sex, epinephrineUse, inCompetition, s5Concomitant: combinedS5, asOf: date })
      : { verdict: "unknown", reasons: ["此成分尚無可靠對應規則；不能將未命中視為不禁用。"] },
  }));
  const unknownCount = ingredients.filter((item) => item.assessment.verdict === "unknown").length;
  const restricted = ingredients.some((item) => ["prohibited", "needs-tue"].includes(item.assessment.verdict));
  const conditional = ingredients.some((item) => ["conditions-required", "permitted-threshold", "in-competition"].includes(item.assessment.verdict));
  const incomplete = !names.length || unknownCount > 0 || Boolean(product.conflictingFields?.length);
  const verdict = stale ? "outdated-rules" : restricted ? "restricted" : conditional ? "conditional" : incomplete ? "unresolved" : "no-listed-restriction";
  return {
    verdict, label: LABELS[verdict], ingredients, unknownCount, incomplete, containsS5,
    ruleYear: extension.listVersion,
    notices: [
      "本功能為開放資料與列名物質的初步對照，未經臨床逐品項審核，也不是 TADA 的原始判定。查無資料或未命中不代表可用；完整 WADA 類別也包含未逐一列名的相似物質。",
      ...(stale ? ["目前只支援 2026 年規則，本次結果不能用來判定其他年份的比賽用藥。"] : []),
      ...(incomplete ? ["本品仍有未完成對照的成分或來源差異；下方已知成分的結果不能代表整個產品。"] : []),
      "劑型不等於實際給藥途徑。靜脈輸注／注射涉及 M2 規則：12 小時內超過 100 mL，除醫院治療、外科手術、臨床診斷檢查等例外，應確認 TUE；輸入物質仍須另行判讀。",
      "賽外使用仍可能影響賽內檢體；本工具不計算清除期、實際劑量或檢體濃度，也不判定個人 TUE 是否獲准。請由隊醫、藥師與運動禁藥管制組織確認。",
    ],
  };
}
