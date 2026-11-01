import { describe, expect, it } from 'vitest';
import type { ChallengeType } from '../challenges/types';
import { createRng } from '../rng';
import { initialSkill, planChests, recordOutcome } from './skillModel';

const solved = (wrongTries = 0) => ({ kind: 'solved' as const, wrongTries });

describe('recordOutcome', () => {
  it('levels up after two clean solves at the current level', () => {
    let s = initialSkill(2);
    s = recordOutcome(s, solved(0), 2, 5);
    expect(s.level).toBe(2);
    s = recordOutcome(s, solved(1), 2, 5);
    expect(s).toMatchObject({ level: 3, streak: 0, attempts: 2, solved: 2, firstTry: 1 });
  });

  it('levels down after two struggles, not below 1', () => {
    let s = initialSkill(2);
    s = recordOutcome(s, { kind: 'revealed' }, 2, 5);
    s = recordOutcome(s, solved(2), 2, 5);
    expect(s.level).toBe(1);
    s = recordOutcome(s, { kind: 'revealed' }, 1, 5);
    s = recordOutcome(s, { kind: 'revealed' }, 1, 5);
    expect(s.level).toBe(1);
  });

  it('does not exceed the max level', () => {
    let s = initialSkill(3);
    for (let i = 0; i < 4; i++) s = recordOutcome(s, solved(), 3, 3);
    expect(s.level).toBe(3);
  });

  it('easy (bronze) solves do not level up; hard (gold) struggles do not level down', () => {
    let s = initialSkill(3);
    s = recordOutcome(s, solved(), 2, 5);
    s = recordOutcome(s, solved(), 2, 5);
    expect(s.level).toBe(3);
    s = recordOutcome(s, { kind: 'revealed' }, 4, 5);
    s = recordOutcome(s, { kind: 'revealed' }, 4, 5);
    expect(s.level).toBe(3);
  });

  it('a clean solve resets a struggle streak; skips only count in stats', () => {
    let s = initialSkill(2);
    s = recordOutcome(s, { kind: 'revealed' }, 2, 5);
    s = recordOutcome(s, solved(), 2, 5);
    s = recordOutcome(s, { kind: 'revealed' }, 2, 5);
    expect(s.level).toBe(2);
    s = recordOutcome(s, { kind: 'skipped' }, 2, 5);
    expect(s).toMatchObject({ level: 2, skipped: 1, attempts: 4 });
  });
});

describe('planChests', () => {
  const type = (id: string, levels: number) => ({ id, levels }) as unknown as ChallengeType;
  it('one chest per tier with level offsets, clamped', () => {
    const chests = planChests(createRng(3), [{ type: type('a', 3), startLevel: 1 }], {}, 3);
    expect(chests.map((c) => c.tier).sort()).toEqual(['bronze', 'gold', 'silver']);
    const byTier = Object.fromEntries(chests.map((c) => [c.tier, c]));
    expect(byTier.bronze).toMatchObject({ level: 1, stars: 1 });
    expect(byTier.silver).toMatchObject({ level: 1, stars: 2 });
    expect(byTier.gold).toMatchObject({ level: 2, stars: 3 });
  });

  it('uses the skill level when known', () => {
    const skills = { a: { ...initialSkill(3) } };
    const chests = planChests(createRng(1), [{ type: type('a', 5), startLevel: 1 }], skills, 3);
    expect(chests.map((c) => c.level).sort()).toEqual([2, 3, 4]);
  });
});

describe('planChests with a stage window', () => {
  const type = (id: string, levels: number) => ({ id, levels }) as unknown as ChallengeType;
  it('never plans above maxLevel, even with a higher stored skill', () => {
    const skills = { a: { ...initialSkill(5) } };
    const chests = planChests(createRng(2), [{ type: type('a', 5), startLevel: 2, maxLevel: 3 }], skills, 6);
    expect(Math.max(...chests.map((c) => c.level))).toBe(3);
    expect(skills.a.level).toBe(5);
  });
});

