import type { Rng } from '../rng';

/** Where an item is worn. One item per slot can be equipped. */
export const REWARD_SLOTS = ['hat', 'glasses', 'neck', 'trail'] as const;
export type RewardSlot = (typeof REWARD_SLOTS)[number];

export interface RewardItem {
  id: string;
  slot: RewardSlot;
}

export type Equipped = Partial<Record<RewardSlot, string>>;

/** Stars needed to fill the star jar (game-design §7). Counting to 10 is practice too. */
export const JAR_SIZE = 10;

/** Adds stars to the jar; every full jar becomes one pending reward choice. */
export function fillJar(jar: number, pendingRewards: number, stars: number): { jar: number; pendingRewards: number } {
  const total = jar + Math.max(0, stars);
  return { jar: total % JAR_SIZE, pendingRewards: pendingRewards + Math.floor(total / JAR_SIZE) };
}

/**
 * Up to `count` items the child does not own yet, preferring different slots so the
 * choice feels varied. Returns fewer when (almost) everything is collected.
 */
export function rewardOffer(catalog: readonly RewardItem[], inventory: readonly string[], rng: Rng, count = 3): RewardItem[] {
  const owned = new Set(inventory);
  const unowned = rng.shuffle(catalog.filter((i) => !owned.has(i.id)));
  const offer: RewardItem[] = [];
  const usedSlots = new Set<RewardSlot>();
  for (const item of unowned) {
    if (offer.length >= count) break;
    if (!usedSlots.has(item.slot)) {
      offer.push(item);
      usedSlots.add(item.slot);
    }
  }
  for (const item of unowned) {
    if (offer.length >= count) break;
    if (!offer.includes(item)) offer.push(item);
  }
  return offer;
}

/** Equips an owned item (replacing the item in the same slot), or unequips it if worn. */
export function toggleEquip(equipped: Equipped, item: RewardItem): Equipped {
  if (equipped[item.slot] === item.id) {
    const next = { ...equipped };
    delete next[item.slot];
    return next;
  }
  return { ...equipped, [item.slot]: item.id };
}
