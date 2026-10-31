import { describe, expect, it } from 'vitest';
import { allSpokenTexts } from '../content/de/speech';
import { clipId } from './clipId';

describe('clipId', () => {
  it('is stable and normalises whitespace', () => {
    expect(clipId('Super gemacht!')).toBe(clipId(' Super gemacht! '));
    // Changing the hash would orphan every committed clip.
    expect(clipId('Super gemacht!')).toBe('2a63mcaneox');
  });

  it('has no collisions across all spoken sentences', () => {
    const texts = allSpokenTexts();
    expect(new Set(texts.map(clipId)).size).toBe(texts.length);
  });
});
