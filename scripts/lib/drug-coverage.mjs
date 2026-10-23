// Coverage is a property of a fixed cohort, not a safety/accuracy score.
export function measureDrugCoverage(products, matchIngredient, targetPercent = 95) {
  if (!Number.isFinite(targetPercent) || targetPercent <= 0 || targetPercent > 100) throw new Error("Invalid coverage target");
  const names = new Map();
  const cohorts = { all: [], uncancelled: [], uncancelledWithComposition: [], uncancelledFormulations: [], uncancelledFormulationsWithComposition: [] };
  const missingByLicenseType = {};
  for (const p of products) {
    const ingredientNames = [...new Set(p.ingredientNames ?? [])];
    const uncancelled = !p.cancellation;
    const formulation = String(p.licenseType ?? "").replace(/\s/g, "") === "製劑";
    let matched = 0;
    for (const name of ingredientNames) {
      if (!names.has(name)) names.set(name, { name, key: matchIngredient(name)?.key || null, products: 0, uncancelled: 0, exampleLicense: p.license });
      const entry = names.get(name);
      entry.products++;
      if (uncancelled) entry.uncancelled++;
      if (entry.key) matched++;
    }
    const kind = !ingredientNames.length ? "missingComposition" : matched === ingredientNames.length ? "fullyNameMapped" : matched ? "partiallyNameMapped" : "noNamesMapped";
    const row = { kind, conflicting: Boolean(p.conflictingFields?.length), ingredientNames };
    cohorts.all.push(row);
    if (uncancelled) {
      cohorts.uncancelled.push(row);
      if (ingredientNames.length) cohorts.uncancelledWithComposition.push(row);
      else missingByLicenseType[p.licenseType || "未提供"] = (missingByLicenseType[p.licenseType || "未提供"] || 0) + 1;
      if (formulation) {
        cohorts.uncancelledFormulations.push(row);
        if (ingredientNames.length) cohorts.uncancelledFormulationsWithComposition.push(row);
      }
    }
  }
  const summaries = Object.fromEntries(Object.entries(cohorts).map(([name, rows]) => {
    const counts = { fullyNameMapped: 0, partiallyNameMapped: 0, noNamesMapped: 0, missingComposition: 0 };
    let fullyMappedWithoutSourceConflict = 0;
    for (const r of rows) {
      counts[r.kind]++;
      if (r.kind === "fullyNameMapped" && !r.conflicting) fullyMappedWithoutSourceConflict++;
    }
    const targetProducts = Math.ceil(rows.length * targetPercent / 100);
    return [name, { total: rows.length, ...counts, fullyMappedWithoutSourceConflict,
      coveragePercent: rows.length ? 100 * fullyMappedWithoutSourceConflict / rows.length : 0,
      targetProducts, remainingProducts: Math.max(0, targetProducts - fullyMappedWithoutSourceConflict),
      targetMet: rows.length > 0 && fullyMappedWithoutSourceConflict >= targetProducts,
    }];
  }));
  const pending = [...names.values()].filter((r) => !r.key)
    .sort((a, b) => b.uncancelled - a.uncancelled || b.products - a.products || a.name.localeCompare(b.name, "en"));
  // Workload projection does not create rules or count unresolved names as covered.
  const eligible = pending.filter((r) => r.uncancelled > 0);
  const rank = new Map(eligible.map((r, i) => [r.name, i + 1]));
  const completionRanks = cohorts.uncancelledWithComposition.filter((r) => !r.conflicting)
    .map((r) => Math.max(0, ...r.ingredientNames.map((n) => rank.get(n) || 0))).sort((a, b) => a - b);
  const targetIndex = summaries.uncancelledWithComposition.targetProducts - 1;
  const targetCohort = summaries.uncancelledWithComposition;
  const milestones = [...new Set([95, 97, 98, 99, targetPercent])].sort((a, b) => a - b).map((percent) => {
    const targetProducts = Math.ceil(targetCohort.total * percent / 100);
    return { percent, cohort: "uncancelledWithComposition", total: targetCohort.total,
      fullyMappedWithoutSourceConflict: targetCohort.fullyMappedWithoutSourceConflict,
      targetProducts, remainingProducts: Math.max(0, targetProducts - targetCohort.fullyMappedWithoutSourceConflict),
      targetMet: targetCohort.total > 0 && targetCohort.fullyMappedWithoutSourceConflict >= targetProducts,
      additionalNamesByFrequency: targetProducts > 0 ? completionRanks[targetProducts - 1] ?? null : null,
    };
  });
  return {
    ingredientNames: names.size, mappedIngredientNames: names.size - pending.length,
    unmappedIngredientNames: pending.length, cohorts: summaries, missingByLicenseType, pending,
    target: { percent: targetPercent, cohort: "uncancelledWithComposition", ...summaries.uncancelledWithComposition },
    // Aspirational milestones share the exact acceptance cohort. Projections
    // never count as completed products or change the configured update gate.
    milestones,
    workloadProjection: {
      interpretation: "假設依頻率逐一完成可靠規則的工作量估算；不是已完成判讀，不代表需要相同數量的不同物質規則。",
      unresolvedNamesInTargetCohort: eligible.length,
      additionalNamesByFrequencyForTarget: targetIndex >= 0 ? completionRanks[targetIndex] ?? null : null,
      curve: [0, 50, 100, 250, 500, 1000, 1500, 2000, 2500, 3000].filter((n) => n <= eligible.length).map((n) => ({
        additionalNames: n, products: completionRanks.filter((r) => r <= n).length,
        percent: cohorts.uncancelledWithComposition.length ? 100 * completionRanks.filter((r) => r <= n).length / cohorts.uncancelledWithComposition.length : 0,
      })),
    },
  };
}
