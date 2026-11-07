# ADR-0015: Designed voice with Qwen3-TTS, generated locally, every clip checked by Whisper

- **Status:** Proposed (owner wants "more realistic speech", free; woman's voice chosen
  2026-11-07; final voice pick and listening check pending). Supersedes the Piper parts of
  ADR-0007 (generator, voice); whole-sentence clips, clip ids and committing clips stay.
- **Date:** 2026-11-07
- **Deciders:** owner / agent

## Context
The Piper voice "Thorsten high" (v1.13) is clear but sounds flat and robotic. The owner asked for a
more realistic voice that costs nothing. Options were compared with samples of real game
sentences (comparison page shared in the PR, 2026-11-07):
- **Cloud services** at build time: Google Chirp 3 HD (1 M characters/month free, billing account
  needed), Azure neural voices (free tier F0 does not grant use of the audio; paid ≈ $3 for all
  clips), Amazon Polly (12 months, 100 k generative characters/month). All need an account.
- **Open models**: Qwen3-TTS (Apache-2.0), Chatterbox Multilingual (MIT), Kokoro German
  (Apache-2.0, Thorsten only), Zonos (Apache-2.0, untested). XTTS-v2, Voxtral, Fish and F5 German
  are non-commercial only.
- The owner has an AMD Radeon RX 7900 XT (20 GB), supported by PyTorch for ROCm.

Generative models sound more natural but are not fully reliable: in the samples Qwen once said
"Auf dem" instead of "Mit dem" and read "1 Kilogramm" as "Ehm Kilogramm"; Chatterbox dropped a
word once. A learning game must say exactly what is on screen.

## Decision
1. **Voice:** Qwen3-TTS 1.7B. A woman's voice is **designed once** from a written description
   (`VoiceDesign` model), so no real person is imitated. Its reference clip and text are
   committed in `scripts/voice/` and every sentence is spoken by **cloning** that clip with the
   `Base` model, which keeps the voice identical across ~7,000 clips. Seeds are fixed.
2. **Numbers as words:** the voice reads `spokenForm(text)` (`src/content/de/spokenForm.ts`,
   unit-tested, no digits left in any game sentence). Clip ids and screen text don't change.
3. **Every clip is checked:** Whisper transcribes it; `matches()` compares letters, ignoring
   spaces, punctuation and number spelling, and allows at most 2 letter edits in a long sentence
   (1 in short, 0 in a single word), so a swapped word is always caught. Mismatches are generated
   again (up to 3 tries, best kept); remaining ones are listed for a human to listen to.
4. **Generated locally** with `npm run audio:generate` on a GPU (AMD via ROCm, NVIDIA) or, slowly,
   on a CPU; resumable in chunks. CI still only checks that every clip exists (ADR-0007).
5. Piper and `scripts/piper_batch.py` are removed. Chatterbox stays the fallback if Qwen's
   German disappoints after the full run.

## Consequences
- More natural voice, still free, offline at play time and private (ADR-0004 unchanged).
- Regenerating all clips takes about an hour on the owner's GPU instead of minutes with Piper;
  contributors without a GPU can generate a few new clips on a CPU (minutes) or leave it to a
  maintainer (AGENTS.md §6).
- New dependency at build time only: Python with PyTorch, `qwen-tts`, Hugging Face models (~6 GB).
- Clip size grows slightly (natural pauses); MP3 settings unchanged.
- Letter sounds for Lautsynthese (M12) are still open; a designed voice may be able to speak them
  with suitable spelling, to be tried separately.
