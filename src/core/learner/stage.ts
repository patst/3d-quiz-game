/**
 * Learner stage (ADR-0009): where a child is in the education system, chosen by a grown-up.
 * Age alone does not determine the school year (school entry date, deferrals, early starters),
 * so we store the stage plus the school year in which it was chosen and advance it on 1 August.
 */
export const STAGES = ['kita', 'preschool', 'grade1', 'grade2', 'grade3', 'grade4'] as const;
export type StageId = (typeof STAGES)[number];

/** Curriculum region. Only Niedersachsen so far; other federal states are additive. */
export type RegionId = 'de-ni';

export interface LearnerInfo {
  stage: StageId;
  /** School year in which the stage was chosen: school year 2026/27 → 2026. */
  schoolYear: number;
  region: RegionId;
}

/** The school year starts on 1 August in Niedersachsen. */
export const SCHOOL_YEAR_START_MONTH = 7; // 0-based: August

export function schoolYearOf(date: Date): number {
  return date.getMonth() >= SCHOOL_YEAR_START_MONTH ? date.getFullYear() : date.getFullYear() - 1;
}

export function stageRank(stage: StageId): number {
  return STAGES.indexOf(stage);
}

export function isStageId(value: unknown): value is StageId {
  return typeof value === 'string' && (STAGES as readonly string[]).includes(value);
}

/**
 * Stage today. From the preschool year on, a child moves up one stage per school year (capped
 * at grade 4). "Kita" covers several years (age 3–5), so it does not advance on its own; a
 * grown-up switches to "Vorschule" in the parents area.
 */
export function currentStage(info: LearnerInfo, now: Date): StageId {
  if (info.stage === 'kita') return 'kita';
  const years = Math.max(0, schoolYearOf(now) - info.schoolYear);
  const rank = Math.min(STAGES.length - 1, stageRank(info.stage) + years);
  return STAGES[rank]!;
}

export function createLearner(stage: StageId, now: Date, region: RegionId = 'de-ni'): LearnerInfo {
  return { stage, schoolYear: schoolYearOf(now), region };
}

/** Inclusive stage range; a missing `max` means "and above". */
export interface StageRange {
  min: StageId;
  max?: StageId;
}

export function inStageRange(stage: StageId, range: StageRange): boolean {
  const r = stageRank(stage);
  return r >= stageRank(range.min) && (range.max === undefined || r <= stageRank(range.max));
}
