/**
 * Maze levels (roadmap M8): every finished maze in a world raises the child's level there;
 * higher levels mean bigger mazes and a few more chests.
 */
export interface LevelSpec {
  level: number;
  cols: number;
  rows: number;
  chests: number;
}

export const MAX_SIZE_LEVEL = 11;

/** Level 1 = 4×4 cells (gentle start), +1 row or column per level, up to 9×9 at level 11. */
export function levelSpec(level: number): LevelSpec {
  const l = Math.max(1, Math.floor(level));
  const grow = Math.min(l, MAX_SIZE_LEVEL) - 1; // 0..10
  const cols = 4 + Math.ceil(grow / 2);
  const rows = 4 + Math.floor(grow / 2);
  const chests = l >= 8 ? 5 : l >= 5 ? 4 : 3;
  return { level: l, cols: Math.max(cols, rows), rows: Math.min(cols, rows), chests };
}

/** Current level in a world = finished mazes there + 1. */
export function currentLevel(completedInWorld: number | undefined): number {
  return (completedInWorld ?? 0) + 1;
}
