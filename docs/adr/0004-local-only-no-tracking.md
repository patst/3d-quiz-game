# ADR-0004: Local-only data, no accounts, no tracking

- **Status:** Accepted (owner, 2026-10-31)
- **Date:** 2026-10-31
- **Deciders:** owner, agent

## Context
Users are young children in Germany (DSGVO / GDPR, Art. 8 consent for children's data).
A backend adds cost, legal duties and operational work.

## Decision
- Static site, no backend. All progress in IndexedDB on the device (persistent; not `sessionStorage`, which is cleared when the tab closes). Hosting: see ADR-0005.
- No analytics, no ads, no third-party requests at runtime (fonts/assets self-hosted).
- Export/import of a save file for backup / moving devices.

## Consequences
- No cross-device sync in v1. If needed later, a new ADR introduces an optional,
  parent-controlled sync.
- Learning analytics only visible locally in the parents area.
