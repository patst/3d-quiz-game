import { describe, expect, it } from 'vitest';
import { createLearner, currentStage, inStageRange, schoolYearOf } from './stage';

const d = (iso: string) => new Date(`${iso}T12:00:00`);

describe('learner stage', () => {
  it('school years start on 1 August', () => {
    expect(schoolYearOf(d('2026-07-31'))).toBe(2025);
    expect(schoolYearOf(d('2026-08-01'))).toBe(2026);
    expect(schoolYearOf(d('2027-01-15'))).toBe(2026);
  });

  it('advances one stage per school year, capped at grade 4', () => {
    const info = createLearner('preschool', d('2026-11-01'));
    expect(currentStage(info, d('2027-07-31'))).toBe('preschool');
    expect(currentStage(info, d('2027-08-01'))).toBe('grade1');
    expect(currentStage(info, d('2028-09-01'))).toBe('grade2');
    expect(currentStage(info, d('2040-09-01'))).toBe('grade4');
  });

  it('Kindergarten does not advance on its own (it spans several years)', () => {
    expect(currentStage(createLearner('kita', d('2026-11-01')), d('2029-09-01'))).toBe('kita');
  });

  it('a clock set back in time never lowers the stage', () => {
    expect(currentStage(createLearner('grade1', d('2026-11-01')), d('2020-01-01'))).toBe('grade1');
  });

  it('checks inclusive ranges, open at the top without max', () => {
    expect(inStageRange('grade1', { min: 'preschool', max: 'grade1' })).toBe(true);
    expect(inStageRange('grade2', { min: 'preschool', max: 'grade1' })).toBe(false);
    expect(inStageRange('kita', { min: 'preschool' })).toBe(false);
    expect(inStageRange('grade4', { min: 'preschool' })).toBe(true);
  });
});
