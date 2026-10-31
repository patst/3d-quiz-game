import type { ChallengeInstance } from './types';

/**
 * Feedback after a tap (game-design §6.4):
 * - correct: solved
 * - tryAgain: 1st wrong → gentle "Versuch es nochmal", wrong choice is removed
 * - hint: 2nd wrong → show a visual hint
 * - reveal: 3rd wrong → solution is shown and explained, child still gets 1 star
 */
export type AttemptFeedback = 'correct' | 'tryAgain' | 'hint' | 'reveal';

export interface AttemptState {
  wrongChoiceIds: readonly string[];
  finished: boolean;
  /** Stars earned; set when finished. */
  stars: number;
}

export const initialAttempt: AttemptState = { wrongChoiceIds: [], finished: false, stars: 0 };

/**
 * @param fullStars stars for solving with at most one wrong try (chest tier, game-design §7)
 */
export function submitAnswer(
  instance: ChallengeInstance,
  state: AttemptState,
  choiceId: string,
  fullStars: number,
): { state: AttemptState; feedback: AttemptFeedback } {
  if (state.finished) throw new Error('Challenge already finished');
  if (choiceId === instance.correctChoiceId) {
    const stars = state.wrongChoiceIds.length <= 1 ? fullStars : 1;
    return { state: { ...state, finished: true, stars }, feedback: 'correct' };
  }
  if (state.wrongChoiceIds.includes(choiceId)) {
    // Tapping an already eliminated choice again does not count.
    return { state, feedback: state.wrongChoiceIds.length >= 2 ? 'hint' : 'tryAgain' };
  }
  const wrongChoiceIds = [...state.wrongChoiceIds, choiceId];
  if (wrongChoiceIds.length >= 3) {
    return { state: { wrongChoiceIds, finished: true, stars: 1 }, feedback: 'reveal' };
  }
  return { state: { ...state, wrongChoiceIds }, feedback: wrongChoiceIds.length === 1 ? 'tryAgain' : 'hint' };
}
