/**
 * CI check (ADR-0007): every sentence the game can speak has a pre-generated clip.
 * Fix failures with `npm run audio:generate` (see docs/audio.md).
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ClipManifest } from '../src/audio/clipId';
import { AUDIO_DIR, MANIFEST, spokenClips } from './audio-texts';

const manifest: ClipManifest = existsSync(MANIFEST)
  ? (JSON.parse(readFileSync(MANIFEST, 'utf8')) as ClipManifest)
  : { voice: '', clips: {} };
const missing = spokenClips().filter((c) => !manifest.clips[c.id] || !existsSync(join(AUDIO_DIR, `${c.id}.mp3`)));
if (missing.length > 0) {
  console.error(`${missing.length} sentences have no audio clip, e.g.:`);
  for (const c of missing.slice(0, 10)) console.error(`  ${c.id}  ${c.text}`);
  console.error('Run `npm run audio:generate` (see docs/audio.md).');
  process.exit(1);
}
console.log(`Audio OK: ${Object.keys(manifest.clips).length} clips (${manifest.voice})`);
