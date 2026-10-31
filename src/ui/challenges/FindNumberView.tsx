import type { FindNumberData } from '../../modules/challenges/math-find-number';
import type { ChallengeViewProps } from './types';

/** Big ear; hint shows the amount as tens bars and ones dots; solved shows the digits. */
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
        <div className="place-value" aria-hidden>
          {Array.from({ length: tens }, (_, i) => (
            <span key={`t${i}`} className="ten-bar">
              {Array.from({ length: 10 }, (_, j) => (
                <span key={j} className="unit-dot" />
              ))}
            </span>
          ))}
          <span className="ones">
            {Array.from({ length: ones }, (_, i) => (
              <span key={i} className="unit-dot" />
            ))}
          </span>
        </div>
      )}
    </div>
  );
}
