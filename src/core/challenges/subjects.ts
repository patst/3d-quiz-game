import type { ChallengeType, SubjectId } from './types';

export const SUBJECTS: readonly SubjectId[] = ['math', 'german', 'knowledge'];

/** Subjects that still have at least one challenge type the parents allow. */
export function allowedSubjects(types: readonly ChallengeType[], disabled: readonly string[]): SubjectId[] {
  return SUBJECTS.filter((s) => types.some((t) => t.subject === s && !disabled.includes(t.id)));
}

/**
 * Child's choice for this session, within what parents allow (owner decision 2c).
 * null = everything allowed. Never returns an empty list.
 */
export function sessionSubjects(chosen: readonly SubjectId[] | null, allowed: readonly SubjectId[]): SubjectId[] {
  const pick = (chosen ?? allowed).filter((s) => allowed.includes(s));
  return pick.length > 0 ? pick : [...allowed];
}

/** Toggle one subject; the last remaining one cannot be switched off. */
export function toggleSubject(current: readonly SubjectId[], subject: SubjectId): SubjectId[] {
  if (current.includes(subject)) return current.length > 1 ? current.filter((s) => s !== subject) : [...current];
  return SUBJECTS.filter((s) => s === subject || current.includes(s));
}
