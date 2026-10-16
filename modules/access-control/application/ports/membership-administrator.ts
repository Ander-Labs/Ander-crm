import type { AuditEventInput } from "@/modules/audit/public";
import type { ProjectRole } from "@/modules/projects/public";
import type { WorkspaceRole } from "@/modules/workspaces/public";

export interface MembershipAdministrator {
  setWorkspaceRole(input: { workspaceId: string; targetUserId: string; role: WorkspaceRole }, audit: AuditEventInput): Promise<void>;
  setProjectRole(input: { workspaceId: string; projectId: string; targetUserId: string; role: ProjectRole }, audit: AuditEventInput): Promise<void>;
}
