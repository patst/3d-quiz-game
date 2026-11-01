import { describe, expect, it } from 'vitest';
import { isUnlocked, mazesUntilUnlock } from './worlds';

describe('world unlocking', () => {
  const rule = { world: 'forest', mazes: 3 };
  it('needs the given number of finished mazes in the other world', () => {
    expect(isUnlocked(undefined, {})).toBe(true);
    expect(isUnlocked(rule, {})).toBe(false);
    expect(mazesUntilUnlock(rule, { forest: 1 })).toBe(2);
    expect(isUnlocked(rule, { forest: 3 })).toBe(true);
    expect(mazesUntilUnlock(rule, { forest: 5 })).toBe(0);
  });
});
