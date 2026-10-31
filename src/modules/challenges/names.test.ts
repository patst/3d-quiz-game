import { describe, expect, it } from 'vitest';
import { de } from '../../content/de/strings';
import { challengeTypes } from '.';

describe('challenge type names', () => {
  it('every registered type has a German name for the parents area', () => {
    for (const t of challengeTypes) expect(de.challengeNames[t.id], t.id).toBeTruthy();
  });
});
