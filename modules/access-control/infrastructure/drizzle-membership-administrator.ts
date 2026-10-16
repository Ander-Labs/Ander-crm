import { and, eq } from "drizzle-orm";
import type { MembershipAdministrator } from "@/modules/access-control/application/ports/membership-administrator";
import { auditEvent, createAuditEvent } from "@/modules/audit/public";
import { project, projectMembership } from "@/modules/projects/public";
import { workspace, workspaceMembership } from "@/modules/workspaces/public";
import { getDatabase } from "@/shared/infrastructure/database";

export class DrizzleMembershipAdministrator implements MembershipAdministrator {
  async setWorkspaceRole(input: Parameters<MembershipAdministrator["setWorkspaceRole"]>[0], audit: Parameters<MembershipAdministrator["setWorkspaceRole"]>[1]) {
    const db = getDatabase();
    await db.transaction(async (tx) => {
      const [activeWorkspace] = await tx.select({ id: workspace.id }).from(workspace)
        .where(and(eq(workspace.id, input.workspaceId), eq(workspace.active, true))).for("update");
      if (!activeWorkspace) throw new Error("The workspace is not active.");
      const currentRows = await tx.select({ userId: workspaceMembership.userId, role: workspaceMembership.role })
        .from(workspaceMembership)
        .where(and(eq(workspaceMembership.workspaceId, input.workspaceId), eq(workspaceMembership.active, true)));
      const current = currentRows.find((row) => row.userId === input.targetUserId);
      if (current?.role === "owner" && input.role !== "owner" && currentRows.filter((row) => row.role === "owner").length <= 1) {
        throw new Error("A workspace must retain at least one active owner.");
      }
      await tx.insert(workspaceMembership).values({
        workspaceId: input.workspaceId,
        userId: input.targetUserId,
        role: input.role,
      }).onConflictDoUpdate({
        target: [workspaceMembership.workspaceId, workspaceMembership.userId],
        set: { role: input.role, active: true },
      });
      await tx.insert(auditEvent).values(createAuditEvent({ ...audit, resourceId: input.targetUserId }));
    });
  }

  async setProjectRole(input: Parameters<MembershipAdministrator["setProjectRole"]>[0], audit: Parameters<MembershipAdministrator["setProjectRole"]>[1]) {
    const db = getDatabase();
    await db.transaction(async (tx) => {
      const [member] = await tx.select({ id: workspaceMembership.id })
        .from(workspaceMembership)
        .where(and(
          eq(workspaceMembership.workspaceId, input.workspaceId),
          eq(workspaceMembership.userId, input.targetUserId),
          eq(workspaceMembership.active, true),
        ))
        .limit(1);
      const [targetProject] = await tx.select({ id: project.id })
        .from(project)
        .where(and(eq(project.workspaceId, input.workspaceId), eq(project.id, input.projectId), eq(project.active, true)))
        .for("update")
        .limit(1);
      if (!member || !targetProject) throw new Error("The target user or project is outside the active workspace scope.");

      const currentRoles = await tx.select({ memberId: projectMembership.workspaceMembershipId, role: projectMembership.role })
        .from(projectMembership)
        .where(and(eq(projectMembership.workspaceId, input.workspaceId), eq(projectMembership.projectId, input.projectId), eq(projectMembership.active, true)));
      const targetCurrent = currentRoles.find((row) => row.memberId === member.id);
      if (targetCurrent?.role === "admin" && input.role !== "admin" && currentRoles.filter((row) => row.role === "admin").length <= 1) {
        throw new Error("A project must retain at least one active administrator.");
      }

      await tx.insert(projectMembership).values({
        workspaceId: input.workspaceId,
        projectId: input.projectId,
        workspaceMembershipId: member.id,
        role: input.role,
      }).onConflictDoUpdate({
        target: [projectMembership.projectId, projectMembership.workspaceMembershipId],
        set: { role: input.role, active: true },
      });
      await tx.insert(auditEvent).values(createAuditEvent({ ...audit, resourceId: input.targetUserId }));
    });
  }
}
