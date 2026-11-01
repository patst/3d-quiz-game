/**
 * Small synthesized sound effects (Web Audio, no files, works offline).
 * Cheerful jingles replace the spoken "Super gemacht!" (owner feedback 2026-11-01).
 * Never punishing: the "try again" sound is a soft, friendly bloop.
 */
let ctx: AudioContext | null = null;
let enabled = true;

/** Parents can switch sounds off (settings.sfx). */
export function setSfxEnabled(value: boolean): void {
  enabled = value;
}

function audio(): AudioContext | null {
  if (!enabled || typeof window === 'undefined' || !('AudioContext' in window)) return null;
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Unlocks audio on the first tap (iOS/Chrome autoplay rules). */
export function initSfx(): void {
  if (typeof document === 'undefined') return;
  document.addEventListener('pointerdown', () => audio(), { once: true, capture: true });
}

/** One bell-like note: sine + soft triangle overtone with a quick decay. */
function bell(ac: AudioContext, freq: number, at: number, length = 0.35, volume = 0.22): void {
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  gain.connect(ac.destination);
  for (const [type, mult, vol] of [
    ['sine', 1, 1],
    ['triangle', 2, 0.25],
  ] as const) {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq * mult, at);
    g.gain.value = vol;
    osc.connect(g).connect(gain);
    osc.start(at);
    osc.stop(at + length + 0.05);
  }
}

const note = (semitonesFromA4: number) => 440 * 2 ** (semitonesFromA4 / 12);
// C5 E5 G5 C6 etc. relative to A4.
const C5 = 3;
const D5 = 5;
const E5 = 7;
const G5 = 10;
const A5 = 12;
const C6 = 15;
const E6 = 19;

/** Different little melodies so praise does not get boring. */
const JINGLES: ReadonlyArray<ReadonlyArray<[semitone: number, delay: number]>> = [
  [
    [C5, 0],
    [E5, 0.09],
    [G5, 0.18],
    [C6, 0.27],
  ],
  [
    [G5, 0],
    [C6, 0.1],
    [E6, 0.2],
  ],
  [
    [E5, 0],
    [G5, 0.08],
    [A5, 0.16],
    [G5, 0.24],
    [C6, 0.34],
  ],
  [
    [C5, 0],
    [G5, 0.1],
    [E5, 0.2],
    [C6, 0.3],
  ],
];

let lastJingle = -1;

/** Correct answer: a random cheerful jingle plus a sparkle (never the same twice in a row). */
export function playSuccess(): void {
  const ac = audio();
  if (!ac) return;
  let i = Math.floor(Math.random() * JINGLES.length);
  if (i === lastJingle) i = (i + 1) % JINGLES.length;
  lastJingle = i;
  const t = ac.currentTime + 0.02;
  for (const [semi, delay] of JINGLES[i]!) bell(ac, note(semi), t + delay);
  const end = t + JINGLES[i]!.at(-1)![1];
  for (let k = 0; k < 4; k++) bell(ac, note(C6 + 12 + k * 2), end + 0.12 + k * 0.05, 0.2, 0.06);
}

/** Star jar full: a longer fanfare. */
export function playFanfare(): void {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + 0.02;
  const melody: Array<[number, number, number]> = [
    [C5, 0, 0.2],
    [C5, 0.15, 0.2],
    [C5, 0.3, 0.2],
    [E5, 0.45, 0.3],
    [D5, 0.7, 0.2],
    [E5, 0.85, 0.2],
    [G5, 1.0, 0.6],
  ];
  for (const [semi, delay, len] of melody) {
    bell(ac, note(semi), t + delay, len + 0.2, 0.2);
    bell(ac, note(semi - 12), t + delay, len + 0.2, 0.08);
  }
}

/** Wrong answer: soft, short, friendly "bloop" (no buzzer!). */
export function playTryAgain(): void {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + 0.02;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(note(C5 - 5), t);
  osc.frequency.exponentialRampToValueAtTime(note(C5 - 12), t + 0.18);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.15, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.3);
}

/** Chest opens / item picked: a short bright pling. */
export function playPling(): void {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + 0.02;
  bell(ac, note(E6), t, 0.25, 0.12);
  bell(ac, note(E6 + 5), t + 0.06, 0.3, 0.1);
}
