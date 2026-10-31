import { clipId, type ClipManifest } from './clipId';

/**
 * Speech output (ADR-0003, ADR-0007).
 * 1. Pre-generated clip (same friendly voice on every device, works offline).
 * 2. Fallback: browser speechSynthesis with a *local* German voice.
 * 3. Otherwise silent (text is always shown too).
 */
export interface SpeechProvider {
  speak(text: string): void;
  stop(): void;
}

const AUDIO_BASE = `${import.meta.env.BASE_URL}audio/de/`;

class WebSpeechProvider implements SpeechProvider {
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (!('speechSynthesis' in window)) return;
    const pick = () => {
      const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('de'));
      // Local voices only: remote voices would send text to a third party (ADR-0004).
      this.voice = voices.find((v) => v.localService) ?? null;
    };
    pick();
    window.speechSynthesis.addEventListener?.('voiceschanged', pick);
  }

  speak(text: string): void {
    if (!this.voice) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = this.voice;
    u.lang = this.voice.lang;
    u.rate = 0.95;
    u.pitch = 1.1;
    window.speechSynthesis.speak(u);
  }

  stop(): void {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }
}

/** 0.05 s of silence (8 kHz mono WAV) used to unlock audio on iOS. */
function silentWav(): string {
  const samples = 400;
  const buf = new DataView(new ArrayBuffer(44 + samples));
  const str = (o: number, s: string) => [...s].forEach((c, i) => buf.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF');
  buf.setUint32(4, 36 + samples, true);
  str(8, 'WAVEfmt ');
  buf.setUint32(16, 16, true);
  buf.setUint16(20, 1, true);
  buf.setUint16(22, 1, true);
  buf.setUint32(24, 8000, true);
  buf.setUint32(28, 8000, true);
  buf.setUint16(32, 1, true);
  buf.setUint16(34, 8, true);
  str(36, 'data');
  buf.setUint32(40, samples, true);
  for (let i = 0; i < samples; i++) buf.setUint8(44 + i, 128);
  let bin = '';
  new Uint8Array(buf.buffer).forEach((b) => (bin += String.fromCharCode(b)));
  return `data:audio/wav;base64,${btoa(bin)}`;
}

class ClipSpeechProvider implements SpeechProvider {
  private manifest: Promise<Set<string>>;
  /** One reused element: once unlocked by a user gesture, iOS lets it play later clips. */
  private readonly audio = new Audio();
  /** Incremented on every speak/stop so late-loading clips of old requests stay silent. */
  private request = 0;

  constructor(private readonly fallback: SpeechProvider) {
    this.manifest = fetch(`${AUDIO_BASE}manifest.json`)
      .then((r) => (r.ok ? (r.json() as Promise<ClipManifest>) : { voice: '', clips: {} }))
      .then((m) => new Set(Object.keys(m.clips)))
      .catch(() => new Set<string>());
    const unlock = () => {
      this.audio.src = silentWav();
      this.audio.play().catch(() => undefined);
    };
    document.addEventListener('pointerdown', unlock, { once: true, capture: true });
  }

  speak(text: string): void {
    const request = ++this.request;
    this.stopPlayback();
    const id = clipId(text);
    void this.manifest.then((ids) => {
      if (request !== this.request) return;
      if (!ids.has(id)) {
        this.fallback.speak(text);
        return;
      }
      this.audio.src = `${AUDIO_BASE}${id}.mp3`;
      this.audio.play().catch(() => this.fallback.speak(text));
    });
  }

  stop(): void {
    this.request++;
    this.stopPlayback();
  }

  private stopPlayback(): void {
    this.audio.pause();
    this.fallback.stop();
  }
}

let provider: SpeechProvider | null = null;

export function speech(): SpeechProvider {
  provider ??= new ClipSpeechProvider(new WebSpeechProvider());
  return provider;
}
