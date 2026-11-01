# Speech audio — how to (re)generate clips

All spoken sentences are pre-generated MP3 clips in `public/audio/de/` (ADR-0007).
`npm run check` fails with "sentences have no audio clip" when content changed.

## One-time setup
```bash
python3 -m venv ~/piper-venv
~/piper-venv/bin/pip install piper-tts
mkdir -p ~/piper-voices && cd ~/piper-voices
B=https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/de/de_DE/thorsten/high
curl -LO $B/de_DE-thorsten-high.onnx -LO $B/de_DE-thorsten-high.onnx.json
```
`ffmpeg` must be installed.

## Generate
```bash
PIPER_PYTHON=~/piper-venv/bin/python PIPER_MODEL=~/piper-voices/de_DE-thorsten-high.onnx npm run audio:generate
```
Current voice (owner choice, 2026-11-01): **Thorsten high** (single speaker, clearest
pronunciation of the Piper German voices), `LENGTH_SCALE` 1.05. The earlier cheerful
"Thorsten emotional / amused" voice pronounced words strangely (owner feedback).
Cheerfulness now comes from jingles (src/audio/sfx.ts) instead of the voice. `PIPER_SPEAKER` overrides the speaker of multi-speaker voices (default 0; single-speaker
voices are detected from the model's `.onnx.json`). Hugging Face downloads need `huggingface.co` and
`us.aws.cdn.hf.co` to be reachable.

Only missing clips are synthesised; unused clips are deleted. Changing the voice, speaker or the
speaking rate (`LENGTH_SCALE` in `scripts/generate-audio.ts`) regenerates all clips.
Commit `public/audio/de/` together with the content change.

## Adding speech
- Challenge sentences: add a template with `render` **and** `variants` in
  `src/content/de/speech.ts`.
- Fixed sentences on screens: add them to `staticSpokenTexts` in the same file.
