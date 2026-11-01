import { useEffect } from 'react';
import { speech } from '../../audio/speech';
import { de } from '../../content/de/strings';
import { STAGES, type StageId } from '../../core/learner/stage';

interface Props {
  onChoose: (stage: StageId) => void;
  onLater: () => void;
}

/**
 * One-time question "Kindergarten oder Schule?" (ADR-0009), shown after creating a profile and
 * once for profiles from before v9. Meant for a grown-up next to the child; no gate, skippable.
 */
export function StageScreen({ onChoose, onLater }: Props) {
  useEffect(() => {
    speech().speak(de.stage.question);
  }, []);

  return (
    <main className="screen menu-screen stage-screen" data-testid="stage-screen">
      <h1 className="title">{de.stage.title}</h1>
      <button className="prompt" onClick={() => speech().speak(de.stage.question)}>
        <span aria-hidden>🔊</span> {de.stage.question}
      </button>
      <div className="stage-grid" role="group" aria-label={de.stage.title}>
        {STAGES.map((s) => (
          <button
            key={s}
            className="card stage-choice"
            data-stage={s}
            onClick={() => {
              speech().speak(de.stage.spoken[s]);
              onChoose(s);
            }}
          >
            <span aria-hidden>{de.stage.icons[s]}</span>
            <strong>{de.stage.names[s]}</strong>
          </button>
        ))}
      </div>
      <p className="hint-text">{de.stage.hint}</p>
      <div className="button-row">
        <button className="button secondary" onClick={onLater}>
          {de.stage.later}
        </button>
      </div>
    </main>
  );
}
