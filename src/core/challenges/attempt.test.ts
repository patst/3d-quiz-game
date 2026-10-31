import { describe, expect, it } from 'vitest';
import { initialAttempt, submitAnswer } from './attempt';
import type { ChallengeInstance } from './types';

const instance: ChallengeInstance = {
  typeId: 'test',
  level: 1,
  data: null,
  choices: [1, 2, 3, 4].map((v, i) => ({ id: `c${i}`, value: v })),
  correctChoiceId: 'c3',
  prompt: { key: 'x' },
  explanation: { key: 'y' },
};

describe('submitAnswer', () => {
  it('gives full stars on first try', () => {
    const r = submitAnswer(instance, initialAttempt, 'c3', 2);
    expect(r.feedback).toBe('correct');
    expect(r.state).toMatchObject({ finished: true, stars: 2 });
  });

  it('still gives full stars after one wrong try', () => {
    let r = submitAnswer(instance, initialAttempt, 'c0', 2);
    expect(r.feedback).toBe('tryAgain');
    r = submitAnswer(instance, r.state, 'c3', 2);
    expect(r.state.stars).toBe(2);
  });

  it('escalates to hint, then reveal with 1 star', () => {
    let r = submitAnswer(instance, initialAttempt, 'c0', 3);
    r = submitAnswer(instance, r.state, 'c1', 3);
    expect(r.feedback).toBe('hint');
    r = submitAnswer(instance, r.state, 'c2', 3);
    expect(r.feedback).toBe('reveal');
    expect(r.state).toMatchObject({ finished: true, stars: 1 });
  });

  it('gives 1 star when solved after the hint', () => {
    let r = submitAnswer(instance, initialAttempt, 'c0', 3);
    r = submitAnswer(instance, r.state, 'c1', 3);
    r = submitAnswer(instance, r.state, 'c3', 3);
    expect(r.state.stars).toBe(1);
  });

  it('ignores repeated taps on an eliminated choice', () => {
    const first = submitAnswer(instance, initialAttempt, 'c0', 2);
    const again = submitAnswer(instance, first.state, 'c0', 2);
    expect(again.state.wrongChoiceIds).toEqual(['c0']);
  });
});
