import { numberChoices } from '../../../core/challenges/choices';
import { type ChallengeType, lv } from '../../../core/challenges/types';
import { WORDS } from '../../../content/de/words';

/** "Wie viele Silben hat Banane? Klatsch mit!" — tap 1–4. */
export interface SyllablesData {
  wordId: string;
}

const LEVELS = [
  { maxSyllables: 2, choices: 3 },
  { maxSyllables: 3, choices: 3 },
  { maxSyllables: 4, choices: 4 },
] as const;

export const germanSyllables: ChallengeType<SyllablesData> = {
  id: 'german.syllables',
  subject: 'german',
  skills: ['german.syllables'],
  levels: LEVELS.length,
  levelInfo: [
    lv('kita', 'grade1', 'ni.a2.silben'),
    lv('preschool', 'grade1', 'ni.a2.silben', 'ni.de2.silben'),
    lv('grade1', 'grade2', 'ni.de2.silben'),
  ],
  generate({ rng, level }) {
    const cfg = LEVELS[Math.min(Math.max(level, 1), LEVELS.length) - 1]!;
    const word = rng.pick(WORDS.filter((w) => w.syllables.length <= cfg.maxSyllables));
    const n = word.syllables.length;
    const { choices, correctChoiceId } = numberChoices(rng, n, cfg.choices, 1, 4);
    return {
      typeId: 'german.syllables',
      level,
      data: { wordId: word.id },
      choices,
      correctChoiceId,
      prompt: { key: 'german.syllables.prompt', params: { word: word.word } },
      explanation: { key: 'german.syllables.explain', params: { word: word.word } },
    };
  },
};
