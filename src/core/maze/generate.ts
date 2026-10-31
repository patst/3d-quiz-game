import { createRng } from '../rng';
import { DIRECTIONS, isFloor, tileIndex, type Maze, type Tile, type TileKind } from './types';
import { distancesFrom } from './pathfinding';

export interface MazeOptions {
  /** Number of maze cells horizontally (tile width = 2*cols+1). */
  cols: number;
  /** Number of maze cells vertically. */
  rows: number;
  /**
   * Fraction (0..1) of dead ends that get an extra opening, creating loops.
   * Loops make mazes friendlier for young children (fewer long dead ends).
   */
  braid: number;
  seed: number;
}

/**
 * Generates a maze with a randomized depth-first search (perfect maze), then braids it.
 * Start is the top-left cell; goal is the floor tile farthest away from the start.
 */
export function generateMaze(options: MazeOptions): Maze {
  const { cols, rows, braid, seed } = options;
  if (cols < 2 || rows < 2) throw new Error('Maze needs at least 2x2 cells');
  const rng = createRng(seed);
  const width = cols * 2 + 1;
  const height = rows * 2 + 1;
  const tiles: TileKind[] = new Array<TileKind>(width * height).fill('wall');
  const dims = { width };
  const set = (t: Tile, kind: TileKind) => {
    tiles[tileIndex(dims, t)] = kind;
  };
  const cellTile = (cx: number, cy: number): Tile => ({ x: cx * 2 + 1, y: cy * 2 + 1 });

  // Iterative DFS ("recursive backtracker").
  const visited = new Set<number>();
  const stack: Array<{ cx: number; cy: number }> = [{ cx: 0, cy: 0 }];
  visited.add(0);
  set(cellTile(0, 0), 'floor');
  while (stack.length > 0) {
    const current = stack[stack.length - 1]!;
    const options = rng
      .shuffle(DIRECTIONS)
      .map((d) => ({ cx: current.cx + d.x, cy: current.cy + d.y, d }))
      .filter(({ cx, cy }) => cx >= 0 && cy >= 0 && cx < cols && cy < rows && !visited.has(cy * cols + cx));
    const nextCell = options[0];
    if (!nextCell) {
      stack.pop();
      continue;
    }
    visited.add(nextCell.cy * cols + nextCell.cx);
    const from = cellTile(current.cx, current.cy);
    set({ x: from.x + nextCell.d.x, y: from.y + nextCell.d.y }, 'floor');
    set(cellTile(nextCell.cx, nextCell.cy), 'floor');
    stack.push({ cx: nextCell.cx, cy: nextCell.cy });
  }

  const grid = { width, height, tiles };
  const floorNeighbours = (t: Tile) =>
    DIRECTIONS.filter((d) => isFloor(grid, { x: t.x + d.x, y: t.y + d.y })).length;

  // Braid: open a wall at some dead ends.
  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      const t = cellTile(cx, cy);
      if (floorNeighbours(t) !== 1 || rng.next() >= braid) continue;
      const candidates = rng.shuffle(DIRECTIONS).filter((d) => {
        const wall = { x: t.x + d.x, y: t.y + d.y };
        const beyond = { x: t.x + d.x * 2, y: t.y + d.y * 2 };
        return (
          beyond.x > 0 && beyond.y > 0 && beyond.x < width - 1 && beyond.y < height - 1 &&
          tiles[tileIndex(dims, wall)] === 'wall'
        );
      });
      const d = candidates[0];
      if (d) set({ x: t.x + d.x, y: t.y + d.y }, 'floor');
    }
  }

  const start = cellTile(0, 0);
  const dist = distancesFrom(grid, start);
  let goal = start;
  let best = -1;
  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      const t = cellTile(cx, cy);
      const d = dist[tileIndex(dims, t)] ?? -1;
      if (d > best) {
        best = d;
        goal = t;
      }
    }
  }

  const cells: Tile[] = [];
  for (let cy = 0; cy < rows; cy++) for (let cx = 0; cx < cols; cx++) cells.push(cellTile(cx, cy));
  const notEnds = (t: Tile) => !(t.x === start.x && t.y === start.y) && !(t.x === goal.x && t.y === goal.y);
  const deadEnds = cells.filter((t) => notEnds(t) && floorNeighbours(t) === 1);
  const others = cells.filter((t) => notEnds(t) && floorNeighbours(t) !== 1);
  const stationCandidates = [...rng.shuffle(deadEnds), ...rng.shuffle(others)];

  return { width, height, tiles, start, goal, stationCandidates, seed };
}
