# Speech audio — how to (re)generate clips

All spoken sentences are pre-generated MP3 clips in `public/audio/de/` (ADR-0007), committed
to the repository. `npm run check` fails with "sentences have no audio clip" when content
changed and clips are missing.

The voice (ADR-0015) is a **designed woman's voice** made with Qwen3-TTS: it was created
once from a written description and is reproduced for every sentence by cloning a committed
reference clip (`scripts/voice/`). Every new clip is transcribed with Whisper and generated
again if its words don't match the sentence.

## One-time setup
You need Node 22, `ffmpeg`, Python 3.12 and, ideally, a GPU. All models are downloaded from
Hugging Face on the first run (~6 GB: `Qwen/Qwen3-TTS-12Hz-1.7B-Base`, the Qwen speech tokenizer,
`openai/whisper-large-v3-turbo`).

### AMD GPU (e.g. Radeon RX 7900 XT) on Linux
Install the AMD GPU driver with ROCm (AMD's "ROCm installation for Linux" guide), then:
```bash
python3.12 -m venv ~/qwen-venv
# PyTorch built for ROCm — pick the current ROCm line from https://pytorch.org/get-started/locally/
~/qwen-venv/bin/pip install torch torchaudio --index-url https://download.pytorch.org/whl/rocm6.4
~/qwen-venv/bin/pip install qwen-tts
~/qwen-venv/bin/python -c "import torch; print(torch.cuda.is_available(), torch.cuda.get_device_name(0))"
```
The last line must print `True` and the card's name (ROCm builds of PyTorch use the name "cuda").
RX 7000 cards (gfx1100) are supported directly. For some other Radeon cards ROCm needs
`HSA_OVERRIDE_GFX_VERSION` (e.g. `10.3.0` for RX 6000) set before running.

### AMD GPU on Windows
Either use **WSL2** (Ubuntu) with AMD's ROCm for WSL and follow the Linux steps inside it, or
install AMD's PyTorch build for Windows (see AMD's "ROCm on Radeon" documentation) into a
Windows venv and then `pip install qwen-tts`. Check with the same `torch.cuda.is_available()`
line.

### NVIDIA GPU (Windows or Linux)
Install a current NVIDIA driver (the CUDA toolkit is not needed; PyTorch brings its own).

Linux / WSL2:
```bash
python3.12 -m venv ~/qwen-venv
~/qwen-venv/bin/pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu128
~/qwen-venv/bin/pip install qwen-tts
~/qwen-venv/bin/python -c "import torch; print(torch.cuda.is_available(), torch.cuda.get_device_name(0))"
```
Windows (PowerShell, Python 3.12 from python.org, `winget install ffmpeg`):
```powershell
py -3.12 -m venv $HOME\qwen-venv
& $HOME\qwen-venv\Scripts\pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu128
& $HOME\qwen-venv\Scripts\pip install qwen-tts
& $HOME\qwen-venv\Scripts\python -c "import torch; print(torch.cuda.is_available(), torch.cuda.get_device_name(0))"
$env:QWEN_PYTHON = "$HOME\qwen-venv\Scripts\python.exe"; npm run audio:generate
```
Harmless messages at start: "SoX could not be found!" (`qwen-tts` checks for it but the
generator doesn't use it; `apt install sox` silences it) and "flash-attn is not installed".

Laptop GPUs often have 4–8 GB of memory. With 8 GB the defaults work; with 6 GB use
`QWEN_BATCH=2`; with 4 GB also `ASR_MODEL=openai/whisper-small`.

### CPU only
```bash
python3.12 -m venv ~/qwen-venv
~/qwen-venv/bin/pip install torch torchaudio qwen-tts
```
On a CPU it works but is slow: about 4–5 seconds of computing per second of speech, so a few new
sentences take minutes, all ~7,000 clips about a day.

## Generate
```bash
QWEN_PYTHON=~/qwen-venv/bin/python npm run audio:generate
```
- Only missing clips are synthesised; unused clips are deleted. A new voice id in
  `scripts/voice/voice.json` regenerates every clip.
- Work is saved every 500 sentences (`AUDIO_CHUNK`); run the command again after an
  interruption and it continues.
- Each clip is checked: Whisper transcribes it and the words must match the sentence
  (`src/audio/transcriptMatch.ts`; spaces, punctuation and number spelling don't count). A clip
  that doesn't match is generated again, up to 3 times (`AUDIO_ATTEMPTS`), and the best try is
  kept. Clips that still don't match are listed in `audio-review.txt` — listen to them.
- Numbers are read as words: the voice gets `spokenForm(text)` (`src/content/de/spokenForm.ts`,
  "1 Kilogramm" → "ein Kilogramm"), while the clip id and the text on screen stay as written.
- `AUDIO_LIMIT=20` makes only the first 20 missing clips, to try the voice; a later full run
  continues from there.
- `QWEN_BATCH` sets how many sentences are spoken at once on the GPU (default 8; lower it if
  memory runs out). `ASR_MODEL` overrides the Whisper model.

Commit `public/audio/de/` together with the content change. Listen to a few new clips.

## Adding speech
- Challenge sentences: add a template with `render` **and** `variants` in
  `src/content/de/speech.ts`.
- Fixed sentences on screens: add them to `staticSpokenTexts` in the same file.
- A number before a feminine noun ("1 Minute") needs the noun in `FEMININE` in
  `src/content/de/spokenForm.ts`, so it is read "eine Minute".

## The voice
`scripts/voice/voice.json` holds the model, the reference clip and its text, the description
the voice was designed from, and the seed. To change the voice (owner decision only): design a
new reference clip with `Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign` (`generate_voice_design` with a
description), add it to `scripts/voice/`, point `refAudio` (and `refText`) to it, and bump `id`. The four
designed candidates (warm, froh, sanft, lehrerin) are kept there with their descriptions.

History: Piper "Thorsten emotional" (v1.4), then Piper "Thorsten high" (v1.13), then the
Qwen3-TTS designed voice (v1.32, ADR-0015).
