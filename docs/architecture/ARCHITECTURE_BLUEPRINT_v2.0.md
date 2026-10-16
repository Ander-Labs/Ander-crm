# Ander CRM — Architecture Blueprint v2.0

**Date:** 2026-10-15  
**Status:** Approved design direction; technical integrations pending validation  
**Product:** Internal AI-operable CRM and business operations platform  
**Architecture:** Next.js modular monolith + feature-first hexagonal modules + native remote MCP

## 1. Purpose, success and scope
Ander CRM centralizes workspaces, initiatives (AISaaGrowth, AIMPY, future ventures), B2B companies and decision makers, lead research, qualification, sales opportunities, activities, proposals, costs, documents, analytics and AI. Goal: a complete internal operations platform across all approved CRM modules. Phasing orders engineering work; it does not reduce the final functional scope.

Success for first usable release: authenticated operator can select workspace/project, add company/contact, record source and consent/legitimate-interest context where appropriate, create lead/opportunity, move pipeline stage, schedule follow-up, see due activities and retrieve scoped data through MCP read tools. No real outreach should be sent without approval.

Out of scope unless expressly approved: public CRM SaaS commercialization, external tenant self-signup, CRM subscription billing, marketplace, unsupervised outreach, microservices, custom auth implementation, own LLM training, universal data lake. Finance within the CRM remains fully in scope; a separate general-purpose ERP is not assumed.

## 2. Architecture decisions
| ID | Decision | Status |
|---|---|---|
| ADR-001 | Better Auth direct + Drizzle adapter; distinct web, API-key and OAuth MCP flows | Approved direction, OAuth integration spike required |
| ADR-002 | One Next.js 16 App Router modular monolith, no `src/` | Approved |
| ADR-003 | Hexagonal modules and shared use cases for UI/API/MCP/jobs | Approved |
| ADR-004 | Neon PostgreSQL + Drizzle, pgvector later | Approved |
| ADR-005 | shadcn/ui Base UI + Tailwind v4, not Radix default | Approved |
| ADR-006 | Native MCP v2 via official server SDK; mcp-handler candidate | Approved direction, runtime spike required |
| ADR-007 | Workspace/project scoped authorization and auditable mutations | Mandatory |
| ADR-008 | Async job provider (Inngest candidate), S3-compatible storage (R2 candidate) | Deferred implementation |

See `decisions/ADR-001-auth-mcp.md` for OAuth and credential distinctions.

## Verified user-supplied package baseline (2026-10-15)
These are **declared package.json versions**, not proof of successful runtime integration. Use the actual `pnpm-lock.yaml` and `pnpm list` for resolution.

| Package | Declared version |
|---|---|
| next / react / react-dom | 16.4.0 / 19.3.0 / 19.3.0 |
| better-auth / @better-auth/drizzle-adapter | ^1.7.7 / ^1.7.7 |
| @better-auth/api-key / @better-auth/i18n | ^1.7.7 / ^1.7.7 |
| @better-auth/agent-auth | ^0.6.2 (review stability and purpose) |
| @modelcontextprotocol/server / mcp-handler | ^2.3.1 / ^2.3.0 |
| drizzle-orm / drizzle-kit | ^0.45.4 / ^1.0.0-rc.4 (RC requires validation) |
| @neondatabase/serverless | ^1.2.0 |
| @base-ui/react / shadcn | ^1.9.0 / ^4.21.4 |
| ai / @ai-sdk/openai | ^7.0.140 / ^4.0.93 |
| @tanstack/react-table / recharts | ^9.3.1 / 3.8.0 |
| tailwindcss / typescript / vitest | ^4 / ^5 / ^5.0.4 |
| pnpm | 12.10.1 |

Other declared packages include `@dnd-kit/*`, `react-hook-form`, `zod`, `decimal.js`, `date-fns`, `pino`, `next-themes`, `@aws-sdk/s3-request-presigner`, `@playwright/test`, `tsx`, `dotenv` and `lucide-react`. **Do not invent installed packages**: `@aws-sdk/client-s3`, `next-intl`, `papaparse`, `@better-auth/mcp`, `@better-auth/oauth-provider`, `@testing-library/react`, `jsdom` and `prettier` are **not present in the supplied manifest**. Some might be transitive; add explicitly only when selected and needed. `@types/papaparse` is present without `papaparse` runtime. Check whether `shadcn` belongs in devDependencies, and whether `cn` / `@shadcn/helpers` are actually used. Verify the installed MCP packages' APIs against their matching versions before coding; do not assume legacy v1 imports.

## 3. Context and trust boundaries
```text
Browser / human  ── HTTPS + session ───► Next.js UI / Server Actions ──┐
API integration  ── HTTPS + API key ───► API route adapters ────────────┤
MCP clients      ── HTTPS + OAuth ─────► /api/mcp (JSON-RPC 2.0) ───────┤
Job worker       ── signed internal job ─► job adapters ────────────────┤
                                                                       ▼
                                                       APPLICATION USE CASES
                                                       policy + validation + audit
                                                                       │
                                                                       ▼
                                                          DOMAIN + PORTS
                                                                       │
                                                                       ▼
                                                 DRIZZLE / NEON / R2 / AI / JOBS
```
Security boundary: authenticate at ingress AND authorize each use case/resource. Browser, MCP, and jobs never get direct database authority. Scope must be resolved from trusted membership and verified credential claims, not untrusted tool arguments.

## 4. Repository structure
```text
ander-crm/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── crm/
│   │   ├── sales/
│   │   └── projects/
│   └── api/
│       ├── auth/[...all]/route.ts
│       └── mcp/route.ts
├── modules/
│   ├── identity/
│   ├── workspaces/
│   ├── projects/
│   ├── companies/
│   ├── contacts/
│   ├── leads/
│   ├── sales/
│   ├── activities/
│   ├── finance/
│   ├── documents/
│   ├── analytics/
│   └── knowledge/
│       # each as needed: domain/, application/, infrastructure/, presentation/, index.ts
├── integrations/
│   └── mcp/
│       ├── server/
│       ├── registry/
│       ├── auth/
│       ├── tools/
│       └── resources/
├── composition/
├── components/ui/                # shadcn Base UI
├── components/layout/
├── shared/
├── drizzle/
├── tests/{unit,integration,e2e}/
├── docs/{architecture,design}/
├── public/
├── components.json
├── AGENTS.md
├── pnpm-lock.yaml
└── package.json
```
`app/` is at the **root**. `@/*` must map to `./*`; do not create `src/`. Do not create every empty directory prematurely.

## 5. Hexagonal contracts
- **Domain:** entities, invariants, domain events, value objects, domain errors. Framework-independent.
- **Application:** commands/queries, use cases, ports, DTOs, transaction orchestration, policies. No SQL or Next imports.
- **Infrastructure:** Drizzle repository adapters, Better Auth identity adapter, Neon client, R2, AI provider, jobs.
- **Presentation:** React components and transport adapters. No direct SQL.
- **Composition:** dependency wiring, request-scoped principal and tenant context, lifecycles.
- **Cross-module:** import public exports only, avoid cycles; use application contracts or events. Prefer transactionally consistent local calls over distributed RPC.

Example flow: `POST MCP sales_create_opportunity_draft` -> validate schema -> authenticate OAuth -> resolve workspace membership -> authorize `sales.opportunity:create` -> application use case -> repository port -> Drizzle -> audit event -> structured MCP result. UI invokes the same use case.

## 6. Identity and permissions
Better Auth is the **identity/session system**, with Drizzle adapter. `@better-auth/api-key` is installed for explicitly issued integration credentials, subject to granular scope/revocation controls. `@better-auth/agent-auth` is installed but experimental suitability must be evaluated before use; it is not a prerequisite for MCP.

Remote MCP requires a **standards-compliant OAuth flow** where supported clients can discover authorization metadata, obtain user-consented scoped tokens, and present them as Bearer credentials. `@better-auth/mcp` / OAuth provider plugin are candidates **not shown in the user-supplied package manifest**. Evaluate compatibility and avoid double-registering overlapping OAuth providers. Distinguish personal API key from OAuth access token. Do not treat a raw session token as a general delegated token.

Authorization matrix baseline:
| Resource | Viewer | Member | Admin | Owner | MCP |
|---|---|---|---|---|---|
| Workspace settings | read limited | read limited | edit | manage | explicit scope and role |
| Company/contact | read | create/update | manage | manage | `crm:read` / `crm:write` + resource check |
| Lead/opportunity | read | create/update | manage | manage | `sales:read` / `sales:write` + project check |
| Finance | deny by default | project-limited | finance policy | manage | separate `finance:*` scopes |
| Credentials/permissions | deny | deny | restricted | manage | no broad agent access |
| Outreach send / destructive action | deny | approval-gated | approval-gated | approval-gated | verified human approval required |

This is an initial **policy design**, not a complete permission matrix. Define specific permissions and membership rules in Phase 1.

## 7. MCP protocol and tool design
- Primary transport: **Streamable HTTP** with JSON-RPC 2.0 POST; optional SSE response stream / GET as supported by selected SDK; legacy standalone SSE is not the primary transport.
- Endpoint: `app/api/mcp/route.ts`; `@modelcontextprotocol/server` 2.x and `mcp-handler` 2.x installed according to user manifest. **Validate actual APIs and peer dependencies** before implementation.
- Authenticate all relevant requests, including stream and lifecycle endpoints. Check issuer, resource/audience, expiry, scopes, token revocation and client authorization. Bind identity and workspace scope at each invocation.
- Registry metadata: name, description, Zod input/output schema, permission, OAuth scopes, risk, approval requirement, idempotency and rate limits.
- Initial read tools: `crm_list_companies`, `crm_search_contacts`, `crm_list_leads`, `sales_list_opportunities`, `activities_list_due`, `projects_list`.
- Safe write tools after auth: `crm_create_contact`, `crm_create_lead`, `sales_create_opportunity_draft`, `activities_create_followup`.
- Later: `finance_get_project_profitability`, `documents_create_quote_draft`, `knowledge_search`.
- High risk: `outreach_send`, bulk export, deletion, invoice issue and payment actions require separate approval workflow and audit. Prefer drafts.
- Result envelopes: stable resource IDs, paginated cursor, explicit errors, redaction and `correlationId`. No unrestricted SQL, file paths, secrets, generic HTTP or code execution.
- Test matrix: valid/invalid bearer, expired/revoked tokens, insufficient scope, wrong workspace, wrong project, prompt injection in retrieved text, malformed JSON-RPC, repeated writes, high-risk approval bypass.
- Real ChatGPT/Codex compatibility must be proven against deployed HTTPS server and supported connector. Do not claim connectivity based on local success alone.

## 8. Domain model and data ownership
| Module | Core concepts | Notes |
|---|---|---|
| Identity | User, Session, Credential, Membership, Role, Permission | Better Auth owns its tables; domain maps identities |
| Workspaces | Workspace, ProjectMembership | Boundary for all customer data |
| Projects | Project, ProjectBudget | Business initiative, not a software task |
| Companies | Company, CompanyAlias, ExternalIdentifier | Workspace-scoped dedupe |
| Contacts | Contact, CompanyContact, ContactMethod | Professional data provenance and lawful-use metadata |
| Leads | Lead, LeadSource, Qualification | Project-specific lead with company/contact links |
| Sales | Pipeline, Stage, Opportunity, OpportunityStageHistory | Deal amount, currency, expected close |
| Activities | Activity, Task, Reminder, Interaction | Linked to contacts, companies, opportunities |
| Finance | Expense, Revenue, Quote, Invoice, Payment, FXRate | Drafts first, explicit money semantics |
| Documents | Document, DocumentVersion, Attachment | R2 pointers, signed access |
| Analytics | MetricDefinition, Snapshot | Derived views; source of truth elsewhere |
| Knowledge | KnowledgeSource, Chunk, Embedding | pgvector deferred |
| Platform | AuditEvent, ApprovalRequest, OutboxEvent, IdempotencyKey | Cross-cutting infrastructure |

Model rules: each tenant-owned record has workspace identity; project-owned records include project identity where needed. Unique keys and foreign keys enforce ownership; application checks verify permissions. Use NUMERIC or integer minor units, explicit ISO currency and exchange-rate timestamp; distinguish forecast vs actual. Never use JS floats for accounting. Implement retention, redaction and deletion rules for professional contact data.

## 9. Data and migrations
- Neon PostgreSQL with Drizzle schema split by module; consolidated migration pipeline and single migration ownership.
- `drizzle-kit@^1.0.0-rc.4` is **release candidate** in manifest; test schema generation, migration SQL and runtime with installed `drizzle-orm@^0.45.4` before trusting it. Consider pinning compatible stable versions by ADR if needed.
- Verify Neon driver transaction support and select appropriate connection strategy for transactional use cases; do not assume HTTP client supports every transaction pattern.
- Index `workspace_id`, project foreign keys, stage/order, activity due dates, external IDs; tenant-aware unique constraints.
- Use migration review, backup/recovery plan, non-destructive forward migration, separate deployment migration step. Do not run migration implicitly inside every `next build`.
- pgvector is a future PostgreSQL extension, not a separate vector database.

## 10. UI and experience
Use shadcn/ui configured with Base UI primitives and Tailwind v4; avoid Radix as default. Visual reference `docs/design/dashboard-reference.png` is aspirational. Dashboard: workspace/project selector, search, KPI cards, sales funnel/Kanban, due activities, recent events and assistant access. Provide responsive layout, keyboard navigation, accessible labels, focus management, loading/empty/error states, permission-aware controls, currency and locale formatting. Data must be real or explicitly labeled demo.

## 11. Integrations and infrastructure
- Files: S3-compatible object storage, Cloudflare R2 candidate. `@aws-sdk/s3-request-presigner` is declared, but `@aws-sdk/client-s3` is **not** in supplied manifest; add before implementing client.
- Email: transactional provider later; outbound sales email needs opt-out/compliance, rate controls, approval and deliverability strategy.
- AI: `ai` and `@ai-sdk/openai` installed; abstract provider via port; add OpenRouter/Groq only after compatibility and data-handling review. Keep provider identities hidden from regular UI only if operationally appropriate; admins need transparency.
- Jobs: provider-independent port, Inngest candidate; add when importing/enriching and retries require it.
- Observability: Pino structured logs, correlation IDs, metrics, error tracking, audit log separated from debug log.
- Deployment: Node-compatible runtime for auth/MCP/DB operations, HTTPS, secure secrets, separate DB migrations; validate serverless streaming/session semantics, max durations and horizontal scaling. No requirement to split services at launch.

## 12. Quality gates and threats
- Vitest for domain/application; integration tests with disposable Postgres/Neon branch; Playwright for key user flows; MCP protocol/authorization contract tests.
- `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build` after baseline configuration; never mark passed without running.
- Threats: workspace data leakage, insecure direct object reference, excessive OAuth scope, bearer-token leakage, CSRF/session issues, prompt injection, SSRF during enrichment, CSV formula injection, cross-tenant vector search, replayed webhooks, excessive AI cost, irreversible agent action.
- Human approvals for high-risk actions must be server-side, expiring, single-use and bound to exact operation arguments and actor.

## 13. Full internal-system delivery stages and validation spikes
1. **Foundation and compatibility:** verify lockfile, Base UI config, Better Auth/Drizzle schema, Neon transactions, MCP SDK v2 + handler compatibility, OAuth plugin options, build and test baseline.
2. **Identity/tenancy:** sessions, workspace/project membership, permission checks and audit.
3. **CRM operational foundation:** company/contact/lead/opportunity/activity with real dashboard and basic MCP read tools; this is an intermediate milestone, not a product MVP or end of scope.
4. **Sales productivity:** import/dedup, Kanban, reminders, draft quotes and basic costs.
5. **MCP remote integration:** delegated OAuth end-to-end, scoped writes, approvals, live client verification.
6. **Analytics, documents, AI, automation:** implement and verify all approved capabilities, with explicit acceptance gates rather than optional deferral.

See `docs/ROADMAP_v2.0.md` for tasks, dependencies, acceptance criteria and release gates.

## 14. Open decisions (do not guess)
- Better Auth OAuth MCP plugin/API selection, required discovery endpoints and supported ChatGPT/Codex auth flow.
- `@better-auth/agent-auth` production readiness and whether to use it at all.
- Drizzle Kit RC compatibility and lockfile pinning.
- Neon transaction strategy for critical financial mutations.
- Deployment target and streaming behavior.
- Whether workspace/project membership should allow cross-project contacts, plus contact ownership/provenance policy.
- Exact roles/permissions, consent/legitimate interest handling, storage retention and jurisdiction-specific outreach compliance.
- Whether pnpm 12 and selected Node version are supported together in deployment/CI.
