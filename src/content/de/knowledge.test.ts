import { describe, expect, it } from 'vitest';
import { ANIMALS, BABIES, COLORS, ODD_CATEGORIES, SEASON_QUESTIONS, SHAPES, shapeAccusative, WEATHER_QUESTIONS, WEATHER_ITEMS } from './knowledge';

describe('knowledge content', () => {
  it('has unique ids and enough entries', () => {
    expect(new Set(ANIMALS.map((a) => a.id)).size).toBe(ANIMALS.length);
    expect(ANIMALS.length).toBeGreaterThanOrEqual(20);
    expect(new Set(BABIES.map((b) => b.baby)).size).toBe(BABIES.length);
    for (const c of ODD_CATEGORIES) expect(c.items.length, c.id).toBeGreaterThanOrEqual(5);
    const allItems = ODD_CATEGORIES.flatMap((c) => c.items.map((i) => i.id));
    expect(new Set(allItems).size).toBe(allItems.length);
  });

  it('declines colour + shape correctly', () => {
    const blue = COLORS.find((c) => c.id === 'blue')!;
    expect(shapeAccusative(blue, SHAPES.find((s) => s.id === 'circle')!)).toBe('den blauen Kreis');
    expect(shapeAccusative(blue, SHAPES.find((s) => s.id === 'triangle')!)).toBe('das blaue Dreieck');
    expect(COLORS.filter((c) => c.adj).length).toBeGreaterThanOrEqual(4);
  });

  it('every season appears as an answer at both levels; weather answers exist', () => {
    for (const level of [1, 2]) {
      const answers = new Set(SEASON_QUESTIONS.filter((q) => q.level === level).map((q) => q.answer));
      expect(answers.size, `level ${level}`).toBe(4);
    }
    for (const q of WEATHER_QUESTIONS) expect(WEATHER_ITEMS.some((i) => i.id === q.answer)).toBe(true);
  });
});
