import type { ChallengeType } from '../../../core/challenges/types';
import { WORDS } from '../../../content/de/words';

/** Read a written word, tap the matching picture. Choice value = index in `options`. */
export interface ReadWordData {
  wordId: string;
  options: string[];
  /** Level 3 shows normal spelling (Maus) instead of capitals (MAUS). */
  mixedCase: boolean;
}

const LEVELS = [
  { maxLength: 3, choices: 3, mixedCase: false },
  { maxLength: 4, choices: 3, mixedCase: false },
  { maxLength: 7, choices: 4, mixedCase: true },
] as const;

export const germanReadWord: ChallengeType<ReadWordData> = {
  id: 'german.read-word',
  subject: 'german',
  skills: ['german.reading'],
  levels: LEVELS.length,
  generate({ rng, level }) {
    const cfg = LEVELS[Math.min(Math.max(level, 1), LEVELS.length) - 1]!;
    const word = rng.pick(WORDS.filter((w) => w.word.length <= cfg.maxLength && (level === 1 || w.word.length >= 3)));
    // Distractors: similar length, different first letter where possible (avoid guessing by length).
    const distractors = rng
      .shuffle(WORDS.filter((w) => w.id !== word.id && Math.abs(w.word.length - word.word.length) <= 1))
      .sort((a, b) => Number(a.word[0] === word.word[0]) - Number(b.word[0] === word.word[0]))
      .slice(0, cfg.choices - 1);
    const options = rng.shuffle([word, ...distractors]).map((w) => w.id);
    const choices = options.map((_, i) => ({ id: `c${i}`, value: i }));
    return {
      typeId: 'german.read-word',
      level,
      data: { wordId: word.id, options, mixedCase: cfg.mixedCase },
      choices,
      correctChoiceId: `c${options.indexOf(word.id)}`,
      prompt: { key: 'german.read.prompt' },
      explanation: { key: 'german.read.explain', params: { word: word.word } },
    };
  },
};
