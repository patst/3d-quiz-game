import { useEffect, useMemo, useState } from 'react';
import { setSpeechEnabled } from '../audio/speech';
import { ParentGate } from '../ui/parents/ParentGate';
import { ParentsArea } from '../ui/parents/ParentsArea';
import { createProfile, type Avatar } from '../core/profile/profile';
import { addProfile, migrateSave, removeProfile, setActiveProfile, updateProfile, updateSettings } from '../core/save/save';
import { MAX_NAME_LENGTH } from '../core/profile/profile';
import { fillJar, toggleEquip } from '../core/rewards/rewards';
import { initialSkill, recordOutcome } from '../core/skills/skillModel';
import { getChallengeType } from '../modules/challenges';
import { getWorld } from '../modules/worlds';
import { getRewardItem } from '../modules/rewards/catalog';
import { CreateProfileScreen } from '../ui/screens/CreateProfileScreen';
import { GameScreen } from '../ui/screens/GameScreen';
import { ProfileSelectScreen } from '../ui/screens/ProfileSelectScreen';
import { createIdbStore, newId } from './storage';
import { useSave } from './useSave';

type Screen = { name: 'profiles' } | { name: 'create' } | { name: 'game' } | { name: 'parents' };

export function App() {
  const store = useMemo(() => createIdbStore(), []);
  const { doc, update } = useSave(store);
  const [screen, setScreen] = useState<Screen>({ name: 'profiles' });
  const [gateOpen, setGateOpen] = useState(false);
  const speechOn = doc?.settings.speech ?? true;

  useEffect(() => setSpeechEnabled(speechOn), [speechOn]);

  if (!doc) return <div className="loading" />;

  if (screen.name === 'parents') {
    return (
      <ParentsArea
        doc={doc}
        onRename={(id, name) =>
          update((d) => updateProfile(d, id, (p) => ({ ...p, name: name.trim().slice(0, MAX_NAME_LENGTH) })))
        }
        onDelete={(id) => update((d) => removeProfile(d, id))}
        onSpeech={(on) => update((d) => updateSettings(d, { speech: on }))}
        onImport={(raw) => update(() => migrateSave(raw))}
        onClose={() => setScreen({ name: 'profiles' })}
      />
    );
  }

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
        onStars={(stars) =>
          update((d) =>
            updateProfile(d, active.id, (p) => ({ ...p, stars: p.stars + stars, ...fillJar(p.jar, p.pendingRewards, stars) })),
          )
        }
        onChooseReward={(itemId) =>
          update((d) =>
            updateProfile(d, active.id, (p) => {
              const item = itemId ? getRewardItem(itemId) : undefined;
              return {
                ...p,
                pendingRewards: Math.max(0, p.pendingRewards - 1),
                inventory: item && !p.inventory.includes(item.id) ? [...p.inventory, item.id] : p.inventory,
                // A new item is worn right away so the child sees it immediately.
                equipped: item ? { ...p.equipped, [item.slot]: item.id } : p.equipped,
              };
            }),
          )
        }
        onRescue={(animal) =>
          update((d) =>
            updateProfile(d, active.id, (p) =>
              p.rescued.includes(animal)
                ? p
                : // A newly rescued friend follows the child right away if no pet is chosen.
                  { ...p, rescued: [...p.rescued, animal], pet: p.pet ?? animal },
            ),
          )
        }
        onChallengeResult={(typeId, level, outcome) =>
          update((d) =>
            updateProfile(d, active.id, (p) => {
              const type = getChallengeType(typeId);
              const start = getWorld('forest').chests.challenges.find((c) => c.typeId === typeId)?.startLevel ?? 1;
              const current = p.skills[typeId] ?? initialSkill(start);
              return { ...p, skills: { ...p.skills, [typeId]: recordOutcome(current, outcome, level, type.levels) } };
            }),
          )
        }
        onSetPet={(animal) =>
          update((d) =>
            updateProfile(d, active.id, (p) => (animal === null || p.rescued.includes(animal) ? { ...p, pet: animal } : p)),
          )
        }
        onToggleEquip={(itemId) =>
          update((d) =>
            updateProfile(d, active.id, (p) => {
              const item = getRewardItem(itemId);
              return item && p.inventory.includes(itemId) ? { ...p, equipped: toggleEquip(p.equipped, item) } : p;
            }),
          )
        }
        onMazeCompleted={() =>
          update((d) => updateProfile(d, active.id, (p) => ({ ...p, mazesCompleted: p.mazesCompleted + 1 })))
        }
      />
    );
  }

  return (
    <>
      <ProfileSelectScreen
      profiles={doc.profiles}
      onSelect={(id) => {
        update((d) => setActiveProfile(d, id));
        setScreen({ name: 'game' });
      }}
      onNew={() => setScreen({ name: 'create' })}
      onParents={() => setGateOpen(true)}
      />
      {gateOpen && (
        <ParentGate
          onPass={() => {
            setGateOpen(false);
            setScreen({ name: 'parents' });
          }}
          onCancel={() => setGateOpen(false)}
        />
      )}
    </>
  );
}
