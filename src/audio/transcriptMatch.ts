import { germanNumber } from '../content/de/spokenForm';

/** Letters only, numbers as German words: "1.000 Hüpf-Knöpfe!" → "tausendhüpfknöpfe". */
export function letters(s: string): string {
  return s
    .toLowerCase()
    .replace(/(\d)\.(?=\d{3}\b)/g, '$1')
    .replace(/\d+/g, (d) => germanNumber(Number(d)))
    .replace(/[^a-zäöüß]/g, '');
}

/** Letter edits (insert, delete, change) between a sentence and its transcript. */
export function letterEdits(text: string, heard: string): number {
  const a = letters(text);
  const b = letters(heard);
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length]!;
}

/**
 * Whether a transcript says the sentence (ADR-0015). Spaces, punctuation and how numbers are
 * written don't count ("Hüpfknopf" = "Hüpf-Knopf", "1000" = "tausend"). A long sentence may
 * differ by 2 letters (Whisper writes "Oli" for "Olli"), a short one by 1, a single word by
 * none — so a swapped word ("Auf dem" for "Mit dem") is always caught.
 */
export function matches(text: string, heard: string): boolean {
  const n = letters(text).length;
  return letterEdits(text, heard) <= (n < 10 ? 0 : n < 20 ? 1 : 2);
}
