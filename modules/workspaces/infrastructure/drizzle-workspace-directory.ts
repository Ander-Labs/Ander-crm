import { and, eq } from "drizzle-orm";
import type { WorkspaceDirectory } from "@/modules/workspaces/application/workspace-directory";
import { workspace, workspaceMembership } from "@/modules/workspaces/infrastructure/persistence/schema";
import { getDatabase } from "@/shared/infrastructure/database";

export class DrizzleWorkspaceDirectory implements WorkspaceDirectory {
  async listForUser(userId: string) {
    return getDatabase()
      .select({ id: workspace.id, slug: workspace.slug, name: workspace.name, role: workspaceMembership.role })
      .from(workspaceMembership)
      .innerJoin(workspace, eq(workspace.id, workspaceMembership.workspaceId))
      .where(and(
        eq(workspaceMembership.userId, userId),
        eq(workspaceMembership.active, true),
        eq(workspace.active, true),
      ))
      .orderBy(workspace.name);
  }
}
