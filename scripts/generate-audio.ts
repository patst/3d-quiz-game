/**
 * Generates one speech clip per sentence the game can say (ADR-0007).
 *
 *   PIPER_PYTHON=/path/to/venv/bin/python \
 *   PIPER_MODEL=/path/to/de_DE-thorsten_emotional-medium.onnx \
 *     npm run audio:generate
 *
 * Only missing clips are synthesised; clips no longer needed are deleted. Requires
 * ffmpeg. See docs/audio.md for setup.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ClipManifest } from '../src/audio/clipId';
import { AUDIO_DIR, MANIFEST, spokenClips } from './audio-texts';

const python = process.env.PIPER_PYTHON ?? 'python3';
const model = process.env.PIPER_MODEL;
if (!model || !existsSync(model)) {
  console.error('Set PIPER_MODEL to a Piper .onnx voice (see docs/audio.md).');
  process.exit(1);
}
/** >1 = slower. 1.05 = lively but clear (owner feedback: "faster and more cheerful"). */
const LENGTH_SCALE = 1.05;
/** Speaker of multi-speaker voices; thorsten_emotional: 0 = "amused" (cheerful). */
const numSpeakers = (JSON.parse(readFileSync(`${model}.json`, 'utf8')) as { num_speakers?: number }).num_speakers ?? 1;
// Single-speaker voices (e.g. thorsten-high) take no speaker id.
const SPEAKER = process.env.PIPER_SPEAKER ?? (numSpeakers > 1 ? '0' : '');
// The manifest's voice id includes the settings, so changing them regenerates every clip.
const voiceName = `${model.split('/').pop()!.replace(/\.onnx$/, '')}#${SPEAKER}@${LENGTH_SCALE}`;

mkdirSync(AUDIO_DIR, { recursive: true });
const old: ClipManifest = existsSync(MANIFEST)
  ? (JSON.parse(readFileSync(MANIFEST, 'utf8')) as ClipManifest)
  : { voice: voiceName, clips: {} };
const sameVoice = old.voice === voiceName;

const clips = spokenClips();
const missing = clips.filter((c) => !sameVoice || !existsSync(join(AUDIO_DIR, `${c.id}.mp3`)));
console.log(`${clips.length} sentences, ${missing.length} to synthesise with ${voiceName}`);

if (missing.length > 0) {
  const wavDir = mkdtempSync(join(tmpdir(), 'piper-'));
  const input = missing.map((c) => JSON.stringify(c)).join('\n') + '\n';
  const res = spawnSync(python, ['scripts/piper_batch.py', model, wavDir, String(LENGTH_SCALE), SPEAKER], { input, stdio: ['pipe', 'ignore', 'inherit'] });
  if (res.status !== 0) process.exit(res.status ?? 1);
  for (const c of missing) {
    // Mono MP3, 24 kHz, ~32 kbit/s: small and plays in every browser.
    execFileSync('ffmpeg', [
      '-loglevel', 'error', '-y', '-i', join(wavDir, `${c.id}.wav`),
      '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse',
      '-ac', '1', '-ar', '24000', '-b:a', '32k', join(AUDIO_DIR, `${c.id}.mp3`),
    ]);
  }
  rmSync(wavDir, { recursive: true, force: true });
}

// Remove clips that are no longer used.
const wanted = new Set(clips.map((c) => `${c.id}.mp3`));
for (const file of readdirSync(AUDIO_DIR)) {
  if (file.endsWith('.mp3') && !wanted.has(file)) rmSync(join(AUDIO_DIR, file));
}

const manifest: ClipManifest = { voice: voiceName, clips: Object.fromEntries(clips.map((c) => [c.id, c.text])) };
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1) + '\n');
console.log(`Wrote ${MANIFEST}`);
