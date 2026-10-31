import { useState } from 'react';
import { numberWord } from '../../content/de/numbers';
import { de } from '../../content/de/strings';

interface Props {
  onPass: () => void;
  onCancel: () => void;
}

/**
 * Simple parent gate: type a two-digit number given as a word ("dreiundvierzig").
 * Children who cannot read long words yet cannot pass; adults pass in seconds.
 */
export function ParentGate({ onPass, onCancel }: Props) {
  const [target] = useState(() => 21 + Math.floor(Math.random() * 78));
  const [input, setInput] = useState('');
  const [wrong, setWrong] = useState(false);

  const press = (digit: number) => {
    const next = input + digit;
    if (next.length < 2) {
      setInput(next);
      return;
    }
    if (Number(next) === target) onPass();
    else {
      setWrong(true);
      setInput('');
    }
  };

  return (
    <div className="overlay" role="dialog" aria-modal data-testid="parent-gate">
      <div className="dialog gate-dialog">
        <h2>{de.parents.gateTitle}</h2>
        <p className="gate-question" data-target-word={numberWord(target)}>
          {de.parents.gateQuestion(numberWord(target))}
        </p>
        <div className="gate-display" aria-live="polite">
          {input.padEnd(2, '_')}
        </div>
        {wrong && <p className="feedback tryAgain">{de.parents.gateWrong}</p>}
        <div className="gate-pad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d) => (
            <button key={d} className="gate-key" onClick={() => press(d)}>
              {d}
            </button>
          ))}
        </div>
        <button className="button secondary" onClick={onCancel}>
          {de.parents.cancel}
        </button>
      </div>
    </div>
  );
}
