import { DrizzleMembershipReader } from "@/modules/access-control/infrastructure/drizzle-membership-reader";
import { DrizzleMembershipAdministrator } from "@/modules/access-control/infrastructure/drizzle-membership-administrator";
import { DrizzleAuditWriter } from "@/modules/audit/infrastructure/drizzle-audit-writer";
import { serverSessionProvider } from "@/modules/identity/presentation/server-session-provider";
import { DrizzleProjectDirectory } from "@/modules/projects/infrastructure/drizzle-project-directory";
import { DrizzleProjectAdministrator } from "@/modules/projects/infrastructure/drizzle-project-administrator";
import { DrizzleWorkspaceDirectory } from "@/modules/workspaces/infrastructure/drizzle-workspace-directory";

export const identityComposition = {
  sessions: serverSessionProvider,
  memberships: new DrizzleMembershipReader(),
  membershipAdministrator: new DrizzleMembershipAdministrator(),
  audit: new DrizzleAuditWriter(),
  workspaces: new DrizzleWorkspaceDirectory(),
  projects: new DrizzleProjectDirectory(),
  projectAdministrator: new DrizzleProjectAdministrator(),
};
