import { authorize, resolveAccessContext, type MembershipReader } from "@/modules/access-control/public";
import type { AuditWriter } from "@/modules/audit/public";
import { recordAuditEvent } from "@/modules/audit/application/record-audit-event";
import type { ProjectAdministrator } from "@/modules/projects/application/ports/project-administrator";
import type { Principal } from "@/modules/identity/public";

export async function createProject(input: {
  principal: Principal | null;
  workspaceId: string;
  name: string;
  slug: string;
  correlationId: string;
}, dependencies: { memberships: MembershipReader; administrator: ProjectAdministrator; audit: AuditWriter }) {
  const principal = input.principal;
  if (!principal) return { ok: false as const, reason: "unauthenticated" as const };
  const name = input.name.trim();
  const slug = input.slug.trim().toLowerCase();
  if (name.length < 2 || name.length > 120 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 80) {
    return { ok: false as const, reason: "invalid_project" as const };
  }
  const resolved = await resolveAccessContext(principal, input.workspaceId, undefined, dependencies.memberships);
  if (!resolved.ok || !authorize(resolved.context, "project.create").allowed) {
    await recordAuditEvent({
      actorUserId: principal.userId,
      credentialKind: principal.credentialKind,
      workspaceId: input.workspaceId,
      action: "project.create",
      resourceType: "project",
      outcome: "denied",
      correlationId: input.correlationId,
      metadata: { reasonCode: "workspace_permission_denied" },
    }, dependencies.audit);
    return { ok: false as const, reason: "access_denied" as const };
  }
  const id = await dependencies.administrator.createWithOwner({
    workspaceId: input.workspaceId,
    name,
    slug,
    ownerUserId: principal.userId,
  }, {
    actorUserId: principal.userId,
    credentialKind: principal.credentialKind,
    workspaceId: input.workspaceId,
    action: "project.create",
    resourceType: "project",
    outcome: "succeeded",
    correlationId: input.correlationId,
    metadata: { source: "application" },
  });
  return { ok: true as const, projectId: id };
}
