/**
 * A world/theme module (architecture.md §3.2). The maze generator is theme-agnostic;
 * a world only decides look, size and later music/station props/unlock rules.
 */
export interface WorldTheme {
  id: string;
  /** Maze shape; the size comes from the child's level (core/progress/levels). */
  maze: { braid: number };
  /**
   * Treasure chests per maze and the challenge types they may hold, with the level a new
   * child starts at. Actual levels adapt per child (core/skills, M4).
   */
  chests: {
    challenges: ReadonlyArray<{ typeId: string; startLevel: number }>;
  };
  colors: {
    sky: string;
    ground: string;
    path: string;
    wall: string;
    wallTop: string;
    decorations: readonly string[];
  };
}
