/**
 * World unlocking (roadmap M9). Pure rules; the world list itself lives in modules/worlds.
 */
export interface UnlockRule {
  /** Finished mazes needed in another world. */
  world: string;
  mazes: number;
}

export function isUnlocked(rule: UnlockRule | undefined, levels: Readonly<Record<string, number>>): boolean {
  return !rule || (levels[rule.world] ?? 0) >= rule.mazes;
}

/** How many more mazes are needed (0 when unlocked). */
export function mazesUntilUnlock(rule: UnlockRule | undefined, levels: Readonly<Record<string, number>>): number {
  return rule ? Math.max(0, rule.mazes - (levels[rule.world] ?? 0)) : 0;
}
