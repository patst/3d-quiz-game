import { describe, expect, it } from 'vitest';
import type { ChallengeType } from './types';
import { allowedSubjects, sessionSubjects, toggleSubject } from './subjects';

const t = (id: string, subject: 'math' | 'german' | 'knowledge') => ({ id, subject }) as ChallengeType;
const types = [t('m1', 'math'), t('m2', 'math'), t('g1', 'german'), t('k1', 'knowledge')];

describe('session subjects', () => {
  it('parents decide what is allowed', () => {
    expect(allowedSubjects(types, [])).toEqual(['math', 'german', 'knowledge']);
    expect(allowedSubjects(types, ['g1'])).toEqual(['math', 'knowledge']);
    expect(allowedSubjects(types, ['m1'])).toEqual(['math', 'german', 'knowledge']);
  });

  it('the child chooses within that; never empty', () => {
    expect(sessionSubjects(null, ['math', 'german'])).toEqual(['math', 'german']);
    expect(sessionSubjects(['knowledge'], ['math', 'german'])).toEqual(['math', 'german']);
    expect(sessionSubjects(['german'], ['math', 'german'])).toEqual(['german']);
  });

  it('toggling keeps at least one subject and a stable order', () => {
    expect(toggleSubject(['math', 'german'], 'math')).toEqual(['german']);
    expect(toggleSubject(['german'], 'german')).toEqual(['german']);
    expect(toggleSubject(['german'], 'math')).toEqual(['math', 'german']);
  });
});
