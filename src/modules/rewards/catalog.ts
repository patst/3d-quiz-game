import type { RewardItem } from '../../core/rewards/rewards';

/**
 * All collectible avatar items (game-design §7). German names: content/de/strings.ts
 * (`rewards.items`), icons: ui/rewardIcons.ts, 3D models: render/avatars/accessories.ts.
 * Adding an item = one entry in each of these four places.
 */
export const rewardCatalog: readonly RewardItem[] = [
  { id: 'party-hat', slot: 'hat' },
  { id: 'crown', slot: 'hat' },
  { id: 'top-hat', slot: 'hat' },
  { id: 'cap', slot: 'hat' },
  { id: 'flower-wreath', slot: 'hat' },
  { id: 'wizard-hat', slot: 'hat' },
  { id: 'round-glasses', slot: 'glasses' },
  { id: 'sunglasses', slot: 'glasses' },
  { id: 'star-glasses', slot: 'glasses' },
  { id: 'heart-glasses', slot: 'glasses' },
  { id: 'scarf', slot: 'neck' },
  { id: 'cape', slot: 'neck' },
  { id: 'bow-tie', slot: 'neck' },
  { id: 'medal', slot: 'neck' },
  { id: 'sparkles', slot: 'trail' },
  { id: 'hearts', slot: 'trail' },
  { id: 'bubbles', slot: 'trail' },
  { id: 'rainbow', slot: 'trail' },
];

export function getRewardItem(id: string): RewardItem | undefined {
  return rewardCatalog.find((i) => i.id === id);
}
