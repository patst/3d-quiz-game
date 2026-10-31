import type { Rng } from '../rng';

export type SubjectId = 'math' | 'german';

/**
 * Something the guide says. `key` refers to a template in content/de (never free text in
 * core), `params` fill its slots. Keeps prompts compatible with pre-generated audio clips
 * (ADR-0003).
 */
export interface SpeechLine {
  key: string;
  params?: Record<string, string | number>;
}

/** One tappable answer button. */
export interface Choice {
  id: string;
  /** The number shown on the button (all M2 challenges are number choices). */
  value: number;
}

/** A generated, ready-to-show challenge. Pure data, serialisable. */
export interface ChallengeInstance<TData = unknown> {
  typeId: string;
  level: number;
  /** Type-specific data the view needs to draw the task. */
  data: TData;
  choices: readonly Choice[];
  correctChoiceId: string;
  prompt: SpeechLine;
  /** Spoken when the solution is revealed after the last wrong try. */
  explanation: SpeechLine;
}

/**
 * Logic part of a challenge type (architecture §3.1). Lives in
 * `src/modules/challenges/<id>/`. The matching view is registered separately in ui/
 * so this stays free of React.
 */
export interface ChallengeType<TData = unknown> {
  id: string;
  subject: SubjectId;
  /** Skills trained, used by the skill model in M4. */
  skills: readonly string[];
  /** Number of difficulty levels (1..levels). */
  levels: number;
  generate(ctx: { rng: Rng; level: number }): ChallengeInstance<TData>;
}
