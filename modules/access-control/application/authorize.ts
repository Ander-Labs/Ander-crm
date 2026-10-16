import type { AccessContext } from "@/modules/access-control/domain/access-context";
import type { Permission } from "@/modules/access-control/domain/permission";

const workspaceGrants: Record<AccessContext["workspaceRole"], ReadonlySet<Permission>> = {
  owner: new Set(["workspace.read", "workspace.members.manage", "project.read", "project.create", "project.members.manage", "audit.read", "credential.manage"]),
  admin: new Set(["workspace.read", "workspace.members.manage", "project.read", "project.create", "project.members.manage", "audit.read"]),
  member: new Set(["workspace.read", "project.read"]),
  viewer: new Set(["workspace.read", "project.read"]),
};

const projectGrants: Record<NonNullable<AccessContext["projectRole"]>, ReadonlySet<Permission>> = {
  admin: new Set(["project.read", "project.members.manage"]),
  member: new Set(["project.read"]),
  viewer: new Set(["project.read"]),
};

export interface AuthorizationDecision {
  allowed: boolean;
  reason: "allowed" | "workspace_role_denied" | "project_membership_required" | "project_role_denied" | "credential_scope_denied";
}

/** Default-deny policy. Project context always requires an active project membership. */
export function authorize(context: AccessContext | null, permission: Permission): AuthorizationDecision {
  if (!context || !workspaceGrants[context.workspaceRole]) return { allowed: false, reason: "workspace_role_denied" };
  if (context.projectId) {
    const workspaceAdministrator = context.workspaceRole === "owner" || context.workspaceRole === "admin";
    const mayAdministerMembershipsWithoutProjectSeat = workspaceAdministrator && permission === "project.members.manage";
    if (!context.projectRole && !mayAdministerMembershipsWithoutProjectSeat) {
      return { allowed: false, reason: "project_membership_required" };
    }
    if (context.projectRole && !projectGrants[context.projectRole]?.has(permission)) {
      return { allowed: false, reason: "project_role_denied" };
    }
    if (!permission.startsWith("project.")) {
      return { allowed: false, reason: "workspace_role_denied" };
    }
  } else if (!workspaceGrants[context.workspaceRole]?.has(permission)) {
    return { allowed: false, reason: "workspace_role_denied" };
  }
  if (context.principal.credentialKind === "session" && context.principal.scopes === null) {
    return { allowed: true, reason: "allowed" };
  }
  if (!context.principal.scopes || !context.principal.scopes.has(permission)) {
    return { allowed: false, reason: "credential_scope_denied" };
  }
  return { allowed: true, reason: "allowed" };
}
