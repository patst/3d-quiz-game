import { AdditionView } from './AdditionView';
import { CountView } from './CountView';
import type { ChallengeView } from './types';

/** View registry, keyed by challenge type id (architecture §3.1). */
export const challengeViews: Record<string, ChallengeView> = {
  'math.count': CountView as ChallengeView,
  'math.addition': AdditionView as ChallengeView,
};
