# packages/contracts

Shared schema definitions consumed by both `apps/web` (TypeScript) and `apps/graph-service` (Python).

## Files

- `episode.ts` — TypeScript interfaces
- `episode.py` — Pydantic v2 models

## Keeping schemas in sync

These two files define the **same** data shapes. When you change one, you **must** update the other to match.

Fields to keep aligned:
- `EpisodeType` enum values
- `EpisodeInput` fields, types, and defaults
- `EpisodeResponse` fields and types
- `HealthResponse` fields and types

## Ownership

These contracts are owned by the W1 (scaffolding) workstream. No other workstream may modify these files without explicit approval.
