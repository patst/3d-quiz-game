import { numberChoices } from '../../../core/challenges/choices';
import { type ChallengeType, lv } from '../../../core/challenges/types';
import type { Rng } from '../../../core/rng';
import { COUNT_OBJECTS, type CountObject, type Placement } from '../objects';

/** "Wie viele Äpfel siehst du?" — count pictures, tap the number. */
export interface CountData {
  object: CountObject;
  count: number;
  placements: Placement[];
}

const LEVELS = [
  { min: 1, max: 5, choices: 3 },
  { min: 1, max: 10, choices: 4 },
  { min: 5, max: 20, choices: 4 },
] as const;

export const mathCount: ChallengeType<CountData> = {
  id: 'math.count',
  subject: 'math',
  skills: ['math.counting'],
  levels: LEVELS.length,
  levelInfo: [
    lv('kita', 'preschool', 'ni.op.mengen', 'ni.op.zaehlen'),
    lv('preschool', 'grade1', 'ni.op.zaehlen', 'ni.ma2.strukturiert'),
    lv('grade1', 'grade2', 'ni.ma2.strukturiert'),
  ],
  generate({ rng, level }) {
    const cfg = LEVELS[Math.min(Math.max(level, 1), LEVELS.length) - 1]!;
    const count = rng.int(cfg.min, cfg.max);
    const object = rng.pick(COUNT_OBJECTS);
    const { choices, correctChoiceId } = numberChoices(rng, count, cfg.choices, 1, cfg.max);
    return {
      typeId: 'math.count',
      level,
      data: { object, count, placements: scatter(rng, count) },
      choices,
      correctChoiceId,
      prompt: { key: 'math.count.prompt', params: { object } },
      explanation: { key: 'math.count.explain', params: { object, count } },
    };
  },
};

/**
 * Places `n` pictures on a jittered grid so they never overlap (counting must be fair).
 */
export function scatter(rng: Rng, n: number): Placement[] {
  const cols = Math.ceil(Math.sqrt(n * 1.4));
  const rows = Math.ceil(n / cols);
  const cells = rng.shuffle(Array.from({ length: cols * rows }, (_, i) => i)).slice(0, n);
  return cells
    .sort((a, b) => a - b)
    .map((cell) => {
      const cx = cell % cols;
      const cy = Math.floor(cell / cols);
      return {
        x: (cx + 0.5 + (rng.next() - 0.5) * 0.3) / cols,
        y: (cy + 0.5 + (rng.next() - 0.5) * 0.3) / rows,
      };
    });
}
