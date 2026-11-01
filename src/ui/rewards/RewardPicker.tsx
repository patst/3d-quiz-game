import { useEffect } from 'react';
import { playFanfare, playPling } from '../../audio/sfx';
import { speech } from '../../audio/speech';
import { de } from '../../content/de/strings';
import type { RewardItem } from '../../core/rewards/rewards';
import { rewardIcons } from '../rewardIcons';

interface Props {
  offer: readonly RewardItem[];
  /** null = nothing left to offer (everything collected). */
  onChoose: (itemId: string | null) => void;
}

/** "Dein Sternenglas ist voll!" — the child picks one of (up to) three items. */
export function RewardPicker({ offer, onChoose }: Props) {
  useEffect(() => {
    playFanfare();
    // Let the fanfare play first, then talk.
    const id = window.setTimeout(() => speech().speak(offer.length > 0 ? de.rewards.speakPick : de.rewards.allCollected), 1200);
    return () => window.clearTimeout(id);
  }, [offer.length]);

  return (
    <div className="overlay reward-overlay" role="dialog" aria-modal data-testid="reward-picker">
      <div className="dialog reward-dialog">
        <div className="dialog-icon" aria-hidden>
          🫙✨
        </div>
        <h2>{de.rewards.pickTitle}</h2>
        {offer.length > 0 ? (
          <>
            <p>{de.rewards.pickText}</p>
            <div className="reward-choices">
              {offer.map((item) => (
                <button
                  key={item.id}
                  className="card reward-card"
                  onClick={() => {
                    playPling();
                    speech().speak(de.rewards.thanks);
                    onChoose(item.id);
                  }}
                >
                  <span className="reward-icon" aria-hidden>
                    {rewardIcons[item.id]}
                  </span>
                  <span className="reward-name">{de.rewards.items[item.id]}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p>{de.rewards.allCollected}</p>
            <button className="button primary" onClick={() => onChoose(null)}>
              {de.challenge.continue}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
