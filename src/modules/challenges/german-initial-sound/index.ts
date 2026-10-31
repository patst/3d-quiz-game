import type { ChallengeType } from '../../../core/challenges/types';
import { SIMILAR_LETTERS, WORDS } from '../../../content/de/words';

/** "Mit welchem Buchstaben beginnt Maus?" — picture + spoken word, tap the letter. */
export interface InitialSoundData {
  wordId: string;
}

const VOWELS = ['A', 'E', 'I', 'O', 'U'];
const LEVELS = [
  { choices: 3, hard: false },
  { choices: 3, hard: true },
  { choices: 4, hard: true },
] as const;

export const germanInitialSound: ChallengeType<InitialSoundData> = {
  id: 'german.initial-sound',
  subject: 'german',
  skills: ['german.phonological-awareness'],
  levels: LEVELS.length,
  generate({ rng, level }) {
    const cfg = LEVELS[Math.min(Math.max(level, 1), LEVELS.length) - 1]!;
    const word = rng.pick(WORDS.filter((w) => w.initial));
    const correct = word.initial!;
    const allLetters = [...new Set(WORDS.map((w) => w.initial).filter((l): l is string => Boolean(l)))];
    const pool = cfg.hard
      ? [...(SIMILAR_LETTERS[correct] ?? []), ...rng.shuffle(allLetters)]
      : // Easy: consonant vs vowel contrast, never a similar-sounding letter.
        rng.shuffle(
          allLetters.filter(
            (l) => !(SIMILAR_LETTERS[correct] ?? []).includes(l) && VOWELS.includes(l) !== VOWELS.includes(correct),
          ),
        );
    const letters = [correct];
    for (const l of pool) {
      if (letters.length >= cfg.choices) break;
      if (!letters.includes(l)) letters.push(l);
    }
    const ordered = rng.shuffle(letters);
    const choices = ordered.map((label, i) => ({ id: `c${i}`, value: i, label }));
    return {
      typeId: 'german.initial-sound',
      level,
      data: { wordId: word.id },
      choices,
      correctChoiceId: choices.find((c) => c.label === correct)!.id,
      prompt: { key: 'german.initial.prompt', params: { word: word.word } },
      explanation: { key: 'german.initial.explain', params: { word: word.word, letter: correct } },
    };
  },
};
