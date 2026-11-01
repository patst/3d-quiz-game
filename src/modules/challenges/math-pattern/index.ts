import type { ChallengeType } from '../../../core/challenges/types';

/** Symbols used in patterns (drawn by the UI). */
export const PATTERN_SYMBOLS = ['red', 'blue', 'yellow', 'green', 'star', 'heart'] as const;
export type PatternSymbol = (typeof PATTERN_SYMBOLS)[number];

/** "Was kommt als Nächstes?" — continue a repeating pattern. Choices' value = symbol index. */
export interface PatternData {
  /** Visible part of the sequence (symbol indices); the next element is missing. */
  sequence: number[];
}

/** Repeating units per level (letters = distinct symbols). */
const UNITS: readonly (readonly string[])[] = [
  ['AB'],
  ['ABC', 'AAB', 'ABB'],
  ['AABB', 'ABCD', 'ABAC', 'AABC'],
];

export const mathPattern: ChallengeType<PatternData> = {
  id: 'math.pattern',
  subject: 'math',
  skills: ['math.patterns'],
  levels: UNITS.length,
  generate({ rng, level }) {
    const unit = rng.pick(UNITS[Math.min(Math.max(level, 1), UNITS.length) - 1]!);
    const letters = [...new Set(unit)];
    const symbols = rng.shuffle(PATTERN_SYMBOLS.map((_, i) => i)).slice(0, letters.length);
    const symbolOf = (ch: string) => symbols[letters.indexOf(ch)]!;
    // Show 2 full repetitions plus a random part, at least 5 elements.
    const shown = unit.length * 2 + rng.int(0, unit.length - 1);
    const full = Array.from({ length: shown + 1 }, (_, i) => symbolOf(unit[i % unit.length]!));
    const answer = full[shown]!;
    // Distractors: other symbols from the pattern first, then a new one.
    const others = rng.shuffle(symbols.filter((s) => s !== answer));
    const extra = rng.shuffle(PATTERN_SYMBOLS.map((_, i) => i).filter((i) => !symbols.includes(i)));
    const values = rng.shuffle([answer, ...[...others, ...extra].slice(0, 2)]);
    const choices = values.map((value, i) => ({ id: `c${i}`, value }));
    return {
      typeId: 'math.pattern',
      level,
      data: { sequence: full.slice(0, shown) },
      choices,
      correctChoiceId: choices.find((c) => c.value === answer)!.id,
      prompt: { key: 'math.pattern.prompt' },
      explanation: { key: 'math.pattern.explain' },
    };
  },
};
