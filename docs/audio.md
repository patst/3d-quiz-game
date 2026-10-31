# Speech audio — how to (re)generate clips

All spoken sentences are pre-generated MP3 clips in `public/audio/de/` (ADR-0007).
`npm run check` fails with "sentences have no audio clip" when content changed.

## One-time setup
```bash
python3 -m venv ~/piper-venv
~/piper-venv/bin/pip install piper-tts
curl -L -o /tmp/thorsten.tgz https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-de-thorsten-low.tar.gz
mkdir -p ~/piper-voices && tar xzf /tmp/thorsten.tgz -C ~/piper-voices
```
`ffmpeg` must be installed.

## Generate
```bash
PIPER_PYTHON=~/piper-venv/bin/python PIPER_MODEL=~/piper-voices/de-thorsten-low.onnx npm run audio:generate
```
Only missing clips are synthesised; unused clips are deleted. Changing the voice or the
speaking rate (`LENGTH_SCALE` in `scripts/generate-audio.ts`) regenerates all clips.
Commit `public/audio/de/` together with the content change.

## Adding speech
- Challenge sentences: add a template with `render` **and** `variants` in
  `src/content/de/speech.ts`.
- Fixed sentences on screens: add them to `staticSpokenTexts` in the same file.
