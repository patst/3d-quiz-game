# ADR-0008: Installable PWA with offline support

- **Status:** Accepted (agent decision within roadmap M7; owner review pending)
- **Date:** 2026-11-01
- **Deciders:** agent

## Context
The game should be installable on phones and work without internet (roadmap M7,
game-design §9). PR previews (ADR-0005) are served from the same origin as the main site
(`patst.github.io/3d-quiz-game/pr-preview/pr-N/`), so a service worker registered by the
main site would also control preview URLs.

## Decision
- `vite-plugin-pwa` (Workbox) with `registerType: autoUpdate`: new versions activate on the
  next load without asking the child anything.
- **Precache** the app shell (JS, CSS, HTML, icons, audio manifest). **Do not precache** the
  ~2000 voice clips (~17 MB): they are cached at runtime (CacheFirst) when first played, and
  the parents area offers "Stimme für offline speichern" to fetch all of them.
- Clips are loaded with `fetch()` and played from a blob URL, so the service worker sees a
  full 200 response it can cache (media elements use range requests → 206, not cacheable).
- **PR previews get no service worker** (`disable` when `BASE_PATH` contains `/pr-preview/`),
  and the main worker ignores preview URLs (`navigateFallbackDenylist`, runtime cache
  pattern). Previews therefore always show their own, current build.

## Consequences
- Installable via "Zum Startbildschirm hinzufügen" with icon, name and splash colours.
- After an update the old version may run once more until the next start (autoUpdate).
- Offline service-worker behaviour is only testable on the main build, not on previews.
