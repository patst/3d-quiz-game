# Speech audio — how to (re)generate clips

All spoken sentences are pre-generated MP3 clips in `public/audio/de/` (ADR-0007).
`npm run check` fails with "sentences have no audio clip" when content changed.

## One-time setup
```bash
python3 -m venv ~/piper-venv
~/piper-venv/bin/pip install piper-tts
mkdir -p ~/piper-voices && cd ~/piper-voices
B=https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/de/de_DE/thorsten_emotional/medium
curl -LO $B/de_DE-thorsten_emotional-medium.onnx -LO $B/de_DE-thorsten_emotional-medium.onnx.json
```
`ffmpeg` must be installed.

## Generate
```bash
PIPER_PYTHON=~/piper-venv/bin/python PIPER_MODEL=~/piper-voices/de_DE-thorsten_emotional-medium.onnx npm run audio:generate
```
Current voice (owner choice, 2026-10-31): **Thorsten emotional, speaker 0 "amused"**
(cheerful), `LENGTH_SCALE` 1.05. `PIPER_SPEAKER` overrides the speaker; set it to an empty
string for single-speaker voices. Hugging Face downloads need `huggingface.co` and
`us.aws.cdn.hf.co` to be reachable.

Only missing clips are synthesised; unused clips are deleted. Changing the voice, speaker or the
speaking rate (`LENGTH_SCALE` in `scripts/generate-audio.ts`) regenerates all clips.
Commit `public/audio/de/` together with the content change.

## Adding speech
- Challenge sentences: add a template with `render` **and** `variants` in
  `src/content/de/speech.ts`.
- Fixed sentences on screens: add them to `staticSpokenTexts` in the same file.
