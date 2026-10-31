import { clipId } from '../src/audio/clipId';
import { allSpokenTexts } from '../src/content/de/speech';

/** Every sentence the game can speak, with its clip id. */
export function spokenClips(): Array<{ id: string; text: string }> {
  return allSpokenTexts().map((text) => ({ id: clipId(text), text }));
}

export const AUDIO_DIR = 'public/audio/de';
export const MANIFEST = `${AUDIO_DIR}/manifest.json`;
