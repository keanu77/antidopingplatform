import baseData from "../../../backend/data/substances.json";
import extension from "../../../backend/data/drug-ingredient-rules.json";
import { evaluateDrug } from "./tueDecision.js";
import { normalizeDrugText, taiwanDate } from "./drugCatalog.js";

export const DRUG_RULE_VERSION = extension;
export const DRUG_SPORTS = baseData.substances.propranolol.sportRestricted;

const steroidRoutes = {
  oral: { status: "needs-tue", note: "糖皮質激素經口服或口腔黏膜使用，賽內禁用。" },
  injection: { status: "needs-tue", note: "糖皮質激素經任何注射途徑使用，賽內禁用。" },
  rectal: { status: "needs-tue", note: "糖皮質激素經直腸使用，賽內禁用。" },
  inhaled: { status: "permitted", note: "限於核准劑量與治療適應症，並須核對其他成分。" },
  topical: { status: "permitted", note: "限皮膚、鼻、眼、耳等清單所列局部途徑，以及核准劑量與治療適應症；口腔黏膜不屬此例外。" },
};

const rules = { ...baseData.substances };
for (const group of extension.groups) {
  for (const name of group.names) {
    if (rules[name]) throw new Error(`Duplicate substance rule: ${name}`);
    rules[name] = {
      displayName: name, wadaCode: group.code, prohibition: group.timing,
      tueEligible: true, needsTUE: true, sourcePage: group.page,
      ...(group.template === "glucocorticoid" ? { routes: steroidRoutes } : {}),
      ...(group.template === "beta-blocker" ? {
        sportRestricted: baseData.substances.propranolol.sportRestricted,
        sportRestrictedOutOfComp: baseData.substances.propranolol.sportRestrictedOutOfComp,
      } : {}),
    };
  }
}
export const DRUG_RULE_COUNT = Object.keys(rules).length;

const normalizedName = (name) => normalizeDrugText(name).replace(/[()[\]]/g, " ").replace(/\s+/g, " ").trim();
const aliases = new Map(Object.keys(rules).map((key) => [normalizedName(key), key]));
for (const [alias, key] of Object.entries(extension.aliases)) {
  if (!rules[key]) throw new Error(`Unknown ingredient alias target: ${key}`);
  aliases.set(normalizedName(alias), key);
}
// Exact whole-name matching only. Do not use brand aliases or substring matching.
// E.g. methylprednisolone must never become prednisolone; pseudoephedrine != ephedrine.
const suffixes = [...extension.saltSuffixes].sort((a, b) => b.length - a.length);
export function matchDrugIngredient(name) {
  let candidate = normalizedName(name);
  for (let i = 0; i < 6; i++) {
    if (aliases.has(candidate)) {
      const key = aliases.get(candidate);
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

export function assessDrugProduct(product, { route = null, sport = null, inCompetition = true, s5Concomitant = "unknown", date = taiwanDate() } = {}) {
  const parsedDate = new Date(`${date}T00:00:00Z`);
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === date;
  const stale = !validDate || date < extension.effectiveFrom || date > extension.effectiveThrough;
  const names = product.ingredientNames ?? [];
  const matched = names.map((name) => ({ name, match: matchDrugIngredient(name) }));
  // Combined products containing S5 trigger the concomitant rule automatically.
  const containsS5 = matched.some(({ match }) => match?.rule.wadaCode === "S5");
  const ingredients = matched.map(({ name, match }) => ({
    name, key: match?.key ?? null, wadaCode: match?.rule.wadaCode ?? null,
    assessment: stale ? { verdict: "unknown", reasons: ["日期不在 2026 年規則適用範圍內；停止顯示此成分的允許或禁用判定。"] }
      : match ? evaluateDrug(match.rule, { route, sport, inCompetition, s5Concomitant: containsS5 ? "prohibited" : s5Concomitant })
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
