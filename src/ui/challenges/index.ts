import { AdditionView } from './AdditionView';
import { CompareView } from './CompareView';
import { CountView } from './CountView';
import { FindNumberView } from './FindNumberView';
import { PatternView } from './PatternView';
import { SubtractionView } from './SubtractionView';
import type { ChallengeView, ChallengeViewEntry } from './types';

/** View registry, keyed by challenge type id (architecture §3.1). */
export const challengeViews: Record<string, ChallengeViewEntry> = {
  'math.count': { View: CountView as ChallengeView },
  'math.find-number': { View: FindNumberView as ChallengeView },
  'math.compare': { View: CompareView as ChallengeView, ownsChoices: true },
  'math.addition': { View: AdditionView as ChallengeView },
  'math.subtraction': { View: SubtractionView as ChallengeView },
  'math.pattern': { View: PatternView as ChallengeView, ownsChoices: true },
};
