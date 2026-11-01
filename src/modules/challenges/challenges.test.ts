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
        expect(values.length).toBeGreaterThanOrEqual(2);
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
        if (inst.promptDisplay) expect(speechText(inst.promptDisplay).length).toBeGreaterThan(0);
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

describe('math.find-number', () => {
  const type = getChallengeType('math.find-number');
  it('never shows the number in the displayed prompt; level 3 often offers the digit twin', () => {
    let twins = 0;
    for (let seed = 1; seed <= 300; seed++) {
      const inst = type.generate({ rng: createRng(seed), level: 3 });
      const n = (inst.data as { number: number }).number;
      expect(speechText(inst.promptDisplay!)).not.toContain(String(n));
      const twin = Number(String(n).split('').reverse().join(''));
      if (twin !== n && inst.choices.some((c) => c.value === twin)) twins++;
    }
    expect(twins).toBeGreaterThan(100);
  });
});

describe('math.subtraction', () => {
  const type = getChallengeType('math.subtraction');
  it('results are never negative; level 5 always borrows', () => {
    for (let level = 1; level <= type.levels; level++) {
      for (let seed = 1; seed <= 300; seed++) {
        const d = type.generate({ rng: createRng(seed), level }).data as { a: number; b: number; difference: number };
        expect(d.difference).toBeGreaterThanOrEqual(1);
        if (level === 4) expect(d.a % 10).toBeGreaterThanOrEqual(d.b);
        if (level === 5) expect(d.a % 10).toBeLessThan(d.b);
      }
    }
  });
});

describe('math.compare', () => {
  const type = getChallengeType('math.compare');
  it('the correct side has more; level 1 differs by at least 2', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const inst = type.generate({ rng: createRng(seed), level: 1 });
      const d = inst.data as { left: number; right: number };
      const correct = inst.choices.find((c) => c.id === inst.correctChoiceId)!;
      expect(correct.value).toBe(Math.max(d.left, d.right));
      expect(Math.abs(d.left - d.right)).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('math.pattern', () => {
  const type = getChallengeType('math.pattern');
  it('the answer continues the period of the shown sequence', () => {
    for (let level = 1; level <= type.levels; level++) {
      for (let seed = 1; seed <= 300; seed++) {
        const inst = type.generate({ rng: createRng(seed), level });
        const seq = (inst.data as { sequence: number[] }).sequence;
        const answer = inst.choices.find((c) => c.id === inst.correctChoiceId)!.value;
        // Smallest period p consistent with the shown sequence predicts the answer.
        const p = [1, 2, 3, 4].find((len) => seq.every((v, i) => i < len || v === seq[i - len]))!;
        expect(answer).toBe(seq[seq.length - p]);
        expect(seq.length).toBeGreaterThanOrEqual(4);
      }
    }
  });
});

describe('german challenges', () => {
  it('initial sound: correct letter is the word initial; level 1 avoids similar letters', async () => {
    const { WORDS, SIMILAR_LETTERS } = await import('../../content/de/words');
    const type = getChallengeType('german.initial-sound');
    for (let level = 1; level <= type.levels; level++) {
      for (let seed = 1; seed <= 300; seed++) {
        const inst = type.generate({ rng: createRng(seed), level });
        const word = WORDS.find((w) => w.id === (inst.data as { wordId: string }).wordId)!;
        const correct = inst.choices.find((c) => c.id === inst.correctChoiceId)!;
        expect(correct.label).toBe(word.initial);
        expect(new Set(inst.choices.map((c) => c.label)).size).toBe(inst.choices.length);
        if (level === 1) {
          for (const c of inst.choices) expect(SIMILAR_LETTERS[word.initial!] ?? []).not.toContain(c.label);
        }
      }
    }
  });

  it('syllables: answer is the syllable count', async () => {
    const { WORDS } = await import('../../content/de/words');
    const type = getChallengeType('german.syllables');
    for (let seed = 1; seed <= 300; seed++) {
      const inst = type.generate({ rng: createRng(seed), level: 3 });
      const word = WORDS.find((w) => w.id === (inst.data as { wordId: string }).wordId)!;
      expect(inst.choices.find((c) => c.id === inst.correctChoiceId)!.value).toBe(word.syllables.length);
    }
  });

  it('rhyme: exactly one option rhymes with the target', async () => {
    const { WORDS } = await import('../../content/de/words');
    const type = getChallengeType('german.rhyme');
    for (let level = 1; level <= type.levels; level++) {
      for (let seed = 1; seed <= 300; seed++) {
        const inst = type.generate({ rng: createRng(seed), level });
        const d = inst.data as { targetId: string; options: string[] };
        const target = WORDS.find((w) => w.id === d.targetId)!;
        const rhyming = d.options.filter((id) => WORDS.find((w) => w.id === id)!.rhyme === target.rhyme);
        expect(rhyming).toHaveLength(1);
        expect(d.options[Number(inst.correctChoiceId.slice(1))]).toBe(rhyming[0]);
        expect(new Set(d.options).size).toBe(d.options.length);
      }
    }
  });

  it('read word: the correct picture is the shown word; level 1 words are short', async () => {
    const { WORDS } = await import('../../content/de/words');
    const type = getChallengeType('german.read-word');
    for (let level = 1; level <= type.levels; level++) {
      for (let seed = 1; seed <= 300; seed++) {
        const inst = type.generate({ rng: createRng(seed), level });
        const d = inst.data as { wordId: string; options: string[] };
        expect(d.options[Number(inst.correctChoiceId.slice(1))]).toBe(d.wordId);
        expect(new Set(d.options).size).toBe(d.options.length);
        if (level === 1) expect(WORDS.find((w) => w.id === d.wordId)!.word.length).toBeLessThanOrEqual(3);
      }
    }
  });
});
