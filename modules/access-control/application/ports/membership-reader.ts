import type { ProjectRole } from "@/modules/projects/public";
import type { WorkspaceRole } from "@/modules/workspaces/public";

export interface MembershipReader {
  findActiveWorkspaceRole(userId: string, workspaceId: string): Promise<WorkspaceRole | null>;
  findActiveProjectRole(userId: string, workspaceId: string, projectId: string): Promise<ProjectRole | null>;
}
