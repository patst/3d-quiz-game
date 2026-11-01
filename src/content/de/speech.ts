import type { SpeechLine } from '../../core/challenges/types';
import { COUNT_OBJECTS, type CountObject } from '../../modules/challenges/objects';
import { de } from './strings';
import { WORDS } from './words';
import {
  ANIMALS,
  BABIES,
  capitalize,
  COLORS,
  ODD_CATEGORIES,
  SEASON_QUESTIONS,
  SEASONS,
  SHAPES,
  shapeAccusative,
  shapeNominative,
  WEATHER_ITEMS,
  WEATHER_QUESTIONS,
} from './knowledge';
import {
  BODY_PARTS,
  bodyAccusative,
  bodyNominative,
  HABITAT_ANIMALS,
  HABITATS,
  OPPOSITE_WORDS,
  POSITION_OBJECTS,
  POSITION_PHRASES,
  POSITIONS,
  SENSES,
  SEQUENCES,
  SIZE_ITEMS,
  sizeAccusative,
  sizeNominative,
  type Position,
} from './preschool';

/** German names of countable objects: [singular, plural]. */
export const objectNames: Record<CountObject, readonly [string, string]> = {
  apple: ['Apfel', 'Äpfel'],
  star: ['Stern', 'Sterne'],
  fish: ['Fisch', 'Fische'],
  flower: ['Blume', 'Blumen'],
  ball: ['Ball', 'Bälle'],
};

type Params = Record<string, string | number>;

interface Template {
  render: (p: Params) => string;
  /**
   * Every parameter combination the game can produce. Used to pre-generate one audio clip
   * per sentence (ADR-0007). A sentence missing here falls back to the browser voice.
   */
  variants: () => Params[];
}

const plural = (p: Params) => objectNames[p.object as CountObject]?.[1] ?? '';
const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const none = () => [{}];

/** All (a, b) with 1 ≤ b < a ≤ 20 — covers every subtraction level. */
const subtractionPairs = () => range(2, 20).flatMap((a) => range(1, a - 1).map((b) => ({ a, b, difference: a - b })));

/** All (a, b) with a, b ≥ 1 and a + b ≤ 20 — covers every addition level. */
const additionPairs = () => range(1, 19).flatMap((a) => range(1, 20 - a).map((b) => ({ a, b, sum: a + b })));

const color = (id: string | number | undefined) => COLORS.find((c) => c.id === id)!;
const shape = (id: string | number | undefined) => SHAPES.find((s) => s.id === id)!;
const colorName = (id: string | number | undefined) => color(id)?.name ?? '';
// Preschool pack helpers (M13b).
const soundWords = () => WORDS.filter((w) => w.initial && WORDS.some((o) => o.id !== w.id && o.initial === w.initial));
const syllableWords = () => WORDS.filter((w) => w.syllables.length >= 2);
/** Spoken syllables where written hyphenation sounds wrong ("Schne-cke" is spoken "Schnek-ke"). */
const SPOKEN_SYLLABLES: Record<string, string> = { Schnecke: 'Schnek, ke' };
const syllablesOf = (word: string | number | undefined) =>
  SPOKEN_SYLLABLES[String(word)] ?? WORDS.find((w) => w.word === word)?.syllables.join(', ') ?? '';
const sizeItem = (id: string | number | undefined) => SIZE_ITEMS.find((i) => i.id === id)!;
const bigSmall = (ask: string | number | undefined) => (ask === 'small' ? 'small' : 'big');
const sizeVariants = () => SIZE_ITEMS.flatMap((i) => ['big', 'small'].map((ask) => ({ item: i.id, ask })));
const bodyPart = (id: string | number | undefined) => BODY_PARTS.find((b) => b.id === id)!;
const habitatSentence = (id: string | number | undefined) => {
  const animal = HABITAT_ANIMALS.find((a) => a.id === id);
  const home = HABITATS.find((h) => h.id === animal?.habitat);
  return animal && home ? `${capitalize(animal.name)} lebt ${home.phrase}.` : '';
};
const positionSentence = (p: Params) => {
  const object = POSITION_OBJECTS.find((o) => o.id === p.object);
  return `${object?.name ?? ''} ist ${POSITION_PHRASES[p.position as Position] ?? ''}.`;
};
const positionVariants = () => POSITION_OBJECTS.flatMap((o) => POSITIONS.map((position) => ({ object: o.id, position })));

const colorShapePairs = () => COLORS.filter((c) => c.adj).flatMap((c) => SHAPES.map((s) => ({ color: c.id, shape: s.id })));

/** Speech templates referenced by `SpeechLine.key`. */
export const speechTemplates: Record<string, Template> = {
  'math.count.prompt': {
    render: (p) => `Wie viele ${plural(p)} siehst du?`,
    variants: () => COUNT_OBJECTS.map((object) => ({ object })),
  },
  'math.count.explain': {
    render: (p) => `Schau mal, es sind ${p.count} ${plural(p)}.`,
    variants: () => COUNT_OBJECTS.flatMap((object) => range(1, 20).map((count) => ({ object, count }))),
  },
  'math.addition.prompt': { render: (p) => `Was ist ${p.a} plus ${p.b}?`, variants: additionPairs },
  'math.addition.explain': { render: (p) => `${p.a} plus ${p.b} ist ${p.sum}.`, variants: additionPairs },
  'math.find-number.prompt': { render: (p) => `Tippe auf die Zahl ${p.n}.`, variants: () => range(1, 100).map((n) => ({ n })) },
  'math.find-number.display': { render: () => 'Welche Zahl hörst du? Tippe sie an!', variants: none },
  'math.find-number.explain': { render: (p) => `Schau, das ist die ${p.n}.`, variants: () => range(1, 100).map((n) => ({ n })) },
  'math.subtraction.prompt': { render: (p) => `Was ist ${p.a} minus ${p.b}?`, variants: subtractionPairs },
  'math.subtraction.explain': { render: (p) => `${p.a} minus ${p.b} ist ${p.difference}.`, variants: subtractionPairs },
  'math.compare.prompt': {
    render: (p) => `Wo sind mehr ${plural(p)}?`,
    variants: () => COUNT_OBJECTS.map((object) => ({ object })),
  },
  'math.compare.prompt-digits': { render: () => 'Welche Zahl ist größer?', variants: none },
  'math.compare.explain': {
    render: (p) => `${p.big} ist mehr als ${p.small}.`,
    variants: () => range(2, 20).flatMap((big) => range(1, big - 1).map((small) => ({ big, small }))),
  },
  'math.pattern.prompt': { render: () => 'Was kommt als Nächstes?', variants: none },
  'math.pattern.explain': { render: () => 'Schau, so geht das Muster weiter.', variants: none },
  'german.initial.prompt': {
    render: (p) => `Mit welchem Buchstaben beginnt ${p.word}?`,
    variants: () => WORDS.filter((w) => w.initial).map((w) => ({ word: w.word })),
  },
  'german.initial.explain': {
    render: (p) => `${p.word} beginnt mit ${p.letter}.`,
    variants: () => WORDS.filter((w) => w.initial).map((w) => ({ word: w.word, letter: w.initial! })),
  },
  'german.syllables.prompt': {
    render: (p) => `Wie viele Silben hat ${p.word}? Klatsch mit!`,
    variants: () => WORDS.map((w) => ({ word: w.word })),
  },
  'german.syllables.explain': {
    render: (p) => {
      const word = WORDS.find((w) => w.word === p.word);
      const parts = word?.syllables ?? [String(p.word)];
      return `${parts.join(', ')}. ${parts.length === 1 ? 'Das ist eine Silbe.' : `Das sind ${parts.length} Silben.`}`;
    },
    variants: () => WORDS.map((w) => ({ word: w.word })),
  },
  'german.rhyme.prompt': {
    render: (p) => `Was reimt sich auf ${p.word}?`,
    variants: () => WORDS.filter((w) => w.rhyme).map((w) => ({ word: w.word })),
  },
  'german.rhyme.explain': {
    render: (p) => `${p.word} und ${p.match} reimen sich.`,
    variants: () =>
      WORDS.filter((w) => w.rhyme).flatMap((a) =>
        WORDS.filter((b) => b.rhyme === a.rhyme && b.id !== a.id).map((b) => ({ word: a.word, match: b.word })),
      ),
  },
  'german.read.prompt': { render: () => 'Lies das Wort. Welches Bild passt?', variants: none },
  'german.read.explain': {
    render: (p) => `Das Wort heißt ${p.word}.`,
    variants: () => WORDS.map((w) => ({ word: w.word })),
  },
  'knowledge.animal.prompt': { render: () => 'Wie heißt dieses Tier?', variants: none },
  'knowledge.animal.explain': {
    render: (p) => `Das Tier heißt ${p.name}.`,
    variants: () => ANIMALS.map((a) => ({ name: a.name })),
  },
  'knowledge.baby.prompt': {
    render: (p) => `Wie heißt das Baby ${p.of}?`,
    variants: () => BABIES.map((b) => ({ of: b.of })),
  },
  'knowledge.baby.explain': {
    render: (p) => `Das Baby ${p.of} heißt ${p.baby}.`,
    variants: () => BABIES.map((b) => ({ of: b.of, baby: b.baby })),
  },
  'knowledge.color.prompt': {
    render: (p) => `Tippe auf ${colorName(p.color)}!`,
    variants: () => COLORS.map((c) => ({ color: c.id })),
  },
  'knowledge.color.explain': {
    render: (p) => `Schau, das ist ${colorName(p.color)}.`,
    variants: () => COLORS.map((c) => ({ color: c.id })),
  },
  'knowledge.shape.prompt': {
    render: (p) => `Tippe auf ${shapeAccusative(color(p.color), shape(p.shape))}!`,
    variants: colorShapePairs,
  },
  'knowledge.shape.explain': {
    render: (p) => `Schau, das ist ${shapeNominative(color(p.color), shape(p.shape))}.`,
    variants: colorShapePairs,
  },
  'knowledge.season.prompt': {
    render: (p) => SEASON_QUESTIONS.find((q) => q.id === p.q)?.question ?? '',
    variants: () => SEASON_QUESTIONS.map((q) => ({ q: q.id })),
  },
  'knowledge.season.explain': {
    render: (p) => SEASON_QUESTIONS.find((q) => q.id === p.q)?.explain ?? '',
    variants: () => SEASON_QUESTIONS.map((q) => ({ q: q.id })),
  },
  'knowledge.weather.prompt': {
    render: (p) => WEATHER_QUESTIONS.find((q) => q.id === p.q)?.question ?? '',
    variants: () => WEATHER_QUESTIONS.map((q) => ({ q: q.id })),
  },
  'knowledge.weather.explain': {
    render: (p) => WEATHER_QUESTIONS.find((q) => q.id === p.q)?.explain ?? '',
    variants: () => WEATHER_QUESTIONS.map((q) => ({ q: q.id })),
  },
  'knowledge.odd.prompt': { render: () => 'Was gehört nicht dazu?', variants: none },
  'knowledge.odd.explain': {
    render: (p) => {
      const item = ODD_CATEGORIES.flatMap((c) => c.items).find((i) => i.id === p.odd);
      const cat = ODD_CATEGORIES.find((c) => c.id === p.category);
      return `${capitalize(item?.withArticle ?? '')} gehört nicht dazu. Die anderen sind ${cat?.plural ?? ''}.`;
    },
    variants: () =>
      ODD_CATEGORIES.flatMap((cat) =>
        ODD_CATEGORIES.filter((o) => o.id !== cat.id).flatMap((o) => o.items.map((i) => ({ odd: i.id, category: cat.id }))),
      ),
  },
  // ── Preschool pack (M13b) ──
  'german.same-start.prompt': {
    render: (p) => `Was fängt genauso an wie ${p.word}?`,
    variants: () => soundWords().map((w) => ({ word: w.word })),
  },
  'german.same-start.explain': {
    render: (p) => `${p.word} und ${p.match} fangen gleich an.`,
    variants: () =>
      soundWords().flatMap((a) =>
        WORDS.filter((b) => b.initial === a.initial && b.id !== a.id).map((b) => ({ word: a.word, match: b.word })),
      ),
  },
  'german.syllable-blend.prompt': {
    render: (p) => `Hör gut zu: ${syllablesOf(p.word)}. Welches Bild ist das?`,
    variants: () => syllableWords().map((w) => ({ word: w.word })),
  },
  'german.syllable-blend.explain': {
    render: (p) => `${syllablesOf(p.word)}: ${p.word}.`,
    variants: () => syllableWords().map((w) => ({ word: w.word })),
  },
  'german.opposites.prompt': {
    render: (p) => `Was ist das Gegenteil von ${p.word}?`,
    variants: () => OPPOSITE_WORDS.map((w) => ({ word: w.word })),
  },
  'german.opposites.explain': {
    render: (p) => `Das Gegenteil von ${p.word} ist ${p.opposite}.`,
    variants: () => OPPOSITE_WORDS.map((w) => ({ word: w.word, opposite: w.partner.word })),
  },
  'math.sizes.prompt': {
    render: (p) => `Tippe auf ${sizeAccusative(sizeItem(p.item), bigSmall(p.ask))}!`,
    variants: sizeVariants,
  },
  'math.sizes.explain': {
    render: (p) => `Schau, das ist ${sizeNominative(sizeItem(p.item), bigSmall(p.ask))}.`,
    variants: sizeVariants,
  },
  'knowledge.habitat.prompt': { render: () => 'Wo lebt das Tier?', variants: none },
  'knowledge.habitat.explain': {
    render: (p) => habitatSentence(p.animal),
    variants: () => HABITAT_ANIMALS.map((a) => ({ animal: a.id })),
  },
  'knowledge.body.prompt': {
    render: (p) => `Tippe auf ${bodyAccusative(bodyPart(p.part))}!`,
    variants: () => BODY_PARTS.map((b) => ({ part: b.id })),
  },
  'knowledge.body.explain': {
    render: (p) => `Schau, das ist ${bodyNominative(bodyPart(p.part))}.`,
    variants: () => BODY_PARTS.map((b) => ({ part: b.id })),
  },
  'knowledge.sense.prompt': {
    render: (p) => SENSES.find((s) => s.id === p.sense)?.question ?? '',
    variants: () => SENSES.map((s) => ({ sense: s.id })),
  },
  'knowledge.sense.explain': {
    render: (p) => SENSES.find((s) => s.id === p.sense)?.answer ?? '',
    variants: () => SENSES.map((s) => ({ sense: s.id })),
  },
  'knowledge.sequence.prompt': {
    render: (p) => (p.ask === 'last' ? 'Was kommt zuletzt?' : p.ask === 'middle' ? 'Was kommt in der Mitte?' : 'Was kommt zuerst?'),
    variants: () => ['first', 'last', 'middle'].map((ask) => ({ ask })),
  },
  'knowledge.sequence.explain': {
    render: (p) => {
      const steps = SEQUENCES.find((q) => q.id === p.sequence)?.steps;
      return steps ? `Zuerst ${steps[0].name}, dann ${steps[1].name}, dann ${steps[2].name}.` : '';
    },
    variants: () => SEQUENCES.map((q) => ({ sequence: q.id })),
  },
  'math.dice.prompt': { render: () => 'Wie viele Punkte siehst du?', variants: none },
  'math.dice.explain': {
    render: (p) => (p.n === 1 ? 'Das ist ein Punkt.' : `Das sind ${p.n} Punkte.`),
    variants: () => range(1, 20).map((n) => ({ n })),
  },
  'math.neighbors.prompt-after': { render: (p) => `Welche Zahl kommt nach ${p.n}?`, variants: () => range(1, 99).map((n) => ({ n })) },
  'math.neighbors.prompt-before': { render: (p) => `Welche Zahl kommt vor ${p.n}?`, variants: () => range(2, 100).map((n) => ({ n })) },
  'math.neighbors.explain-after': {
    render: (p) => `Nach ${p.n} kommt ${p.m}.`,
    variants: () => range(1, 99).map((n) => ({ n, m: n + 1 })),
  },
  'math.neighbors.explain-before': {
    render: (p) => `Vor ${p.n} kommt ${p.m}.`,
    variants: () => range(2, 100).map((n) => ({ n, m: n - 1 })),
  },
  'math.position.prompt': { render: (p) => `Tippe auf das Bild: ${positionSentence(p)}`, variants: positionVariants },
  'math.position.explain': { render: (p) => `Schau: ${positionSentence(p)}`, variants: positionVariants },
  'feedback.tryAgain': { render: () => 'Fast! Versuch es nochmal.', variants: none },
  'feedback.hint': { render: () => 'Ich helfe dir. Schau genau hin!', variants: none },
  'feedback.skipQuestion': { render: () => 'Möchtest du diese Aufgabe wirklich überspringen?', variants: none },
};

export function speechText(line: SpeechLine): string {
  const template = speechTemplates[line.key];
  if (!template) throw new Error(`Missing speech template: ${line.key}`);
  return template.render(line.params ?? {});
}

/** Fixed sentences spoken outside challenges (screens, guide). */
export const staticSpokenTexts: readonly string[] = [
  de.createProfile.speakIntro,
  de.stage.question,
  ...Object.values(de.stage.spoken),
  ...Object.values(de.lostAnimals).flatMap((a) => [a.speakStart, a.speakGoal, a.name]),
  ...Object.values(de.animals),
  de.breakTime.speak,
  de.wayHint.speak,
  de.wayHint.wait,
  de.worldSelect.speak,
  de.subjects.speakToday,
  de.subjects.keepOne,
  ...Object.values(de.subjects.names),
  de.worldSelect.speakLocked,
  de.worldSelect.speakUnlocked,
  ...Object.values(de.guideIntro),
  de.rewards.speakPick,
  de.treehouse.speakWelcome,
  de.treehouse.speakEmpty,
  de.rewards.thanks,
  de.rewards.allCollected,
  ...Object.values(de.rewards.items),
  ...range(1, 10).map((n) => de.rewards.jarHint(n)),
  // Single words, for the speaker buttons on pictures (rhyme, read-word, knowledge cards).
  ...WORDS.map((w) => w.word),
  ...ANIMALS.map((a) => a.name),
  ...BABIES.map((b) => b.baby),
  ...SEASONS.map((s) => s.name),
  ...WEATHER_ITEMS.map((i) => i.name),
  ...ODD_CATEGORIES.flatMap((c) => c.items.map((i) => i.name)),
  // Preschool pack: speaker buttons on answer cards.
  ...OPPOSITE_WORDS.map((w) => w.word),
  ...HABITATS.map((h) => h.name),
  ...SEQUENCES.flatMap((q) => q.steps.map((s) => s.name)),
  ...BODY_PARTS.map((b) => b.word),
];

/** Every sentence the game can speak; input for the audio clip generator. */
export function allSpokenTexts(): string[] {
  const texts = new Set<string>(staticSpokenTexts);
  for (const template of Object.values(speechTemplates)) {
    for (const params of template.variants()) texts.add(template.render(params));
  }
  return [...texts].sort();
}
