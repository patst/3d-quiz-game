import { describe, expect, it } from 'vitest';
import { generateMaze } from '../maze/generate';
import { MazeSession } from './mazeSession';

describe('MazeSession', () => {
  it('emits goalReached once when walking the path to the goal', () => {
    const maze = generateMaze({ cols: 4, rows: 4, braid: 0, seed: 3 });
    const session = new MazeSession(maze);
    const path = session.pathTo(maze.goal)!;
    const events = path.slice(1).flatMap((t) => session.arrive(t));
    expect(events).toEqual([{ type: 'goalReached' }]);
    expect(session.isFinished).toBe(true);
    expect(session.pathTo(maze.start)).toBeNull();
  });

  it('snaps taps on walls to a floor tile', () => {
    const maze = generateMaze({ cols: 4, rows: 4, braid: 0, seed: 3 });
    const path = new MazeSession(maze).pathTo({ x: 0, y: 0 });
    expect(path?.[path.length - 1]).toEqual(maze.start);
  });

  it('blocks steps into walls', () => {
    const maze = generateMaze({ cols: 4, rows: 4, braid: 0, seed: 3 });
    expect(new MazeSession(maze).step({ x: -1, y: 0 })).toBeNull();
  });
});
