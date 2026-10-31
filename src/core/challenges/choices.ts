import type { Rng } from '../rng';
import type { Choice } from './types';

/**
 * Builds `count` unique number choices including `correct`, with distractors close to it
 * (±1, ±2, …) inside [min, max]. Returns shuffled choices and the id of the correct one.
 */
export function numberChoices(
  rng: Rng,
  correct: number,
  count: number,
  min: number,
  max: number,
): { choices: Choice[]; correctChoiceId: string } {
  const values = new Set<number>([correct]);
  const near: number[] = [];
  for (let d = 1; d <= max - min && near.length < 12; d++) {
    if (correct - d >= min) near.push(correct - d);
    if (correct + d <= max) near.push(correct + d);
  }
  // Prefer the closest distractors, but shuffle within the nearest few.
  const pool = rng.shuffle(near.slice(0, Math.max(count + 1, 4))).concat(near.slice(Math.max(count + 1, 4)));
  for (const v of pool) {
    if (values.size >= count) break;
    values.add(v);
  }
  const ordered = rng.shuffle([...values]);
  const choices = ordered.map((value, i) => ({ id: `c${i}`, value }));
  const correctChoiceId = choices.find((c) => c.value === correct)!.id;
  return { choices, correctChoiceId };
}
