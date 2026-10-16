# Ander CRM

Ander CRM is a private internal platform for managing ventures, projects, CRM, sales, finance, documents, analytics, AI, automations, and secure MCP access. Implementation follows the approved architecture and roadmap; phases are delivery order, not a reduced product scope.

## Local setup

Use Node.js 24 and pnpm 12.10.1. Copy `.env.example` to `.env.local` and fill in development-only values when exercising database or authentication integrations. Never commit `.env.local` or real credentials.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

The root route sends authenticated operators to the protected dashboard and unauthenticated visitors to the internal login. Public account creation is disabled.

For the first internal owner in a disposable development database, set the bootstrap-only values in ignored `.env.local`, apply the reviewed migration with `pnpm db:migrate`, then run `pnpm auth:bootstrap`. The command provisions through Better Auth's server API, assigns workspace owner membership, and never exposes an admin HTTP route. Do not use production credentials for this setup command.

## Validation commands

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

The Playwright smoke test uses the production server, so run `pnpm build` first. CI runs the same checks and installs Chromium on its runner.

## Architecture and status

- [Architecture Blueprint](docs/architecture/ARCHITECTURE_BLUEPRINT_v2.0.md)
- [Authentication and MCP ADR](docs/architecture/ADR-001-auth-mcp.md)
- [Roadmap](docs/ROADMAP_v2.0.md)
- [Phase 0 foundation audit](docs/architecture/PHASE-0_FOUNDATION.md)
- [Phase 1 identity implementation](docs/architecture/PHASE-1-IDENTITY-IMPLEMENTATION.md)
