import type { Placement } from '../../modules/challenges/objects';
import type { CompareData } from '../../modules/challenges/math-compare';
import { objectIcons } from './objectIcons';
import type { ChallengeViewProps } from './types';

/** Two tappable groups (or numbers); the bigger one is the answer. */
export function CompareView({ data, hint, solved, answers }: ChallengeViewProps<CompareData>) {
  const side = (id: 'left' | 'right', amount: number, placements: Placement[]) => {
    const wrong = answers?.wrongChoiceIds.includes(id);
    const correct = solved && answers?.correctChoiceId === id;
    const size = amount <= 5 ? 40 : amount <= 10 ? 30 : 24;
    return (
      <button
        className={`compare-side ${wrong ? 'wrong' : ''} ${correct ? 'correct' : ''}`}
        disabled={solved || wrong}
        aria-label={String(amount)}
        onClick={() => answers?.onChoose(id)}
      >
        {data.digits ? (
          <span className="big-number">{amount}</span>
        ) : (
          placements.map((p, i) => (
            <span key={i} className="task-object" style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, fontSize: size }}>
              {objectIcons[data.object]}
              {(hint || solved) && <span className="count-badge">{i + 1}</span>}
            </span>
          ))
        )}
      </button>
    );
  };
  return (
    <div className="compare-area" data-testid="task-area">
      {side('left', data.left, data.leftPlacements)}
      {side('right', data.right, data.rightPlacements)}
    </div>
  );
}
