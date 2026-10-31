# Game Design Document

**Status:** DRAFT v0.1 — under iteration with the owner. Items marked **[Q]** are open
questions (see `open-questions.md`); items marked **[Proposal]** are agent suggestions not
yet confirmed.

## 1. Vision
Children (5–7, Vorschule to 2. Klasse) explore small, colourful 3D comic-style mazes with
their own avatar. Inside the maze they find "challenge stations". Solving a challenge
opens the way / fills a treasure chest and earns collectible rewards for their avatar and
their home base. The child should feel *explorer*, not *test-taker*.

## 2. Target audience — and what that implies
| Fact about 5–7 year olds | Design consequence |
|---|---|
| Many **cannot read yet** (5–6) or read only slowly (7) | Every instruction is **spoken** (German audio) and visual. Answers are picked by tapping pictures/numbers, never typed. Text is only an addition. |
| Fine motor skills still developing | Big touch targets (≥ 64 px), no drag precision, no double-tap. |
| Spatial orientation in 3D is limited; first-person 3D can cause disorientation / motion sickness | **Third-person camera from above at an angle** (diorama look), not first-person. **[Proposal]** tap-to-walk as main control. |
| Short attention span (~10–15 min) | Mazes are small (1–3 min to cross), a session = a few mazes. Natural stopping points. |
| Frustration ends play | No lives, no timers, no game-over. Wrong answer → friendly hint, try again. |
| Abstract points mean little | Rewards are **concrete and visible**: stickers, hats, pets, decorations. Points/stars only as a secondary currency. |
| Strong spread in ability within the age range | **Adaptive difficulty per skill**, not one global level. |

## 3. Core loop
```
Choose world → walk through maze → reach challenge station → solve challenge
   ↑                                                          ↓
 spend rewards (avatar / home base)  ←  collect reward  ←  path opens / chest opens
```
- Each maze has **3–5 stations** and a **goal** (e.g. treasure, friend to rescue).
- **[Proposal]** Stations act as **gates**: the path continues only after solving. Optional
  side stations (bonus chests) let the child choose extra/harder challenges voluntarily.
- **[Proposal]** Difficulty choice is shown diegetically: bronze / silver / gold chests.
  Gold = harder challenge, bigger reward. The child chooses; the system still adapts the
  actual content to the child's level within that tier.

## 4. Controls
- **Mobile:** tap a spot on the floor → avatar walks there (pathfinding). Optional virtual
  joystick as setting. **[Q]**
- **Desktop:** arrow keys / WASD + mouse click (same tap-to-walk).
- Camera follows automatically; no manual camera control required.

## 5. Challenges
### 5.1 Concept
A *challenge type* is a self-contained module: it knows its subject, the skills it trains,
how to **generate** an instance for a given difficulty, how to **present** it, and how to
**check** the answer. New types can be added without touching the maze code.

Difficulty: each type defines levels 1..N. A per-child **skill model** tracks success per
skill and recommends the level (e.g. 2 correct in a row → up, 2 wrong → down).

### 5.2 Initial catalogue **[Proposal — please prioritise]**
Oriented on German Vorschule / Klasse 1 curriculum (Lehrplan Mathematik/Deutsch Kl. 1–2).

**Mathe**
| Type | Example | Levels | Auto-generated? |
|---|---|---|---|
| Mengen zählen | "Wie viele Äpfel siehst du?" tap 1–10 | quantity range 1–5 / 1–10 / 1–20 | fully |
| Zahlen vergleichen | "Wo sind mehr Sterne?" | range, closeness of numbers | fully |
| Plus/Minus | "3 + 2 = ?" with pictures → without | ≤5, ≤10, ≤20, with/without Zehnerübergang | fully |
| Muster fortsetzen | 🔴🔵🔴🔵 ? | pattern length/complexity | fully |
| Formen erkennen | "Tippe auf das Dreieck" | number of distractors | fully |

**Deutsch**
| Type | Example | Levels | Auto-generated? |
|---|---|---|---|
| Anlaut finden | picture of "Maus" → which letter: M / A / S | number of options, similar sounds | from word bank |
| Silben klatschen | "Wie viele Silben hat Ba-na-ne?" | 1–2 / 1–3 / 1–4 syllables | from word bank |
| Reimpaare | "Was reimt sich auf Haus?" Maus / Hund / Baum | distractor similarity | from word bank |
| Wort lesen | show word "OMA" → tap matching picture | word length, letter set | from word bank |
| Groß/klein Buchstaben | match A ↔ a | — | fully |

"From word bank" = a curated list of German words with tags (picture, syllables, initial
sound, rhyme group, audio). Generators combine entries randomly. The word bank is content,
not code, and can grow independently.

### 5.3 Wrong answers
1st wrong → gentle audio ("Versuch es nochmal!") + wrong option fades out.
2nd wrong → visual hint (e.g. counting animation).
3rd wrong → solution is shown and explained; child still gets a small reward for effort.
Data is fed into the skill model.

## 6. Rewards & progression **[Q: owner preference]**
- **Stars** per solved challenge (1 / 2 / 3 by tier).
- **Collectibles:** avatar items (hats, glasses, capes), pets that follow the avatar,
  stickers for a sticker book.
- **[Proposal] Home base** (Baumhaus / Raumschiff) the child decorates with earned items —
  gives a reason to come back without streaks or pressure.
- **No** loot boxes / random paid-like mechanics, no daily-streak guilt, no ranking
  against other children.
- New worlds/themes unlock by progress (e.g. Wald → Unterwasser → Weltraum).

## 7. Worlds & look
- Comic / toon look: bright colours, toon shading with outlines, chunky low-poly shapes.
- Each world = theme (tile set, colours, music, challenge-station props). Mazes are
  procedurally generated per visit, seeded, with hand-tuned size per age level.
- Friendly guide character that speaks all instructions **[Q: name/character]**.

## 8. Parents area
- Behind a simple parent gate (e.g. "Tippe die Zahl dreiundvierzig" — readable only by
  adults).
- Per child: which skills were practised, success rates, enable/disable subjects,
  optional session time limit.
- Multiple child profiles per device (siblings) **[Q]**.

## 9. Non-functional
- German only (UI and audio). Code in English.
- Runs in mobile and desktop browsers; installable as PWA; works offline.
- No accounts, no server, no tracking; progress stored locally on the device
  **[Q: sync between devices needed?]**.
- Smooth on mid-range phones (target: 2020-era Android, iPhone 11+).

## 10. Out of scope for v1 (candidates for later)
Multiplayer, teacher/class mode, cloud sync, other languages, user-generated mazes,
mini-games that are not challenges (e.g. racing), speech recognition answers.
