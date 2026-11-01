import type { FindNumberData } from '../../modules/challenges/math-find-number';
import type { ChallengeViewProps } from './types';

function DotRow({ filled, kind }: { filled: number; kind: 'ten' | 'one' }) {
  return (
    <span className={`dot-row ${kind}`}>
      {Array.from({ length: 10 }, (_, j) => (
        <span key={j} className={`unit-dot ${j < filled ? 'filled' : 'empty'}`} />
      ))}
    </span>
  );
}

/** Big ear; hint shows the amount in rows of ten; solved shows the digits. */
export function FindNumberView({ data, hint, solved }: ChallengeViewProps<FindNumberData>) {
  const tens = Math.floor(data.number / 10);
  const ones = data.number % 10;
  return (
    <div className="task-area find-area" data-testid="task-area">
      {solved ? (
        <div className="big-number solved">{data.number}</div>
      ) : (
        <div className="listen-icon" aria-hidden>
          👂
        </div>
      )}
      {(hint || solved) && (
        // One row per ten (10 dots, grouped 5 + 5 like a ten-frame), ones in the last row:
        // everything reads left to right, top to bottom.
        <div className="place-value" aria-hidden data-testid="place-value">
          {Array.from({ length: tens }, (_, i) => (
            <DotRow key={`t${i}`} filled={10} kind="ten" />
          ))}
          {ones > 0 && <DotRow filled={ones} kind="one" />}
        </div>
      )}
    </div>
  );
}
