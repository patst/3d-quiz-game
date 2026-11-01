import type { ComponentType } from 'react';
import type { Choice } from '../../core/challenges/types';

/** Answer state for views that draw their own answer buttons (ownsChoices). */
export interface ViewAnswers {
  choices: readonly Choice[];
  wrongChoiceIds: readonly string[];
  correctChoiceId: string;
  onChoose: (choiceId: string) => void;
}

/** Props every challenge view gets. */
export interface ChallengeViewProps<TData> {
  data: TData;
  /** Second wrong try: show a helping visual (e.g. numbered objects). */
  hint: boolean;
  /** Solution revealed (after correct answer or third wrong try). */
  solved: boolean;
  /** Only passed to views registered with ownsChoices. */
  answers?: ViewAnswers;
}

export type ChallengeView<TData = unknown> = ComponentType<ChallengeViewProps<TData>>;

export interface ChallengeViewEntry {
  View: ChallengeView;
  /** true: the view renders its own answer buttons (e.g. two groups to compare). */
  ownsChoices?: boolean;
}
