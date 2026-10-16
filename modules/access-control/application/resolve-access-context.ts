import type { MembershipReader } from "@/modules/access-control/application/ports/membership-reader";
import type { AccessContext } from "@/modules/access-control/domain/access-context";
import type { Principal } from "@/modules/identity/public";

export type ContextResolution =
  | { ok: true; context: AccessContext }
  | { ok: false; reason: "unauthenticated" | "workspace_access_denied" | "project_access_denied" };

/** Resolves caller-supplied resource IDs against server-owned active memberships. */
export async function resolveAccessContext(
  principal: Principal | null,
  workspaceId: string,
  projectId: string | undefined,
  memberships: MembershipReader,
  options: { allowWorkspaceAdminForProjectMembership?: boolean } = {},
): Promise<ContextResolution> {
  if (!principal?.userId || !workspaceId) return { ok: false, reason: "unauthenticated" };
  const workspaceRole = await memberships.findActiveWorkspaceRole(principal.userId, workspaceId);
  if (!workspaceRole) return { ok: false, reason: "workspace_access_denied" };
  if (!projectId) {
    return { ok: true, context: { principal, workspaceId, workspaceRole } };
  }
  const projectRole = await memberships.findActiveProjectRole(principal.userId, workspaceId, projectId);
  if (!projectRole) {
    if (options.allowWorkspaceAdminForProjectMembership && (workspaceRole === "owner" || workspaceRole === "admin")) {
      return { ok: true, context: { principal, workspaceId, workspaceRole, projectId } };
    }
    return { ok: false, reason: "project_access_denied" };
  }
  return { ok: true, context: { principal, workspaceId, workspaceRole, projectId, projectRole } };
}
