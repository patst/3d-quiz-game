# ADR-0003: Spoken instructions — build-time neural TTS clips, browser TTS fallback

- **Status:** Proposed (revised 2026-10-31 after owner asked to evaluate on-the-fly TTS)
- **Date:** 2026-10-31
- **Deciders:** owner (pending), agent

## Context
Pre-readers must hear every instruction. Challenges are auto-generated, so sentences vary.
Owner asked whether speech can be generated **on the fly in the browser**.

## Options considered
| Option | Quality | Offline | Download | Privacy | Notes |
|---|---|---|---|---|---|
| A. **Web Speech API** (`speechSynthesis`, OS voices) | Varies: decent on iOS/macOS ("Anna"), Windows, most Android; robotic or missing on some devices | Only with local voices | 0 | Some voices are cloud voices (e.g. Chrome desktop "Google Deutsch" sends text to Google) — filter on `voice.localService` | Truly on the fly, any sentence. Voice differs per device. |
| B. **Neural TTS in the browser** (Piper/VITS model via ONNX Runtime Web / WASM) | Good, identical everywhere | Yes, after download | ~20–75 MB per German voice + runtime | Fully local | On the fly, but heavy first download for phones; synthesis latency on low-end devices |
| C. **Build-time neural TTS** (same Piper voice, run in CI) → static audio clips | Good, identical everywhere | Yes | Small (all v1 clips ≈ 1–3 MB) | Fully local | Needs sentences known at build time |
| D. Cloud TTS at runtime | Very good | No | 0 | Sends data off device | Violates ADR-0004 |
| E. Human recordings | Best | Yes | Small | Local | Not agentic; can replace C clip by clip later |

Key insight: generated **math** prompts are combinations of a small template set and
numbers 0–100 (+ picture nouns like "Äpfel"). Every possible sentence can be stitched
from pre-generated clips, so on-the-fly generation is not *needed* for v1.

## Decision (proposed)
- **Primary: C.** Prompts are expressed as `SpeechLine` = template id + slots; the audio
  layer plays clip sequences. A CI step generates/updates clips; a check fails if a
  template or slot value has no clip.
- **Fallback: A.** If a clip is missing (e.g. new content during development), use
  `speechSynthesis` with a **local** German voice; if none exists, show text only.
- **Not now: B.** Revisit when German challenges need free-form sentences that cannot be
  stitched, or as an optional "download better voice" setting. The audio layer has one
  `SpeechProvider` interface so B can be added without touching challenges.

## Consequences
- Consistent, child-friendly voice on all devices with a tiny download.
- `scripts/generate-audio` + CI job; voice model downloaded in CI only, never shipped.
- Stitched sentences may sound slightly choppy; mitigate with whole-sentence clips for
  the most frequent prompts.
