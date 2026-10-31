import type { ChallengeType } from '../challenges/types';
import type { Rng } from '../rng';

/**
 * Adaptive difficulty per challenge type (game-design §6.1 / M4).
 * Simple, explainable rule: two clean solves in a row at (or above) the current level →
 * level up; two struggles in a row at (or below) it → level down.
 */
export interface SkillState {
  level: number;
  /** >0: consecutive clean solves, <0: consecutive struggles. */
  streak: number;
  // Statistics for the parents area.
  attempts: number;
  firstTry: number;
  solved: number;
  revealed: number;
  skipped: number;
}

/** How a challenge ended. */
export type ChallengeOutcome =
  | { kind: 'solved'; wrongTries: number }
  | { kind: 'revealed' }
  | { kind: 'skipped' };

export const STREAK_TO_CHANGE = 2;

export function initialSkill(startLevel: number): SkillState {
  return { level: startLevel, streak: 0, attempts: 0, firstTry: 0, solved: 0, revealed: 0, skipped: 0 };
}

export function recordOutcome(state: SkillState, outcome: ChallengeOutcome, playedLevel: number, maxLevel: number): SkillState {
  const next: SkillState = { ...state, attempts: state.attempts + 1 };
  // clean = no or one wrong try; struggled = needed the hint or the solution.
  let signal: 'clean' | 'struggled' | 'neutral' = 'neutral';
  if (outcome.kind === 'solved') {
    next.solved++;
    if (outcome.wrongTries === 0) next.firstTry++;
    signal = outcome.wrongTries <= 1 ? 'clean' : 'struggled';
  } else if (outcome.kind === 'revealed') {
    next.revealed++;
    signal = 'struggled';
  } else {
    next.skipped++;
  }

  if (signal === 'clean' && playedLevel >= state.level) next.streak = Math.max(0, state.streak) + 1;
  else if (signal === 'struggled' && playedLevel <= state.level) next.streak = Math.min(0, state.streak) - 1;

  if (next.streak >= STREAK_TO_CHANGE && next.level < maxLevel) {
    next.level++;
    next.streak = 0;
  } else if (next.streak <= -STREAK_TO_CHANGE && next.level > 1) {
    next.level--;
    next.streak = 0;
  }
  return next;
}

export type ChestTier = 'bronze' | 'silver' | 'gold';

/** Tier → level offset and stars (game-design §6.2/§7). */
export const TIERS: Record<ChestTier, { offset: number; stars: number }> = {
  bronze: { offset: -1, stars: 1 },
  silver: { offset: 0, stars: 2 },
  gold: { offset: 1, stars: 3 },
};

export interface PlannedChest {
  type: ChallengeType;
  level: number;
  tier: ChestTier;
  stars: number;
}

/**
 * Chests for one maze: tiers cycle bronze/silver/gold (shuffled), types vary.
 * The level is the child's level for that type plus the tier offset, clamped.
 */
export function planChests(
  rng: Rng,
  types: ReadonlyArray<{ type: ChallengeType; startLevel: number }>,
  skills: Readonly<Record<string, SkillState>>,
  count: number,
): PlannedChest[] {
  if (types.length === 0) return [];
  const tiers = rng.shuffle<ChestTier>(['bronze', 'silver', 'gold']);
  const order = rng.shuffle(types);
  return Array.from({ length: count }, (_, i) => {
    const { type, startLevel } = order[i % order.length]!;
    const tier = tiers[i % tiers.length]!;
    const base = skills[type.id]?.level ?? startLevel;
    const level = Math.min(type.levels, Math.max(1, base + TIERS[tier].offset));
    return { type, level, tier, stars: TIERS[tier].stars };
  });
}
