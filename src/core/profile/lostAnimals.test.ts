import { describe, expect, it } from 'vitest';
import { createRng } from '../rng';
import { FOREST_ANIMALS, SEA_ANIMALS, nextLostAnimal } from './lostAnimals';

describe('nextLostAnimal', () => {
  it('goes through all friends in order, then picks randomly', () => {
    const rescued: string[] = [];
    for (const expected of FOREST_ANIMALS) {
      const next = nextLostAnimal(rescued, createRng(1));
      expect(next).toBe(expected);
      rescued.push(next);
    }
    expect(FOREST_ANIMALS).toContain(nextLostAnimal(rescued, createRng(5)));
    // Sea friends come from their own list, independent of forest rescues.
    expect(nextLostAnimal(rescued, createRng(5), SEA_ANIMALS)).toBe('turtle');
  });
});
