export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

export interface WorkspaceMembership {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  active: boolean;
}
