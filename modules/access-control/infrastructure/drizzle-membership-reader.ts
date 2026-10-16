import { and, eq } from "drizzle-orm";
import type { MembershipReader } from "@/modules/access-control/application/ports/membership-reader";
import { project, projectMembership } from "@/modules/projects/public";
import { workspace, workspaceMembership } from "@/modules/workspaces/public";
import { getDatabase } from "@/shared/infrastructure/database";

export class DrizzleMembershipReader implements MembershipReader {
  async findActiveWorkspaceRole(userId: string, workspaceId: string) {
    const [membership] = await getDatabase()
      .select({ role: workspaceMembership.role })
      .from(workspaceMembership)
      .innerJoin(workspace, eq(workspace.id, workspaceMembership.workspaceId))
      .where(and(
        eq(workspaceMembership.userId, userId),
        eq(workspaceMembership.workspaceId, workspaceId),
        eq(workspaceMembership.active, true),
        eq(workspace.active, true),
      ))
      .limit(1);
    return membership?.role ?? null;
  }

  async findActiveProjectRole(userId: string, workspaceId: string, projectId: string) {
    const [membership] = await getDatabase()
      .select({ role: projectMembership.role })
      .from(projectMembership)
      .innerJoin(workspaceMembership, and(
        eq(workspaceMembership.id, projectMembership.workspaceMembershipId),
        eq(workspaceMembership.workspaceId, projectMembership.workspaceId),
      ))
      .innerJoin(project, and(
        eq(project.id, projectMembership.projectId),
        eq(project.workspaceId, projectMembership.workspaceId),
      ))
      .innerJoin(workspace, eq(workspace.id, projectMembership.workspaceId))
      .where(and(
        eq(workspaceMembership.userId, userId),
        eq(workspaceMembership.active, true),
        eq(projectMembership.workspaceId, workspaceId),
        eq(projectMembership.projectId, projectId),
        eq(projectMembership.active, true),
        eq(project.active, true),
        eq(workspace.active, true),
      ))
      .limit(1);
    return membership?.role ?? null;
  }
}
