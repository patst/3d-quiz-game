# ADR-0009: Learner stage on the profile, curriculum tags on challenge levels

- **Status:** Proposed
- **Date:** 2026-11-01
- **Deciders:** owner / agent

## Context
The owner wants more questions, an age on the player profile, and questions tagged with
the age they suit. Math and German should follow the Niedersachsen curriculum (research, verified
against the ministry PDFs: `docs/curriculum/niedersachsen.md`). Preschool (age 5) needs much more content. The design
must stay extensible, for other federal states, grades 3–4 and new subjects.

Facts that shape the design:
- **Age does not determine the school year.** In NDS the Stichtag is 30 September. Parents
  can defer entry for children born from July to September, younger children can start early,
  and some children repeat a year. The KC states its goals per **double year** (end of Jg. 2,
  end of Jg. 4), not per age.
- Our challenges are **generated**, not a fixed question list. Difficulty lives in a type's
  **levels**, and some types also draw from content lists (words, quiz questions).
- Start levels currently sit in the world config (`forest.chests.challenges[].startLevel`).
  They are the same for every child, and the skill model adapts from there.
- Privacy (ADR-0004): store as little personal data as possible, and only locally.

## Options considered
1. **Store the birth date, derive age and stage.** Pros: the age is always current. Cons:
   personal data; wrong for deferred or early-entry children and repeaters; a full date is
   more than we need.
2. **Store the age in years.** Cons: goes stale; still not the school year.
3. **Store the learner stage plus the school year it was set in, and advance automatically
   on 1 August** (`kita`, `preschool`, `grade1`…`grade4`). Parents pick from "Kindergarten",
   "Vorschule", "1. Klasse"… and can correct it at any time. Pros: maps directly onto the
   curriculum; no birth date; stays current. Cons: one more question during setup.
4. **Tag every question with a `minimumAge`.** Cons: most questions are generated, so
   tagging single questions doesn't fit; age is the wrong unit (see above).
5. **Tag challenge levels (and content items) with a stage range plus curriculum
   competency ids.** Pros: fits the generator model; one place per type; competency ids make
   coverage measurable and allow other curricula later.

## Decision (proposed)
Options **3 + 5**.

### 1. Learner stage (core, pure TS)
`src/core/learner/stage.ts`:
```ts
export const STAGES = ['kita', 'preschool', 'grade1', 'grade2', 'grade3', 'grade4'] as const;
export type StageId = (typeof STAGES)[number];
export interface LearnerInfo {
  stage: StageId;          // stage chosen by a parent …
  schoolYear: number;      // … in this school year (school year 2026/27 → 2026)
  region: 'de-ni';         // curriculum region; other federal states later
}
/** Stage today: advances one step per 1 August since it was set, capped at grade4. */
export function currentStage(info: LearnerInfo, now: Date): StageId;
export function stageRank(s: StageId): number;
```
- `Profile.learner: LearnerInfo | null`. Here `null` means "unknown": the game behaves as it
  does today.
- `createProfile` asks for the stage as one extra step. It uses big picture tiles (Kita, school
  bag 1, school bag 2, …) and spoken labels, and suggests "a grown-up chooses".
- **Migration v8 → v9:** existing profiles get `learner: null`. When such a profile is opened,
  a one-time question asks for the stage; it can be skipped, and it can also be set in the
  Parents area. No guess is made from `createdAt`.

### 2. Curriculum metadata on challenge levels
The `ChallengeType` contract gains per-level metadata:
```ts
export interface LevelInfo {
  /** Lowest and highest stage this level is meant for (inclusive). */
  stages: { min: StageId; max?: StageId };
  /** Curriculum competency ids, e.g. 'ni.ma.zo.addition-20', 'ni.op.ma.menge'. */
  competencies?: readonly string[];
}
export interface ChallengeType<TData> {
  …
  levels: number;                 // unchanged (still 1..levels)
  levelInfo: readonly LevelInfo[]; // length === levels (unit-tested)
}
```
- **Competency catalogue as data:** `src/content/curriculum/de-ni.ts` holds ids, area,
  stage and the source document. Display names are only for the Parents area, in German,
  in content files. A unit test checks that every id used by a type exists in the catalogue.
  Another region would be one more catalogue file. Ids are namespaced by region; levels can
  list ids from several regions.
- **Content items** (words, quiz questions, …) get an optional `minStage` / `maxStage`.
  This mainly matters for word lists, where `Lernwörter` belong to grade 1–2 and long compound
  words should not appear in preschool. Generators filter with a pure helper,
  `forStage(items, stage)`.

### 3. Selection pipeline (one pure function, `core/challenges/selection.ts`)
```
registered types
  ∩ world's type list            (world no longer sets start levels)
  − parents' disabled types
  ∩ session subjects
  → per type: allowed level window for the stage
        [lowest level with min ≤ stage,  highest level with min ≤ stage + 1 ("stretch")]
     drop the type if the window is empty (e.g. "read a sentence" for kita)
  → start level = highest level whose stages contain the stage (entry level)
  → skill model adapts as today, clamped to the window
```
- `learner === null` → window = all levels, start = level 1 (today's behaviour). Start
  levels move from the world config into each type's `levelInfo`, so worlds only list type
  ids.
- Parents can still switch types off. The Parents area shows each type's suggested stages
  and its competencies. A coverage view ("what does my child practise?") is possible later.
- Stored `skills` stay valid. A level the child already reached is clamped into the new
  window, never reset.

### 4. Content roadmap (separate PRs after approval)
- **M13a:** stage model, migration v9, stage picker (create, first open, Parents area),
  `levelInfo` for all 15 existing types, selection pipeline.
- **M13b, preschool pack** (OP ch. 6, KC De annex A2):
  - Anlaut/Endlaut by picture (sound, no letters)
  - Laut- and Silbensynthese
  - Raumlage
  - groß/klein, ordering by size
  - Würfelbilder / fingers at a glance
  - Menge ↔ Zahl
  - Vorgänger/Nachfolger
  - Verteilen
  - shapes and solids
  - Tagesablauf / vorher–nachher
  - Unterschiede finden
  - Gegenteile
  - Oberbegriffe
  - more words with `minStage: 'kita'`
- **M13c, grade 1–2 math (KC):**
  - Zahlenhaus / Zerlegen
  - Kernaufgaben 1+1
  - Verdoppeln / Halbieren
  - Zehner und Einer
  - gerade/ungerade
  - ± up to 100
  - Kernaufgaben 1×1 (×1, ×2, ×5, ×10, squares)
  - Geld
  - Uhr (volle → halbe → Viertelstunde)
  - Symmetrie
  - sicher/möglich/unmöglich
- **M13d, grade 1–2 German (KC):**
  - der/die/das
  - Einzahl/Mehrzahl
  - Wortarten
  - fehlende Buchstabengruppe (sch, ei, au …)
  - d oder t?
  - groß oder klein
  - Satz lesen → Bild
  - Wort passt in den Satz
  - ABC
  - zusammengesetzte Nomen

Each new type follows the existing plug-in contract (architecture §3.1) and adds speech
templates and clips (ADR-0007).

## Consequences
- **Easier:** content can grow without touching core. Curriculum coverage is checkable by a
  test. Other federal states, grades 3–4 and new subjects are additive (a catalogue file,
  `levelInfo`, a new `SubjectId`).
- **Harder:** every new type or level must declare stages (enforced by a test). Clip count
  grows with every new sentence, so audio generation time rises; consider batching.
- The world config loses `startLevel`, so architecture §3.1 and the design doc must be
  updated in the same PR as M13a.
- Open: owner decisions in `open-questions.md` #3. The KC versions in force (2017) were
  verified on 2026-11-01. The 2024 drafts are only used to order content within the 2017
  goals.
