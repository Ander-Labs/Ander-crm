# Phase 0 foundation audit

**Date:** 2026-10-15  
**Scope:** repository inventory, compatibility audit, and non-destructive foundation setup  
**Status:** In progress; this is evidence for Phase 0, not a Phase 0 exit approval.

## Repository inventory

- Root App Router is present at `app/`; no `src/` directory exists. The only routes are the generated starter home page and root layout. There are no CRM modules, API routes, DB schemas, migrations, Better Auth setup, composition root, or MCP endpoint yet.
- Existing UI work includes 18 shadcn-style components under `components/ui/`, configured for Base UI by `components.json`; `app/globals.css` imports Tailwind v4, `tw-animate-css`, and `shadcn/tailwind.css`.
- TypeScript is strict with repository-root `@/*` aliases. ESLint uses Next core-web-vitals and TypeScript presets. Next 16.4 build accepts `cacheComponents`, `partialPrefetching`, and `experimental.agentFeedback`; the installed docs say Cache Components requires Node.js runtime and Partial Prefetching requires Cache Components.
- There is no `drizzle.config.*`, `.env.example`, Vitest config, Playwright config, CI workflow, or typecheck/test script in the initial checkout. There is no `docs/design/dashboard-reference.png`.
- The requested ADR subpath `docs/architecture/decisions/ADR-001-auth-mcp.md` does not exist; the approved ADR is at `docs/architecture/ADR-001-auth-mcp.md` and was read.
- Initial Git state was `master` with local modifications to `AGENTS.md`, `app/globals.css`, `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml`, plus untracked `components/`, `docs/`, and `lib/`. These were present before this task and have been preserved.

## Resolved toolchain and package inventory

Observed versions: Node.js `v24.21.0`, pnpm `12.10.1`, Next `16.4.0`, React/React DOM `19.3.0`, TypeScript `5.9.3`, `@types/node` `24.0.0`, Tailwind `4.3.3`, `@base-ui/react` `1.9.0`, shadcn `4.21.4`, Better Auth and Drizzle adapter `1.7.7`, Drizzle ORM `0.45.4`, Drizzle Kit `0.31.11`, Neon driver `1.2.0`, MCP server `2.3.1`, `mcp-handler` `2.3.0`, Zod `4.6.7`, Vitest `5.0.4`, Playwright `1.64.1`, ESLint `9.39.5`.

The initial `drizzle-kit@^1.0.0-rc.4` range resolved `1.0.0-rc.5-ab785fc`. Its CLI failed against the approved `drizzle-orm@0.45.4` with `ERR_PACKAGE_PATH_NOT_EXPORTED` for `drizzle-orm/_relations`. [ADR-002](decisions/ADR-002-drizzle-version-alignment.md) records the minimal correction: retain stable ORM 0.45.4, pin stable Kit `^0.31.11`, and align `@types/node` to Node 24/Vitest 5. The new Kit CLI reports both installed versions successfully. Schema generation and migration behavior remain unverified because the repository has no schema and no disposable database.

The Better Auth Drizzle adapter API and PostgreSQL provider are compatible at the documented integration level, but Ander has no auth schema or DB connection to exercise. `@better-auth/api-key`, `@better-auth/agent-auth`, and `@better-auth/i18n` are installed; API key scopes and the experimental agent plugin are not proof of end-user authorization. No MCP OAuth provider/plugin appears in the manifest. Keep MCP closed until a single OAuth server choice, audience/scopes, revocation, and client flow are tested.

MCP SDK v2, `mcp-handler` v2, Zod v4, Node 24, and Next Route Handlers align at the published compatibility level. A live JSON-RPC/HTTP compatibility test has not yet been run, so F0-05 remains open. Do not expose a ping endpoint before authentication and deny-by-default behavior are verified.

Neon HTTP is suitable for individual queries but is not the chosen path for interactive transactions. A Node-compatible Neon WebSocket/Pool driver is the candidate for transactional use cases; validation against a disposable database is still required. No database URL or auth secret was present in the environment example because that file did not exist. The new `.env.example` contains variable names only.

## Foundation changes in this session

- Added scripts for TypeScript, Vitest, and Playwright and a Node-environment Vitest config.
- Added an application error contract that exposes stable sanitized messages while retaining an internal `cause` for logging.
- Added a Pino logger with common credential fields redacted.
- Added an App Router HTTP smoke test and Playwright configuration.
- Added a GitHub Actions CI workflow for frozen install, typecheck, lint, unit tests, build, Chromium installation, and the Playwright smoke test.
- Added a names-only `.env.example`.
- Added a Drizzle Kit PostgreSQL config and an explicitly invoked Neon WebSocket Pool client for transaction-capable database use. No schema or migration was created.
- Moved the shadcn CLI from production dependencies to dev dependencies because it is a development-time generator; the dependency version is unchanged.
- Replaced incompatible Drizzle Kit 1.0 RC with stable 0.31.11 and updated `@types/node` from 20 to 24 to satisfy Vitest 5 and match the selected Node runtime. See ADR-002.
- Updated the README from generic create-next-app instructions to the project's setup, validation, and architecture references. Added ignore rules for generated Playwright output and allowed the names-only `.env.example` through the existing `.env*` ignore rule.

No production database was contacted, no tables or migrations were created, and no external OAuth integration or MCP route was enabled.

## Verification evidence

| Command | Result |
|---|---|
| `node --version` / `pnpm --version` | Node `v24.21.0` / pnpm `12.10.1` |
| `pnpm list --depth 0` | Resolved top-level versions listed above |
| `pnpm install --frozen-lockfile --lockfile-only` | Passed, lockfile passes supply-chain policy (897 entries); this validates metadata/lock consistency, not a clean full install |
| `pnpm exec drizzle-kit --version` | Passed after alignment: Kit `0.31.11`, ORM `0.45.4` |
| `pnpm peers check` | Passed after updating Node types to v24 |
| `pnpm typecheck` | Passed (`tsc --noEmit`) |
| `pnpm lint` | Passed |
| `pnpm test` | Passed: 1 file, 1 test |
| `pnpm build` | Passed: optimized build, TypeScript, and static generation for `/` and `/_not-found` |
| `pnpm test:e2e` | Passed: 1 App Router route smoke test against the production server |
| `git diff --check` | Passed (only Git line-ending notices for pre-existing modified files) |

The first E2E configuration used `next dev` and timed out after 120 seconds before the development server became ready. It now runs against the built production server, after `pnpm build`; the smoke test then passed. The CI workflow has not run on a hosted runner. `git remote -v` returned no remotes, so there is no PR/CI evidence yet.

## Decisions and blockers

- No material architectural decision is proposed for ADR-001. Its Better Auth identity boundary, independent authorization policy, OAuth requirement for remote MCP, and closed-by-default security remain appropriate.
- Do not wire Better Auth yet: the Drizzle auth schema must be reviewed/generated and tested before claiming persistence works. `BETTER_AUTH_SECRET` is intentionally blank until supplied locally.
- F0-03 requires an isolated disposable database to verify Neon transactions, schema generation, and migration behavior. No database credential was available.
- F0-04 needs a dev-only Better Auth schema/adapter smoke test; the adapter's documented shape is compatible, but integration remains unverified.
- F0-05/F0-06 need an installed-version MCP HTTP protocol spike and selection of one OAuth Authorization Server approach. Do not use `agent-auth` as a substitute without a separate review.
- F0-09 (Domain Model, ERD, permission matrix, MCP catalog) still needs a reviewed design pass. The Blueprint concepts are not yet implemented schemas or complete policies.
- The initial route is still the generated Next starter; dashboard/product UI is not part of this foundation change.

## Phase 0 task state

See `docs/ROADMAP_v2.0.md`: F0-01 is DONE from repository inspection; F0-02, F0-03, F0-07, and F0-08 are IN_PROGRESS pending all acceptance checks. F0-04 through F0-06 and F0-09 remain TODO pending the spikes/reviews listed above.

## User-approved transition and subsequent F1 evidence (2026-10-15)

The user approved advancing out of Phase 0 while accepting technical carryover; this is an administrative gate decision, not evidence that the open criteria passed. The original inventory above records the repository state before Phase 1 changes. Since then, F1 added auth/workspace/project/audit schemas and `drizzle/0000_phase1_identity_workspaces_access_audit.sql`. Drizzle Kit generated the migration locally (nine tables, no database connection); schema application and transaction behavior still require a disposable database. Better Auth session and adapter configuration now exist, but no auth request was run. The Phase 1 document and roadmap carry the current status and evidence.
