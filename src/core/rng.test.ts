import { describe, expect, it } from 'vitest';
import { createRng } from './rng';

describe('createRng', () => {
  it('is reproducible', () => {
    const a = createRng(123);
    const b = createRng(123);
    for (let i = 0; i < 10; i++) expect(a.next()).toBe(b.next());
  });

  it('int stays in range and covers it', () => {
    const rng = createRng(1);
    const seen = new Set<number>();
    for (let i = 0; i < 1000; i++) {
      const v = rng.int(1, 6);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(6);
      seen.add(v);
    }
    expect(seen.size).toBe(6);
  });

  it('shuffle keeps elements', () => {
    const rng = createRng(5);
    expect(rng.shuffle([1, 2, 3, 4]).sort()).toEqual([1, 2, 3, 4]);
  });
});
