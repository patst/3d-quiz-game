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
