import type { SpeechLine } from '../../core/challenges/types';
import type { CountObject } from '../../modules/challenges/objects';

/** German names of countable objects: [singular, plural]. */
export const objectNames: Record<CountObject, readonly [string, string]> = {
  apple: ['Apfel', 'Äpfel'],
  star: ['Stern', 'Sterne'],
  fish: ['Fisch', 'Fische'],
  flower: ['Blume', 'Blumen'],
  ball: ['Ball', 'Bälle'],
};

type Params = Record<string, string | number>;

const plural = (p: Params) => objectNames[p.object as CountObject]?.[1] ?? '';

/**
 * Speech templates referenced by `SpeechLine.key`. Each must be expressible as a fixed
 * sentence + slots so audio clips can be pre-generated (ADR-0003).
 */
export const speechTemplates: Record<string, (p: Params) => string> = {
  'math.count.prompt': (p) => `Wie viele ${plural(p)} siehst du?`,
  'math.count.explain': (p) => `Schau mal, es sind ${p.count} ${plural(p)}.`,
  'math.addition.prompt': (p) => `Was ist ${p.a} plus ${p.b}?`,
  'math.addition.explain': (p) => `${p.a} plus ${p.b} ist ${p.sum}.`,
  'feedback.correct': () => 'Super gemacht!',
  'feedback.tryAgain': () => 'Fast! Versuch es nochmal.',
  'feedback.hint': () => 'Ich helfe dir. Schau genau hin!',
};

export function speechText(line: SpeechLine): string {
  const template = speechTemplates[line.key];
  if (!template) throw new Error(`Missing speech template: ${line.key}`);
  return template(line.params ?? {});
}
