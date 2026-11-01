import { describe, expect, it } from 'vitest';
import { WORDS } from './words';

describe('word bank', () => {
  it('ids and emoji are unique', () => {
    expect(new Set(WORDS.map((w) => w.id)).size).toBe(WORDS.length);
    expect(new Set(WORDS.map((w) => w.emoji)).size).toBe(WORDS.length);
  });

  it('syllables spell the word; initial is the first letter', () => {
    for (const w of WORDS) {
      expect(w.syllables.join(''), w.word).toBe(w.word);
      expect(w.syllables.length).toBeGreaterThanOrEqual(1);
      expect(w.syllables.length).toBeLessThanOrEqual(4);
      if (w.initial) expect(w.word[0]!.toUpperCase(), w.word).toBe(w.initial);
    }
  });

  it('every rhyme group has at least two words that end alike', () => {
    const groups = new Map<string, string[]>();
    for (const w of WORDS) if (w.rhyme) groups.set(w.rhyme, [...(groups.get(w.rhyme) ?? []), w.word]);
    expect(groups.size).toBeGreaterThanOrEqual(10);
    for (const [ending, words] of groups) {
      expect(words.length, ending).toBeGreaterThanOrEqual(2);
      for (const word of words) expect(word.toLowerCase().endsWith(ending), word).toBe(true);
    }
  });

  it('has enough words per syllable count and initial letter', () => {
    for (const n of [1, 2, 3]) expect(WORDS.filter((w) => w.syllables.length === n).length).toBeGreaterThanOrEqual(10);
    expect(new Set(WORDS.map((w) => w.initial).filter(Boolean)).size).toBeGreaterThanOrEqual(12);
  });
});
