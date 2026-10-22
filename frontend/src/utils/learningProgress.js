import { learningPaths, questionLearning } from '../data/learningPaths';
import { scenarioQuestions, knowledgeQuestions } from '../data/quiz';
import { registry, calendarDate } from '../../../shared/content-evidence.mjs';
import { questionEvidence } from './quizSession';

export const PROGRESS_KEY = 'clean-sport-learning-v1';
export const PROGRESS_MAX_AGE = 90 * 24 * 60 * 60 * 1000;
export const allQuestions = [...scenarioQuestions, ...knowledgeQuestions];
const taskIds = learningPaths.flatMap(path => path.tasks.map(task => `${path.id}:${task.id}`));

// This checksum is a content revision identifier, not a security mechanism.
export function contentRevision(content) {
  let hash = 2166136261;
  for (const char of JSON.stringify(content)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(16);
}
export const PROGRESS_REVISION = contentRevision({ learningPaths, questionLearning, allQuestions,
  evidence: allQuestions.map(q => registry.entries[`quiz:${q.id}`]), versions: registry.versions, sources: registry.sources });

export function emptyProgress() { return { completed: [], answers: [], reviewOn: null }; }

export function validReviewDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

export function progressExpiry(now) {
  const boundaries = allQuestions.flatMap(q => {
    const entry = registry.entries[`quiz:${q.id}`];
    const version = registry.versions[entry?.ruleVersion];
    return [version?.effectiveUntil && new Date(`${version.effectiveUntil}T00:00:00`).getTime(),
      entry?.nextReviewAt && new Date(`${entry.nextReviewAt}T23:59:59.999`).getTime(),
      version?.nextReviewAt && new Date(`${version.nextReviewAt}T23:59:59.999`).getTime()].filter(Number.isFinite);
  });
  return Math.min(now + PROGRESS_MAX_AGE, ...boundaries);
}

export function parseProgress(raw, now = Date.now(), revision = PROGRESS_REVISION) {
  try {
    const value = JSON.parse(raw);
    if (!value || value.schemaVersion !== 1 || value.revision !== revision
      || !Number.isFinite(value.updatedAt) || value.updatedAt > now + 300000
      || !Number.isFinite(value.expiresAt) || value.expiresAt <= now
      || value.expiresAt > progressExpiry(value.updatedAt)
      || !Array.isArray(value.completed) || value.completed.length > taskIds.length
      || value.completed.some(id => !taskIds.includes(id)) || new Set(value.completed).size !== value.completed.length
      || !Array.isArray(value.answers) || value.answers.length > allQuestions.length
      || new Set(value.answers.map(a => a?.questionId)).size !== value.answers.length
      || (value.reviewOn !== null && !validReviewDate(value.reviewOn))) return null;
    const answers = value.answers.map(answer => {
      const question = allQuestions.find(q => q.id === answer?.questionId);
      if (!question || !Number.isInteger(answer.optionIndex) || !question.options[answer.optionIndex]
        || answer.option !== question.options[answer.optionIndex]
        || !questionEvidence(question, calendarDate(new Date(now))).valid) throw new Error('Invalid saved answer');
      return { questionId: question.id, optionIndex: answer.optionIndex, option: answer.option };
    });
    // Whitelist fields so unrelated or personal data is never carried forward.
    return { completed: [...value.completed], answers, reviewOn: value.reviewOn };
  } catch { return null; }
}

export function readProgress(storage, now = Date.now()) {
  try {
    const raw = storage.getItem(PROGRESS_KEY);
    if (raw === null) return emptyProgress();
    const value = parseProgress(raw, now);
    if (value) return value;
    storage.removeItem(PROGRESS_KEY);
  } catch { /* Storage may be disabled or full. Learning remains available. */ }
  return emptyProgress();
}

export function saveProgress(storage, progress, now = Date.now()) {
  const value = { ...progress, schemaVersion: 1, revision: PROGRESS_REVISION, updatedAt: now, expiresAt: progressExpiry(now) };
  const clean = parseProgress(JSON.stringify(value), now);
  if (!clean) return false;
  try {
    storage.setItem(PROGRESS_KEY, JSON.stringify({ ...clean, schemaVersion: 1, revision: PROGRESS_REVISION, updatedAt: now, expiresAt: value.expiresAt }));
    return true;
  } catch { return false; }
}

export function clearProgress(storage) {
  try { storage.removeItem(PROGRESS_KEY); return true; } catch { return false; }
}

export function mergeAnswer(progress, answer) {
  return { ...progress, answers: [...progress.answers.filter(previous => previous.questionId !== answer.questionId), answer] };
}
