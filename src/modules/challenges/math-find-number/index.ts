import { numberChoices } from '../../../core/challenges/choices';
import { type ChallengeType, lv } from '../../../core/challenges/types';

/** "Tippe auf die Sieben" — hear a number, find the digit(s). Number recognition. */
export interface FindNumberData {
  number: number;
}

const LEVELS = [
  { min: 1, max: 10, choices: 3 },
  { min: 1, max: 20, choices: 4 },
  { min: 10, max: 100, choices: 4 },
] as const;

export const mathFindNumber: ChallengeType<FindNumberData> = {
  id: 'math.find-number',
  subject: 'math',
  skills: ['math.number-recognition'],
  levels: LEVELS.length,
  levelInfo: [
    lv('preschool', 'grade1', 'ni.op.zaehlen'),
    lv('grade1', 'grade1', 'ni.ma2.zahlen-100'),
    lv('grade2', 'grade2', 'ni.ma2.zahlen-100'),
  ],
  generate({ rng, level }) {
    const cfg = LEVELS[Math.min(Math.max(level, 1), LEVELS.length) - 1]!;
    const number = rng.int(cfg.min, cfg.max);
    let { choices, correctChoiceId } = numberChoices(rng, number, cfg.choices, cfg.min, cfg.max);
    // Two-digit numbers: the swapped-digit twin (47 ↔ 74) is the most useful distractor.
    const twin = Number(String(number).split('').reverse().join(''));
    if (level === 3 && number % 11 !== 0 && twin >= cfg.min && twin <= cfg.max && !choices.some((c) => c.value === twin)) {
      const values = choices.map((c) => c.value);
      const replaceIdx = values.findIndex((v) => v !== number);
      values[replaceIdx] = twin;
      values.sort((a, b) => a - b);
      choices = values.map((value, i) => ({ id: `c${i}`, value }));
      correctChoiceId = choices.find((c) => c.value === number)!.id;
    }
    return {
      typeId: 'math.find-number',
      level,
      data: { number },
      choices,
      correctChoiceId,
      prompt: { key: 'math.find-number.prompt', params: { n: number } },
      promptDisplay: { key: 'math.find-number.display' },
      explanation: { key: 'math.find-number.explain', params: { n: number } },
    };
  },
};
