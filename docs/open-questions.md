# Open questions for the owner

Answer inline (or in chat); agents move answers into `game-design.md` / ADRs and delete
the question here.

## Game design
1. **Readers or non-readers?** Is the main audience 5-year-olds (pre-readers) or 1st/2nd
   graders? Affects how much German content can rely on reading.
2. **Controls:** OK with *tap-to-walk* + third-person top-down camera instead of a joystick /
   first-person view?
3. **Gates vs. free exploration:** must a challenge be solved to continue (gate), or are
   challenges optional chests while the maze is always solvable?
4. **Difficulty choice:** may the child choose bronze/silver/gold, or should the system
   decide entirely?
5. **Reward focus:** avatar dress-up, pets, sticker book, home base — which 1–2 for v1?
6. **Story/guide character:** do you want a named guide (e.g. a fox "Fred") and a light
   story (rescue friends / collect treasure)?
7. **Subjects for v1:** Mathe + Deutsch only? Later candidates: Uhrzeit, Englisch-Wörter,
   Sachkunde (Tiere, Farben), Logik.
8. **Curriculum alignment:** a specific Bundesland Lehrplan or general Klasse-1 level?
   Specific Anlauttabelle / Schrift (Druckschrift, Grundschrift)?
9. **Multiple children per device?**

## Architecture / operations
10. Approve **Three.js + React overlay** (ADR-0002) vs. Babylon.js?
11. Approve **pre-generated TTS audio** (ADR-0003)? Would you be willing to record a few
    lines yourself later?
12. Approve **local-only, no backend** (ADR-0004)? Any wish for cross-device sync?
13. Hosting: **GitHub Pages** OK? Public or private repo/site?
14. Who playtests? Do you have access to a child in the age range for the M2 playtest?
