import { relations } from "drizzle-orm";
import { boolean, foreignKey, index, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { workspace, workspaceMembership } from "@/modules/workspaces/public";

export const project = pgTable("project", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspace.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique("project_workspace_slug_unique").on(table.workspaceId, table.slug),
  unique("project_workspace_id_unique").on(table.workspaceId, table.id),
  index("project_workspace_active_idx").on(table.workspaceId, table.active),
]);

export const projectMembership = pgTable("project_membership", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").notNull(),
  projectId: uuid("project_id").notNull(),
  workspaceMembershipId: uuid("workspace_membership_id").notNull(),
  role: text("role", { enum: ["admin", "member", "viewer"] }).notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique("project_membership_project_member_unique").on(table.projectId, table.workspaceMembershipId),
  unique("project_membership_project_id_unique").on(table.projectId, table.id),
  index("project_membership_member_active_idx").on(table.workspaceMembershipId, table.active),
  foreignKey({
    name: "project_membership_project_workspace_fk",
    columns: [table.workspaceId, table.projectId],
    foreignColumns: [project.workspaceId, project.id],
  }).onDelete("cascade"),
  foreignKey({
    name: "project_membership_workspace_member_fk",
    columns: [table.workspaceId, table.workspaceMembershipId],
    foreignColumns: [workspaceMembership.workspaceId, workspaceMembership.id],
  }).onDelete("cascade"),
]);

export const projectRelations = relations(project, ({ one, many }) => ({
  workspace: one(workspace, { fields: [project.workspaceId], references: [workspace.id] }),
  memberships: many(projectMembership),
}));
export const projectMembershipRelations = relations(projectMembership, ({ one }) => ({
  project: one(project, { fields: [projectMembership.workspaceId, projectMembership.projectId], references: [project.workspaceId, project.id] }),
  workspaceMembership: one(workspaceMembership, { fields: [projectMembership.workspaceId, projectMembership.workspaceMembershipId], references: [workspaceMembership.workspaceId, workspaceMembership.id] }),
}));
