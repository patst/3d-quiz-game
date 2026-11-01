import { numberChoices } from '../../../core/challenges/choices';
import { type ChallengeType, lv } from '../../../core/challenges/types';
import type { Rng } from '../../../core/rng';
import { COUNT_OBJECTS, type CountObject } from '../objects';

/** "Was ist 3 plus 2?" — with pictures on low levels, numbers only later. */
export interface AdditionData {
  a: number;
  b: number;
  sum: number;
  object: CountObject;
  /** Show the summands as pictures (always shown as hint after the 2nd wrong try). */
  showPictures: boolean;
}

interface Level {
  pick: (rng: Rng) => [number, number];
  pictures: boolean;
  choices: number;
  max: number;
}

const LEVELS: readonly Level[] = [
  // 1: sum ≤ 5 with pictures
  { pick: (rng) => pair(rng, 1, 5), pictures: true, choices: 3, max: 5 },
  // 2: sum ≤ 10 with pictures
  { pick: (rng) => pair(rng, 2, 10), pictures: true, choices: 4, max: 10 },
  // 3: sum ≤ 10, numbers only
  { pick: (rng) => pair(rng, 2, 10), pictures: false, choices: 4, max: 10 },
  // 4: ≤ 20 without carrying (e.g. 12 + 5)
  {
    pick: (rng) => {
      const ones = rng.int(0, 8);
      const b = rng.int(1, 9 - ones);
      return [10 + ones, b];
    },
    pictures: false,
    choices: 4,
    max: 20,
  },
  // 5: ≤ 20 with carrying (e.g. 8 + 5)
  {
    pick: (rng) => {
      const a = rng.int(2, 9);
      const b = rng.int(Math.max(1, 10 - a), 9);
      return [a, b];
    },
    pictures: false,
    choices: 4,
    max: 20,
  },
];

/** Two positive numbers whose sum is in [minSum, maxSum]. */
function pair(rng: Rng, minSum: number, maxSum: number): [number, number] {
  const sum = rng.int(Math.max(2, minSum), maxSum);
  const a = rng.int(1, sum - 1);
  return [a, sum - a];
}

export const mathAddition: ChallengeType<AdditionData> = {
  id: 'math.addition',
  subject: 'math',
  skills: ['math.addition'],
  levels: LEVELS.length,
  levelInfo: [
    lv('preschool', 'grade1', 'ni.op.hinzufuegen'),
    lv('preschool', 'grade1', 'ni.op.hinzufuegen', 'ni.ma2.addition'),
    lv('grade1', 'grade1', 'ni.ma2.addition', 'ni.ma2.einspluseins'),
    lv('grade1', 'grade2', 'ni.ma2.einspluseins'),
    lv('grade1', 'grade2', 'ni.ma2.einspluseins'),
  ],
  generate({ rng, level }) {
    const cfg = LEVELS[Math.min(Math.max(level, 1), LEVELS.length) - 1]!;
    const [a, b] = cfg.pick(rng);
    const sum = a + b;
    const object = rng.pick(COUNT_OBJECTS);
    const { choices, correctChoiceId } = numberChoices(rng, sum, cfg.choices, 0, cfg.max);
    return {
      typeId: 'math.addition',
      level,
      data: { a, b, sum, object, showPictures: cfg.pictures },
      choices,
      correctChoiceId,
      prompt: { key: 'math.addition.prompt', params: { a, b } },
      explanation: { key: 'math.addition.explain', params: { a, b, sum } },
    };
  },
};
