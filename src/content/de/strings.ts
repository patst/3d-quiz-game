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
    hint: 'Finde das verirrte Küken!',
    speakStart: 'Oh nein, ein kleines Küken hat sich im Labyrinth verirrt. Kannst du es finden?',
    goalTitle: 'Juhu!',
    goalText: 'Du hast das Küken gefunden!',
    speakGoal: 'Juhu! Du hast das Küken gefunden. Super gemacht!',
    nextMaze: 'Neues Labyrinth',
    controlsHint: 'Tippe auf den Weg, um zu laufen.',
    starsTotal: (n: number) => `${n} Sterne`,
    goalStars: (n: number) =>
      n === 0 ? 'Öffne beim nächsten Mal eine Schatzkiste!' : `Du hast ${n} ${n === 1 ? 'Stern' : 'Sterne'} gesammelt!`,
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
