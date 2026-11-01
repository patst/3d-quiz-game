import { useEffect } from 'react';
import { playPling } from '../../audio/sfx';
import { speech } from '../../audio/speech';
import { de } from '../../content/de/strings';
import type { Profile } from '../../core/profile/profile';
import { currentLevel } from '../../core/progress/levels';
import { isUnlocked, mazesUntilUnlock } from '../../core/progress/worlds';
import { worlds } from '../../modules/worlds';

interface Props {
  profile: Profile;
  onChoose: (worldId: string) => void;
  onTreehouse: () => void;
  onBack: () => void;
}

/** "Wohin geht die Reise?" — big world cards; locked worlds say how many mazes are missing. */
export function WorldSelectScreen({ profile, onChoose, onTreehouse, onBack }: Props) {
  useEffect(() => {
    speech().speak(de.worldSelect.speak);
  }, []);

  return (
    <main className="screen menu-screen world-screen" data-testid="world-select">
      <h1 className="title">{de.worldSelect.title}</h1>
      <div className="world-grid">
        {worlds.map((w) => {
          const open = isUnlocked(w.unlock, profile.levels);
          const missing = mazesUntilUnlock(w.unlock, profile.levels);
          const name = de.worlds[w.id]?.name ?? w.id;
          return (
            <button
              key={w.id}
              className={`card world-card ${open ? '' : 'locked'}`}
              style={{ background: open ? w.colors.card : undefined }}
              aria-label={open ? name : `${name}: ${de.worldSelect.locked(missing)}`}
              onClick={() => {
                if (!open) {
                  speech().speak(de.worldSelect.speakLocked);
                  return;
                }
                playPling();
                const intro = de.guideIntro[w.guide];
                if (intro) speech().speak(intro);
                onChoose(w.id);
              }}
            >
              <span className="world-icon" aria-hidden>
                {open ? de.worlds[w.id]?.icon : '🔒'}
              </span>
              <span className="world-name">{name}</span>
              <span className="world-guide" aria-hidden>
                {de.guideIcons[w.guide]}
              </span>
              {open ? (
                <span className="profile-level">{de.levels.badge(currentLevel(profile.levels[w.id]))}</span>
              ) : (
                <span className="world-locked">{de.worldSelect.locked(missing)}</span>
              )}
            </button>
          );
        })}
        <button className="card world-card treehouse-card" aria-label={de.treehouse.title} onClick={onTreehouse}>
          <span className="world-icon" aria-hidden>
            🌳🏠
          </span>
          <span className="world-name">{de.treehouse.title}</span>
        </button>
      </div>
      <button className="button secondary" onClick={onBack}>
        🏠
      </button>
    </main>
  );
}
