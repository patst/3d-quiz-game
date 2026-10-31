import { useEffect, useRef, useState } from 'react';
import { speech } from '../../audio/speech';
import { de } from '../../content/de/strings';
import {
  AVATAR_ANIMALS,
  AVATAR_COLORS,
  MAX_NAME_LENGTH,
  type Avatar,
  type AvatarAnimal,
  type AvatarColor,
} from '../../core/profile/profile';
import { AvatarPreview } from '../../render/AvatarPreview';
import { animalIcons } from '../animalIcons';

interface Props {
  canGoBack: boolean;
  onBack: () => void;
  onCreate: (name: string, avatar: Avatar) => void;
}

export function CreateProfileScreen({ canGoBack, onBack, onCreate }: Props) {
  const [animal, setAnimal] = useState<AvatarAnimal>('bunny');
  const [color, setColor] = useState<AvatarColor>(AVATAR_COLORS[0]);
  const [name, setName] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);
  const previewView = useRef<AvatarPreview | null>(null);

  useEffect(() => {
    if (!previewRef.current) return;
    const view = new AvatarPreview(previewRef.current);
    previewView.current = view;
    return () => {
      view.dispose();
      previewView.current = null;
    };
  }, []);

  useEffect(() => {
    previewView.current?.setAvatar({ animal, color });
  }, [animal, color]);

  return (
    <main className="screen menu-screen create-screen">
      <h1 className="title" onClick={() => speech().speak(de.createProfile.speakIntro)}>
        {de.createProfile.title}
      </h1>
      <div className="avatar-preview" ref={previewRef} />
      <div className="choice-row" role="radiogroup" aria-label={de.createProfile.title}>
        {AVATAR_ANIMALS.map((a) => (
          <button
            key={a}
            role="radio"
            aria-checked={a === animal}
            className={`card animal-choice ${a === animal ? 'selected' : ''}`}
            onClick={() => {
              setAnimal(a);
              speech().speak(de.animals[a]);
            }}
          >
            <span aria-hidden>{animalIcons[a]}</span>
            <small>{de.animals[a]}</small>
          </button>
        ))}
      </div>
      <div className="choice-row" role="radiogroup" aria-label={de.createProfile.chooseColor}>
        {AVATAR_COLORS.map((c) => (
          <button
            key={c}
            role="radio"
            aria-checked={c === color}
            aria-label={c}
            className={`swatch ${c === color ? 'selected' : ''}`}
            style={{ background: c }}
            onClick={() => setColor(c)}
          />
        ))}
      </div>
      <label className="name-field">
        <span>{de.createProfile.nameLabel}</span>
        <input value={name} maxLength={MAX_NAME_LENGTH} onChange={(e) => setName(e.target.value)} />
      </label>
      <div className="button-row">
        {canGoBack && (
          <button className="button secondary" onClick={onBack}>
            {de.createProfile.back}
          </button>
        )}
        <button className="button primary" onClick={() => onCreate(name, { animal, color })}>
          {de.createProfile.start}
        </button>
      </div>
    </main>
  );
}
