/**
 * Tree house (roadmap M10): decorations placed on fixed spots. Pure data helpers.
 */
export const TREEHOUSE_SPOTS = ['s1', 's2', 's3', 's4', 's5', 's6'] as const;
export type TreehouseSpot = (typeof TREEHOUSE_SPOTS)[number];

/** spot id → decoration item id */
export type Treehouse = Partial<Record<TreehouseSpot, string>>;

/** Places an item on a spot; an item can only stand in one place (moves if already placed). */
export function placeDecor(house: Treehouse, spot: TreehouseSpot, itemId: string): Treehouse {
  const next: Treehouse = {};
  for (const [s, id] of Object.entries(house) as [TreehouseSpot, string][]) if (id !== itemId) next[s] = id;
  next[spot] = itemId;
  return next;
}

export function removeDecor(house: Treehouse, spot: TreehouseSpot): Treehouse {
  const next = { ...house };
  delete next[spot];
  return next;
}

/** New decorations go to the first free spot automatically (nothing happens if full). */
export function autoPlace(house: Treehouse, itemId: string): Treehouse {
  if (Object.values(house).includes(itemId)) return house;
  const free = TREEHOUSE_SPOTS.find((s) => !house[s]);
  return free ? { ...house, [free]: itemId } : house;
}
