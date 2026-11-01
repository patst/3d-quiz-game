/**
 * Shared data shape for the "Wissen" challenges (roadmap M11b): an optional big picture
 * and answer cards with an emoji, a coloured shape or a word. Choice value = option index.
 */
export interface QuizOption {
  label: string;
  emoji?: string;
  /** Coloured shape instead of an emoji (colours & shapes). */
  color?: string;
  shape?: 'circle' | 'triangle' | 'square' | 'star' | 'heart';
}

export interface QuizData {
  picture?: string;
  options: QuizOption[];
  /** Words on the cards are always visible (word answers) or only as a hint. */
  labels: 'always' | 'hint' | 'never';
  /** Each card has a speaker button that says its name. */
  speakOptions: boolean;
}

export function quizChoices(options: readonly unknown[]) {
  return options.map((_, i) => ({ id: `c${i}`, value: i }));
}
