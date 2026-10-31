/**
 * Stable file id for a spoken sentence (cyrb53 hash, base36). Shared by the clip generator
 * script and the runtime, so a clip is found by its text alone.
 */
export function clipId(text: string): string {
  const normalized = text.normalize('NFC').trim();
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

/** Shape of `public/audio/de/manifest.json`. */
export interface ClipManifest {
  voice: string;
  /** clip id → spoken text */
  clips: Record<string, string>;
}
