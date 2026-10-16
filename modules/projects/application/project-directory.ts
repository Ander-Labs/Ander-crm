export interface ProjectSummary {
  id: string;
  workspaceId: string;
  slug: string;
  name: string;
  role: string;
}

export interface ProjectDirectory {
  listForUserInWorkspace(userId: string, workspaceId: string): Promise<ProjectSummary[]>;
}

export async function listMyProjects(
  principal: Principal | null,
  workspaceId: string,
  directory: ProjectDirectory,
  memberships: MembershipReader,
) {
  if (!principal || !workspaceId) throw new Error("An authenticated user and workspace are required.");
  const resolved = await resolveAccessContext(principal, workspaceId, undefined, memberships);
  if (!resolved.ok || !authorize(resolved.context, "workspace.read").allowed) {
    throw new Error("Workspace access denied.");
  }
  return directory.listForUserInWorkspace(principal.userId, workspaceId);
}
import { authorize } from "@/modules/access-control/application/authorize";
import type { MembershipReader } from "@/modules/access-control/application/ports/membership-reader";
import { resolveAccessContext } from "@/modules/access-control/application/resolve-access-context";
import type { Principal } from "@/modules/identity/public";

