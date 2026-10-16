# ADR-002 — Align Drizzle Kit and ORM release lines

- **Status:** Accepted
- **Date:** 2026-10-15
- **Decision owners:** Ander CRM engineering
- **Scope:** Phase 0 migration tooling

## Context

The approved dependency baseline declared `drizzle-orm@^0.45.4` and `drizzle-kit@^1.0.0-rc.4`. The lockfile resolved ORM `0.45.4` and Kit `1.0.0-rc.5-ab785fc`. Running the installed Kit CLI failed immediately with `ERR_PACKAGE_PATH_NOT_EXPORTED` for `drizzle-orm/_relations`. Kit v1 is a new release line and requires an aligned ORM v1 upgrade; that would change more of the approved stack than necessary.

## Decision

Keep the stable `drizzle-orm@^0.45.4` line and use stable `drizzle-kit@^0.31.11`. Keep `@types/node` on `^24.0.0` to match the selected Node 24 runtime and Vitest 5's peer range. Drizzle Kit remains a development dependency. Migration generation and execution continue to be explicit commands and are never run during build.

## Consequences

- The installed CLI now starts and reports Kit `0.31.11` with ORM `0.45.4`.
- The existing Neon WebSocket Pool client and Drizzle configuration remain on the stable ORM API.
- The Kit v1 release line can be reconsidered later as a deliberate upgrade with an ORM upgrade and migration rehearsal.
- This does not prove schema generation, transactional behavior, or migration execution against Neon. Those checks still require a disposable development database and reviewed schema.

## Verification

- Before the change, `pnpm exec drizzle-kit --version` failed with `ERR_PACKAGE_PATH_NOT_EXPORTED` for `drizzle-orm/_relations`.
- After the change, it reports `drizzle-kit: v0.31.11` and `drizzle-orm: v0.45.4`.
- `pnpm peers check` passes after updating `@types/node` to v24 for Vitest 5.

## References

- [Drizzle ORM 0.31 release notes](https://orm.drizzle.team/docs/latest-releases/drizzle-orm-v0310) state ORM/Kit compatibility beginning with Kit 0.22, making Kit 0.31 the smaller alignment for ORM 0.45.
- [Drizzle ORM v1 upgrade guide](https://orm.drizzle.team/docs/upgrade-v1) documents the coordinated upgrade to the ORM and Kit RC line and its relation-query migration steps.
