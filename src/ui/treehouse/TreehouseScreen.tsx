import { useEffect, useRef, useState } from 'react';
import { playPling } from '../../audio/sfx';
import { speech } from '../../audio/speech';
import { de } from '../../content/de/strings';
import { isLostAnimal } from '../../core/profile/lostAnimals';
import type { Profile } from '../../core/profile/profile';
import type { TreehouseSpot } from '../../core/rewards/treehouse';
import { rewardCatalog } from '../../modules/rewards/catalog';
import { TreehouseView } from '../../render/treehouse/TreehouseView';
import { rewardIcons } from '../rewardIcons';

interface Props {
  profile: Profile;
  onPlace: (spot: TreehouseSpot, itemId: string | null) => void;
  onBack: () => void;
}

/** "Mein Baumhaus": tap a spot to place one of the collected decorations (roadmap M10). */
export function TreehouseScreen({ profile, onPlace, onBack }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<TreehouseView | null>(null);
  const [spot, setSpot] = useState<TreehouseSpot | null>(null);
  const ownedDecor = rewardCatalog.filter((i) => i.slot === 'decor' && profile.inventory.includes(i.id));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const view = new TreehouseView({
      container,
      avatar: profile.avatar,
      equipped: profile.equipped,
      friends: profile.rescued.filter(isLostAnimal),
      onSpot: (s) => setSpot(s),
    });
    viewRef.current = view;
    return () => {
      view.dispose();
      viewRef.current = null;
    };
    // The scene is built once; decorations update via setDecor below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    viewRef.current?.setDecor(profile.treehouse);
  }, [profile.treehouse]);

  useEffect(() => {
    speech().speak(ownedDecor.length > 0 ? de.treehouse.speakWelcome : de.treehouse.speakEmpty);
    // Only on entering.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = spot ? profile.treehouse[spot] : undefined;

  return (
    <main className="screen game-screen" data-testid="treehouse">
      <div className="game-canvas" ref={containerRef} />
      <div className="hud">
        <button className="round-button" aria-label={de.treehouse.back} onClick={onBack}>
          ⬅️
        </button>
        <div className="guide-bubble">🌳 {de.treehouse.title}</div>
      </div>
      {spot && (
        <div className="overlay" role="dialog" aria-modal data-testid="decor-picker">
          <div className="dialog decor-dialog">
            <h2>{de.treehouse.choose}</h2>
            {ownedDecor.length === 0 ? (
              <p>{de.treehouse.nothing}</p>
            ) : (
              <div className="wardrobe-items">
                {ownedDecor.map((item) => (
                  <button
                    key={item.id}
                    className={`wardrobe-item owned ${current === item.id ? 'worn' : ''}`}
                    aria-label={de.rewards.items[item.id]}
                    onClick={() => {
                      playPling();
                      speech().speak(de.rewards.items[item.id] ?? '');
                      onPlace(spot, item.id);
                      setSpot(null);
                    }}
                  >
                    <span aria-hidden>{rewardIcons[item.id]}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="button-row">
              {current && (
                <button
                  className="button secondary small"
                  onClick={() => {
                    onPlace(spot, null);
                    setSpot(null);
                  }}
                >
                  {de.treehouse.remove}
                </button>
              )}
              <button className="button primary small" onClick={() => setSpot(null)}>
                {de.treehouse.back}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
