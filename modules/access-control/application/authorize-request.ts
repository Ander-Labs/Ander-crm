import type { AuditWriter } from "@/modules/audit/public";
import { recordAuditEvent } from "@/modules/audit/application/record-audit-event";
import type { Principal } from "@/modules/identity/public";
import type { MembershipReader } from "@/modules/access-control/application/ports/membership-reader";
import { authorize } from "@/modules/access-control/application/authorize";
import { resolveAccessContext } from "@/modules/access-control/application/resolve-access-context";
import type { Permission } from "@/modules/access-control/domain/permission";

export async function authorizeRequest(input: {
  principal: Principal | null;
  workspaceId: string;
  projectId?: string;
  permission: Permission;
  correlationId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
}, memberships: MembershipReader, audit: AuditWriter) {
  const resolved = await resolveAccessContext(input.principal, input.workspaceId, input.projectId, memberships);
  const decision = resolved.ok ? authorize(resolved.context, input.permission) : { allowed: false as const, reason: resolved.reason };
  if (!decision.allowed) {
    await recordAuditEvent({
      actorUserId: input.principal?.userId ?? null,
      credentialKind: input.principal?.credentialKind ?? "system",
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      outcome: "denied",
      correlationId: input.correlationId,
      metadata: { reasonCode: decision.reason },
    }, audit);
  }
  return { ...decision, context: resolved.ok ? resolved.context : undefined };
}
