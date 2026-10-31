import { describe, expect, it } from 'vitest';
import { allSpokenTexts, speechText } from '../../content/de/speech';
import { createRng } from '../../core/rng';
import { challengeTypes, getChallengeType } from '.';
import type { AdditionData } from './math-addition';
import type { CountData } from './math-count';

const SEEDS = 1000;

/** Generic property test every challenge type must pass (architecture §3.1). */
describe.each(challengeTypes.map((t) => [t.id, t] as const))('%s', (_id, type) => {
  it('generates valid, solvable instances for every level', () => {
    for (let level = 1; level <= type.levels; level++) {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const inst = type.generate({ rng: createRng(seed * 31 + level), level });
        expect(inst.typeId).toBe(type.id);
        const values = inst.choices.map((c) => c.value);
        expect(new Set(values).size).toBe(values.length);
        expect(new Set(inst.choices.map((c) => c.id)).size).toBe(values.length);
        expect(inst.choices.filter((c) => c.id === inst.correctChoiceId)).toHaveLength(1);
        expect(values.length).toBeGreaterThanOrEqual(3);
        for (const v of values) expect(v).toBeGreaterThanOrEqual(0);
        // Every spoken line has a German template.
        expect(speechText(inst.prompt).length).toBeGreaterThan(0);
        expect(speechText(inst.explanation).length).toBeGreaterThan(0);
      }
    }
  });

  it('every generated sentence has a pre-generated clip (is enumerated)', () => {
    const spoken = new Set(allSpokenTexts());
    for (let level = 1; level <= type.levels; level++) {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const inst = type.generate({ rng: createRng(seed * 17 + level), level });
        expect(spoken.has(speechText(inst.prompt))).toBe(true);
        expect(spoken.has(speechText(inst.explanation))).toBe(true);
      }
    }
  });

  it('is deterministic for a seed', () => {
    const a = type.generate({ rng: createRng(42), level: 1 });
    const b = type.generate({ rng: createRng(42), level: 1 });
    expect(a).toEqual(b);
  });
});

describe('math.count', () => {
  const type = getChallengeType('math.count');
  it('correct choice equals the number of pictures, placements do not overlap', () => {
    for (let level = 1; level <= type.levels; level++) {
      for (let seed = 1; seed <= 300; seed++) {
        const inst = type.generate({ rng: createRng(seed), level });
        const data = inst.data as CountData;
        const correct = inst.choices.find((c) => c.id === inst.correctChoiceId)!;
        expect(correct.value).toBe(data.count);
        expect(data.placements).toHaveLength(data.count);
        for (const p of data.placements) {
          expect(p.x).toBeGreaterThan(0);
          expect(p.x).toBeLessThan(1);
          expect(p.y).toBeGreaterThan(0);
          expect(p.y).toBeLessThan(1);
        }
        const minGap = Math.min(
          ...data.placements.flatMap((p, i) =>
            data.placements.slice(i + 1).map((q) => Math.hypot(p.x - q.x, p.y - q.y)),
          ),
          1,
        );
        expect(minGap).toBeGreaterThan(0.05);
      }
    }
  });
});

describe('math.addition', () => {
  const type = getChallengeType('math.addition');
  const sample = (level: number) =>
    Array.from({ length: 300 }, (_, i) => type.generate({ rng: createRng(i + 1), level }).data as AdditionData);

  it('respects the level ranges', () => {
    for (const d of sample(1)) expect(d.sum).toBeLessThanOrEqual(5);
    for (const d of sample(2)) expect(d.sum).toBeLessThanOrEqual(10);
    for (const d of sample(4)) {
      expect(d.sum).toBeLessThanOrEqual(19);
      expect((d.a % 10) + (d.b % 10)).toBeLessThan(10);
    }
    for (const d of sample(5)) {
      expect(d.sum).toBeGreaterThanOrEqual(10);
      expect(d.sum).toBeLessThanOrEqual(18);
    }
  });

  it('shows pictures only on the first two levels', () => {
    expect(sample(2).every((d) => d.showPictures)).toBe(true);
    expect(sample(3).some((d) => d.showPictures)).toBe(false);
  });

  it('correct choice equals a + b', () => {
    for (let level = 1; level <= type.levels; level++) {
      const inst = type.generate({ rng: createRng(level), level });
      const d = inst.data as AdditionData;
      expect(inst.choices.find((c) => c.id === inst.correctChoiceId)?.value).toBe(d.a + d.b);
    }
  });
});
