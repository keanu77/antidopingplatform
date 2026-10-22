import { describe, expect, it } from 'vitest';
import { registry } from '../../../shared/content-evidence.mjs';
import { scenarioQuestions, knowledgeQuestions } from '../data/quiz';
import { answerQuestion, createQuizSession, eligibleQuestions, questionEvidence, sessionResults } from './quizSession';

const questions = [...scenarioQuestions, ...knowledgeQuestions];
const day = '2026-10-23';

describe('stable quiz sessions', () => {
  it('preserves shuffled IDs, option text and answer pairing through results', () => {
    const originalIds = questions.map(q => q.id);
    let session = createQuizSession('quiz', eligibleQuestions(questions, day), () => 0.25);
    const selectedIds = [...session.questionIds];
    expect(selectedIds).toHaveLength(10);
    expect(new Set(selectedIds).size).toBe(10);
    const selected = selectedIds.map(id => questions.find(q => q.id === id));
    for (const question of selected) session = answerQuestion(session, question, question.correctIndex, day);
    const result = sessionResults(session, [...questions].reverse(), day);
    expect(result.map(answer => answer.questionId)).toEqual(selectedIds);
    expect(result.every(answer => answer.correct && answer.option === answer.question.options[answer.optionIndex])).toBe(true);
    expect(session.questionIds).toEqual(selectedIds);
    expect(questions.map(q => q.id)).toEqual(originalIds);
  });

  it('prevents double scoring, unknown questions and invalid option indexes', () => {
    const question = questions[0];
    const initial = createQuizSession('scenario', [question]);
    expect(answerQuestion(initial, questions[1], 0, day)).toBe(initial);
    expect(answerQuestion(initial, question, -1, day)).toBe(initial);
    expect(answerQuestion(initial, question, 0.5, day)).toBe(initial);
    const answered = answerQuestion(initial, question, 0, day);
    expect(answerQuestion(answered, question, 1, day)).toBe(answered);
    expect(sessionResults(answered, questions, day)[0].correct).toBe(false);
  });

  it('allows a deliberate review attempt without mutating the previous attempt', () => {
    const question = questions[0];
    const first = answerQuestion(createQuizSession('quiz', [question]), question, 0, day);
    const review = answerQuestion(createQuizSession('review', [question]), question, question.correctIndex, day);
    expect(sessionResults(first, questions, day)[0].correct).toBe(false);
    expect(sessionResults(review, questions, day)[0].correct).toBe(true);
    expect(createQuizSession('quiz', questions.slice(0, 3)).questionIds).toHaveLength(3);
    expect(createQuizSession('scenario', scenarioQuestions).questionIds).toEqual(scenarioQuestions.map(q => q.id));
  });
});

describe('quiz evidence gates', () => {
  it('suspends all current questions at the 2027 rule boundary', () => {
    expect(eligibleQuestions(questions, '2026-12-31')).toHaveLength(16);
    expect(eligibleQuestions(questions, '2027-01-01')).toEqual([]);
  });

  it('rechecks evidence at answer time and result time if a session crosses expiry', () => {
    const question = questions[0];
    const session = createQuizSession('scenario', [question]);
    expect(answerQuestion(session, question, question.correctIndex, '2027-01-01')).toBe(session);
    const answered = answerQuestion(session, question, question.correctIndex, '2026-12-31');
    expect(sessionResults(answered, questions, '2026-12-31')[0].correct).toBe(true);
    expect(sessionResults(answered, questions, '2027-01-01')[0].correct).toBeNull();
  });

  it.each(['pending_verification', 'superseded', 'withdrawn'])('excludes %s sources rather than scoring them', status => {
    const catalog = structuredClone(registry);
    catalog.entries['quiz:sc1'].verificationStatus = status;
    const session = createQuizSession('scenario', [questions[0]]);
    expect(questionEvidence(questions[0], day, catalog).valid).toBe(false);
    expect(eligibleQuestions(questions, day, catalog)).toHaveLength(15);
    expect(answerQuestion(session, questions[0], 1, day, catalog)).toBe(session);
  });

  it('does not score missing sources or mismatched saved option text', () => {
    const catalog = structuredClone(registry);
    delete catalog.sources['list-faq'];
    expect(questionEvidence(questions[0], day, catalog).valid).toBe(false);
    const session = answerQuestion(createQuizSession('scenario', [questions[0]]), questions[0], 1, day);
    session.answers[0].option = 'an old option';
    expect(sessionResults(session, questions, day)[0].correct).toBeNull();
  });
});
