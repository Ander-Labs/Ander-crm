export type ProjectRole = "admin" | "member" | "viewer";

export interface ProjectMembership {
  id: string;
  workspaceId: string;
  projectId: string;
  workspaceMembershipId: string;
  role: ProjectRole;
  active: boolean;
}
