/**
 * Content for the "Wissen" challenges (roadmap M11b). German grammar is written out per
 * entry so sentences are natural (and can be pre-generated as audio).
 */
import { WORDS } from './words';

/** A picture option with a spoken name. */
export interface NamedPicture {
  id: string;
  name: string;
  emoji: string;
}

const fromWords = (ids: string[]): NamedPicture[] =>
  ids.map((id) => {
    const w = WORDS.find((x) => x.id === id);
    if (!w) throw new Error(`knowledge: unknown word ${id}`);
    return { id, name: w.word, emoji: w.emoji };
  });

/** Animals for "Wie heißt das Tier?" (pictures and names from the word bank). */
export const ANIMALS: readonly NamedPicture[] = fromWords([
  'maus', 'hund', 'katze', 'kuh', 'schwein', 'ziege', 'hase', 'hahn', 'igel', 'ente', 'elefant', 'giraffe',
  'krokodil', 'löwe', 'tiger', 'biene', 'raupe', 'schnecke', 'pinguin', 'kamel', 'hamster', 'panda', 'affe',
  'robbe', 'zebra', 'lama', 'wal', 'fisch', 'pferd', 'schmetterling', 'fliege', 'ameise',
]);

export interface AnimalBaby {
  id: string;
  parentEmoji: string;
  /** "von der Kuh" / "vom Schaf" */
  of: string;
  baby: string;
}

export const BABIES: readonly AnimalBaby[] = [
  { id: 'cow', parentEmoji: '🐮', of: 'von der Kuh', baby: 'Kalb' },
  { id: 'pig', parentEmoji: '🐷', of: 'vom Schwein', baby: 'Ferkel' },
  { id: 'sheep', parentEmoji: '🐑', of: 'vom Schaf', baby: 'Lamm' },
  { id: 'horse', parentEmoji: '🐴', of: 'vom Pferd', baby: 'Fohlen' },
  { id: 'dog', parentEmoji: '🐶', of: 'vom Hund', baby: 'Welpe' },
  { id: 'cat', parentEmoji: '🐱', of: 'von der Katze', baby: 'Kätzchen' },
  { id: 'hen', parentEmoji: '🐔', of: 'vom Huhn', baby: 'Küken' },
  { id: 'goat', parentEmoji: '🐐', of: 'von der Ziege', baby: 'Zicklein' },
];

export interface ColorDef {
  id: string;
  /** "Rot" */
  name: string;
  hex: string;
  /** Declined forms for "den roten Kreis" / "das rote Dreieck" / "der rote Kreis"; only for basic colours. */
  adj?: { acc_m: string; n: string; nom_m: string };
}

export const COLORS: readonly ColorDef[] = [
  { id: 'red', name: 'Rot', hex: '#e63946', adj: { acc_m: 'roten', n: 'rote', nom_m: 'rote' } },
  { id: 'blue', name: 'Blau', hex: '#1d6fe0', adj: { acc_m: 'blauen', n: 'blaue', nom_m: 'blaue' } },
  { id: 'yellow', name: 'Gelb', hex: '#ffd60a', adj: { acc_m: 'gelben', n: 'gelbe', nom_m: 'gelbe' } },
  { id: 'green', name: 'Grün', hex: '#2bb24c', adj: { acc_m: 'grünen', n: 'grüne', nom_m: 'grüne' } },
  { id: 'orange', name: 'Orange', hex: '#ff8c1a' },
  { id: 'purple', name: 'Lila', hex: '#8e44ad' },
  { id: 'pink', name: 'Rosa', hex: '#ff8fc7' },
  { id: 'brown', name: 'Braun', hex: '#8b5a2b' },
];

export interface ShapeDef {
  id: 'circle' | 'triangle' | 'square' | 'star' | 'heart';
  /** grammatical gender of the noun */
  gender: 'm' | 'n';
  noun: string;
}

export const SHAPES: readonly ShapeDef[] = [
  { id: 'circle', gender: 'm', noun: 'Kreis' },
  { id: 'triangle', gender: 'n', noun: 'Dreieck' },
  { id: 'square', gender: 'n', noun: 'Viereck' },
  { id: 'star', gender: 'm', noun: 'Stern' },
  { id: 'heart', gender: 'n', noun: 'Herz' },
];

/** "den blauen Kreis" / "das blaue Dreieck" */
export function shapeAccusative(color: ColorDef, shape: ShapeDef): string {
  return shape.gender === 'm' ? `den ${color.adj!.acc_m} ${shape.noun}` : `das ${color.adj!.n} ${shape.noun}`;
}

/** "der blaue Kreis" / "das blaue Dreieck" */
export function shapeNominative(color: ColorDef, shape: ShapeDef): string {
  return shape.gender === 'm' ? `der ${color.adj!.nom_m} ${shape.noun}` : `das ${color.adj!.n} ${shape.noun}`;
}

export const SEASONS: readonly NamedPicture[] = [
  { id: 'spring', name: 'Frühling', emoji: '🌷' },
  { id: 'summer', name: 'Sommer', emoji: '☀️' },
  { id: 'autumn', name: 'Herbst', emoji: '🍂' },
  { id: 'winter', name: 'Winter', emoji: '⛄' },
];

export interface SeasonQuestion {
  id: string;
  question: string;
  answer: 'spring' | 'summer' | 'autumn' | 'winter';
  explain: string;
  /** 1 = very obvious, 2 = needs some knowledge */
  level: 1 | 2;
}

export const SEASON_QUESTIONS: readonly SeasonQuestion[] = [
  { id: 'snow', question: 'Wann fällt Schnee?', answer: 'winter', explain: 'Schnee fällt im Winter.', level: 1 },
  { id: 'snowman', question: 'Wann baust du einen Schneemann?', answer: 'winter', explain: 'Einen Schneemann baust du im Winter.', level: 1 },
  { id: 'swim', question: 'Wann badest du im See?', answer: 'summer', explain: 'Im See badest du im Sommer.', level: 1 },
  { id: 'hot', question: 'Wann ist es draußen am heißesten?', answer: 'summer', explain: 'Am heißesten ist es im Sommer.', level: 1 },
  { id: 'leaves', question: 'Wann werden die Blätter bunt und fallen von den Bäumen?', answer: 'autumn', explain: 'Die Blätter fallen im Herbst.', level: 1 },
  { id: 'flowers', question: 'Wann fangen die ersten Blumen an zu blühen?', answer: 'spring', explain: 'Die ersten Blumen blühen im Frühling.', level: 1 },
  { id: 'christmas', question: 'Wann ist Weihnachten?', answer: 'winter', explain: 'Weihnachten ist im Winter.', level: 2 },
  { id: 'easter', question: 'Wann suchst du Ostereier?', answer: 'spring', explain: 'Ostereier suchst du im Frühling.', level: 2 },
  { id: 'kite', question: 'Wann lässt man gern Drachen steigen?', answer: 'autumn', explain: 'Drachen steigen lassen macht man gern im Herbst.', level: 2 },
  { id: 'apples', question: 'Wann werden die Äpfel geerntet?', answer: 'autumn', explain: 'Äpfel werden im Herbst geerntet.', level: 2 },
  { id: 'nests', question: 'Wann bauen die Vögel ihre Nester?', answer: 'spring', explain: 'Vögel bauen ihre Nester im Frühling.', level: 2 },
  { id: 'icecream', question: 'Wann isst du am liebsten Eis am Strand?', answer: 'summer', explain: 'Eis am Strand gibt es im Sommer.', level: 2 },
  { id: 'pumpkin', question: 'Wann gibt es viele Kürbisse?', answer: 'autumn', explain: 'Kürbisse gibt es im Herbst.', level: 2 },
  { id: 'sledge', question: 'Wann fährst du Schlitten?', answer: 'winter', explain: 'Schlitten fährst du im Winter.', level: 2 },
];

export interface WeatherQuestion {
  id: string;
  question: string;
  answer: string;
  explain: string;
}

/** Level 3 of seasons & weather: what do you need? */
export const WEATHER_ITEMS: readonly NamedPicture[] = [
  { id: 'umbrella', name: 'Regenschirm', emoji: '☂️' },
  { id: 'sunglasses', name: 'Sonnenbrille', emoji: '🕶️' },
  { id: 'gloves', name: 'Handschuhe', emoji: '🧤' },
  { id: 'shorts', name: 'Kurze Hose', emoji: '🩳' },
];

export const WEATHER_QUESTIONS: readonly WeatherQuestion[] = [
  { id: 'rain', question: 'Was brauchst du, wenn es regnet?', answer: 'umbrella', explain: 'Wenn es regnet, brauchst du einen Regenschirm.' },
  { id: 'sun', question: 'Was schützt deine Augen, wenn die Sonne hell scheint?', answer: 'sunglasses', explain: 'Eine Sonnenbrille schützt deine Augen.' },
  { id: 'cold', question: 'Was ziehst du an, wenn deine Hände im Schnee frieren?', answer: 'gloves', explain: 'Handschuhe halten deine Hände warm.' },
  { id: 'heat', question: 'Was ziehst du an, wenn es im Sommer sehr heiß ist?', answer: 'shorts', explain: 'Wenn es heiß ist, ziehst du eine kurze Hose an.' },
];

export interface OddCategory {
  id: string;
  /** "Obst" — used in "Die anderen sind Obst." */
  plural: string;
  items: ReadonlyArray<NamedPicture & { withArticle: string }>;
  /** Categories that are close (harder distractors, level 2+) */
  near?: readonly string[];
}

const item = (id: string, name: string, emoji: string, withArticle: string) => ({ id, name, emoji, withArticle });

export const ODD_CATEGORIES: readonly OddCategory[] = [
  {
    id: 'fruit',
    plural: 'Obst',
    near: ['vegetables'],
    items: [
      item('apple', 'Apfel', '🍎', 'der Apfel'),
      item('banana', 'Banane', '🍌', 'die Banane'),
      item('pear', 'Birne', '🍐', 'die Birne'),
      item('grapes', 'Trauben', '🍇', 'die Trauben'),
      item('strawberry', 'Erdbeere', '🍓', 'die Erdbeere'),
      item('cherries', 'Kirschen', '🍒', 'die Kirschen'),
      item('pineapple', 'Ananas', '🍍', 'die Ananas'),
    ],
  },
  {
    id: 'vegetables',
    plural: 'Gemüse',
    near: ['fruit'],
    items: [
      item('carrot', 'Möhre', '🥕', 'die Möhre'),
      item('broccoli', 'Brokkoli', '🥦', 'der Brokkoli'),
      item('corn', 'Mais', '🌽', 'der Mais'),
      item('potato', 'Kartoffel', '🥔', 'die Kartoffel'),
      item('pepper', 'Paprika', '🫑', 'die Paprika'),
    ],
  },
  {
    id: 'vehicles',
    plural: 'Fahrzeuge',
    items: [
      item('car', 'Auto', '🚗', 'das Auto'),
      item('bus', 'Bus', '🚌', 'der Bus'),
      item('train', 'Zug', '🚂', 'der Zug'),
      item('bike', 'Fahrrad', '🚲', 'das Fahrrad'),
      item('boat', 'Boot', '⛵', 'das Boot'),
      item('plane', 'Flugzeug', '✈️', 'das Flugzeug'),
      item('helicopter', 'Hubschrauber', '🚁', 'der Hubschrauber'),
    ],
  },
  {
    id: 'animals',
    plural: 'Tiere',
    items: [
      item('a-dog', 'Hund', '🐶', 'der Hund'),
      item('a-cat', 'Katze', '🐱', 'die Katze'),
      item('a-mouse', 'Maus', '🐭', 'die Maus'),
      item('a-rabbit', 'Hase', '🐰', 'der Hase'),
      item('a-bear', 'Bär', '🐻', 'der Bär'),
      item('a-frog', 'Frosch', '🐸', 'der Frosch'),
      item('a-cow', 'Kuh', '🐮', 'die Kuh'),
    ],
  },
  {
    id: 'clothes',
    plural: 'Kleidungsstücke',
    items: [
      item('shirt', 'T-Shirt', '👕', 'das T-Shirt'),
      item('trousers', 'Hose', '👖', 'die Hose'),
      item('socks', 'Socken', '🧦', 'die Socken'),
      item('dress', 'Kleid', '👗', 'das Kleid'),
      item('cap', 'Mütze', '🧢', 'die Mütze'),
      item('scarf', 'Schal', '🧣', 'der Schal'),
      item('shoe', 'Schuh', '👟', 'der Schuh'),
    ],
  },
  {
    id: 'instruments',
    plural: 'Musikinstrumente',
    items: [
      item('guitar', 'Gitarre', '🎸', 'die Gitarre'),
      item('drum', 'Trommel', '🥁', 'die Trommel'),
      item('trumpet', 'Trompete', '🎺', 'die Trompete'),
      item('violin', 'Geige', '🎻', 'die Geige'),
      item('piano', 'Klavier', '🎹', 'das Klavier'),
    ],
  },
];

/** "Der Apfel" — sentence start. */
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
