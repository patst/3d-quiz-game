/**
 * A world/theme module (architecture.md §3.2). The maze generator is theme-agnostic;
 * a world only decides look, size and later music/station props/unlock rules.
 */
export interface WorldTheme {
  id: string;
  /** Maze size in cells. */
  maze: { cols: number; rows: number; braid: number };
  colors: {
    sky: string;
    ground: string;
    path: string;
    wall: string;
    wallTop: string;
    decorations: readonly string[];
  };
}
