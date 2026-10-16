export interface WorkspaceSummary {
  id: string;
  slug: string;
  name: string;
  role: string;
}

export interface WorkspaceDirectory {
  listForUser(userId: string): Promise<WorkspaceSummary[]>;
}

export function listMyWorkspaces(principal: Principal | null, directory: WorkspaceDirectory) {
  if (!principal) throw new Error("An authenticated user is required.");
  return directory.listForUser(principal.userId);
}
import type { Principal } from "@/modules/identity/domain/principal";

