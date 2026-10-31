# ADR-0001: Record architecture decisions in the repository

- **Status:** Accepted
- **Date:** 2026-10-31
- **Deciders:** owner (requirement), agent

## Context
Development is done by AI agents across many sessions with no shared memory. The owner
only steers design and architecture. Agents need a reliable, versioned source of truth.

## Decision
- Lightweight ADRs in `docs/adr/` (template `0000-template.md`), numbered, immutable once
  accepted (superseded, not edited).
- Living documents: `docs/game-design.md`, `docs/architecture.md`, `docs/roadmap.md`,
  `docs/open-questions.md`.
- `CLAUDE.md` at the root is the entry point and lists rules for agents.

## Consequences
Every PR that changes architecture must include an ADR. Docs review is part of PR review.
