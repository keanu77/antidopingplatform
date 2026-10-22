import { registry, assessEvidence, calendarDate } from '../../../shared/content-evidence.mjs';

export function questionEvidence(question, asOf = calendarDate(), catalog = registry) {
  const id = `quiz:${question?.id}`;
  return assessEvidence(id, catalog.entries[id]?.ruleVersion, asOf, catalog);
}

export function eligibleQuestions(questions, asOf = calendarDate(), catalog = registry) {
  return questions.filter(question => questionEvidence(question, asOf, catalog).valid);
}

// Fisher-Yates works on a copy. The chosen IDs remain fixed through the results view.
export function createQuizSession(mode, questions, random = Math.random) {
  const pool = [...questions];
  if (mode === 'quiz') {
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
  }
  return { mode, questionIds: (mode === 'quiz' ? pool.slice(0, 10) : pool).map(q => q.id), answers: [] };
}

export function answerQuestion(session, question, optionIndex, asOf = calendarDate(), catalog = registry) {
  if (!session.questionIds.includes(question.id) || session.answers.some(answer => answer.questionId === question.id)
    || !Number.isInteger(optionIndex) || !question.options[optionIndex] || !questionEvidence(question, asOf, catalog).valid) return session;
  return { ...session, answers: [...session.answers, { questionId: question.id, optionIndex, option: question.options[optionIndex] }] };
}

export function sessionResults(session, questions, asOf = calendarDate(), catalog = registry) {
  return session.answers.map(answer => {
    const question = questions.find(q => q.id === answer.questionId);
    const valid = question && question.options[answer.optionIndex] === answer.option && questionEvidence(question, asOf, catalog).valid;
    return { ...answer, question, correct: valid ? answer.optionIndex === question.correctIndex : null };
  });
}
