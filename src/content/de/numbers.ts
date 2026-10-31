const ONES = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];
const TEENS = ['zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
const TENS = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];

/** German number word for 0..99 ("dreiundvierzig"). */
export function numberWord(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 99) throw new Error(`numberWord: ${n} out of range`);
  if (n < 10) return ONES[n]!;
  if (n < 20) return TEENS[n - 10]!;
  const tens = TENS[Math.floor(n / 10)]!;
  const ones = n % 10;
  if (ones === 0) return tens;
  return `${ones === 1 ? 'ein' : ONES[ones]}und${tens}`;
}
