/**
 * Generates one speech clip per sentence the game can say (ADR-0007, voice: ADR-0015).
 *
 *   QWEN_PYTHON=/path/to/venv/bin/python npm run audio:generate
 *
 * The voice is defined in scripts/voice/voice.json (Qwen3-TTS, cloned from a committed
 * reference clip). Every clip is transcribed with Whisper; clips whose words don't match the
 * sentence (src/audio/transcriptMatch.ts) are generated again (up to MAX_ATTEMPTS) and the best one is kept. Sentences that
 * still don't match are listed for a human to listen to.
 *
 * Only missing clips are synthesised (or all, when the voice changed); clips no longer needed
 * are deleted. Work is saved every chunk, so an interrupted run continues where it stopped.
 * Requires ffmpeg. See docs/audio.md for setup (AMD GPU via ROCm, NVIDIA, or CPU).
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ClipManifest } from '../src/audio/clipId';
import { spokenForm } from '../src/content/de/spokenForm';
import { AUDIO_DIR, MANIFEST, spokenClips } from './audio-texts';
import { letterEdits, matches } from '../src/audio/transcriptMatch';

const VOICE_FILE = 'scripts/voice/voice.json';
const PROGRESS = 'scripts/.audio-progress.json';
const REVIEW = 'audio-review.txt';
const CHUNK = Number(process.env.AUDIO_CHUNK ?? 500);
const MAX_ATTEMPTS = Number(process.env.AUDIO_ATTEMPTS ?? 3);
/** Try the voice on the first N missing sentences; progress is kept, the manifest isn't touched. */
const LIMIT = process.env.AUDIO_LIMIT ? Number(process.env.AUDIO_LIMIT) : undefined;

const python = process.env.QWEN_PYTHON ?? 'python3';
const voice = JSON.parse(readFileSync(VOICE_FILE, 'utf8')) as { id: string };

mkdirSync(AUDIO_DIR, { recursive: true });
const old: ClipManifest = existsSync(MANIFEST)
  ? (JSON.parse(readFileSync(MANIFEST, 'utf8')) as ClipManifest)
  : { voice: voice.id, clips: {} };
const progress = existsSync(PROGRESS)
  ? (JSON.parse(readFileSync(PROGRESS, 'utf8')) as { voice: string; done: string[] })
  : { voice: voice.id, done: [] as string[] };
if (progress.voice !== voice.id) Object.assign(progress, { voice: voice.id, done: [] });
const done = new Set(progress.done);

const clips = spokenClips();
const hasClip = (id: string) => existsSync(join(AUDIO_DIR, `${id}.mp3`));
const missing = clips
  .filter((c) => !hasClip(c.id) || (old.voice !== voice.id && !done.has(c.id)))
  .slice(0, LIMIT);
console.log(`${clips.length} sentences, ${missing.length} to synthesise with ${voice.id}`);

const review: string[] = [];
for (let start = 0; start < missing.length; start += CHUNK) {
  const chunk = missing.slice(start, start + CHUNK);
  console.log(`Chunk ${start / CHUNK + 1}/${Math.ceil(missing.length / CHUNK)}: ${chunk.length} sentences`);
  const work = mkdtempSync(join(tmpdir(), 'voice-'));
  const bestDir = join(work, 'best');
  mkdirSync(bestDir);
  const best = new Map<string, { edits: number; ok: boolean; heard: string }>();
  let todo = chunk;
  for (let attempt = 0; attempt < MAX_ATTEMPTS && todo.length > 0; attempt++) {
    if (attempt > 0) console.log(`  attempt ${attempt + 1}: ${todo.length} clips did not match, trying again`);
    const attemptDir = join(work, `a${attempt}`);
    mkdirSync(attemptDir);
    const input = todo.map((c) => JSON.stringify({ id: c.id, say: spokenForm(c.text), attempt })).join('\n') + '\n';
    const res = spawnSync(python, ['scripts/qwen_batch.py', VOICE_FILE, attemptDir], {
      input,
      stdio: ['pipe', 'pipe', 'inherit'],
      maxBuffer: 64 * 1024 * 1024,
    });
    if (res.status !== 0) process.exit(res.status ?? 1);
    // Libraries print banners on stdout too; results are the JSON lines.
    for (const line of res.stdout.toString().split('\n').filter((l) => l.startsWith('{"id"'))) {
      const { id, heard } = JSON.parse(line) as { id: string; heard: string };
      const text = chunk.find((c) => c.id === id)!.text;
      const edits = letterEdits(text, heard);
      if (!best.has(id) || edits < best.get(id)!.edits) {
        best.set(id, { edits, ok: matches(text, heard), heard });
        copyFileSync(join(attemptDir, `${id}.wav`), join(bestDir, `${id}.wav`));
      }
    }
    todo = todo.filter((c) => !best.get(c.id)?.ok);
  }
  for (const c of chunk) {
    // Trim silence, even out loudness; mono MP3, 24 kHz, ~32 kbit/s plays in every browser.
    execFileSync('ffmpeg', [
      '-loglevel', 'error', '-y', '-i', join(bestDir, `${c.id}.wav`),
      '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-18:TP=-2',
      '-ac', '1', '-ar', '24000', '-b:a', '32k', join(AUDIO_DIR, `${c.id}.mp3`),
    ]);
    done.add(c.id);
    const b = best.get(c.id)!;
    if (!b.ok) review.push(`${c.id}.mp3\t${c.text}\theard: ${b.heard}`);
  }
  rmSync(work, { recursive: true, force: true });
  writeFileSync(PROGRESS, JSON.stringify({ voice: voice.id, done: [...done] }));
}

if (review.length > 0) {
  writeFileSync(REVIEW, review.join('\n') + '\n');
  console.log(`${review.length} clips still differ from their sentence after ${MAX_ATTEMPTS} tries.`);
  console.log(`Listen to them (list in ${REVIEW}); fix the sentence or rerun with AUDIO_ATTEMPTS=5.`);
}
if (LIMIT !== undefined) {
  console.log(`AUDIO_LIMIT: made ${missing.length} clips; run without it to finish (progress is kept).`);
  process.exit(0);
}

// Remove clips that are no longer used.
const wanted = new Set(clips.map((c) => `${c.id}.mp3`));
for (const file of readdirSync(AUDIO_DIR)) {
  if (file.endsWith('.mp3') && !wanted.has(file)) rmSync(join(AUDIO_DIR, file));
}

const manifest: ClipManifest = { voice: voice.id, clips: Object.fromEntries(clips.map((c) => [c.id, c.text])) };
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1) + '\n');
rmSync(PROGRESS, { force: true });
console.log(`Wrote ${MANIFEST}`);
