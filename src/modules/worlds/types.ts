/**
 * A world/theme module (architecture.md §3.2). The maze generator is theme-agnostic;
 * a world only decides look, size and later music/station props/unlock rules.
 */
import type { LostAnimal } from '../../core/profile/lostAnimals';
import type { UnlockRule } from '../../core/progress/worlds';

export interface WorldTheme {
  id: string;
  /** Guide character (content/de guides), shown in the HUD. */
  guide: 'olli' | 'ida' | 'rick';
  /** Friends lost in this world's mazes, rescued in this order. */
  lostAnimals: readonly LostAnimal[];
  /** Missing = available from the start. */
  unlock?: UnlockRule;
  /** Wall look and ambient effects. */
  style: 'hedge' | 'coral';
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
    /** Strong colour for the world card (white text on it). */
    card: string;
    sky: string;
    ground: string;
    path: string;
    wall: string;
    /** Optional per-wall colour variety (coral). */
    wallVariants?: readonly string[];
    wallTop: string;
    decorations: readonly string[];
  };
}
