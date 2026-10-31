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
  /** Parents area: adults read this, so it is not spoken. */
  parents: {
    button: 'Eltern',
    gateTitle: 'Nur für Eltern',
    gateQuestion: (word: string) => `Bitte tippe die Zahl „${word}“.`,
    gateWrong: 'Das war leider nicht richtig.',
    cancel: 'Abbrechen',
    title: 'Elternbereich',
    profiles: 'Kinder',
    name: 'Name',
    stats: (stars: number, mazes: number, friends: number, items: number) =>
      [
        `${stars} ${stars === 1 ? 'Stern' : 'Sterne'}`,
        `${mazes} ${mazes === 1 ? 'Labyrinth' : 'Labyrinthe'}`,
        `${friends} ${friends === 1 ? 'Tierfreund' : 'Tierfreunde'}`,
        `${items} ${items === 1 ? 'Sache' : 'Sachen'}`,
      ].join(' · '),
    delete: 'Löschen',
    deleteConfirm: (name: string) => `${name} wirklich löschen? Alle Sterne und Sachen gehen verloren.`,
    deleteYes: 'Ja, löschen',
    deleteNo: 'Nein',
    skills: 'Lernstand',
    skillLine: (name: string, level: number, max: number, solved: number, firstTry: number) =>
      `${name}: Stufe ${level} von ${max} · ${solved} gelöst, davon ${firstTry} ohne Fehler`,
    noSkills: 'Noch keine Aufgaben gelöst.',
    settings: 'Einstellungen',
    speech: 'Aufgaben vorlesen',
    backup: 'Spielstand',
    export: 'Spielstand sichern',
    import: 'Spielstand laden',
    importDone: 'Spielstand geladen.',
    importFailed: 'Die Datei konnte nicht gelesen werden.',
    importConfirm: 'Der aktuelle Spielstand wird ersetzt. Fortfahren?',
    privacy: 'Alle Daten bleiben auf diesem Gerät. Es gibt keine Konten, keine Werbung und kein Tracking.',
    close: 'Zurück',
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
  /** Challenge type names for the parents area. */
  challengeNames: {
    'math.count': 'Zählen',
    'math.find-number': 'Zahlen erkennen',
    'math.compare': 'Mengen vergleichen',
    'math.addition': 'Plus rechnen',
    'math.subtraction': 'Minus rechnen',
    'math.pattern': 'Muster fortsetzen',
  } as Record<string, string>,
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
