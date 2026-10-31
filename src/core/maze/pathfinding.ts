import { DIRECTIONS, isFloor, sameTile, tileIndex, type Grid, type Tile } from './types';

/** BFS distance (in steps) from `from` to every tile; -1 = unreachable. */
export function distancesFrom(maze: Grid, from: Tile): number[] {
  const dist = new Array<number>(maze.width * maze.height).fill(-1);
  if (!isFloor(maze, from)) return dist;
  dist[tileIndex(maze, from)] = 0;
  const queue: Tile[] = [from];
  for (let head = 0; head < queue.length; head++) {
    const t = queue[head]!;
    const d = dist[tileIndex(maze, t)]!;
    for (const dir of DIRECTIONS) {
      const n = { x: t.x + dir.x, y: t.y + dir.y };
      if (isFloor(maze, n) && dist[tileIndex(maze, n)] === -1) {
        dist[tileIndex(maze, n)] = d + 1;
        queue.push(n);
      }
    }
  }
  return dist;
}

/**
 * Shortest path from `from` to `to` (both inclusive), or null if unreachable.
 * If `to` is a wall, returns null.
 */
export function findPath(maze: Grid, from: Tile, to: Tile): Tile[] | null {
  if (!isFloor(maze, from) || !isFloor(maze, to)) return null;
  if (sameTile(from, to)) return [from];
  const dist = distancesFrom(maze, to);
  if (dist[tileIndex(maze, from)] === -1) return null;
  // Walk downhill from `from` towards `to`.
  const path: Tile[] = [from];
  let current = from;
  while (!sameTile(current, to)) {
    const d = dist[tileIndex(maze, current)]!;
    const next = DIRECTIONS.map((dir) => ({ x: current.x + dir.x, y: current.y + dir.y })).find(
      (n) => isFloor(maze, n) && dist[tileIndex(maze, n)] === d - 1,
    );
    if (!next) return null;
    path.push(next);
    current = next;
  }
  return path;
}

/** Nearest floor tile to an arbitrary (possibly wall/out-of-bounds) tile, by grid distance. */
export function nearestFloor(maze: Grid, target: Tile): Tile | null {
  let best: Tile | null = null;
  let bestD = Infinity;
  for (let y = 0; y < maze.height; y++) {
    for (let x = 0; x < maze.width; x++) {
      if (maze.tiles[y * maze.width + x] !== 'floor') continue;
      const d = (x - target.x) ** 2 + (y - target.y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = { x, y };
      }
    }
  }
  return best;
}

export interface DirectWalkOptions {
  /** Maximum number of steps one tap may move the avatar. */
  maxSteps: number;
  /**
   * How many extra steps (beyond the straight grid distance) a route may take.
   * Small values mean the avatar never walks "around" hedges to reach a tapped spot,
   * so tapping the goal does not solve the maze.
   */
  maxDetour: number;
}

/**
 * Tap-to-walk path that does NOT solve the maze for the child.
 *
 * Only tiles that are close (≤ maxSteps) and reachable almost directly
 * (path length ≤ grid distance + maxDetour) are allowed destinations. Of those, the
 * one closest to `target` is chosen (ties: shorter walk). Returns the path including
 * `from`, or null if the avatar would not move.
 */
export function directWalkPath(maze: Grid, from: Tile, target: Tile, opts: DirectWalkOptions): Tile[] | null {
  if (!isFloor(maze, from)) return null;
  const size = maze.width * maze.height;
  const dist = new Array<number>(size).fill(-1);
  const parent = new Array<number>(size).fill(-1);
  dist[tileIndex(maze, from)] = 0;
  const queue: Tile[] = [from];
  let best = from;
  let bestScore = (from.x - target.x) ** 2 + (from.y - target.y) ** 2;
  let bestSteps = 0;

  for (let head = 0; head < queue.length; head++) {
    const t = queue[head]!;
    const d = dist[tileIndex(maze, t)]!;
    if (d >= opts.maxSteps) continue;
    for (const dir of DIRECTIONS) {
      const n = { x: t.x + dir.x, y: t.y + dir.y };
      const ni = tileIndex(maze, n);
      if (!isFloor(maze, n) || dist[ni] !== -1) continue;
      dist[ni] = d + 1;
      parent[ni] = tileIndex(maze, t);
      queue.push(n);
      const gridDistance = Math.abs(n.x - from.x) + Math.abs(n.y - from.y);
      if (d + 1 > gridDistance + opts.maxDetour) continue;
      const score = (n.x - target.x) ** 2 + (n.y - target.y) ** 2;
      if (score < bestScore || (score === bestScore && d + 1 < bestSteps)) {
        best = n;
        bestScore = score;
        bestSteps = d + 1;
      }
    }
  }

  if (sameTile(best, from)) return null;
  const path: Tile[] = [];
  for (let i = tileIndex(maze, best); i !== -1; i = parent[i]!) {
    path.push({ x: i % maze.width, y: Math.floor(i / maze.width) });
  }
  return path.reverse();
}
