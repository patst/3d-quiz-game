import { describe, expect, it } from 'vitest';
import { de } from '../../content/de/strings';
import { rewardIcons } from '../../ui/rewardIcons';
import { rewardCatalog } from './catalog';

describe('reward catalog', () => {
  it('has unique ids, a German name and an icon for every item', () => {
    const ids = rewardCatalog.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(de.rewards.items[id], id).toBeTruthy();
      expect(rewardIcons[id], id).toBeTruthy();
    }
  });
});
