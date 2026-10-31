# ADR-0005: Hosting on GitHub Pages with per-PR preview deployments

- **Status:** Accepted (owner, 2026-10-31)
- **Date:** 2026-10-31
- **Deciders:** owner, agent

## Context
No backend (ADR-0004) → the game is a static site. Owner wants to publish for testing and
to test every pull request in a real browser/phone before merging.

## Decision
GitHub Actions workflows:
1. **`ci.yml`** (every push/PR): install, lint, typecheck, unit tests (Vitest), build,
   E2E smoke tests (Playwright, mobile + desktop viewport).
2. **`deploy.yml`** (push to `main`): build and publish to the root of the `gh-pages`
   branch → `https://patst.github.io/3d-quiz-game/`.
3. **`pr-preview.yml`** (PR opened/updated/closed): build with base path
   `/3d-quiz-game/pr-preview/pr-<N>/`, publish into that folder of `gh-pages`, comment the
   URL on the PR, remove the folder when the PR closes (e.g. `rossjrw/pr-preview-action`).

Pages source = "Deploy from branch: `gh-pages`" (required so main site and previews can
coexist; the artifact-based Pages deployment only supports one site).

## Consequences
- **Owner action required once:** repository Settings → Pages → Source: branch `gh-pages`;
  Settings → Actions → Workflow permissions: read & write. The repository is public (owner, 2026-10-31).
- All deployments share one origin (`patst.github.io`) and therefore one IndexedDB/
  localStorage. Save keys are namespaced by deployment (main vs. `pr-<N>`) so previews never
  corrupt the main save.
- PRs from forks get no preview (no write token) — acceptable for this project.
- Vite `base` path is set from an environment variable in the build.
