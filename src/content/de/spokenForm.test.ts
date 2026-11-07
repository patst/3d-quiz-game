import { describe, expect, it } from 'vitest';
import { allSpokenTexts } from './speech';
import { germanNumber, spokenForm } from './spokenForm';

describe('germanNumber', () => {
  it.each([
    [0, 'null'],
    [1, 'eins'],
    [21, 'einundzwanzig'],
    [100, 'hundert'],
    [101, 'hunderteins'],
    [700, 'siebenhundert'],
    [1000, 'tausend'],
    [1001, 'tausendeins'],
    [7312, 'siebentausenddreihundertzwölf'],
    [9000, 'neuntausend'],
    [21_000, 'einundzwanzigtausend'],
  ])('%i → %s', (n, word) => expect(germanNumber(n)).toBe(word));
});

describe('spokenForm', () => {
  it.each([
    ['1 Kilogramm sind 1000 Gramm.', 'ein Kilogramm sind tausend Gramm.'],
    ['1 Stunde sind 60 Minuten.', 'eine Stunde sind sechzig Minuten.'],
    ['Was ist 16 plus 1?', 'Was ist sechzehn plus eins?'],
    ['Das sind 1 Euro 10.', 'Das sind ein Euro zehn.'],
    ['Das ist die 12: ein Zehner und 2 Einer.', 'Das ist die zwölf: ein Zehner und zwei Einer.'],
    ['Wie viele Blumen siehst du?', 'Wie viele Blumen siehst du?'],
  ])('%s', (text, spoken) => expect(spokenForm(text)).toBe(spoken));

  it('leaves no digits in any sentence the game can say', () => {
    for (const text of allSpokenTexts()) expect(spokenForm(text), text).not.toMatch(/\d/);
  });
});
