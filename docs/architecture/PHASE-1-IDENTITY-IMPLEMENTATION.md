# Phase 1 — identity, tenancy and authorization

**Date:** 2026-10-15  
**Status:** Implementation in progress; migration `0000_phase1_identity_workspaces_access_audit` applied to Neon project `crm-ander-labs`, branch `production`, on 2026-10-15. TypeScript, ESLint, and unit tests pass. No build, E2E, or application bootstrap was run.

## Scope delivered in code

- Better Auth 1.7.7 uses the installed Drizzle adapter 1.7.7 with PostgreSQL, Better Auth-owned identity tables, email/password sessions, secure cookies for HTTPS, 12-hour session lifetime, and public sign-up disabled. Its Next.js adapter is exposed only through `/api/auth/[...all]` on the Node runtime.
- Server Components obtain a principal from Better Auth session headers. The login route, dashboard route group, and logout action use that provider. App Router implementation follows the installed Next.js 16.4 route/layout docs; authentication at the shell does not replace authorization in application code.
- Workspace and project memberships are separate from Better Auth identity. Project membership references both `(workspace_id, project_id)` and `(workspace_id, workspace_membership_id)` so PostgreSQL rejects cross-workspace membership rows.
- A private `auth:bootstrap` CLI creates the initial internal account through Better Auth's official admin `createUser` API and assigns workspace owner membership. The admin plugin exists only in that CLI composition; it is not registered on the web auth handler. Workspace/project role changes and project creation are application use cases, with the mutation and success audit record written in the same Drizzle transaction.
- Workspace/project directories derive user identity from a verified server principal and return only active memberships. Selecting a workspace is resolved against active membership. Project listing also resolves access in the application use case.
- The policy engine is a pure application/domain layer. It denies absent context and unrecognized grants, requires explicit project membership, and combines actor grants with scoped-credential grants. Web session scopes are distinct from future API key and OAuth MCP scopes.
- Audit events include actor/credential, workspace/project, action/resource, outcome and correlation ID. Metadata is allowlisted and secret/PII-like keys are removed before persistence. Denied authorization decisions can be audited. The append-only Drizzle adapter exposes insert only.
- Before applying, the target `public` schema was confirmed empty; the existing Drizzle migration ledger had six earlier entries. `pnpm db:migrate` applied the reviewed additive migration, creating nine public tables and recording the seventh migration entry. Post-migration read-only queries confirmed the tables, migration ledger, and foreign-key constraints. No business or identity rows were created by the migration.

## Task evidence and outstanding acceptance

| Task | Implementation evidence | Still required to close |
|---|---|---|
| F1-01 | Better Auth config, API handler, login form, logout, protected route group, and deployed auth schema | Seeded internal account, DB session smoke, unauthenticated/authenticated E2E |
| F1-02 | Workspace/membership schema deployed, active membership directory, workspace selection, role-management use case and private bootstrap | Run cross-workspace integration tests |
| F1-03 | Project/project-membership schema deployed, composite ownership FKs, authorized directory, creation and membership-management use cases | Run cross-project tests and review project role grants |
| F1-04 | Shared context resolver, default-deny policy, scope intersection; policy unit tests pass | Review permission matrix with operator and route future API/MCP use cases through this policy |
| F1-05 | Audit schema deployed, metadata redaction, append-only writer, deny-decision hook, successful project/membership mutations audited atomically; audit unit tests pass | Verify persistence/redaction against a real application write |

## Security boundaries

- Better Auth proves identity; workspace/project memberships and Ander policies decide access.
- Client-supplied workspace/project IDs are lookup selectors only. Server-side active memberships establish the authorized context.
- Workspace owner/admin may create projects and manage project membership for the workspace; reading project data still requires an active project membership. Project administrators may manage their project members only after that membership is verified.
- No OAuth authorization server, API key plugin, MCP endpoint, or service credential is enabled in this phase. Better Auth session cookies are not delegated MCP Bearer tokens.
- The policy grants are deliberately limited to workspace/project administration and read navigation. Finance, CRM, export, delete, and outreach permissions remain default-deny until their modules define their permissions.
- Logs and audit metadata must not contain raw credential material or unrestricted before/after payloads.

## Operational blockers

1. Verify Better Auth identity/session persistence and audit writes against the migrated database.
2. Configure `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `BOOTSTRAP_ADMIN_NAME`, `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD`, `BOOTSTRAP_WORKSPACE_NAME`, and `BOOTSTRAP_WORKSPACE_SLUG` in ignored local env; these values are currently absent. Then run the operator-only `pnpm auth:bootstrap` procedure. Public self-sign-up remains disabled.
3. Run session E2E and cross-workspace/project integration checks. A build remains intentionally deferred per the user's instruction.

## Rollback

Migration `0000` is applied on the production branch and is additive. It created schema only; no application data was inserted. Do not drop these tables as a rollback. If correction is needed, use a reviewed forward migration that preserves identity, membership, session, and audit history.
