import { numberWord } from './numbers';

/**
 * What the TTS voice is given to read for a sentence (ADR-0015). The clip id and the text on
 * screen stay the written sentence; only the voice input differs. Generative voices guess at
 * digits ("1 Kilogramm" → "Ehm Kilogramm"), so numbers are written out as German words.
 */
export function spokenForm(text: string): string {
  return text.replace(/(?<![\d.,])(\d+)(?![\d.,]\d)(\s+)?(\p{Lu}\p{L}*)?/gu, (_, digits: string, space?: string, word?: string) => {
    const n = Number(digits);
    const rest = word ? `${space ?? ''}${word}` : (space ?? '');
    // "1 Kind" → "ein Kind", "1 Minute" → "eine Minute"; a lone 1 is "eins".
    if (n === 1 && word && space) return `${FEMININE.has(word) ? 'eine' : 'ein'}${rest}`;
    return `${germanNumber(n)}${rest}`;
  });
}

/** Feminine nouns that follow a "1" in the game's sentences. */
const FEMININE = new Set(['Minute', 'Stunde', 'Kugel', 'Blume', 'Zahl', 'Sekunde', 'Woche']);

/** German number word for 0..999 999 ("siebentausenddreihundertzwölf"). */
export function germanNumber(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 999_999) throw new Error(`germanNumber: ${n} out of range`);
  if (n < 100) return numberWord(n);
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const r = n % 100;
    return `${h === 1 ? '' : numberWord(h)}hundert${r === 0 ? '' : numberWord(r)}`;
  }
  const t = Math.floor(n / 1000);
  const r = n % 1000;
  return `${t === 1 ? '' : germanNumber(t)}tausend${r === 0 ? '' : germanNumber(r)}`;
}
