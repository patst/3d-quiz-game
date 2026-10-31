import type { Equipped } from '../rewards/rewards';

/** Animal avatars a child can choose (game-design §2/§7). Display names live in content/de. */
export const AVATAR_ANIMALS = ['bunny', 'bear', 'cat', 'frog', 'penguin'] as const;
export type AvatarAnimal = (typeof AVATAR_ANIMALS)[number];

/** Avatar main colours (hex). Kept small so the picker stays simple for kids. */
export const AVATAR_COLORS = ['#f4a3c0', '#f6c453', '#8fd16a', '#6ec6f0', '#b18cf0', '#f08c5a'] as const;
export type AvatarColor = (typeof AVATAR_COLORS)[number];

export interface Avatar {
  animal: AvatarAnimal;
  color: AvatarColor;
}

export interface Profile {
  id: string;
  /** Optional; typed by a parent. Pre-readers recognise their profile by the avatar. */
  name: string;
  avatar: Avatar;
  createdAt: number;
  /** Stars collected in total (game-design §7). */
  stars: number;
  /** Number of mazes finished. */
  mazesCompleted: number;
  /** Stars in the star jar (0..JAR_SIZE-1). */
  jar: number;
  /** Full jars whose reward has not been chosen yet. */
  pendingRewards: number;
  /** Owned reward item ids. */
  inventory: string[];
  /** Worn item per slot. */
  equipped: Equipped;
  /** Rescued animal friends (LostAnimal ids), in rescue order. */
  rescued: string[];
  /** Rescued friend that follows the avatar, or null. */
  pet: string | null;
}

export const MAX_PROFILES = 6;
export const MAX_NAME_LENGTH = 16;

export function createProfile(input: { id: string; name: string; avatar: Avatar; now: number }): Profile {
  return {
    id: input.id,
    name: input.name.trim().slice(0, MAX_NAME_LENGTH),
    avatar: input.avatar,
    createdAt: input.now,
    stars: 0,
    mazesCompleted: 0,
    jar: 0,
    pendingRewards: 0,
    inventory: [],
    equipped: {},
    rescued: [],
    pet: null,
  };
}
