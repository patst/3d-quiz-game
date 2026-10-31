import { describe, expect, it } from 'vitest';
import { challengeTypes } from '../../modules/challenges';
import { challengeViews } from '.';

describe('challenge view registry', () => {
  it('every registered challenge type has a view', () => {
    for (const t of challengeTypes) expect(challengeViews[t.id]?.View, t.id).toBeTruthy();
  });
});
