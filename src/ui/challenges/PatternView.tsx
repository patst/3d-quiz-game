import type { PatternData } from '../../modules/challenges/math-pattern';
import { PATTERN_SYMBOLS } from '../../modules/challenges/math-pattern';
import type { ChallengeViewProps } from './types';

const SYMBOL_ICONS: Record<(typeof PATTERN_SYMBOLS)[number], string> = {
  red: '🔴',
  blue: '🔵',
  yellow: '🟡',
  green: '🟢',
  star: '⭐',
  heart: '❤️',
};

const icon = (i: number) => SYMBOL_ICONS[PATTERN_SYMBOLS[i]!];

/** Smallest repeating period of the visible sequence (for the hint grouping). */
function period(seq: number[]): number {
  return [1, 2, 3, 4].find((len) => seq.every((v, i) => i < len || v === seq[i - len])) ?? seq.length;
}

/** Sequence + "?" slot; answer buttons show symbols. Hint groups the repeating unit. */
export function PatternView({ data, hint, solved, answers }: ChallengeViewProps<PatternData>) {
  const p = period(data.sequence);
  const answer = answers?.choices.find((c) => c.id === answers.correctChoiceId)?.value;
  return (
    <div className="pattern-wrap" data-testid="task-area">
      <div className="task-area pattern-row">
        {data.sequence.map((s, i) => (
          <span key={i} className={`pattern-item ${(hint || solved) && i % p === 0 && i > 0 ? 'unit-start' : ''}`}>
            {icon(s)}
          </span>
        ))}
        <span className={`pattern-item missing ${(hint || solved) && data.sequence.length % p === 0 ? 'unit-start' : ''}`}>
          {solved && answer !== undefined ? icon(answer) : '?'}
        </span>
      </div>
      {!solved && answers && (
        <div className="choice-buttons">
          {answers.choices.map((c) => {
            const wrong = answers.wrongChoiceIds.includes(c.id);
            return (
              <button
                key={c.id}
                className={`number-button symbol ${wrong ? 'wrong' : ''}`}
                disabled={wrong}
                aria-label={PATTERN_SYMBOLS[c.value]}
                onClick={() => answers.onChoose(c.id)}
              >
                {icon(c.value)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
