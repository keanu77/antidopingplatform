// Pure checks for scripts/check-live.mjs so the six-hour monitor alerts on rule expiry.
import { registry as defaultRegistry, calendarDate } from '../../shared/content-evidence.mjs';

const DAY_MS = 24 * 60 * 60 * 1000;
const daysBetween = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS);

// Last calendar date on which served evidence stays valid (effectiveUntil is exclusive, nextReviewAt inclusive).
function lastValidDate(evidenceId, ruleVersion, catalog) {
  const entry = catalog.entries[evidenceId];
  const version = catalog.versions[ruleVersion];
  if (!entry || !version) return null;
  const candidates = [entry.nextReviewAt, version.nextReviewAt];
  if (version.effectiveUntil) candidates.push(new Date(Date.parse(version.effectiveUntil) - DAY_MS).toISOString().slice(0, 10));
  const dates = candidates.filter(d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d));
  return dates.length ? dates.sort()[0] : null;
}

export function assessLiveSubstances(payload, { warnDays = 30, catalog = defaultRegistry, today } = {}) {
  const errors = [];
  const warnings = [];
  const substances = payload?.substances;
  if (!substances || typeof substances !== 'object') return { errors: ['Substance data not served'], warnings, valid: 0, asOf: null };
  const drugs = Object.entries(substances);
  const salbutamol = substances.salbutamol;
  if (!salbutamol?.s5ThresholdRule) errors.push('Current S5 data not served');
  if (salbutamol && salbutamol.evidence?.valid !== true) errors.push(`salbutamol evidence invalid: ${salbutamol.evidence?.reason || 'missing evidence'}`);
  const valid = drugs.filter(([, drug]) => drug?.evidence?.valid === true);
  if (valid.length === 0) errors.push('No served drug decision has valid evidence (rules or reviews expired?)');
  const asOf = salbutamol?.evidence?.asOf || valid[0]?.[1]?.evidence?.asOf || today || calendarDate();
  let soonest = null;
  for (const [, drug] of valid) {
    const last = lastValidDate(drug.evidence.evidenceId, drug.evidence.ruleVersion, catalog);
    if (last && (!soonest || last < soonest.date)) soonest = { date: last, ruleVersion: drug.evidence.ruleVersion };
  }
  if (soonest && asOf) {
    const remaining = daysBetween(asOf, soonest.date);
    if (remaining < 0) errors.push(`Served evidence for ${soonest.ruleVersion} expired after ${soonest.date}`);
    else if (remaining <= warnDays) warnings.push(`Evidence for ${soonest.ruleVersion} expires after ${soonest.date} (${remaining} day(s) left); re-verify sources or activate the next rule version.`);
  }
  return { errors, warnings, valid: valid.length, total: drugs.length, asOf, lastValidDate: soonest?.date || null };
}
