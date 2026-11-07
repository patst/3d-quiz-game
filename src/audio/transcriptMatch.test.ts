import { describe, expect, it } from 'vitest';
import { letterEdits, letters, matches } from './transcriptMatch';

describe('transcript match (ADR-0015)', () => {
  it('ignores spaces, punctuation, case and how numbers are written', () => {
    expect(letters('1.000 Hüpf-Knöpfe!')).toBe('tausendhüpfknöpfe');
    expect(matches('1 Kilogramm sind 1000 Gramm.', 'Ein Kilogramm sind tausend Gramm.')).toBe(true);
    expect(matches('Du ziehst ohne hinzusehen eine Kugel.', 'Du ziehst ohnehin zu sehen eine Kugel.')).toBe(true);
  });
  it('tolerates a one-letter spelling difference in names', () => {
    expect(matches('Hallo! Ich bin Olli, die Eule.', 'Hallo, ich bin Oli, die Eule.')).toBe(true);
  });
  it('catches swapped, wrong or missing words, also in long sentences', () => {
    const long = 'Halte den Pfeil gedrückt, dann läufst du. Mit dem Hüpf-Knopf springst du.';
    expect(matches(long, long.replace('Mit dem', 'Auf dem'))).toBe(false);
    expect(matches('Super! Du hast alle Paare gefunden.', 'Super, du hast alle Power gefunden.')).toBe(false);
    expect(matches('Affe', 'Affen')).toBe(false);
    expect(matches('Wie viele Blumen siehst du?', '')).toBe(false);
    expect(letterEdits('Affe', 'Affe.')).toBe(0);
  });
});
