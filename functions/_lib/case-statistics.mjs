export function topWithRemainder(rows, limit = 9) {
  const sorted = [...rows].sort((a, b) => b.count - a.count);
  const rest = sorted.slice(limit).reduce((sum, row) => sum + row.count, 0);
  return [...sorted.slice(0, limit), ...(rest ? [{ key: "其他標籤", count: rest }] : [])];
}

export function primarySource(caseData) {
  // The chart describes the publisher of the primary link, not the governing
  // federation named inside a registry record (which may be different).
  let host;
  try { host = new URL(caseData.sourceLinks?.[0]?.url).hostname; }
  catch { return "來源未分類"; }
  const publishers = {
    "usada.org": "USADA", "ita.sport": "ITA",
    "athleticsintegrity.org": "AIU", "itia.tennis": "ITIA",
    "wada-ama.org": "WADA", "tas-cas.org": "CAS",
  };
  for (const [domain, publisher] of Object.entries(publishers)) {
    if (host === domain || host.endsWith(`.${domain}`)) return publisher;
  }
  return "其他來源";
}

export const isCountryPending = (c) => c.review?.countryEvidence?.status === "title_only";

// Title-only country labels stay out of the confirmed denominator until an
// official source is accepted for that case.
export function countryConfirmedDistribution(cases, limit = 15) {
  const counts = new Map();
  for (const c of cases) {
    if (isCountryPending(c) || !c.nationality) continue;
    counts.set(c.nationality, (counts.get(c.nationality) ?? 0) + 1);
  }
  return topWithRemainder([...counts].map(([key, count]) => ({ key, count })), limit)
    .map(({ key, count }) => ({ country: key === "其他標籤" ? "其他國家／地區" : key, count }));
}

export function reviewSummary(cases) {
  const count = (predicate) => cases.filter(predicate).length;
  const dates = cases.map((c) => c.review?.checkedAt).filter(Boolean).sort();
  const sources = new Map();
  for (const c of cases) {
    const label = primarySource(c);
    sources.set(label, (sources.get(label) ?? 0) + 1);
  }
  const models = (c) => c.review?.sourceComparison?.modelSeats?.length ?? 0;
  const consequence = (field) => ({
    confirmed: count((c) => c.punishment?.[field] === true),
    explicitlyAbsent: count((c) => c.punishment?.[field] === false),
    unknown: count((c) => c.punishment?.[field] == null),
  });
  return {
    totalCases: cases.length,
    newCases: count((c) => c.review?.datasetGroup === "new"),
    correctedLegacyCases: count((c) => c.review?.datasetGroup === "legacy_corrected"),
    coreChecked: count((c) => c.review?.status === "core_checked"),
    primaryExcerptChecked: count((c) => c.review?.status === "primary_excerpt_checked"),
    sourceCompared: count((c) => models(c) > 0),
    comparedByAtLeastTwo: count((c) => models(c) >= 2),
    comparedByThree: count((c) => models(c) >= 3),
    comparedByFour: count((c) => models(c) >= 4),
    modelCoverage: Object.fromEntries(["GPT", "Gemini", "Grok", "Claude"].map((seat) => [seat,
      count((c) => c.review?.sourceComparison?.modelSeats?.includes(seat))])),
    changedAfterModelReview: count((c) => c.review?.sourceComparison?.claimsChangedAfterReview === true),
    sourceDatesUnresolved: count((c) => c.review?.sourceComparison?.unresolvedSourceFields?.includes("dates")),
    countrySourceFollowups: count((c) => c.review?.countryEvidence?.status === "official_country_as_listed"),
    countryProfileAtLookup: count((c) => c.review?.countryEvidence?.scope === "official_profile_at_lookup"),
    lastCountryFollowupAt: cases.map((c) => c.review?.countryEvidence?.checkedAt).filter(Boolean).sort().at(-1) ?? null,
    countryEvidencePending: count(isCountryPending),
    countryConfirmedDenominator: count((c) => !isCountryPending(c)),
    countryConfirmedDistribution: countryConfirmedDistribution(cases),
    lastReviewedAt: dates.at(-1) ?? null,
    resultsCancelled: consequence("resultsCancelled"),
    medalStripped: consequence("medalStripped"),
    sourceDistribution: [...sources].map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count),
  };
}
