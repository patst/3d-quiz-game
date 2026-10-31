import type { AvatarAnimal } from '../../core/profile/profile';

/**
 * All German text the child sees or hears. Components must not hard-code strings
 * (CLAUDE.md rule 4). Keys are English, values German.
 */
export const de = {
  appTitle: 'Labyrinth-Abenteuer',
  guide: {
    name: 'Olli',
    species: 'Eule',
  },
  profiles: {
    whoIsPlaying: 'Wer spielt?',
    newChild: 'Neues Kind',
    stars: (n: number) => `${n} ${n === 1 ? 'Stern' : 'Sterne'}`,
    noName: 'Ohne Namen',
  },
  createProfile: {
    title: 'Wähle dein Tier!',
    chooseColor: 'Welche Farbe?',
    nameLabel: 'Name (für Eltern, freiwillig)',
    start: "Los geht's!",
    back: 'Zurück',
    speakIntro: 'Hallo! Ich bin Olli, die Eule. Welches Tier möchtest du sein?',
  },
  animals: {
    bunny: 'Hase',
    bear: 'Bär',
    cat: 'Katze',
    frog: 'Frosch',
    penguin: 'Pinguin',
  } satisfies Record<AvatarAnimal, string>,
  game: {
    home: 'Zurück zum Start',
    hint: 'Finde das verirrte Küken!',
    speakStart: 'Oh nein, ein kleines Küken hat sich im Labyrinth verirrt. Kannst du es finden?',
    goalTitle: 'Juhu!',
    goalText: 'Du hast das Küken gefunden!',
    speakGoal: 'Juhu! Du hast das Küken gefunden. Super gemacht!',
    nextMaze: 'Neues Labyrinth',
    controlsHint: 'Tippe auf den Weg, um zu laufen.',
  },
} as const;
