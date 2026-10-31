# ADR-0003: Audio-first instructions with pre-generated German speech

- **Status:** Proposed
- **Date:** 2026-10-31
- **Deciders:** owner (pending), agent

## Context
Many 5–6 year olds cannot read. Every instruction must be spoken. Challenges are
auto-generated, so the set of sentences is large but structured.

## Options considered
1. **Browser Web Speech API** at runtime — zero assets, but German voice quality and
   availability vary wildly across devices (some Android/desktop have none), offline unreliable.
2. **Cloud TTS at runtime** — good quality, but needs network, costs, and sends data off
   device (privacy issue for kids' app).
3. **Offline TTS at build time** (e.g. Piper, open-source German voices) → static audio
   files. Generated prompts are built from **sentence templates + clips** (numbers 0–100,
   words from the word bank).
4. Human recordings — best quality, but not agentic-friendly; can replace (3) later file by file.

## Decision (proposed)
Option 3, with Web Speech API as fallback for missing clips during development. Audio
manifest keyed by string id; a CI check fails if a string has no audio.

## Consequences
- Challenge generators must express prompts as `SpeechLine[]` (template id + slots), not
  free text.
- A script `scripts/generate-audio` is part of the content pipeline.
- Owner may later swap in recorded voices for the guide character.
