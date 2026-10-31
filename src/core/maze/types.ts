/** A position on the tile grid. x = column, y = row. */
export interface Tile {
  readonly x: number;
  readonly y: number;
}

export type TileKind = 'wall' | 'floor';

/**
 * A maze as a tile grid. Cells of the abstract maze live on odd coordinates,
 * walls/passages between them on even ones, so width/height are always odd.
 */
export interface Maze {
  readonly width: number;
  readonly height: number;
  /** Row-major, length width*height. */
  readonly tiles: readonly TileKind[];
  readonly start: Tile;
  readonly goal: Tile;
  /** Floor tiles suitable for placing stations (dead ends first, never start/goal). */
  readonly stationCandidates: readonly Tile[];
  readonly seed: number;
}

export function tileIndex(maze: Pick<Maze, 'width'>, t: Tile): number {
  return t.y * maze.width + t.x;
}

/** The minimal grid shape needed by tile queries. */
export type Grid = Pick<Maze, 'width' | 'height' | 'tiles'>;

export function isFloor(maze: Grid, t: Tile): boolean {
  if (t.x < 0 || t.y < 0 || t.x >= maze.width || t.y >= maze.height) return false;
  return maze.tiles[tileIndex(maze, t)] === 'floor';
}

export function sameTile(a: Tile, b: Tile): boolean {
  return a.x === b.x && a.y === b.y;
}

export const DIRECTIONS: readonly Tile[] = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
];
