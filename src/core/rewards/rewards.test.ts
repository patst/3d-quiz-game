import { describe, expect, it } from 'vitest';
import { createRng } from '../rng';
import { fillJar, rewardOffer, toggleEquip, type RewardItem } from './rewards';

const catalog: RewardItem[] = [
  { id: 'h1', slot: 'hat' },
  { id: 'h2', slot: 'hat' },
  { id: 'g1', slot: 'glasses' },
  { id: 'n1', slot: 'neck' },
  { id: 't1', slot: 'trail' },
];

describe('fillJar', () => {
  it('fills up and converts full jars into pending rewards', () => {
    expect(fillJar(0, 0, 2)).toEqual({ jar: 2, pendingRewards: 0 });
    expect(fillJar(9, 0, 2)).toEqual({ jar: 1, pendingRewards: 1 });
    expect(fillJar(8, 1, 23)).toEqual({ jar: 1, pendingRewards: 4 });
  });
});

describe('rewardOffer', () => {
  it('offers 3 unowned items from different slots when possible', () => {
    for (let seed = 1; seed < 50; seed++) {
      const offer = rewardOffer(catalog, ['g1'], createRng(seed));
      expect(offer).toHaveLength(3);
      expect(offer.map((i) => i.id)).not.toContain('g1');
      expect(new Set(offer.map((i) => i.slot)).size).toBe(3);
    }
  });

  it('offers fewer when almost everything is owned', () => {
    expect(rewardOffer(catalog, ['h1', 'h2', 'g1', 'n1'], createRng(1))).toEqual([{ id: 't1', slot: 'trail' }]);
    expect(rewardOffer(catalog, catalog.map((i) => i.id), createRng(1))).toEqual([]);
  });
});

describe('toggleEquip', () => {
  it('replaces within a slot and unequips when worn', () => {
    let eq = toggleEquip({}, catalog[0]!);
    expect(eq).toEqual({ hat: 'h1' });
    eq = toggleEquip(eq, catalog[1]!);
    expect(eq).toEqual({ hat: 'h2' });
    eq = toggleEquip(eq, catalog[1]!);
    expect(eq).toEqual({});
  });
});
