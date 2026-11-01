import { type ChallengeType, lv } from '../../../core/challenges/types';
import { scatter } from '../math-count';
import { COUNT_OBJECTS, type CountObject, type Placement } from '../objects';

/**
 * "Wo sind mehr Äpfel?" — two groups, tap the bigger one. Level 3 compares digits only.
 * Choices: 'left' / 'right' (value = amount); the view draws them itself.
 */
export interface CompareData {
  object: CountObject;
  left: number;
  right: number;
  leftPlacements: Placement[];
  rightPlacements: Placement[];
  /** Numbers only, no pictures. */
  digits: boolean;
}

const LEVELS = [
  { min: 1, max: 5, minDiff: 2, digits: false },
  { min: 1, max: 10, minDiff: 1, digits: false },
  { min: 1, max: 20, minDiff: 1, digits: true },
] as const;

export const mathCompare: ChallengeType<CompareData> = {
  id: 'math.compare',
  subject: 'math',
  skills: ['math.comparing'],
  levels: LEVELS.length,
  levelInfo: [
    lv('kita', 'preschool', 'ni.op.mengen'),
    lv('preschool', 'grade1', 'ni.op.mengen', 'ni.ma2.vergleichen'),
    lv('grade1', 'grade2', 'ni.ma2.vergleichen'),
  ],
  generate({ rng, level }) {
    const cfg = LEVELS[Math.min(Math.max(level, 1), LEVELS.length) - 1]!;
    const big = rng.int(cfg.min + cfg.minDiff, cfg.max);
    const small = rng.int(cfg.min, big - cfg.minDiff);
    const bigLeft = rng.next() < 0.5;
    const [left, right] = bigLeft ? [big, small] : [small, big];
    const object = rng.pick(COUNT_OBJECTS);
    return {
      typeId: 'math.compare',
      level,
      data: {
        object,
        left,
        right,
        leftPlacements: scatter(rng, left),
        rightPlacements: scatter(rng, right),
        digits: cfg.digits,
      },
      choices: [
        { id: 'left', value: left },
        { id: 'right', value: right },
      ],
      correctChoiceId: bigLeft ? 'left' : 'right',
      prompt: cfg.digits ? { key: 'math.compare.prompt-digits' } : { key: 'math.compare.prompt', params: { object } },
      explanation: { key: 'math.compare.explain', params: { big, small } },
    };
  },
};
