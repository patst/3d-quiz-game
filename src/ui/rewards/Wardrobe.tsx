import { useEffect, useRef } from 'react';
import { speech } from '../../audio/speech';
import { de } from '../../content/de/strings';
import type { Profile } from '../../core/profile/profile';
import { REWARD_SLOTS } from '../../core/rewards/rewards';
import { rewardCatalog } from '../../modules/rewards/catalog';
import { AvatarPreview } from '../../render/AvatarPreview';
import { rewardIcons } from '../rewardIcons';
import { LOST_ANIMALS, type LostAnimal } from '../../core/profile/lostAnimals';
import { lostAnimalIcons } from '../lostAnimalIcons';

interface Props {
  profile: Profile;
  onToggle: (itemId: string) => void;
  onSetPet: (animal: LostAnimal | null) => void;
  onClose: () => void;
}

/** Collection album + dressing room. Unfound items are shown as silhouettes. */
export function Wardrobe({ profile, onToggle, onSetPet, onClose }: Props) {
  const previewRef = useRef<HTMLDivElement>(null);
  const preview = useRef<AvatarPreview | null>(null);

  useEffect(() => {
    if (!previewRef.current) return;
    const view = new AvatarPreview(previewRef.current);
    preview.current = view;
    return () => {
      view.dispose();
      preview.current = null;
    };
  }, []);

  useEffect(() => {
    preview.current?.setAvatar(profile.avatar, profile.equipped);
  }, [profile.avatar, profile.equipped]);

  const owned = new Set(profile.inventory);
  const worn = new Set(Object.values(profile.equipped));

  return (
    <div className="overlay wardrobe-overlay" role="dialog" aria-modal data-testid="wardrobe">
      <div className="dialog wardrobe-dialog">
        <h2>{de.rewards.wardrobe}</h2>
        <div className="avatar-preview small" ref={previewRef} />
        <p className="hint-text">{de.rewards.wardrobeHint}</p>
        {REWARD_SLOTS.map((slot) => (
          <section key={slot} className="wardrobe-section">
            <h3>{de.rewards.slots[slot]}</h3>
            <div className="wardrobe-items">
              {rewardCatalog
                .filter((i) => i.slot === slot)
                .map((item) => {
                  const has = owned.has(item.id);
                  const name = de.rewards.items[item.id] ?? item.id;
                  return (
                    <button
                      key={item.id}
                      className={`wardrobe-item ${has ? 'owned' : 'locked'} ${worn.has(item.id) ? 'worn' : ''}`}
                      disabled={!has}
                      aria-pressed={worn.has(item.id)}
                      aria-label={has ? name : de.rewards.locked}
                      onClick={() => {
                        speech().speak(name);
                        onToggle(item.id);
                      }}
                    >
                      <span aria-hidden>{rewardIcons[item.id]}</span>
                    </button>
                  );
                })}
            </div>
          </section>
        ))}
        <section className="wardrobe-section" data-testid="friends">
          <h3>{de.friends.title}</h3>
          <p className="hint-text">{de.friends.hint}</p>
          <div className="wardrobe-items">
            {LOST_ANIMALS.map((animal) => {
              const has = profile.rescued.includes(animal);
              const name = de.lostAnimals[animal].name;
              const active = profile.pet === animal;
              return (
                <button
                  key={animal}
                  className={`wardrobe-item ${has ? 'owned' : 'locked'} ${active ? 'worn' : ''}`}
                  disabled={!has}
                  aria-pressed={active}
                  aria-label={has ? name : de.rewards.locked}
                  onClick={() => {
                    speech().speak(name);
                    onSetPet(active ? null : animal);
                  }}
                >
                  <span aria-hidden>{lostAnimalIcons[animal]}</span>
                </button>
              );
            })}
          </div>
        </section>
        <button className="button primary" onClick={onClose}>
          {de.rewards.back}
        </button>
      </div>
    </div>
  );
}
