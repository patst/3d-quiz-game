import type { CountData } from '../../modules/challenges/math-count';
import { objectIcons } from './objectIcons';
import type { ChallengeViewProps } from './types';

export function CountView({ data, hint, solved }: ChallengeViewProps<CountData>) {
  const size = data.count <= 5 ? 56 : data.count <= 10 ? 44 : 34;
  return (
    <div className="task-area count-area" data-testid="task-area">
      {data.placements.map((p, i) => (
        <span
          key={i}
          className="task-object"
          style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, fontSize: size }}
        >
          {objectIcons[data.object]}
          {(hint || solved) && (
            <span className="count-badge" style={{ animationDelay: `${i * 0.25}s` }}>
              {i + 1}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
