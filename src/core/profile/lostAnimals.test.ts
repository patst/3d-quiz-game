import { describe, expect, it } from 'vitest';
import { createRng } from '../rng';
import { LOST_ANIMALS, nextLostAnimal } from './lostAnimals';

describe('nextLostAnimal', () => {
  it('goes through all friends in order, then picks randomly', () => {
    const rescued: string[] = [];
    for (const expected of LOST_ANIMALS) {
      const next = nextLostAnimal(rescued, createRng(1));
      expect(next).toBe(expected);
      rescued.push(next);
    }
    expect(LOST_ANIMALS).toContain(nextLostAnimal(rescued, createRng(5)));
  });
});
