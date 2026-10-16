# Ander CRM — Roadmap de desarrollo e implementación v2.0

**Fecha:** 2026-10-15  
**Estado:** Fase 0 autorizada por el usuario para cierre administrativo y entrada a Fase 1 (2026-10-15); las tareas conservan su evidencia técnica real.
**Enfoque:** sistema interno completo (no MVP, no SaaS para vender), arquitectura hexagonal y MCP nativo desde el inicio. Todas las fases y módulos aprobados forman parte del alcance final.

## Alcance contractual del proyecto
- **Uso exclusivamente interno:** Ander CRM es nuestra herramienta de gestión para AISaaGrowth, AIMPY y otros proyectos. No se desarrollará como producto comercializable ni se planificarán ventas, suscripciones o facturación de la plataforma CRM.
- **Entrega completa:** los hitos parciales permiten usar funciones durante el desarrollo, pero **ningún hito equivale a un MVP ni a finalización**. La finalización exige todos los módulos y flujos definidos, integración MCP, pruebas, seguridad y documentación.
- **Multi-workspace no significa SaaS público:** se gestionan nuestros proyectos y equipos; el cobro de productos/servicios de esos proyectos sí pertenece al módulo de finanzas.
- **Alcance funcional obligatorio:** identidad y permisos; workspaces y proyectos; empresas, contactos, leads y oportunidades; actividades y tareas; prospección/importación; pipeline y seguimiento; costes, ingresos, presupuestos y documentos comerciales; archivos y conocimiento; analítica y previsiones; MCP seguro; IA/RAG; automatización e integraciones; configuración, auditoría y operaciones.
- **Criterio de cierre:** matriz de cobertura de módulos al 100 %, flujos E2E validados, permisos y aislamiento verificados, migraciones reproducibles y manual de operación interno.

## Reglas de ejecución
- Codex **primero inspecciona y planifica**; no implementa ni instala hasta aprobación de la fase.
- Estados: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`; por defecto **TODO**.
- Una tarea solo pasa a DONE con pruebas, evidencia y revisión de permisos cuando aplica.
- Cada fase tiene dependencia de la anterior salvo trabajo de diseño/spikes expresamente paralelizable.
- Los plazos son **estimaciones orientativas**, no promesas; se ajustan tras la Fase 0.
- No confundir `package.json` con funcionamiento probado.

## Hitos internos de implementación (ninguno es un MVP)

| Release | Fases | Resultado verificable |
|---|---|---|
| R0 — Foundation | 0 | Repo reproducible, arquitectura y contratos validados |
| R1 — Secure core | 1 | Usuarios y workspaces con aislamiento probado |
| **R2 — Núcleo CRM operativo** | **2–3** | **Prospectos, contactos, oportunidades y seguimientos utilizables** |
| R3 — Prospecting scale | 4 | Importación y enriquecimiento responsable |
| R4 — Agent operations | 5 | MCP remoto con OAuth y escrituras seguras |
| R5 — Commercial ops | 6–7 | Costos, propuestas, KPIs y previsiones |
| R6 — Intelligence | 8 | Documentos, RAG y asistente con permisos |
| R7 — Production | 9 | Automatización, observabilidad y despliegue |

## Vista de fases

| Fase | Nombre | Duración estimada | Prioridad | Entrega |
|---|---|---|---|---|
| 0 | Foundation & compatibility | 0-1 weeks | P0 | Architecture and reproducible foundation |
| 1 | Identity, workspaces & policy | 1-2 weeks | P0 | Secure authenticated and tenant-scoped app |
| 2 | CRM Core — gestión integral de entidades | 1-2 weeks | P0 | Capture and organize real prospects |
| 3 | Sales pipeline & activities | 1-2 weeks | P0 | Turn prospects into actionable follow-up |
| 4 | Import, enrichment & prospecting | 1-2 weeks | P1 | Accelerate targeted acquisition |
| 5 | MCP remote OAuth & safe writes | 1-2 weeks | P1 | Enable controlled remote agent operations |
| 6 | Finance & commercial documents | 1-2 weeks | P1 | Track costs and create commercial drafts |
| 7 | Analytics & forecasting | 1 week | P1 | Support decisions with trustworthy KPIs |
| 8 | Knowledge, RAG & AI assistant | 2 weeks | P2 | Context-aware internal assistance |
| 9 | Automation, email & hardening | 2 weeks | P2 | Production-ready operations |

## Dependencias críticas
```text
F0 ─► F1 ─► F2 ─► F3 ─► R2 (hito interno parcial)
                        ├─► F4 (prospección)
                        └─► F5 (MCP remoto, OAuth) [spikes MCP comienzan en F0]
F3 + F1 ─► F6 ─► F7
F1 + F2 ─► F8
F4 + F5 + F6 + F8 ─► F9
```

## Backlog detallado por fases

### Fase 0 — Foundation & compatibility
**Objetivo:** Architecture and reproducible foundation. **Estimación:** 0-1 weeks. **Prioridad:** P0.
**Dependencias:** Ninguna; inspección del repositorio.

| ID | Tarea | Criterio de aceptación | Verificación | Estado |
|---|---|---|---|---|
| F0-01 | Inspect actual repository, lockfile, node/pnpm versions, scripts and `components.json` | Inventory with gaps and no invented installs | Read-only inspection and report | DONE |
| F0-02 | Validate Next 16/React 19/TS/Tailwind/Base UI and shadcn generator | Build and one Base UI interaction render without Radix | Build, typecheck, accessible smoke test | IN_PROGRESS |
| F0-03 | Validate Drizzle ORM vs Drizzle Kit RC and Neon driver transactions | Document tested migration strategy and rollback | Generate sample migration against disposable DB only | IN_PROGRESS |
| F0-04 | Validate Better Auth + Drizzle adapter + plugin APIs | Working dev-only auth spike with documented schema | Auth smoke and schema review | TODO |
| F0-05 | Validate MCP server v2 and mcp-handler v2, HTTP transport | Minimal non-sensitive ping tool in dev, no public exposure | JSON-RPC protocol tests | TODO |
| F0-06 | Evaluate Better Auth OAuth MCP plugin choices and deployment constraints | ADR updated with concrete integration choice | Discovery/token contract tests in isolated spike | TODO |
| F0-07 | Establish hexagonal skeleton, import boundaries and DI composition | Feature template and architecture lint constraints | Unit import-boundary checks | IN_PROGRESS |
| F0-08 | Configure Vitest, Playwright, CI, formatting, env example | Green baseline CI on clean install | Typecheck, lint, tests, build | IN_PROGRESS |
| F0-09 | Produce Domain Model v0, ERD v0, permission matrix v0 and MCP catalog v0 | Reviewed designs and ownership rules | Schema/policy review | TODO |

**Gate de salida F0:** Build, types, lint, test harness, dependency compatibility, repo structure; evidencia de pruebas y revisión de arquitectura/seguridad publicada.

**Decisión de avance (2026-10-15):** el usuario autorizó dar salida administrativa a F0 y comenzar F1 aceptando que las verificaciones dependientes de credenciales/BD (F0-03/04/05/06/09) queden como carryover visible. Esta aprobación no equivale a declarar esos criterios técnicos probados ni a marcar sus filas como `DONE`. Evidencia detallada: `docs/architecture/PHASE-0_FOUNDATION.md`.

### Fase 1 — Identity, workspaces & policy
**Objetivo:** Secure authenticated and tenant-scoped app. **Estimación:** 1-2 weeks. **Prioridad:** P0.
**Dependencias:** Fase 0 completada o hitos de seguridad equivalentes aprobados.

| ID | Tarea | Criterio de aceptación | Verificación | Estado |
|---|---|---|---|---|
| F1-01 | Configure Better Auth sessions, login/logout and protected routes | Unauthenticated access blocked | Session E2E | IN_PROGRESS |
| F1-02 | Implement workspaces and membership roles | User can switch only authorized workspaces | Cross-workspace integration tests | IN_PROGRESS |
| F1-03 | Implement projects and project membership | Scoped project selection and data | Project authorization tests | IN_PROGRESS |
| F1-04 | Create application policy engine and permission matrix | Deny-by-default decisions reused by all entrypoints | Table-driven policy tests | IN_PROGRESS |
| F1-05 | Add audit log and credential security foundations | Sensitive writes have actor/correlation ID | Audit and redaction tests | IN_PROGRESS |

**Gate de salida F1:** Better Auth, workspace/project membership, authorization, audit; evidencia de pruebas y revisión de arquitectura/seguridad publicada.

**Evidencia de implementación (2026-10-15):** Better Auth 1.7.7 + adaptador Drizzle 1.7.7 configurados en runtime Node; login/logout y rutas de dashboard protegidas añadidas; esquema y migración Fase 1 aplicados a `crm-ander-labs` / rama `production` tras confirmar que `public` no tenía tablas. Drizzle registró la séptima migración y consultas de solo lectura confirmaron nueve tablas nuevas y las claves foráneas; no se insertaron datos de negocio ni credenciales en el repositorio. Composición explícita, resolución server-side de membresías, política deny-by-default, límites de scope y payload de auditoría redactado implementados. Se añadió aprovisionamiento privado mediante `auth:bootstrap` (admin plugin solo en composición CLI), creación de proyectos/membresías con autorización y auditoría en la misma transacción. Verificación ejecutada: TypeScript, ESLint y 9 pruebas unitarias pasan; el alias `@` de Vitest y tipos de Better Auth se ajustaron. F1 sigue `IN_PROGRESS`: faltan sesión E2E y aislamiento, verificar escrituras de identidad/auditoría y ejecutar el CLI con datos de cuenta aprobados. No se hizo build.

### Fase 2 — CRM Core — gestión integral de entidades
**Objetivo:** Capture and organize real prospects. **Estimación:** 1-2 weeks. **Prioridad:** P0.
**Dependencias:** Fase 1 completada o hitos de seguridad equivalentes aprobados.

| ID | Tarea | Criterio de aceptación | Verificación | Estado |
|---|---|---|---|---|
| F2-01 | Company entity, repository, API/use cases and CRUD UI | Workspace-scoped create/read/update and search | Domain + integration + E2E | TODO |
| F2-02 | Contact entity, company associations and verified professional fields | Multiple contacts per company, provenance recorded | Duplicate and isolation tests | TODO |
| F2-03 | Lead entity linked to project and source | Project-specific lead lifecycle and owner | Scope + lifecycle tests | TODO |
| F2-04 | Search, filters, pagination and empty/loading/error UI | Usable prospect lists on real data | Pagination and UX tests | TODO |
| F2-05 | Prospecting quick capture flow | Company + contact + lead created in one guided flow | End-to-end quick capture | TODO |

**Gate de salida F2:** Companies, contacts, leads, provenance, search and basic UI; evidencia de pruebas y revisión de arquitectura/seguridad publicada.

### Fase 3 — Sales pipeline & activities
**Objetivo:** Turn prospects into actionable follow-up. **Estimación:** 1-2 weeks. **Prioridad:** P0.
**Dependencias:** Fase 2 completada o hitos de seguridad equivalentes aprobados.

| ID | Tarea | Criterio de aceptación | Verificación | Estado |
|---|---|---|---|---|
| F3-01 | Pipeline and stage model with ordering | Stages customizable per project where authorized | Order/invariant tests | TODO |
| F3-02 | Opportunity model with amounts and stage history | Deals trace stage changes and currencies | Audit/precision tests | TODO |
| F3-03 | Kanban drag/drop using dnd-kit | Accessible stage changes with optimistic rollback | E2E drag/drop + keyboard | TODO |
| F3-04 | Tasks, activities and due follow-up list | Owner sees actionable follow-ups | Due date/timezone tests | TODO |
| F3-05 | First MCP read tools: companies, contacts, leads, deals, due activities | Read-only scoped queries match UI permissions | MCP tenant/scope protocol tests | TODO |
| F3-06 | Gate interno: gestión de prospectos y actividades verificada | Operator can manage 10 leads and next actions | Manual acceptance walkthrough | TODO |

**Gate de salida F3:** Pipeline, opportunities, Kanban, tasks, due reminders, initial MCP read tools; evidencia de pruebas y revisión de arquitectura/seguridad publicada.

### Fase 4 — Import, enrichment & prospecting
**Objetivo:** Accelerate targeted acquisition. **Estimación:** 1-2 weeks. **Prioridad:** P1.
**Dependencias:** Fase 3 completada o hitos de seguridad equivalentes aprobados.

| ID | Tarea | Criterio de aceptación | Verificación | Estado |
|---|---|---|---|---|
| F4-01 | CSV import preview and mapping | Preview, validation, rollback/error report | CSV injection and malformed file tests | TODO |
| F4-02 | Duplicate detection and merge proposal | No silent destructive merges | Duplicate test matrix | TODO |
| F4-03 | Enrichment/research source interface and provenance | Sources/time/confidence stored, no fabricated emails | Provider mock + compliance review | TODO |
| F4-04 | Background job port and chosen provider spike | Retry/idempotency and rate limits | Job replay tests | TODO |
| F4-05 | Outreach draft and approval request only | No autonomous send | Approval bypass tests | TODO |

**Gate de salida F4:** CSV, dedupe, research sources, job abstraction, approval-aware outreach drafts; evidencia de pruebas y revisión de arquitectura/seguridad publicada.

### Fase 5 — MCP remote OAuth & safe writes
**Objetivo:** Enable controlled remote agent operations. **Estimación:** 1-2 weeks. **Prioridad:** P1.
**Dependencias:** Fase 4 completada o hitos de seguridad equivalentes aprobados.

| ID | Tarea | Criterio de aceptación | Verificación | Estado |
|---|---|---|---|---|
| F5-01 | Implement approved OAuth MCP discovery and consent flow | Compatible delegated token obtained and revoked | OAuth flow tests | TODO |
| F5-02 | Token validation, audience/scope and tenant policy middleware | Invalid/wrong-scope tokens rejected | Security matrix | TODO |
| F5-03 | Tool registry and safe write tools | Create lead/contact/follow-up draft with idempotency | Tool contract tests | TODO |
| F5-04 | Approval service for high-risk tools | Single-use signed approval bound to exact action | Replay/expiry tests | TODO |
| F5-05 | Remote HTTPS MCP client compatibility spike | External client can list and invoke scoped tools | End-to-end remote test | TODO |

**Gate de salida F5:** OAuth flow, discovery, scopes, tools, audit, client compatibility; evidencia de pruebas y revisión de arquitectura/seguridad publicada.

### Fase 6 — Finance & commercial documents
**Objetivo:** Track costs and create commercial drafts. **Estimación:** 1-2 weeks. **Prioridad:** P1.
**Dependencias:** Fase 5 completada o hitos de seguridad equivalentes aprobados.

| ID | Tarea | Criterio de aceptación | Verificación | Estado |
|---|---|---|---|---|
| F6-01 | Money and exchange rate domain primitives | Currency/precision and actual vs estimate enforced | Property and decimal tests | TODO |
| F6-02 | Project costs, expenses and revenue entries | Profitability by project with audit | Finance reconciliation tests | TODO |
| F6-03 | Quote/proposal draft editor and versioning | Drafts trace revisions and approvals | Version tests | TODO |
| F6-04 | PDF export and object storage integration | Permission-scoped download | Signed URL and access tests | TODO |

**Gate de salida F6:** Expenses, revenue, unit economics, quotes and PDF drafts; evidencia de pruebas y revisión de arquitectura/seguridad publicada.

### Fase 7 — Analytics & forecasting
**Objetivo:** Support decisions with trustworthy KPIs. **Estimación:** 1 week. **Prioridad:** P1.
**Dependencias:** Fase 6 completada o hitos de seguridad equivalentes aprobados.

| ID | Tarea | Criterio de aceptación | Verificación | Estado |
|---|---|---|---|---|
| F7-01 | Metric definitions and query projections | Documented denominators and source-of-truth | Fixture-based metric tests | TODO |
| F7-02 | Sales conversion and stage aging dashboard | Correct scoped visualizations | Dashboard integration tests | TODO |
| F7-03 | CAC/LTV assumptions and project profitability | Distinguish measured from modeled values | Precision and missing-data tests | TODO |
| F7-04 | Forecasting with uncertainty labels | Forecasts never presented as actual | Scenario tests | TODO |

**Gate de salida F7:** Dashboards, CAC, conversion, stage velocity, forecasts; evidencia de pruebas y revisión de arquitectura/seguridad publicada.

### Fase 8 — Knowledge, RAG & AI assistant
**Objetivo:** Context-aware internal assistance. **Estimación:** 2 weeks. **Prioridad:** P2.
**Dependencias:** Fase 7 completada o hitos de seguridad equivalentes aprobados.

| ID | Tarea | Criterio de aceptación | Verificación | Estado |
|---|---|---|---|---|
| F8-01 | Document ingest with permissions, retention and scanning strategy | Secure upload and retrieval | File abuse tests | TODO |
| F8-02 | Chunking, embeddings and tenant-scoped pgvector index | No cross-workspace retrieval | Vector isolation tests | TODO |
| F8-03 | AI assistant with provider adapter and budgets | User-visible sources, cost/rate caps | Prompt injection tests | TODO |
| F8-04 | Knowledge MCP tools and model/provider controls | Authorized retrieval with citations | MCP retrieval tests | TODO |

**Gate de salida F8:** Document storage, chunks, embeddings, pgvector, AI chat and permissions; evidencia de pruebas y revisión de arquitectura/seguridad publicada.

### Fase 9 — Automation, email & hardening
**Objetivo:** Production-ready operations. **Estimación:** 2 weeks. **Prioridad:** P2.
**Dependencias:** Fase 8 completada o hitos de seguridad equivalentes aprobados.

| ID | Tarea | Criterio de aceptación | Verificación | Estado |
|---|---|---|---|---|
| F9-01 | Workflow scheduler, outbox and idempotent jobs | Retries do not duplicate effects | Failure/replay tests | TODO |
| F9-02 | Email integration with draft/review/send approvals | Opt-out, limits, consent checks | Approval/deliverability tests | TODO |
| F9-03 | Observability, alerts, audit retention and cost budgets | Production dashboards and alert thresholds | Load/chaos smoke tests | TODO |
| F9-04 | Backups, migrations, incident response and security review | Restore tested and runbook approved | Restore drill | TODO |
| F9-05 | Deployment and release acceptance | HTTPS, auth, MCP, UI and CI green | Production smoke suite | TODO |

**Gate de salida F9:** Jobs, workflows, email approval, security, observability, backups and deployment; evidencia de pruebas y revisión de arquitectura/seguridad publicada.

## Riesgos y decisiones pendientes

| Riesgo | Impacto | Mitigación / momento |
|---|---|---|
| Better Auth OAuth para MCP sin plugin elegido | Bloquea conexión remota | F0-06 y F5-01; validar flujo real |
| MCP SDK v2 y mcp-handler v2 incompatibles | Bloquea endpoint | F0-05, prueba mínima en Node |
| Drizzle Kit RC vs ORM | Migraciones incorrectas | F0-03, BD desechable, revisión SQL |
| `@better-auth/agent-auth` en evolución | Dependencia inestable | Mantener fuera del camino crítico |
| Neon HTTP vs transacciones complejas | Integridad financiera | Spike F0-03, adaptar driver |
| `@tanstack/react-table` v9 | Diferencias de API respecto a ejemplos v8 | Validar APIs instaladas |
| Paquetes faltantes en manifiesto | Fallos al compilar features | Instalar por fase, documentar |
| Datos de contacto y outreach | Riesgo legal/reputacional | Proveniencia, opt-out, revisión humana |
| Complejidad de implementación simultánea | Riesgo de integración | Entregar por fases sin recortar el alcance final |
| MCP con acceso demasiado amplio | Fuga de datos | Scope+RBAC+resource policy+approval |

## Primera sesión de Codex — entregables (sin escribir código funcional)
1. Inventario real de archivos y dependencias, y comparación con esta documentación.
2. Reporte de compatibilidad de Next.js, Better Auth, Drizzle Kit RC, MCP SDK v2 y mcp-handler v2.
3. Propuesta de estructura final sin `src/` y con Base UI.
4. Domain Model v0 + ERD v0 + matriz de permisos v0 + catálogo MCP v0, con preguntas abiertas.
5. Backlog F0 refinado con estimación, dependencias, rutas de archivo, criterios de aceptación y pruebas.
6. ADRs adicionales si son necesarios; esperar aprobación antes de instalar o implementar.

## Indicadores de calidad y uso interno
- Tiempo para registrar empresa + contacto + lead (objetivo inicial: menos de 2 minutos, a validar).
- Porcentaje de leads con próxima actividad registrada.
- Número de oportunidades activas por proyecto y etapa.
- Porcentaje de consultas MCP denegadas correctamente en pruebas cross-tenant (100%).
- Número de leads con fuente verificable y fecha de investigación.
- No usar métricas inventadas; capturar datos reales o etiquetar fixtures.

## Gate final de completitud (obligatorio)
Codex debe mantener una matriz `módulo → requisitos → endpoints/UI/MCP → pruebas → estado`. No declarar Ander CRM terminado con el núcleo CRM operativo. Se exige que identidad, workspaces/proyectos, CRM, ventas, prospección, actividades, finanzas, presupuestos, documentos, analítica, IA/RAG, MCP, integraciones, automatizaciones, administración, auditoría y despliegue tengan criterios de aceptación comprobados. Las fases 0–9 organizan el trabajo; si el análisis identifica submódulos ausentes, debe ampliar el backlog antes de dar por cerrado el alcance, sin convertirlos en opcionales.

## Documentación relacionada
- `AGENTS.md`
- `docs/architecture/ARCHITECTURE_BLUEPRINT_v2.0.md`
- `docs/architecture/decisions/ADR-001-auth-mcp.md`
- `docs/design/dashboard-reference.png` (si existe)
