import { de } from '../../content/de/strings';
import type { Profile } from '../../core/profile/profile';
import { MAX_PROFILES } from '../../core/profile/profile';
import { animalIcons } from '../animalIcons';

interface Props {
  profiles: readonly Profile[];
  onSelect: (id: string) => void;
  onNew: () => void;
  onParents: () => void;
}

export function ProfileSelectScreen({ profiles, onSelect, onNew, onParents }: Props) {
  return (
    <main className="screen menu-screen">
      <h1 className="title">{de.profiles.whoIsPlaying}</h1>
      <ul className="profile-grid">
        {profiles.map((p) => (
          <li key={p.id}>
            <button className="card profile-card" style={{ background: p.avatar.color }} onClick={() => onSelect(p.id)}>
              <span className="profile-icon" aria-hidden>
                {animalIcons[p.avatar.animal]}
              </span>
              <span className="profile-name">{p.name || de.animals[p.avatar.animal]}</span>
              <span className="profile-level">{de.levels.badge(Math.max(1, ...Object.values(p.levels ?? {}).map((n) => n + 1)))}</span>
            </button>
          </li>
        ))}
        {profiles.length < MAX_PROFILES && (
          <li>
            <button className="card profile-card new" onClick={onNew}>
              <span className="profile-icon" aria-hidden>
                ＋
              </span>
              <span className="profile-name">{de.profiles.newChild}</span>
            </button>
          </li>
        )}
      </ul>
      <button className="parents-button" onClick={onParents}>
        🔒 {de.parents.button}
      </button>
    </main>
  );
}
