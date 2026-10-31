# Game Design Document

**Status:** APPROVED v1.0 (owner, 2026-10-31). Changes require owner sign-off; record them
in the changelog at the end. Items marked **[Q]** are open (see `open-questions.md`).

## 1. Vision
Children (5–7, Vorschule to 2. Klasse) explore small, colourful 3D comic-style mazes with
their own avatar to **rescue lost animal friends**. Along the way they find treasure
chests with challenges. Solving them earns stars; stars fill a star jar that turns into
collectible rewards. The child should feel like an *explorer*, not a *test-taker*.

## 2. Target audience — and what that implies
Both pre-readers (5) and early readers (6–7) are supported. Baseline assumption for v1:
a 5-year-old recognises some digits and can do very easy addition.

| Fact about 5–7 year olds | Design consequence |
|---|---|
| Many cannot read yet or read slowly | Every instruction is **spoken** (German) **and** shown as text. "Vorlesen" is on by default. Answers are tapped (numbers, pictures), never typed. |
| Fine motor skills still developing | Big touch targets (≥ 64 px), no precision dragging, no double-tap. |
| Limited 3D spatial orientation; first-person can cause motion sickness | **Third-person camera from above at an angle** (diorama look). **Tap-to-walk** as main control. |
| Short attention span (~10–15 min) | Mazes take 1–3 min to cross; a session = a few mazes. |
| Frustration ends play | No lives, no timers, no game-over. Wrong answer → hint, try again. |
| Abstract points mean little | Stars are visualised as a **star jar with 10 slots** (counting to 10 is itself practice) that converts into concrete rewards. |
| Big spread in ability | **Adaptive difficulty per skill**, plus child-chosen chest tier. |

## 3. Story & world (v1)
- **Scenario v1: "Tierfreunde retten"** — animal friends got lost in the maze garden.
  Each maze has one lost animal at the goal. Reaching it rescues the animal.
- Guide characters speak all instructions and cheer. Approved names: **Olli** (Eule,
  guide of world 1), **Ida** (Igel) and **Rick** (Waschbär / raccoon) for later worlds.
  Do not use the name "Fini".
- v1 has **one world** (Zauberwald / garden hedge maze). Further worlds with their own
  scenarios (Unterwasser, Weltraum, …) come later via the world-module extension point.

## 4. Core loop
```
start maze → walk → find chest (optional) → solve or skip → stars into jar
     ↑                                                        ↓
 new maze  ←  rescue animal at goal  ←  jar full (10★) → pick 1 of 3 rewards
```
- Each maze has **3–5 chests** and a goal. **The goal is always reachable** — challenges
  never block the path.
- **Skipping:** a child may walk past a chest or close it. If a challenge is open, an
  "Überspringen" button asks for **confirmation** (big ✓ / ✗ icons, spoken question
  "Möchtest du diese Aufgabe wirklich überspringen?"). A skipped chest stays closed and can
  be retried while in the maze.

## 4a. Avatar & profiles
- The child plays a **comic animal**: Hase, Bär, Katze, Frosch, Pinguin (more later),
  in one of 6 colours. Rewards (hats, pets, trails) are added on top of the animal.
- **Local profiles from the start:** up to 6 children per device. Profile screen
  "Wer spielt?" shows each child's animal; the name is optional and typed by a parent.
  Deleting profiles will live in the parents area (behind the parent gate).

## 5. Controls
- **Mobile:** tap on the floor → avatar walks towards it, but only a **short, direct way**
  (max. 6 tiles, never around a hedge). Tapping the chick far away must not solve the
  maze; the child finds the route by tapping step by step.
- **Desktop:** arrow keys / WASD + click-to-walk.
- Camera follows automatically; no manual camera control required.

## 6. Challenges
### 6.1 Concept
A *challenge type* is a self-contained module: subject, trained skills, how to
**generate** an instance for a difficulty level, how to **present** it, how to **check**
it. New types are added without touching maze code.

Difficulty: each type has levels 1..N. A per-child **skill model** recommends the level
(e.g. 2 correct in a row → up, 2 wrong → down).

### 6.2 Chest tiers
Chests come in **bronze / silver / gold** (visible from afar). The child chooses which to
open. Tier = offset from the child's current recommended level (bronze −1, silver ±0,
gold +1) and stars awarded (1 / 2 / 3).

### 6.3 v1 catalogue: math only
German challenges (Anlaut, Silben, Reime, …) follow after v1; the architecture keeps
them in mind (word bank, see architecture.md).

| Type | Example | Levels |
|---|---|---|
| Mengen zählen | "Wie viele Äpfel siehst du?" → tap a number | 1–5 / 1–10 / 1–20 |
| Zahl hören & finden | "Tippe auf die Sieben" | 1–10 / 1–20 / 1–100 |
| Mengen vergleichen | "Wo sind mehr Sterne?" | range, closeness of numbers |
| Plus | "3 + 2 = ?" with pictures → without | ≤5, ≤10, ≤20 (no carry), ≤20 (carry) |
| Minus | "5 − 2 = ?" with pictures → without | same as Plus |
| Muster fortsetzen | 🔴🔵🔴🔵 ? | pattern length/complexity |

All fully auto-generated with a seeded RNG.

### 6.4 Wrong answers
1st wrong → gentle audio ("Versuch es nochmal!"), wrong option fades out.
2nd wrong → visual hint (e.g. counting animation).
3rd wrong → solution is shown and explained; **1 star** for effort regardless of tier.
All outcomes feed the skill model.

## 7. Rewards & progression
- **Stars:** bronze 1 · silver 2 · gold 3 (solved with ≤ 1 wrong try), otherwise 1.
  Skipped = 0.
- **Star jar:** 10 stars → jar full → **reward moment**: the child **chooses 1 of 3**
  offered items. Leftover stars carry over. (Choice instead of random "loot box" → no
  gambling mechanics, more ownership.)
- **Reward categories** (variety keeps collecting interesting):
  1. Avatar items: hats, glasses, capes, shoes, colours.
  2. **Rescued animals** (from maze goals, not from the jar) — choose one as a pet that
     follows the avatar.
  3. Trails/effects (sparkles, footprints) — cheap to make, popular with kids.
  4. Later: home base decoration.
- **Collection album:** shows all collectibles, unfound ones as silhouettes → clear
  "what's next" goal, motivates completion.
- No streaks, no rankings, no time-limited offers.
- Later worlds unlock by number of rescued animals.

## 8. Parents area
- Parent gate (e.g. "Tippe die Zahl dreiundvierzig").
- Per child: practised skills, success rates, enable/disable challenge types,
  "Vorlesen" on/off, optional session time limit.
- Manage child profiles (rename, delete).

## 9. Non-functional
- German only (UI and audio). Code in English.
- Mobile + desktop browsers; installable PWA; works offline.
- No accounts, no server, no tracking; progress stored persistently on the device
  (IndexedDB — note: browser *sessionStorage* would be lost when the tab closes, so it is
  not used for progress).
- Hosted on GitHub Pages, with a preview deployment per pull request (ADR-0005).
- Smooth on mid-range phones (2020-era Android, iPhone 11+).

## 10. Out of scope for v1
German challenges (planned next), more worlds/scenarios, multiplayer, teacher mode,
cloud sync, other languages, speech-recognition answers.

## Changelog
- v1.4 (2026-10-31): guide voice = cheerful "Thorsten emotional (amused)", lively speaking rate (owner choice after voice samples).
- v1.3 (2026-10-31): M2 chests use one tier (2 stars) and fixed levels (Zählen 1–10, Plus ≤ 10 mit Bildern) until adaptive difficulty (M4); answer buttons are sorted ascending.
- v1.2 (2026-10-31): tap-to-walk limited to short, direct walks (owner feedback after M1).
- v1.1 (2026-10-31): Rick is a raccoon (Waschbär).
- v1.0 (2026-10-31): approved. Guide names Olli/Ida/Rick, animal avatars, local profiles
  from the start, pick-1-of-3 rewards confirmed.
