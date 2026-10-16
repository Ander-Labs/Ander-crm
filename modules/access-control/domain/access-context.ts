import type { Principal } from "@/modules/identity/public";
import type { ProjectRole } from "@/modules/projects/public";
import type { WorkspaceRole } from "@/modules/workspaces/public";

export interface AccessContext {
  principal: Principal;
  workspaceId: string;
  workspaceRole: WorkspaceRole;
  projectId?: string;
  projectRole?: ProjectRole;
}
