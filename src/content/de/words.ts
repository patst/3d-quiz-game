/**
 * German word bank for the German challenges (game-design §6, M6).
 * Each word has a picture (emoji), its syllables, the initial letter if the word starts
 * with a clear single sound (null for Sch, St, Pf, Ei, Au, soft G, …) and a rhyme group.
 * Adding words: append here; tests check consistency, then run `npm run audio:generate`.
 */
export interface Word {
  id: string;
  word: string;
  emoji: string;
  syllables: readonly string[];
  /** Uppercase first letter for "Anlaut" tasks, or null if the first sound is not one letter. */
  initial: string | null;
  rhyme?: string;
}

const w = (word: string, emoji: string, syllables: string, initial: string | null, rhyme?: string): Word => ({
  id: word.toLowerCase(),
  word,
  emoji,
  syllables: syllables.split('-'),
  initial,
  ...(rhyme ? { rhyme } : {}),
});

export const WORDS: readonly Word[] = [
  w('Maus', '🐭', 'Maus', 'M', 'aus'),
  w('Haus', '🏠', 'Haus', 'H', 'aus'),
  w('Hose', '👖', 'Ho-se', 'H', 'ose'),
  w('Rose', '🌹', 'Ro-se', 'R', 'ose'),
  w('Dose', '🥫', 'Do-se', 'D', 'ose'),
  w('Nase', '👃', 'Na-se', 'N', 'ase'),
  w('Hase', '🐰', 'Ha-se', 'H', 'ase'),
  w('Hund', '🐶', 'Hund', 'H', 'und'),
  w('Mund', '👄', 'Mund', 'M', 'und'),
  w('Kuh', '🐮', 'Kuh', 'K', 'uh'),
  w('Schuh', '👟', 'Schuh', null, 'uh'),
  w('Schwein', '🐷', 'Schwein', null, 'ein'),
  w('Stein', '🪨', 'Stein', null, 'ein'),
  w('Bein', '🦵', 'Bein', 'B', 'ein'),
  w('Zahn', '🦷', 'Zahn', 'Z', 'ahn'),
  w('Hahn', '🐓', 'Hahn', 'H', 'ahn'),
  w('Ziege', '🐐', 'Zie-ge', 'Z', 'iege'),
  w('Fliege', '🪰', 'Flie-ge', 'F', 'iege'),
  w('Katze', '🐱', 'Kat-ze', 'K', 'atze'),
  w('Tatze', '🐾', 'Tat-ze', 'T', 'atze'),
  w('Sonne', '☀️', 'Son-ne', 'S', 'onne'),
  w('Tonne', '🛢️', 'Ton-ne', 'T', 'onne'),
  w('Wal', '🐋', 'Wal', 'W', 'al'),
  w('Schal', '🧣', 'Schal', null, 'al'),
  w('Hand', '✋', 'Hand', 'H', 'and'),
  w('Strand', '🏖️', 'Strand', null, 'and'),
  w('Mond', '🌙', 'Mond', 'M'),
  w('Baum', '🌳', 'Baum', 'B'),
  w('Ball', '⚽', 'Ball', 'B'),
  w('Banane', '🍌', 'Ba-na-ne', 'B'),
  w('Apfel', '🍎', 'Ap-fel', 'A'),
  w('Auto', '🚗', 'Au-to', null),
  w('Ente', '🦆', 'En-te', 'E'),
  w('Igel', '🦔', 'I-gel', 'I'),
  w('Eis', '🍦', 'Eis', null),
  w('Uhr', '⌚', 'Uhr', 'U'),
  w('Ohr', '👂', 'Ohr', 'O'),
  w('Bus', '🚌', 'Bus', 'B'),
  w('Fisch', '🐟', 'Fisch', 'F'),
  w('Tomate', '🍅', 'To-ma-te', 'T'),
  w('Rakete', '🚀', 'Ra-ke-te', 'R'),
  w('Giraffe', '🦒', 'Gi-raf-fe', null),
  w('Elefant', '🐘', 'E-le-fant', 'E'),
  w('Krokodil', '🐊', 'Kro-ko-dil', 'K'),
  w('Zitrone', '🍋', 'Zi-tro-ne', 'Z'),
  w('Kirsche', '🍒', 'Kir-sche', 'K'),
  w('Birne', '🍐', 'Bir-ne', 'B'),
  w('Möhre', '🥕', 'Möh-re', 'M'),
  w('Kuchen', '🍰', 'Ku-chen', 'K'),
  w('Brot', '🍞', 'Brot', 'B'),
  w('Boot', '⛵', 'Boot', 'B'),
  w('Löwe', '🦁', 'Lö-we', 'L'),
  w('Tiger', '🐯', 'Ti-ger', 'T'),
  w('Pferd', '🐴', 'Pferd', null),
  w('Biene', '🐝', 'Bie-ne', 'B'),
  w('Raupe', '🐛', 'Rau-pe', 'R'),
  w('Schnecke', '🐌', 'Schne-cke', null),
  w('Pilz', '🍄', 'Pilz', 'P'),
  w('Wolke', '☁️', 'Wol-ke', 'W'),
  w('Blume', '🌸', 'Blu-me', 'B'),
  w('Buch', '📖', 'Buch', 'B'),
  w('Stern', '⭐', 'Stern', null),
  w('Herz', '❤️', 'Herz', 'H'),
  w('Kerze', '🕯️', 'Ker-ze', 'K'),
  w('Gitarre', '🎸', 'Gi-tar-re', 'G'),
  w('Schmetterling', '🦋', 'Schmet-ter-ling', null),
  w('Erdbeere', '🍓', 'Erd-bee-re', 'E'),
  w('Ananas', '🍍', 'A-na-nas', 'A'),
  w('Pinguin', '🐧', 'Pin-gu-in', 'P'),
  w('Kamel', '🐪', 'Ka-mel', 'K'),
  w('Hamster', '🐹', 'Hams-ter', 'H'),
  w('Panda', '🐼', 'Pan-da', 'P'),
  w('Teddy', '🧸', 'Ted-dy', 'T'),
  w('Roller', '🛴', 'Rol-ler', 'R'),
  w('Dino', '🦕', 'Di-no', 'D'),
  w('Drache', '🐉', 'Dra-che', 'D'),
  w('Kartoffel', '🥔', 'Kar-tof-fel', 'K'),
  w('Salat', '🥗', 'Sa-lat', 'S'),
  w('Ufo', '🛸', 'U-fo', 'U'),
  w('Oma', '👵', 'O-ma', 'O'),
  w('Opa', '👴', 'O-pa', 'O'),
  w('Ameise', '🐜', 'A-mei-se', 'A'),
  w('Affe', '🐒', 'Af-fe', 'A'),
  w('Robbe', '🦭', 'Rob-be', 'R'),
  w('Muschel', '🐚', 'Mu-schel', 'M'),
  w('Ring', '💍', 'Ring', 'R'),
  w('Zebra', '🦓', 'Ze-bra', 'Z'),
  w('Tasse', '☕', 'Tas-se', 'T'),
  w('Zug', '🚂', 'Zug', 'Z'),
  w('Bett', '🛏️', 'Bett', 'B'),
  w('Fuß', '🦶', 'Fuß', 'F'),
  w('Pizza', '🍕', 'Piz-za', 'P'),
  w('Nudeln', '🍝', 'Nu-deln', 'N'),
  w('Lama', '🦙', 'La-ma', 'L'),
];

export function getWord(id: string): Word {
  const word = WORDS.find((x) => x.id === id);
  if (!word) throw new Error(`Unknown word ${id}`);
  return word;
}

/** Letters that sound alike — used as hard distractors in "Anlaut" level 3. */
export const SIMILAR_LETTERS: Record<string, readonly string[]> = {
  M: ['N'],
  N: ['M'],
  B: ['P', 'D'],
  P: ['B'],
  D: ['T', 'B'],
  T: ['D'],
  G: ['K'],
  K: ['G'],
  F: ['W'],
  W: ['F'],
  E: ['I'],
  I: ['E'],
  O: ['U'],
  U: ['O'],
};
