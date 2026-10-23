import registry from '../backend/data/content-registry.json' with { type: 'json' };
export { registry };

export const CONTENT_TIME_ZONE = 'Asia/Taipei';
const contentDateFormatter = new Intl.DateTimeFormat('en', {
  timeZone: CONTENT_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
});

// Content validity and review deadlines use Taiwan time in both browser and API.
// This is separate from an event's in-/out-of-competition timing.
export function calendarDate(now = new Date()) {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) return null;
  const parts = Object.fromEntries(contentDateFormatter.formatToParts(now).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

// Taiwan's platform date boundary is midnight UTC+08:00, regardless of host TZ.
export function nextContentDateBoundary(now = new Date()) {
  const date = calendarDate(now);
  return date ? new Date(Date.parse(`${date}T00:00:00+08:00`) + 24 * 60 * 60 * 1000) : null;
}

function isCalendarDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

export function assessEvidence(evidenceId, ruleVersion, asOf = calendarDate(), catalog = registry) {
  const entry = catalog.entries[evidenceId];
  const version = catalog.versions[ruleVersion];
  let reason = null;
  if (!entry || !version || entry.ruleVersion !== ruleVersion) reason = '來源或規則版本不完整，無法作出確定判定。';
  else if (entry.verificationStatus !== 'source_checked' || !isCalendarDate(entry.verifiedAt)
    || !isCalendarDate(version.verifiedAt) || !entry.references?.length
    || entry.references.some(ref => !catalog.sources[ref.sourceId]?.url || !ref.locator)) reason = '此內容尚缺已核對的對應證據；待查不代表禁用或允許，請向運動禁藥管制組織確認。';
  else if (version.activationStatus !== 'active') reason = '這個規則版本尚未在平台啟用；官方公布不等於平台完成規則核對。';
  else if (!isCalendarDate(asOf) || !isCalendarDate(version.effectiveFrom) || !isCalendarDate(version.effectiveUntil)
    || version.effectiveFrom >= version.effectiveUntil
    || asOf < version.effectiveFrom || asOf >= version.effectiveUntil) reason = '規則有效期間不完整或目前日期不在有效期內，請查閱當年度官方規範。';
  else if (entry.verifiedAt > asOf || version.verifiedAt > asOf) reason = '核對日期晚於目前日期，紀錄無效，需重新核對官方來源後才能判定。';
  else if (!isCalendarDate(entry.nextReviewAt) || !isCalendarDate(version.nextReviewAt)
    || entry.nextReviewAt < entry.verifiedAt || version.nextReviewAt < version.verifiedAt
    || asOf > entry.nextReviewAt || asOf > version.nextReviewAt) reason = '複核日期不完整、無效或已逾期，需重新核對官方來源後才能判定。';
  return { valid: reason === null, reason, evidenceId: evidenceId || null, ruleVersion: ruleVersion || null, asOf, status: entry?.verificationStatus || 'missing' };
}

// Preserve legacy inventory shape without publishing answers that have not been checked.
export function publicQuiz(quiz, asOf) {
  const entry = registry.entries[quiz.evidenceId];
  const evidence = assessEvidence(quiz.evidenceId, entry?.ruleVersion, asOf);
  const { correctAnswer, explanation, ...inventory } = quiz;
  return evidence.valid
    ? { ...inventory, correctAnswer, explanation, evidence }
    : { ...inventory, correctAnswer: null, explanation: null, publicationStatus: 'pending_verification', evidence, learningUrl: '/quiz' };
}

export function publicSubstance(substance, asOf) {
  const evidence = assessEvidence(substance.evidenceId, substance.ruleVersion, asOf);
  return evidence.valid ? { ...substance, evidence } : {
    ...substance, evidence, prohibition: 'unverified', needsTUE: null, tueEligible: null,
    routes: null, washout: null, categoryLabel: '資料待核對', note: evidence.reason,
  };
}
