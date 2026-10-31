import { describe, expect, it } from 'vitest';
import { generateMaze } from './generate';
import { distancesFrom, findPath, nearestFloor } from './pathfinding';
import { isFloor, sameTile } from './types';

describe('generateMaze', () => {
  it('is deterministic for a seed', () => {
    const a = generateMaze({ cols: 6, rows: 6, braid: 0.3, seed: 42 });
    const b = generateMaze({ cols: 6, rows: 6, braid: 0.3, seed: 42 });
    expect(a.tiles).toEqual(b.tiles);
    expect(a.goal).toEqual(b.goal);
  });

  it('produces valid mazes for many seeds', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const maze = generateMaze({ cols: 3 + (seed % 5), rows: 3 + (seed % 4), braid: 0.25, seed });
      expect(maze.width % 2).toBe(1);
      expect(isFloor(maze, maze.start)).toBe(true);
      expect(isFloor(maze, maze.goal)).toBe(true);
      expect(sameTile(maze.start, maze.goal)).toBe(false);
      // Border is closed.
      for (let x = 0; x < maze.width; x++) {
        expect(isFloor(maze, { x, y: 0 })).toBe(false);
        expect(isFloor(maze, { x, y: maze.height - 1 })).toBe(false);
      }
      // Every floor tile is reachable from start.
      const dist = distancesFrom(maze, maze.start);
      maze.tiles.forEach((kind, i) => {
        if (kind === 'floor') expect(dist[i]).toBeGreaterThanOrEqual(0);
      });
      expect(maze.stationCandidates.length).toBeGreaterThan(0);
    }
  });
});

describe('findPath', () => {
  const maze = generateMaze({ cols: 5, rows: 5, braid: 0, seed: 7 });

  it('finds a connected path from start to goal', () => {
    const path = findPath(maze, maze.start, maze.goal)!;
    expect(path[0]).toEqual(maze.start);
    expect(path[path.length - 1]).toEqual(maze.goal);
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1]!;
      const b = path[i]!;
      expect(Math.abs(a.x - b.x) + Math.abs(a.y - b.y)).toBe(1);
      expect(isFloor(maze, b)).toBe(true);
    }
  });

  it('returns null for walls', () => {
    expect(findPath(maze, maze.start, { x: 0, y: 0 })).toBeNull();
  });

  it('nearestFloor snaps walls to floor', () => {
    const t = nearestFloor(maze, { x: 0, y: 0 })!;
    expect(isFloor(maze, t)).toBe(true);
  });
});
