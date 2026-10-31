/**
 * Speech output (ADR-0003). M1 only has the fallback provider (browser speechSynthesis
 * with a *local* German voice). Pre-generated clips arrive in M2 behind the same interface.
 */
export interface SpeechProvider {
  speak(text: string): void;
  stop(): void;
}

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

let provider: SpeechProvider | null = null;

export function speech(): SpeechProvider {
  provider ??= new WebSpeechProvider();
  return provider;
}
