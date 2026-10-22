import { describe, expect, it } from 'vitest';
import { learningPaths, questionLearning, sharedLearningSources } from './learningPaths';
import { scenarioQuestions, knowledgeQuestions } from './quiz';
import { registry } from '../../../shared/content-evidence.mjs';

const routes = new Set(['/learning', '/tue', '/testing-process', '/education', '/prohibited-list', '/resources', '/adel', '/sources']);
const tabs = { '/tue': ['basic', 'application', 'diseases', 'tools'], '/education': ['substances', 'commonMistakes', 'violationTypes', 'supplements', 'caseLearning', 'specialties'] };
function checkLink(href) {
  const url = new URL(href, 'https://platform.example');
  expect(url.protocol).toBe('https:');
  if (url.hostname === 'platform.example') {
    expect(routes.has(url.pathname)).toBe(true);
    if (url.searchParams.has('tab')) expect(tabs[url.pathname]).toContain(url.searchParams.get('tab'));
    if (url.searchParams.has('role')) expect(learningPaths.map(path => path.id)).toContain(url.searchParams.get('role'));
  } else expect(['www.antidoping.org.tw', 'www.check-antidoping.org.tw']).toContain(url.hostname);
}

describe('role learning paths', () => {
  it('gives all three roles at least three concrete tasks, a checklist and an appropriate official course', () => {
    expect(learningPaths.map(path => path.id)).toEqual(['athlete', 'coach', 'medical']);
    for (const path of learningPaths) {
      expect(path.tasks.length).toBeGreaterThanOrEqual(3);
      expect(new Set(path.tasks.map(task => task.id)).size).toBe(path.tasks.length);
      expect(path.checklist.length).toBeGreaterThanOrEqual(3);
      expect(path.course).toContain('ADEL');
      for (const task of path.tasks) {
        expect(task.action.length).toBeGreaterThan(3); checkLink(task.href);
        expect(registry.entries[task.evidenceId]?.references.length).toBeGreaterThan(0);
      }
    }
    expect(learningPaths.find(path => path.id === 'coach').course).toContain('Coaches');
    expect(learningPaths.find(path => path.id === 'medical').course).toContain('Medical');
    expect(sharedLearningSources.every(id => registry.sources[id]?.url.startsWith('https://'))).toBe(true);
  });

  it('maps every quiz question to valid roles, a competency and an exact learning route', () => {
    for (const question of [...scenarioQuestions, ...knowledgeQuestions]) {
      const metadata = questionLearning[question.id];
      expect(metadata.roles.length).toBeGreaterThan(0);
      expect(metadata.roles.every(id => learningPaths.some(path => path.id === id))).toBe(true);
      expect(metadata.competency.length).toBeGreaterThan(2);
      checkLink(metadata.href);
    }
  });
});
