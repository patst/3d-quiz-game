import type { Rng } from '../rng';

/** Animal friends lost in the mazes (game-design §3 "Tierfreunde retten"). */
export const LOST_ANIMALS = ['chick', 'piglet', 'puppy', 'lamb', 'bunny-baby', 'kitten'] as const;
export type LostAnimal = (typeof LOST_ANIMALS)[number];

/** The next friend to rescue: first one not rescued yet, otherwise a random one. */
export function nextLostAnimal(rescued: readonly string[], rng: Rng): LostAnimal {
  return LOST_ANIMALS.find((a) => !rescued.includes(a)) ?? rng.pick(LOST_ANIMALS);
}

export function isLostAnimal(id: string): id is LostAnimal {
  return (LOST_ANIMALS as readonly string[]).includes(id);
}
