import type { ChallengeType } from '../../core/challenges/types';
import { mathAddition } from './math-addition';
import { mathCount } from './math-count';

/**
 * Registry of all challenge types (architecture §3.1).
 * Add a new type: create `src/modules/challenges/<id>/`, register it here, register its
 * view in `src/ui/challenges/`, add speech templates in `src/content/de/speech.ts`.
 */
export const challengeTypes: readonly ChallengeType[] = [mathCount, mathAddition] as ChallengeType[];

export function getChallengeType(id: string): ChallengeType {
  const type = challengeTypes.find((t) => t.id === id);
  if (!type) throw new Error(`Unknown challenge type: ${id}`);
  return type;
}
