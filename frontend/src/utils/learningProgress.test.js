import { describe, expect, it } from 'vitest';
import { PROGRESS_KEY, PROGRESS_REVISION, allQuestions, clearProgress, contentRevision, emptyProgress, mergeAnswer, parseProgress, progressExpiry, readProgress, saveProgress, validReviewDate } from './learningProgress';

const now = new Date('2026-10-23T12:00:00').getTime();
const question = allQuestions[0];
const answer = { questionId: question.id, optionIndex: 0, option: question.options[0] };
const progress = { completed: ['athlete:medicine'], answers: [answer], reviewOn: '2026-10-30' };
function storageMock() {
  const values = new Map([['unrelated-key', 'preserve']]);
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}
function record(overrides = {}) {
  return JSON.stringify({ ...progress, schemaVersion: 1, revision: PROGRESS_REVISION, updatedAt: now, expiresAt: progressExpiry(now), ...overrides });
}

describe('anonymous learning progress', () => {
  it('roundtrips tasks, selected options and review date while discarding unrelated fields', () => {
    const storage = storageMock();
    expect(saveProgress(storage, { ...progress, personalData: 'must not persist' }, now)).toBe(true);
    expect(readProgress(storage, now)).toEqual(progress);
    expect(storage.getItem(PROGRESS_KEY)).not.toContain('personalData');
  });

  it.each(['{broken', 'null', '[]', '"text"'])('ignores and removes malformed storage: %s', value => {
    const storage = storageMock(); storage.setItem(PROGRESS_KEY, value);
    expect(readProgress(storage, now)).toEqual(emptyProgress());
    expect(storage.getItem(PROGRESS_KEY)).toBeNull();
  });

  it.each([
    { completed: ['unknown:task'] }, { completed: ['athlete:medicine', 'athlete:medicine'] },
    { answers: [{ ...answer, optionIndex: 200 }] }, { answers: [{ ...answer, option: 'old label' }] },
    { answers: [answer, answer] }, { answers: [null] }, { reviewOn: '2026-02-30' },
    { expiresAt: now - 1 }, { updatedAt: now + 600000 }, { schemaVersion: 2 },
    { revision: 'old-revision' },
  ])('rejects invalid or stale records: %j', overrides => {
    expect(parseProgress(record(overrides), now)).toBeNull();
  });

  it('invalidates a changed revision and expires saved 2026 answers at 2027 midnight', () => {
    expect(parseProgress(record(), now, 'new-content-revision')).toBeNull();
    expect(progressExpiry(now)).toBe(new Date('2026-12-31T23:59:59.999+08:00').getTime());
    const storage = storageMock(); saveProgress(storage, progress, now);
    expect(readProgress(storage, new Date('2027-01-01T00:00:00+08:00').getTime())).toEqual(emptyProgress());
    expect(storage.getItem(PROGRESS_KEY)).toBeNull();
    expect(contentRevision({ option: 'A' })).not.toBe(contentRevision({ option: 'B' }));
  });

  it('clears only this feature storage, including the reminder and wrong answers', () => {
    const storage = storageMock(); saveProgress(storage, progress, now);
    expect(clearProgress(storage)).toBe(true);
    expect(readProgress(storage, now)).toEqual(emptyProgress());
    expect(storage.getItem('unrelated-key')).toBe('preserve');
  });

  it('continues learning when browser storage is disabled', () => {
    const blocked = { getItem() { throw new Error(); }, setItem() { throw new Error(); }, removeItem() { throw new Error(); } };
    expect(readProgress(blocked, now)).toEqual(emptyProgress());
    expect(saveProgress(blocked, progress, now)).toBe(false);
    expect(clearProgress(blocked)).toBe(false);
  });

  it('replaces one prior answer without losing task or reminder progress', () => {
    const corrected = { questionId: question.id, optionIndex: question.correctIndex, option: question.options[question.correctIndex] };
    const next = mergeAnswer(progress, corrected);
    expect(next.answers).toEqual([corrected]);
    expect(next.completed).toEqual(progress.completed);
    expect(next.reviewOn).toEqual(progress.reviewOn);
    expect(progress.answers).toEqual([answer]);
    expect(validReviewDate('2026-10-30')).toBe(true);
    expect(validReviewDate('2026-02-30')).toBe(false);
  });
});
