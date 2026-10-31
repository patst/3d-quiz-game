import type { SpeechLine } from '../../core/challenges/types';
import { COUNT_OBJECTS, type CountObject } from '../../modules/challenges/objects';
import { de } from './strings';

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
  'feedback.correct': { render: () => 'Super gemacht!', variants: none },
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
  ...Object.values(de.lostAnimals).flatMap((a) => [a.speakStart, a.speakGoal, a.name]),
  ...Object.values(de.animals),
  de.rewards.speakPick,
  de.rewards.thanks,
  de.rewards.allCollected,
  ...Object.values(de.rewards.items),
  ...range(1, 10).map((n) => de.rewards.jarHint(n)),
];

/** Every sentence the game can speak; input for the audio clip generator. */
export function allSpokenTexts(): string[] {
  const texts = new Set<string>(staticSpokenTexts);
  for (const template of Object.values(speechTemplates)) {
    for (const params of template.variants()) texts.add(template.render(params));
  }
  return [...texts].sort();
}
