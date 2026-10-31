import type { LostAnimal } from '../../core/profile/lostAnimals';
import type { AvatarAnimal } from '../../core/profile/profile';

/**
 * All German text the child sees or hears. Components must not hard-code strings
 * (CLAUDE.md rule 4). Keys are English, values German.
 */
export const de = {
  appTitle: 'Labyrinth-Abenteuer',
  /** Guide characters (game-design §3). Olli guides world 1; Ida and Rick later worlds. */
  guides: {
    olli: { name: 'Olli', species: 'Eule' },
    ida: { name: 'Ida', species: 'Igel' },
    rick: { name: 'Rick', species: 'Waschbär' },
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

    goalTitle: 'Juhu!',
    nextMaze: 'Neues Labyrinth',
    controlsHint: 'Tippe auf den Weg, um zu laufen.',
    starsTotal: (n: number) => `${n} Sterne`,
    goalStars: (n: number) =>
      n === 0 ? 'Öffne beim nächsten Mal eine Schatzkiste!' : `Du hast ${n} ${n === 1 ? 'Stern' : 'Sterne'} gesammelt!`,
  },
  /** Per lost animal: full sentences (German articles differ: das Küken, den Welpen). */
  lostAnimals: {
    chick: {
      name: 'Küken',
      hint: 'Finde das verirrte Küken!',
      speakStart: 'Oh nein, ein kleines Küken hat sich im Labyrinth verirrt. Kannst du es finden?',
      goalText: 'Du hast das Küken gefunden!',
      speakGoal: 'Juhu! Du hast das Küken gefunden. Super gemacht!',
    },
    piglet: {
      name: 'Ferkel',
      hint: 'Finde das verirrte Ferkel!',
      speakStart: 'Oh nein, ein kleines Ferkel hat sich im Labyrinth verirrt. Kannst du es finden?',
      goalText: 'Du hast das Ferkel gefunden!',
      speakGoal: 'Juhu! Du hast das Ferkel gefunden. Super gemacht!',
    },
    puppy: {
      name: 'Welpe',
      hint: 'Finde den verirrten Welpen!',
      speakStart: 'Oh nein, ein kleiner Welpe hat sich im Labyrinth verirrt. Kannst du ihn finden?',
      goalText: 'Du hast den Welpen gefunden!',
      speakGoal: 'Juhu! Du hast den Welpen gefunden. Super gemacht!',
    },
    lamb: {
      name: 'Lamm',
      hint: 'Finde das verirrte Lamm!',
      speakStart: 'Oh nein, ein kleines Lamm hat sich im Labyrinth verirrt. Kannst du es finden?',
      goalText: 'Du hast das Lamm gefunden!',
      speakGoal: 'Juhu! Du hast das Lamm gefunden. Super gemacht!',
    },
    'bunny-baby': {
      name: 'Häschen',
      hint: 'Finde das verirrte Häschen!',
      speakStart: 'Oh nein, ein kleines Häschen hat sich im Labyrinth verirrt. Kannst du es finden?',
      goalText: 'Du hast das Häschen gefunden!',
      speakGoal: 'Juhu! Du hast das Häschen gefunden. Super gemacht!',
    },
    kitten: {
      name: 'Kätzchen',
      hint: 'Finde das verirrte Kätzchen!',
      speakStart: 'Oh nein, ein kleines Kätzchen hat sich im Labyrinth verirrt. Kannst du es finden?',
      goalText: 'Du hast das Kätzchen gefunden!',
      speakGoal: 'Juhu! Du hast das Kätzchen gefunden. Super gemacht!',
    },
  } satisfies Record<LostAnimal, { name: string; hint: string; speakStart: string; goalText: string; speakGoal: string }>,
  friends: {
    title: 'Meine Tierfreunde',
    hint: 'Tippe auf einen Freund, damit er mit dir läuft.',
    newFriend: (name: string) => `Neuer Freund: ${name}!`,
  },
  rewards: {
    jarLabel: (n: number) => `Sternenglas: ${n} von 10`,
    jarHint: (missing: number) =>
      missing === 1 ? 'Noch ein Stern bis zur nächsten Belohnung!' : `Noch ${missing} Sterne bis zur nächsten Belohnung!`,
    pickTitle: 'Dein Sternenglas ist voll!',
    pickText: 'Such dir eine Belohnung aus!',
    speakPick: 'Dein Sternenglas ist voll! Such dir eine Belohnung aus!',
    thanks: 'Super, das sieht toll aus!',
    allCollected: 'Wow, du hast schon alles gesammelt!',
    wardrobe: 'Mein Schrank',
    wardrobeHint: 'Tippe auf etwas, um es anzuziehen oder auszuziehen.',
    locked: 'Noch nicht gefunden',
    back: 'Zurück zum Spiel',
    slots: { hat: 'Hüte', glasses: 'Brillen', neck: 'Schals und Umhänge', trail: 'Spuren' },
    items: {
      'party-hat': 'Partyhut',
      crown: 'Krone',
      'top-hat': 'Zylinder',
      cap: 'Kappe',
      'flower-wreath': 'Blumenkranz',
      'wizard-hat': 'Zauberhut',
      'round-glasses': 'Brille',
      sunglasses: 'Sonnenbrille',
      'star-glasses': 'Sternenbrille',
      'heart-glasses': 'Herzbrille',
      scarf: 'Schal',
      cape: 'Umhang',
      'bow-tie': 'Fliege',
      medal: 'Medaille',
      sparkles: 'Glitzerspur',
      hearts: 'Herzchenspur',
      bubbles: 'Seifenblasen',
      rainbow: 'Regenbogenspur',
    } as Record<string, string>,
  },
  challenge: {
    listen: 'Nochmal hören',
    skip: 'Überspringen',
    skipQuestion: 'Möchtest du diese Aufgabe wirklich überspringen?',
    skipYes: 'Ja, überspringen',
    skipNo: 'Nein, weiter rechnen',
    continue: 'Weiter',
    starsWon: (n: number) => `+${n} ${n === 1 ? 'Stern' : 'Sterne'}`,
  },
} as const;
