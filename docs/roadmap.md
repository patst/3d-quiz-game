# Roadmap

**Status:** living document. Principle: ship a playable vertical slice early and test it
with a real child before building breadth.

| Milestone | Goal | Done when |
|---|---|---|
| **M0 Design & architecture** ✅ | Owner approves game-design + architecture + ADRs | done 2026-10-31 |
| **M1 Tech spike** ✅ | Project skeleton, CI + deploy + PR-preview workflows (ADR-0005). Procedural maze rendered in toon style, avatar walks by tap/keys on phone + desktop. Local profiles with animal avatar |  Playable URL on a phone at 30+ fps |
| **M2 Vertical slice** 🧪 ready for playtest | 1 world, 1 maze with 3 stations, 2 math challenge types (Mengen zählen, Plus ≤10), audio, stars, skip with confirmation, rescue animal at goal | **Playtest with a 5–7 year old**; findings written to `docs/playtests/` (see `docs/playtests/README.md`) |
| **M3 Rewards & profile** (PRs: M3a jar+rewards, M3b animals+pets, M3c parents area) | Star jar → choose-1-of-3 rewards, collection album, pets, parent gate + profile management | Progress survives reload |
| **M4 Adaptive difficulty** | Skill model, levels per challenge, bronze/silver/gold chests | Unit-tested skill model; second playtest |
| **M5 Math breadth** | Full v1 math catalogue | — |
| **M6 German challenges** | Word bank ≥ 150 words, Anlaut/Silben/Reime | — |
| **M7 Polish & PWA** | Offline install, parents area stats, performance pass | Lighthouse PWA pass, works offline |
