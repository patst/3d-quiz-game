import { useEffect, useState } from 'react';
import { speech } from '../../audio/speech';
import { speechText } from '../../content/de/speech';
import { de } from '../../content/de/strings';
import { initialAttempt, submitAnswer, type AttemptFeedback, type AttemptState } from '../../core/challenges/attempt';
import type { Chest } from '../../core/session/mazeSession';
import type { ChallengeOutcome } from '../../core/skills/skillModel';
import { challengeViews } from '.';

const TIER_ICONS = { bronze: '🥉', silver: '🥈', gold: '🥇' } as const;

interface Props {
  chest: Chest;
  onSolved: (stars: number, outcome: ChallengeOutcome) => void;
  onSkip: () => void;
}

/** Full-screen challenge for one chest: task, number buttons, hints, skip with confirmation. */
export function ChallengeDialog({ chest, onSolved, onSkip }: Props) {
  const { challenge } = chest;
  const [attempt, setAttempt] = useState<AttemptState>(initialAttempt);
  const [feedback, setFeedback] = useState<AttemptFeedback | null>(null);
  const [confirmSkip, setConfirmSkip] = useState(false);
  const View = challengeViews[challenge.typeId];

  const sayPrompt = () => speech().speak(speechText(challenge.prompt));
  useEffect(() => {
    speech().speak(speechText(challenge.prompt));
  }, [challenge]);

  const choose = (choiceId: string) => {
    const result = submitAnswer(challenge, attempt, choiceId, chest.stars);
    setAttempt(result.state);
    setFeedback(result.feedback);
    if (result.feedback === 'correct') speech().speak(speechText({ key: 'feedback.correct' }));
    else if (result.feedback === 'reveal') speech().speak(speechText(challenge.explanation));
    else speech().speak(speechText({ key: `feedback.${result.feedback}` }));
  };

  const finished = attempt.finished;
  const correctValue = challenge.choices.find((c) => c.id === challenge.correctChoiceId)?.value;

  return (
    <div className="overlay challenge-overlay" role="dialog" aria-modal data-testid="challenge">
      <div className={`dialog challenge-dialog tier-${chest.tier}`} data-tier={chest.tier}>
        <span className="tier-badge" aria-hidden>
          {TIER_ICONS[chest.tier]}
        </span>
        <button className="prompt" onClick={sayPrompt} aria-label={de.challenge.listen}>
          <span aria-hidden>🔊</span> {speechText(challenge.prompt)}
        </button>

        {View && <View data={challenge.data} hint={feedback === 'hint' || feedback === 'reveal'} solved={finished} />}

        {!finished && (
          <div className="choice-buttons">
            {challenge.choices.map((c) => {
              const wrong = attempt.wrongChoiceIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  className={`number-button ${wrong ? 'wrong' : ''}`}
                  disabled={wrong}
                  onClick={() => choose(c.id)}
                >
                  {c.value}
                </button>
              );
            })}
          </div>
        )}

        {feedback && !finished && (
          <p className={`feedback ${feedback}`} aria-live="polite">
            {speechText({ key: `feedback.${feedback}` })}
          </p>
        )}

        {finished && (
          <div className="result-box" aria-live="polite">
            {feedback === 'reveal' ? (
              <p className="feedback reveal">{speechText(challenge.explanation)}</p>
            ) : (
              <p className="feedback correct">
                {speechText({ key: 'feedback.correct' })} <strong>{correctValue}</strong>
              </p>
            )}
            <p className="stars-won">⭐ {de.challenge.starsWon(attempt.stars)}</p>
            <button
              className="button primary"
              onClick={() =>
                onSolved(
                  attempt.stars,
                  feedback === 'reveal' ? { kind: 'revealed' } : { kind: 'solved', wrongTries: attempt.wrongChoiceIds.length },
                )
              }
            >
              {de.challenge.continue}
            </button>
          </div>
        )}

        {!finished && (
          <button
            className="skip-button"
            onClick={() => {
              setConfirmSkip(true);
              speech().speak(speechText({ key: 'feedback.skipQuestion' }));
            }}
          >
            {de.challenge.skip}
          </button>
        )}
      </div>

      {confirmSkip && (
        <div className="overlay confirm-overlay" role="alertdialog" aria-modal>
          <div className="dialog">
            <p className="confirm-question">{de.challenge.skipQuestion}</p>
            <div className="button-row">
              <button className="button big-icon secondary" aria-label={de.challenge.skipNo} onClick={() => setConfirmSkip(false)}>
                ✗
              </button>
              <button className="button big-icon primary" aria-label={de.challenge.skipYes} onClick={onSkip}>
                ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
