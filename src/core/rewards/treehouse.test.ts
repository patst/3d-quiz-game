import { describe, expect, it } from 'vitest';
import { autoPlace, placeDecor, removeDecor } from './treehouse';

describe('treehouse', () => {
  it('auto-places new decorations on free spots until full', () => {
    let house = {};
    for (const id of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) house = autoPlace(house, id);
    expect(Object.keys(house)).toHaveLength(6);
    expect(Object.values(house)).not.toContain('g');
    expect(autoPlace(house, 'a')).toBe(house);
  });

  it('moves an item when placed elsewhere and can remove it', () => {
    let house = placeDecor({}, 's1', 'lamp');
    house = placeDecor(house, 's3', 'lamp');
    expect(house).toEqual({ s3: 'lamp' });
    house = placeDecor(house, 's3', 'plant');
    expect(house).toEqual({ s3: 'plant' });
    expect(removeDecor(house, 's3')).toEqual({});
  });
});
