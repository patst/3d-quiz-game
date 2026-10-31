# ADR-0002: Three.js + TypeScript + React UI overlay as game stack

- **Status:** Accepted (owner, 2026-10-31)
- **Date:** 2026-10-31
- **Deciders:** owner, agent

## Context
Requirements: 3D comic look, runs in mobile + desktop browsers, small download, extensible,
and — critically — **developed entirely by AI agents**. That last point favours
code-first, text-only, well-documented tools with lots of public example code, and
disfavours editor-centric engines with binary scene files.

## Options considered
| Option | Pros | Cons |
|---|---|---|
| **Three.js** (vanilla, TS) | Largest web-3D ecosystem & example corpus (agents know it best), small (~150 KB gz), total control, easy toon shading/outlines | Not a full engine: we build input, scene mgmt, pathfinding ourselves (small for a maze game) |
| React Three Fiber | Declarative scenes, same model as UI | Extra abstraction; React re-render pitfalls in game loop; harder to keep core engine-agnostic |
| Babylon.js | Full engine (GUI, physics, inspector), TS-native, good mobile support | Larger bundle (~1 MB+), smaller example corpus, its GUI weaker than DOM for big kid-friendly UI |
| PlayCanvas | Strong mobile perf | Workflow centred on cloud editor → poor fit for agentic dev |
| Godot (web export) | Real engine, editor, good 2D/3D | 30–40 MB WASM download, slow start on phones, iOS Safari quirks, scene files edited best in editor |
| Unity WebGL | Mature | Heavy builds, poor mobile web, binary assets, editor-dependent — bad fit |

## Decision
- **Three.js** for the 3D maze world, wrapped in `src/render/`.
- **React (DOM overlay)** for all 2D UI incl. challenge screens: crisp text, big
  accessible buttons, easy layout across phone/desktop, easy to test.
- **Pure-TS `core/`** independent of both, so rendering tech could be swapped later.
- Vite, Vitest, Playwright, PWA plugin.

## Consequences
- We must write a small amount of engine glue (input → tap-to-walk, grid pathfinding,
  camera follow). Acceptable for a grid maze.
- Challenge screens are DOM, not 3D. Stations in the maze are 3D; when the child reaches
  one, a 2D overlay opens (with a 3D-styled frame). This is a deliberate simplicity trade-off.
