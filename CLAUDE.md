# Guide for AI agents

This repository is developed **agentically**. The human owner steers game design and
architecture; agents do the implementation. Read this file first, every session.

## Project in one sentence
A browser-based 3D maze game (mobile + desktop) for German-speaking children aged 5–7,
where solving small learning challenges (math, German, …) inside the maze earns rewards.

## Where the truth lives
| Topic | File | Status |
|---|---|---|
| Game design (what we build) | `docs/game-design.md` | DRAFT – being iterated with owner |
| Architecture (how we build it) | `docs/architecture.md` | PROPOSED – not yet approved |
| Decisions and their reasons | `docs/adr/` | see status in each ADR |
| Open questions for the owner | `docs/open-questions.md` | living list |
| Roadmap / milestones | `docs/roadmap.md` | DRAFT |

## Rules for agents
1. **No game code until the owner approves** `game-design.md` and `architecture.md`
   (status changes to APPROVED). Until then, only edit docs.
2. **Every architectural decision gets an ADR** (`docs/adr/NNNN-title.md`, use
   `docs/adr/0000-template.md`). Never silently change an accepted ADR — write a new one that
   supersedes it.
3. If a requirement is unclear, add it to `docs/open-questions.md` instead of guessing.
   Small, reversible choices may be made by agents; record them in the PR description.
4. **Language:** code, comments, identifiers, docs, commits → English.
   Everything the child sees or hears → German, and only via the content/locale files
   (never hard-coded strings in components).
5. **Children-first constraints are non-negotiable** (see `game-design.md` §"Design
   principles"): no ads, no tracking, no external network calls at runtime, no time
   pressure, no punishment for wrong answers, every instruction must be available as audio.
6. Keep `docs/` in sync with the code in the same PR that changes behaviour.
