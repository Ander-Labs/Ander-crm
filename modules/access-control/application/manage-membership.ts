import type { AuditWriter } from "@/modules/audit/public";
import { recordAuditEvent } from "@/modules/audit/application/record-audit-event";
import type { AuditEventInput } from "@/modules/audit/public";
import { authorize } from "@/modules/access-control/application/authorize";
import type { MembershipReader } from "@/modules/access-control/application/ports/membership-reader";
import type { MembershipAdministrator } from "@/modules/access-control/application/ports/membership-administrator";
import { resolveAccessContext } from "@/modules/access-control/application/resolve-access-context";
import type { Principal } from "@/modules/identity/public";
import type { ProjectRole } from "@/modules/projects/public";
import type { WorkspaceRole } from "@/modules/workspaces/public";

async function authorizeManagement(input: {
  principal: Principal | null;
  workspaceId: string;
  projectId?: string;
  correlationId: string;
}, permission: "workspace.members.manage" | "project.members.manage", memberships: MembershipReader, auditWriter: AuditWriter) {
  const resolved = await resolveAccessContext(input.principal, input.workspaceId, input.projectId, memberships, {
    allowWorkspaceAdminForProjectMembership: permission === "project.members.manage",
  });
  const decision = resolved.ok ? authorize(resolved.context, permission) : { allowed: false as const, reason: resolved.reason };
  const audit: AuditEventInput = {
    actorUserId: input.principal?.userId ?? null,
    credentialKind: input.principal?.credentialKind ?? "system",
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    action: permission,
    resourceType: "membership",
    outcome: "denied",
    correlationId: input.correlationId,
    metadata: { reasonCode: decision.reason },
  };
  if (!decision.allowed) await recordAuditEvent(audit, auditWriter);
  return { allowed: decision.allowed, context: resolved.ok ? resolved.context : undefined, audit };
}

export async function setWorkspaceMemberRole(input: {
  principal: Principal | null;
  workspaceId: string;
  targetUserId: string;
  role: WorkspaceRole;
  correlationId: string;
}, dependencies: { memberships: MembershipReader; administrator: MembershipAdministrator; audit: AuditWriter }) {
  const access = await authorizeManagement({
    principal: input.principal,
    workspaceId: input.workspaceId,
    correlationId: input.correlationId,
  }, "workspace.members.manage", dependencies.memberships, dependencies.audit);
  if (!access.allowed || !access.context) return { ok: false as const, reason: "access_denied" as const };
  if (!input.targetUserId || (input.targetUserId === access.context.principal.userId && input.role !== "owner") ||
      (input.role === "owner" && access.context.workspaceRole !== "owner")) {
    await recordAuditEvent({
      ...access.audit,
      actorUserId: access.context.principal.userId,
      credentialKind: access.context.principal.credentialKind,
      outcome: "denied",
      metadata: { reasonCode: "membership_role_escalation_denied" },
    }, dependencies.audit);
    return { ok: false as const, reason: "invalid_membership_change" as const };
  }
  const audit: AuditEventInput = {
    ...access.audit,
    actorUserId: access.context.principal.userId,
    credentialKind: access.context.principal.credentialKind,
    outcome: "succeeded",
    metadata: { targetRole: input.role },
  };
  await dependencies.administrator.setWorkspaceRole({ workspaceId: input.workspaceId, targetUserId: input.targetUserId, role: input.role }, audit);
  return { ok: true as const };
}

export async function setProjectMemberRole(input: {
  principal: Principal | null;
  workspaceId: string;
  projectId: string;
  targetUserId: string;
  role: ProjectRole;
  correlationId: string;
}, dependencies: { memberships: MembershipReader; administrator: MembershipAdministrator; audit: AuditWriter }) {
  const access = await authorizeManagement({
    principal: input.principal,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    correlationId: input.correlationId,
  }, "project.members.manage", dependencies.memberships, dependencies.audit);
  if (!access.allowed || !access.context) return { ok: false as const, reason: "access_denied" as const };
  if (!input.targetUserId) return { ok: false as const, reason: "invalid_membership_change" as const };
  const audit: AuditEventInput = {
    ...access.audit,
    actorUserId: access.context.principal.userId,
    credentialKind: access.context.principal.credentialKind,
    outcome: "succeeded",
    metadata: { targetRole: input.role },
  };
  await dependencies.administrator.setProjectRole({ workspaceId: input.workspaceId, projectId: input.projectId, targetUserId: input.targetUserId, role: input.role }, audit);
  return { ok: true as const };
}
