# ADR-001 — Identidad, autorización y acceso MCP en Ander CRM

- **Estado:** Aceptado como decisión arquitectónica; integraciones sujetas a verificación técnica en Fase 0
- **Fecha:** 2026-10-15
- **Proyecto:** Ander CRM v2.0 — plataforma interna, no SaaS comercial
- **Responsables:** Equipo de desarrollo de Ander CRM
- **Ámbito:** Autenticación web, autorización por recurso, integraciones de agentes y servidor MCP

## 1. Contexto

Ander CRM es una plataforma privada para gestionar varios negocios y proyectos propios (incluidos AISaaGrowth, AIMPY y Runa Labs), sus contactos, oportunidades, actividades, finanzas, documentos, analítica, automatizaciones e IA. Debe ser accesible mediante su interfaz web y, con autorización explícita, mediante ChatGPT, Codex y otros clientes MCP. Los límites entre negocios/proyectos son límites de autorización y aislamiento lógico, no un sistema de suscripciones para vender el CRM.

El stack acordado es Next.js 16 App Router, TypeScript, Neon PostgreSQL, Drizzle ORM, Better Auth, `@modelcontextprotocol/server` v2 y `mcp-handler` v2. El manifiesto compartido incluye `better-auth@1.7.7`, `@better-auth/drizzle-adapter@1.7.7`, `@better-auth/api-key@1.7.7`, `@better-auth/agent-auth@0.6.2`, `@better-auth/i18n@1.7.7`, `@modelcontextprotocol/server@^2.3.1` y `mcp-handler@^2.3.0`. Las versiones reales se confirmarán con el lockfile.

## 2. Decisión

1. **Better Auth es la autoridad de identidad y sesiones.** Se integra con Drizzle y Neon PostgreSQL. No utilizar Neon Auth como capa de autenticación.
   El alta inicial de usuarios se realiza mediante un comando local y explícito de operador. El plugin administrativo Better Auth, si se usa para ese comando, permanece fuera de la configuración del handler web; no se habilitan rutas de administración globales ni registro público.
2. **La autorización de negocio es propia y centralizada.** Roles, membresías y permisos sobre workspace/negocio, proyecto y recurso se comprueban en los casos de uso del backend, independientemente del canal de entrada. No basta con comprobar que un usuario haya iniciado sesión.
3. **MCP es un adaptador de entrada, no una capa de negocio paralela.** Los handlers MCP llaman a los mismos casos de uso que las rutas y acciones web. La lógica de autorización se aplica antes de acceder a datos o ejecutar acciones.
4. **Transporte MCP: Streamable HTTP.** JSON-RPC 2.0 sobre HTTP POST, con SSE para respuestas/streaming cuando el protocolo y el cliente lo requieran. No adoptar el transporte SSE legado como diseño principal.
5. **OAuth para clientes MCP remotos.** La conexión delegada debe seguir el flujo OAuth aplicable a MCP, con PKCE cuando corresponda, scopes, validación de audiencia/recurso, expiración, revocación y consentimiento según capacidades verificadas. Elegir y probar **una única integración OAuth compatible** de Better Auth (por ejemplo, el plugin MCP o el OAuth Provider), evitando registrarlas simultáneamente si existe conflicto. No afirmar compatibilidad hasta ejecutar pruebas.
6. **API keys y Bearer tokens son mecanismos separados.** El plugin `@better-auth/api-key` podrá servir para integraciones internas explícitamente aprobadas, con scopes mínimos, expiración, revocación y almacenamiento seguro. No sustituye automáticamente OAuth para clientes MCP remotos. El plugin `agent-auth` es opcional y no es requisito de seguridad de la primera implementación.
7. **Toda operación sensible requiere autorización y auditoría.** Las escrituras de alto impacto (eliminación masiva, envíos, operaciones financieras, cambios de permisos, exportaciones) exigen confirmación/aprobación cuando corresponda. Se aplica denegación por defecto.

## 3. Flujos de acceso

### 3.1 Web

Navegador → sesión Better Auth (cookie segura) → servidor Next.js → resolución de identidad y contexto autorizado → caso de uso → repositorio Drizzle/Neon.

- Proteger Server Actions y Route Handlers de forma independiente de la UI.
- Cookies `HttpOnly`, `Secure` en producción y `SameSite` adecuado.
- Protección CSRF y validación de origen según los flujos reales.
- No almacenar tokens privilegiados en `localStorage`.

### 3.2 Cliente MCP remoto

Cliente MCP → descubrimiento/autorización OAuth → token de acceso con audiencia y scopes → `app/api/mcp/route.ts` → validación de token y contexto → comprobación de permisos → herramienta MCP → caso de uso → auditoría.

- No aceptar un token únicamente porque tenga formato Bearer; verificar firma o introspección, emisor, audiencia, expiración y scopes conforme al proveedor escogido.
- Nunca confiar en `workspaceId`, `projectId` o `userId` enviados por el cliente sin contrastarlos con membresías y permisos.
- La autorización se verifica por operación y recurso, no solo al establecer la conexión.
- Respuestas y errores no revelan secretos, datos de otros proyectos ni detalles internos.

### 3.3 Automatizaciones internas

Jobs y agentes internos → identidad de servicio de privilegio mínimo → caso de uso autorizado → auditoría. No reutilizar indiscriminadamente sesiones de usuario ni claves maestras.

## 4. Diseño modular

```text
app/api/auth/[...all]/route.ts      # Adaptador HTTP Better Auth
app/api/mcp/route.ts                # Adaptador HTTP MCP
modules/identity/                  # Identidad y membresías
modules/access-control/            # Roles, políticas, scopes y decisiones
modules/audit/                     # Auditoría transversal
integrations/mcp/                  # Registro, herramientas, recursos, auth y transporte
composition/                       # Composición de dependencias
shared/                            # Contratos transversales mínimos
```

Los nombres exactos pueden adaptarse al Blueprint, manteniendo las responsabilidades y la dirección de dependencias: **presentación/transportes → aplicación → dominio; infraestructura implementa puertos**. No crear una carpeta `src/`.

## 5. Modelo conceptual mínimo

- `user`, `session`, `account`, `verification` y demás tablas requeridas por la versión de Better Auth utilizada.
- `workspace` / `business`, `workspace_membership`, `project`, `project_membership` cuando proceda.
- `role`, `permission` o políticas equivalentes; asignaciones explícitas y auditables.
- `api_credential` / entidades del plugin API Key cuando se active.
- Entidades OAuth del plugin elegido (clientes, grants, consentimientos, tokens), conforme a su esquema real.
- `audit_event`: actor, canal, operación, recurso, alcance, resultado, fecha, correlación y metadatos redactados.

**No duplicar tablas gestionadas por Better Auth ni inventar sus nombres físicos.** Codex debe inspeccionar el esquema generado por los plugins efectivamente seleccionados. Los datos de CRM siempre llevan el contexto de aislamiento apropiado; las consultas aplican filtros de alcance en backend.

## 6. Políticas mínimas

| Acción | Política |
|---|---|
| Leer contactos/leads | Usuario o agente autenticado, membresía válida, permiso de lectura y alcance del proyecto |
| Crear/editar lead | Permiso de escritura y validación de pertenencia |
| Exportar contactos | Permiso explícito, límites y auditoría |
| Enviar correos/campañas | Permiso específico, confirmación según impacto y trazabilidad |
| Consultar finanzas | Permiso financiero específico; mínimo privilegio |
| Cambiar roles o credenciales | Privilegio administrativo, controles adicionales y auditoría |
| Eliminar en lote | Autorización reforzada y aprobación humana cuando corresponda |

Los scopes OAuth limitan el acceso del cliente, pero **no reemplazan** los permisos del usuario ni los límites del proyecto. El permiso efectivo es la intersección de ambos.

## 7. Controles de seguridad y operación

- HTTPS obligatorio en producción; CORS y orígenes explícitos.
- Rate limiting para autenticación, OAuth, MCP y herramientas costosas.
- Validación de entradas/salidas con Zod; límites de tamaño, paginación y cuotas.
- Protección ante SSRF en herramientas que consulten URLs externas; restricciones de red y destinos.
- No registrar tokens, contraseñas, secretos ni datos personales innecesarios.
- Secretos exclusivamente en variables de entorno/gestor de secretos; `.env.example` sin valores reales.
- Rotación y revocación de credenciales; política de expiración.
- Pruebas de aislamiento entre workspaces/proyectos, escalada de privilegios, token inválido/expirado y escritura no autorizada.
- Observabilidad: identificador de correlación, resultado, duración y actor seudonimizado.

## 8. Consecuencias

**Beneficios:** una identidad coherente; lógica de negocio reutilizable desde web y MCP; seguridad por recurso; modularidad; acceso de agentes revocable y auditable.

**Costes:** configuración OAuth y pruebas de interoperabilidad; diseño explícito de permisos; mantenimiento de auditoría y políticas; necesidad de revisar plugins experimentales.

**Alternativas descartadas:** Neon Auth como proveedor de identidad; autorización solo en frontend; un token global con acceso total; herramientas MCP que consultan Drizzle directamente; SSE legado como transporte principal.

## 9. Plan de implementación y validación

**Fase 0 — Compatibilidad y base:** inspeccionar `package.json`, lockfile y documentación; verificar exportaciones y APIs reales de Better Auth, adaptador Drizzle, plugins y SDK MCP; decidir integración OAuth única; comprobar `tsc`, lint, tests y build. Registrar decisiones y bloqueos. No inventar compatibilidad.

**Fase 1 — Identidad y permisos:** configurar Better Auth/Drizzle, sesiones, workspaces, membresías, políticas y pruebas de aislamiento. Ejecutar migraciones únicamente en base de desarrollo y previa revisión.

**Fase de MCP inicial:** endpoint Streamable HTTP con herramienta de diagnóstico sin datos sensibles, autenticación denegada por defecto, registro modular y pruebas del transporte.

**Fase de integración MCP remota:** OAuth interoperable con clientes reales, scopes, tokens, consentimiento, revocación, herramientas de lectura/escritura y aprobaciones de operaciones sensibles.

**Fases posteriores:** incorporar herramientas MCP junto con cada módulo funcional, no mediante duplicación de lógica.

## 10. Criterios de aceptación

- Inicio/cierre de sesión web funcional y probado.
- Persistencia y migraciones reproducibles con Drizzle/Neon.
- Ningún usuario o agente puede leer/escribir recursos fuera de su alcance.
- Endpoint MCP conforme al transporte elegido y con pruebas de clientes reales.
- Tokens expirados, revocados, con audiencia incorrecta o sin scope son rechazados.
- Herramientas MCP usan casos de uso y verifican permisos por llamada.
- Operaciones sensibles quedan auditadas; confirmaciones se exigen cuando aplica.
- Tests de seguridad, tipado, lint y build pasan.

## 11. Pendientes de verificación explícita

1. Versión y compatibilidad exactas de `@better-auth/mcp` frente a Better Auth 1.7.7 y `@better-auth/agent-auth` 0.6.2.
2. Si `@better-auth/drizzle-adapter` requiere configuración específica con Drizzle ORM 0.45.4.
3. API y requisitos efectivos de `@modelcontextprotocol/server` 2.3.x y `mcp-handler` 2.3.x.
4. Compatibilidad de `drizzle-kit` 1.0.0 RC con el esquema generado.
5. Modelo de despliegue de Next.js para conexiones HTTP/SSE, timeouts y escalabilidad.

Estas cuestiones **no bloquean la documentación**, pero sí el cierre técnico de las tareas que dependen de ellas. Codex deberá validarlas con código y pruebas, documentando el resultado.
