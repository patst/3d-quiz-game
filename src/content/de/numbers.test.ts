import { describe, expect, it } from 'vitest';
import { numberWord } from './numbers';

describe('numberWord', () => {
  it.each([
    [0, 'null'],
    [7, 'sieben'],
    [11, 'elf'],
    [17, 'siebzehn'],
    [20, 'zwanzig'],
    [21, 'einundzwanzig'],
    [43, 'dreiundvierzig'],
    [36, 'sechsunddreißig'],
    [99, 'neunundneunzig'],
  ])('%i → %s', (n, word) => expect(numberWord(n)).toBe(word));
});
