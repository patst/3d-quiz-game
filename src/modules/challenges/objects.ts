/** Countable picture objects used by math challenges. German names live in content/de. */
export const COUNT_OBJECTS = ['apple', 'star', 'fish', 'flower', 'ball'] as const;
export type CountObject = (typeof COUNT_OBJECTS)[number];

/** Normalised position (0..1) of one picture inside the task area. */
export interface Placement {
  x: number;
  y: number;
}
