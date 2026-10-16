import { and, eq } from "drizzle-orm";
import type { ProjectAdministrator } from "@/modules/projects/application/ports/project-administrator";
import { auditEvent, createAuditEvent } from "@/modules/audit/public";
import { project, projectMembership } from "@/modules/projects/infrastructure/persistence/schema";
import { workspace, workspaceMembership } from "@/modules/workspaces/public";
import { getDatabase } from "@/shared/infrastructure/database";

export class DrizzleProjectAdministrator implements ProjectAdministrator {
  async createWithOwner(input: Parameters<ProjectAdministrator["createWithOwner"]>[0], audit: Parameters<ProjectAdministrator["createWithOwner"]>[1]) {
    const db = getDatabase();
    return db.transaction(async (tx) => {
      const [activeWorkspace] = await tx.select({ id: workspace.id })
        .from(workspace).where(and(eq(workspace.id, input.workspaceId), eq(workspace.active, true))).for("update");
      if (!activeWorkspace) throw new Error("The workspace is not active.");
      const [membership] = await tx.select({ id: workspaceMembership.id })
        .from(workspaceMembership)
        .where(and(
          eq(workspaceMembership.workspaceId, input.workspaceId),
          eq(workspaceMembership.userId, input.ownerUserId),
          eq(workspaceMembership.active, true),
        )).limit(1);
      if (!membership) throw new Error("The project owner has no active workspace membership.");
      const [created] = await tx.insert(project).values({
        workspaceId: input.workspaceId,
        name: input.name,
        slug: input.slug,
      }).returning({ id: project.id });
      if (!created) throw new Error("Project creation did not complete.");
      await tx.insert(projectMembership).values({
        workspaceId: input.workspaceId,
        projectId: created.id,
        workspaceMembershipId: membership.id,
        role: "admin",
      });
      await tx.insert(auditEvent).values(createAuditEvent({ ...audit, resourceId: created.id }));
      return created.id;
    });
  }
}
