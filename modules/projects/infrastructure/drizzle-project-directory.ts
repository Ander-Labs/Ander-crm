import { and, eq } from "drizzle-orm";
import type { ProjectDirectory } from "@/modules/projects/application/project-directory";
import { project, projectMembership } from "@/modules/projects/infrastructure/persistence/schema";
import { workspace, workspaceMembership } from "@/modules/workspaces/public";
import { getDatabase } from "@/shared/infrastructure/database";

export class DrizzleProjectDirectory implements ProjectDirectory {
  async listForUserInWorkspace(userId: string, workspaceId: string) {
    return getDatabase()
      .select({ id: project.id, workspaceId: project.workspaceId, slug: project.slug, name: project.name, role: projectMembership.role })
      .from(projectMembership)
      .innerJoin(workspaceMembership, and(
        eq(workspaceMembership.id, projectMembership.workspaceMembershipId),
        eq(workspaceMembership.workspaceId, projectMembership.workspaceId),
      ))
      .innerJoin(project, and(
        eq(project.id, projectMembership.projectId),
        eq(project.workspaceId, projectMembership.workspaceId),
      ))
      .innerJoin(workspace, eq(workspace.id, project.workspaceId))
      .where(and(
        eq(workspaceMembership.userId, userId),
        eq(workspaceMembership.active, true),
        eq(projectMembership.active, true),
        eq(projectMembership.workspaceId, workspaceId),
        eq(project.active, true),
        eq(workspace.active, true),
      ))
      .orderBy(project.name);
  }
}
