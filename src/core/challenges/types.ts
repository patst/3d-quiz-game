import type { StageRange } from '../learner/stage';
import type { Rng } from '../rng';

export type SubjectId = 'math' | 'german' | 'knowledge';

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
  /** Number shown on the button, or an index into type-specific data (symbols, words). */
  value: number;
  /** Shown instead of `value` on the default buttons (e.g. a letter "M"). */
  label?: string;
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
  /**
   * Text shown instead of the spoken prompt, when showing it would give the answer away
   * (e.g. "Tippe auf die 7" is spoken, "Welche Zahl hörst du?" is shown).
   */
  promptDisplay?: SpeechLine;
  /** Spoken when the solution is revealed after the last wrong try. */
  explanation: SpeechLine;
}

/**
 * Curriculum metadata for one difficulty level (ADR-0009).
 * `stages` says for whom the level is meant; `competencies` are ids from a curriculum
 * catalogue (src/content/curriculum/), e.g. 'ni.ma2.addition'.
 */
export interface LevelInfo {
  stages: StageRange;
  competencies: readonly string[];
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
  /** One entry per level (index 0 = level 1); checked by a unit test. */
  levelInfo: readonly LevelInfo[];
  generate(ctx: { rng: Rng; level: number }): ChallengeInstance<TData>;
}

/** Shorthand for `LevelInfo` literals in challenge modules: `lv('kita', 'grade1', 'ni.op.mengen')`. */
export function lv(min: StageRange['min'], max: StageRange['max'], ...competencies: string[]): LevelInfo {
  return { stages: max === undefined ? { min } : { min, max }, competencies };
}
