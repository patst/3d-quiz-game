import { AdditionView } from './AdditionView';
import { CompareView } from './CompareView';
import { CountView } from './CountView';
import { FindNumberView } from './FindNumberView';
import { InitialSoundView } from './InitialSoundView';
import { ReadWordView } from './ReadWordView';
import { RhymeView } from './RhymeView';
import { SyllablesView } from './SyllablesView';
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
  'german.initial-sound': { View: InitialSoundView as ChallengeView },
  'german.syllables': { View: SyllablesView as ChallengeView },
  'german.rhyme': { View: RhymeView as ChallengeView, ownsChoices: true },
  'german.read-word': { View: ReadWordView as ChallengeView, ownsChoices: true },
};
