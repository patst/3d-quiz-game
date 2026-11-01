import type { Rng } from '../rng';

/** Animal friends lost in the forest mazes (game-design §3 "Tierfreunde retten"). */
export const FOREST_ANIMALS = ['chick', 'piglet', 'puppy', 'lamb', 'bunny-baby', 'kitten'] as const;
/** Sea friends lost in the underwater mazes (roadmap M9). */
export const SEA_ANIMALS = ['turtle', 'octopus', 'crab', 'pufferfish', 'whale-baby', 'clownfish'] as const;

export const LOST_ANIMALS = [...FOREST_ANIMALS, ...SEA_ANIMALS] as const;
export type LostAnimal = (typeof LOST_ANIMALS)[number];

/**
 * The next friend to rescue from a world's list: first one not rescued yet, otherwise a
 * random one from that list.
 */
export function nextLostAnimal(
  rescued: readonly string[],
  rng: Rng,
  candidates: readonly LostAnimal[] = FOREST_ANIMALS,
): LostAnimal {
  return candidates.find((a) => !rescued.includes(a)) ?? rng.pick(candidates);
}

export function isLostAnimal(id: string): id is LostAnimal {
  return (LOST_ANIMALS as readonly string[]).includes(id);
}
