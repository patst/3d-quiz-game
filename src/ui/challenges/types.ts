import type { ComponentType } from 'react';

/** Props every challenge view gets. Views only draw the task; answers are generic buttons. */
export interface ChallengeViewProps<TData> {
  data: TData;
  /** Second wrong try: show a helping visual (e.g. numbered objects). */
  hint: boolean;
  /** Solution revealed (after correct answer or third wrong try). */
  solved: boolean;
}

export type ChallengeView<TData = unknown> = ComponentType<ChallengeViewProps<TData>>;
