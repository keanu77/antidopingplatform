// Product-level comparator. No result here changes a rule or a coverage count.
const exact = (s) => String(s).normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
const composition = (names) => JSON.stringify([...new Set(names.map(exact))].sort());
const binary = (verdict) => verdict === 'restricted' ? 'prohibited' : verdict === 'no-listed-restriction' ? 'not-prohibited' : null;

export function routeScenario(form) {
  // These are explicit test scenarios suggested by the dosage form, not a
  // confirmation of the patient's actual administration. Generic injection,
  // liquid, powder, suppository and topical liquid remain unspecified.
  const oral = ['錠劑', '膜衣錠', '糖衣錠', '腸溶錠', '腸溶膜衣錠', '膠囊劑', '軟膠囊劑', '內服液劑', '口服液劑', '糖漿劑', '內服顆粒劑', '持續性藥效錠', '持續性藥效膜衣錠', '持續性藥效膠囊劑', '腸溶微粒膠囊劑'];
  if (oral.includes(form)) return 'oral';
  if (['點眼液劑', '眼藥膏劑'].includes(form)) return 'ophthalmic';
  if (['乳膏劑', '軟膏劑', '外用凝膠劑', '藥膠布'].includes(form)) return 'dermal';
  return null;
}

export function compareReference(product, fact, assess, date = '2026-10-23') {
  const context = { date, route: routeScenario(product.dosageForm) };
  const predictions = Object.fromEntries([['inCompetition', true], ['outOfCompetition', false]].map(([key, inCompetition]) => {
    const result = assess(product, { ...context, inCompetition });
    return [key, { verdict: result.verdict, unknownCount: result.unknownCount, incomplete: result.incomplete,
      conditions: result.ingredients.filter((i) => !['permitted', 'prohibited', 'needs-tue'].includes(i.assessment.verdict)).map((i) => ({ name: i.name, verdict: i.assessment.verdict, reasons: i.assessment.reasons })) }];
  }));
  const row = { license: product.license, nameZh: product.nameZh, dosageForm: product.dosageForm, ingredientNames: product.ingredientNames, context,
    contextBasis: '劑型所建議的測試情境；未核實個人實際用法。未指定運動、性別、劑量或例外，不代填可用條件。', predictions, comparisons: [] };
  if (!fact) return { ...row, status: 'reference-not-collected' };
  row.reference = Object.fromEntries(['url', 'sha256', 'retrievedAt', 'ingredientNames', 'inCompetition', 'outOfCompetition', 'substanceField', 'wadaCode', 'specificUsage'].map((k) => [k, fact[k] ?? null]));
  if (product.license !== fact.license || product.conflictingFields?.length || !fact.compositionMatchesTfda || !fact.sourceSummaryMatchesTfda
    || composition(product.ingredientNames) !== composition(fact.ingredientNames)
    || composition(product.ingredientSummary.split(';;').filter((s) => s.trim())) !== composition(fact.ingredientNames)) return { ...row, status: 'identity-or-formula-conflict' };
  if (fact.hasSpecificUsage || fact.specificUsage || !['不禁止', '禁止'].includes(fact.inCompetition) || !['不禁止', '禁止'].includes(fact.outOfCompetition)
    || !fact.substanceField || /雖含禁用物質/.test(fact.substanceField)) return { ...row, status: 'reference-conditions-need-review' };
  for (const period of ['inCompetition', 'outOfCompetition']) {
    const expected = fact[period] === '禁止' ? 'prohibited' : 'not-prohibited';
    const predicted = binary(predictions[period].verdict);
    row.comparisons.push({ period, reference: expected, prediction: predicted,
      outcome: predicted === null ? 'abstained' : predicted === expected ? 'agreement' : predicted === 'not-prohibited' ? 'potential-false-clear' : 'more-restrictive-than-reference' });
  }
  row.status = row.comparisons.some((c) => c.outcome === 'potential-false-clear') ? 'potential-false-clear'
    : row.comparisons.some((c) => c.outcome === 'more-restrictive-than-reference') ? 'more-restrictive-than-reference'
      : row.comparisons.some((c) => c.outcome === 'abstained') ? 'local-conditions-or-unresolved' : 'binary-status-agreement';
  return row;
}

export function summarizeComparisons(rows) {
  const count = (values) => Object.fromEntries([...new Set(values)].sort().map((v) => [v, values.filter((x) => x === v).length]));
  const pairs = rows.flatMap((r) => r.comparisons), decisive = pairs.filter((p) => p.prediction !== null);
  const complete = rows.filter((r) => r.comparisons.length === 2 && r.comparisons.every((c) => c.prediction !== null));
  const agree = complete.filter((r) => r.status === 'binary-status-agreement').length;
  return { sampledProducts: rows.length, referenceAvailable: rows.filter((r) => r.reference).length, statuses: count(rows.map((r) => r.status)),
    fullyComparableProducts: complete.length, agreeingProducts: agree, productAgreementPercent: complete.length ? 100 * agree / complete.length : null,
    productComparisonCompletionPercent: rows.length ? 100 * complete.length / rows.length : 0,
    periodComparisons: pairs.length, decisivePeriodComparisons: decisive.length, periodOutcomes: count(pairs.map((p) => p.outcome)),
    interpretation: '僅為已取得且身分、配方與條件可比的兩個時段之二元狀態一致率；其餘仍列在原樣本分母。非整體準確率，非獨立臨床驗證。與TADA不同不等於本機錯誤，需主要來源裁定。' };
}
