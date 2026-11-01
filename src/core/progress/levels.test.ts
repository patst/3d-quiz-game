import { describe, expect, it } from 'vitest';
import { generateMaze } from '../maze/generate';
import { currentLevel, levelSpec } from './levels';

describe('maze levels', () => {
  it('starts small and grows by one row or column per level up to 9×9 (level 11)', () => {
    expect(levelSpec(1)).toMatchObject({ cols: 4, rows: 4, chests: 3 });
    expect(levelSpec(2)).toMatchObject({ cols: 5, rows: 4 });
    expect(levelSpec(3)).toMatchObject({ cols: 5, rows: 5 });
    expect(levelSpec(10)).toMatchObject({ cols: 9, rows: 8, chests: 5 });
    expect(levelSpec(11)).toMatchObject({ cols: 9, rows: 9 });
    expect(levelSpec(25)).toMatchObject({ cols: 9, rows: 9, chests: 5 });
    for (let l = 1; l < 12; l++) {
      const a = levelSpec(l);
      const b = levelSpec(l + 1);
      expect(b.cols * b.rows).toBeGreaterThanOrEqual(a.cols * a.rows);
      expect(b.chests).toBeGreaterThanOrEqual(a.chests);
    }
  });

  it('every level has enough room for its chests', () => {
    for (let l = 1; l <= 12; l++) {
      const spec = levelSpec(l);
      for (let seed = 1; seed <= 30; seed++) {
        const maze = generateMaze({ cols: spec.cols, rows: spec.rows, braid: 0.35, seed });
        expect(maze.stationCandidates.length).toBeGreaterThanOrEqual(spec.chests);
      }
    }
  });

  it('level = finished mazes + 1', () => {
    expect(currentLevel(undefined)).toBe(1);
    expect(currentLevel(4)).toBe(5);
  });
});
