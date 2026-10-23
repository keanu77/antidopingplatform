import { DRUG_RULE_VERSION, matchDrugIngredient } from "./drugAssessment.js";
import { taiwanDate } from "./drugCatalog.js";

// Food registration and NHI reimbursement contain no athlete batch clearance.
// This helper deliberately has no "permitted" or "safe" product outcome.
export function reviewProductEvidence(product, date = taiwanDate()) {
  const parsed = new Date(`${date}T00:00:00Z`);
  const rulesCurrent = /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date
    && date >= DRUG_RULE_VERSION.effectiveFrom && date <= DRUG_RULE_VERSION.effectiveThrough;
  const names = product.ingredientNames || [];
  const flags = rulesCurrent ? names.flatMap((name) => {
    const matched = matchDrugIngredient(name);
    return matched && matched.rule.wadaCode !== "none" ? [{ name, code: matched.rule.wadaCode, key: matched.key }] : [];
  }) : [];
  return {
    status: "unverified", rulesCurrent, flags,
    label: flags.length ? "成分名稱對應到禁用清單，需專業確認" : "尚不能判定運動員可用",
    compositionLabel: product.compositionScope === "health-effect-components" ? "保健功效相關成分（不是完整配方）"
      : product.compositionScope === "source-declared" ? "來源登錄成分（須核對實際包裝）" : "來源未提供完整處方成分",
    batchLabel: "此資料沒有產品批號的運動禁藥檢測證明",
  };
}
