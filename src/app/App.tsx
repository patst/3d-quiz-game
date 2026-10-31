import { useMemo, useState } from 'react';
import { createProfile, type Avatar } from '../core/profile/profile';
import { addProfile, setActiveProfile, updateProfile } from '../core/save/save';
import { CreateProfileScreen } from '../ui/screens/CreateProfileScreen';
import { GameScreen } from '../ui/screens/GameScreen';
import { ProfileSelectScreen } from '../ui/screens/ProfileSelectScreen';
import { createIdbStore, newId } from './storage';
import { useSave } from './useSave';

type Screen = { name: 'profiles' } | { name: 'create' } | { name: 'game' };

export function App() {
  const store = useMemo(() => createIdbStore(), []);
  const { doc, update } = useSave(store);
  const [screen, setScreen] = useState<Screen>({ name: 'profiles' });

  if (!doc) return <div className="loading" />;

  const active = doc.profiles.find((p) => p.id === doc.activeProfileId) ?? null;

  if (screen.name === 'create' || (screen.name === 'profiles' && doc.profiles.length === 0)) {
    return (
      <CreateProfileScreen
        canGoBack={doc.profiles.length > 0}
        onBack={() => setScreen({ name: 'profiles' })}
        onCreate={(name: string, avatar: Avatar) => {
          update((d) => addProfile(d, createProfile({ id: newId(), name, avatar, now: Date.now() })));
          setScreen({ name: 'game' });
        }}
      />
    );
  }

  if (screen.name === 'game' && active) {
    return (
      <GameScreen
        profile={active}
        onHome={() => setScreen({ name: 'profiles' })}
        onStars={(stars) => update((d) => updateProfile(d, active.id, (p) => ({ ...p, stars: p.stars + stars })))}
        onMazeCompleted={() =>
          update((d) => updateProfile(d, active.id, (p) => ({ ...p, mazesCompleted: p.mazesCompleted + 1 })))
        }
      />
    );
  }

  return (
    <ProfileSelectScreen
      profiles={doc.profiles}
      onSelect={(id) => {
        update((d) => setActiveProfile(d, id));
        setScreen({ name: 'game' });
      }}
      onNew={() => setScreen({ name: 'create' })}
    />
  );
}
