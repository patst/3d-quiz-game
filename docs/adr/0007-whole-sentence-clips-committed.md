# ADR-0007: Whole-sentence voice clips, generated with Piper and committed

- **Status:** Accepted (refines ADR-0003; agent decision within the approved approach)
- **Date:** 2026-10-31
- **Deciders:** agent (owner approved ADR-0003 and PR C scope)

## Context
ADR-0003 chose build-time neural TTS with stitched clips (template + number clips) and a
CI step that generates audio. While implementing it:
- The number of distinct sentences is small: **~500** for all M2 challenges and screens.
- Stitched number clips sound choppy; whole sentences sound natural.
- The voice model (~63 MB) and Piper (Python) would have to be installed in every CI run;
  Hugging Face downloads are not always reachable from build environments.

## Decision
1. **One clip per whole sentence.** Every speech template declares all its parameter
   variants (`variants()` in `src/content/de/speech.ts`); `allSpokenTexts()` lists every
   sentence the game can say.
2. Clip file name = `clipId(text)` (stable 53-bit hash, `src/audio/clipId.ts`), so the
   runtime finds a clip from the text alone. `public/audio/de/manifest.json` lists all clips.
3. Clips are generated **locally** with `npm run audio:generate` (Piper voice
   `de-thorsten-low`, CC0, speaking rate ×1.25 slower, MP3 24 kHz mono 32 kbit/s) and
   **committed**. CI only runs `npm run audio:check`, which fails if any sentence lacks a
   clip. A unit test checks that every sentence a challenge generator can produce is
   enumerated.
4. Runtime order: clip → browser voice (local German voices only) → text only.
   One reused `<audio>` element, unlocked on the first tap (iOS).

## Consequences
- Same friendly voice on every device, works offline, ~4 MB total, loaded per clip on demand.
- New content (templates, numbers > 20, new words) requires re-running the generator;
  CI tells the agent when it forgot.
- Free-form German sentences in M6 (word bank) multiply the clip count by the word list;
  still small (hundreds), so the approach scales for v1.
- Swapping the voice (e.g. a recorded human voice) only replaces files with the same ids.
