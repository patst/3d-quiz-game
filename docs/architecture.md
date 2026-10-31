# Architecture

**Status:** PROPOSED — awaiting owner approval. Rationale for key choices is in `docs/adr/`.

## 1. Tech stack (see ADR-0002)
| Concern | Choice |
|---|---|
| Language | TypeScript (strict) |
| Build / dev server | Vite |
| 3D rendering | Three.js (vanilla, wrapped in our own thin layer) |
| 2D UI (menus, challenge screens, parents area) | React DOM overlay on top of the canvas |
| State | Small typed store (Zustand) for UI state; game core is plain TS |
| Persistence | IndexedDB (via `idb-keyval`), versioned save format with migrations |
| Audio | Howler.js; pre-generated German speech files (see ADR-0003) |
| Offline / install | PWA via `vite-plugin-pwa` |
| Tests | Vitest (unit, core logic), Playwright (E2E smoke on mobile + desktop viewports) |
| Lint/format | ESLint + Prettier |
| CI/CD | GitHub Actions → GitHub Pages (static hosting) |

## 2. Layering
```
┌──────────────────────────────────────────────────────────┐
│ app/          bootstrapping, routing between screens     │
├──────────────┬──────────────────────┬────────────────────┤
│ ui/ (React)  │ render/ (Three.js)   │ audio/             │
│ menus, HUD,  │ maze scene, avatar,  │ speech queue,      │
│ challenge    │ camera, input,       │ music, sfx         │
│ views        │ toon materials       │                    │
├──────────────┴──────────────────────┴────────────────────┤
│ core/  (pure TypeScript, NO DOM / Three.js imports)      │
│  maze generation · game session · skill model ·          │
│  rewards/inventory · save format · RNG                   │
├──────────────────────────────────────────────────────────┤
│ modules/  plug-ins: challenges/*, worlds/*               │
│ content/  data: word bank, locale (de), audio manifest   │
└──────────────────────────────────────────────────────────┘
```
Rules:
- `core/` must not import from `ui/`, `render/` or `audio/` → fully unit-testable, and
  agents can reason about game rules without a browser.
- Communication core → presentation via typed events (`GameEvent` union) and read-only
  state snapshots.
- All randomness goes through a seeded RNG (`core/rng.ts`) → reproducible mazes and
  challenges in tests and bug reports.

## 3. Extension points
### 3.1 Challenge types (`src/modules/challenges/<id>/`)
```ts
export interface ChallengeType<TData = unknown, TAnswer = unknown> {
  id: string;                      // "math.count-objects"
  subject: SubjectId;              // "math" | "german" | ...
  skills: SkillId[];               // e.g. ["math.counting.1-10"]
  levels: number;                  // 1..levels
  generate(ctx: { rng: Rng; level: number; content: ContentRepo }): ChallengeInstance<TData>;
  check(instance: ChallengeInstance<TData>, answer: TAnswer): CheckResult; // correct + hint level
  View: React.ComponentType<ChallengeViewProps<TData, TAnswer>>;           // presentation
  speech(instance: ChallengeInstance<TData>): SpeechLine[];               // what the guide says
}
```
Each module registers itself in `modules/challenges/index.ts`. Adding a challenge =
one folder + one line of registration + tests. Every module ships a generator property
test ("for 1000 seeds × each level: instance is valid and solvable").

### 3.2 Worlds / themes (`src/modules/worlds/<id>/`)
A world declares: tile set (meshes/materials), palette, music, station prop, maze size
range, unlock condition. The maze generator is theme-agnostic.

### 3.3 Later: game modes
The session layer (`core/session`) is written against a `GameMode` interface so that
non-maze modes (e.g. a short mini-game) can be added later without rewriting
challenges or rewards.

## 4. Content pipeline
- `content/de/strings.ts` — every UI/speech text, keyed.
- `content/words/*.json` — word bank: `{ word, syllables, initialSound, rhymeGroup, image, audio }`.
- Speech audio is **generated at build/dev time** from text by an offline TTS
  (candidate: Piper with a German voice) into `public/audio/`, listed in a manifest.
  Generated challenge prompts are composed from fixed sentence templates + number/word
  clips so that every possible sentence has audio. (ADR-0003)
- Art: CC0 asset packs (e.g. Kenney, Quaternius) + procedural geometry with a shared
  toon material and outline pass. Licenses tracked in `ASSETS.md`.

## 5. Persistence
Local only (ADR-0004). One save document per child profile:
`{ version, profile, inventory, skillModel, progress, settings }`. Migrations in
`core/save/migrations.ts`. Export/import as file for backup.

## 6. Performance budget
- Initial download < 5 MB (before world assets), each world < 5 MB.
- 60 fps target, 30 fps floor on mid-range phones; instanced meshes for maze tiles,
  ≤ 100 draw calls, device-pixel-ratio capped at 2.

## 7. Proposed directory layout
```
src/
  app/ core/ render/ ui/ audio/
  modules/challenges/<id>/ modules/worlds/<id>/
content/
public/audio/ public/models/
tests/e2e/
docs/ (game-design, architecture, adr/, roadmap, open-questions)
```
