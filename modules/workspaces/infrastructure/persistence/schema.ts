import { relations } from "drizzle-orm";
import { boolean, index, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { user } from "@/modules/identity/public";

export const workspace = pgTable("workspace", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [unique("workspace_slug_unique").on(table.slug), unique("workspace_id_unique").on(table.id)]);

export const workspaceMembership = pgTable("workspace_membership", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspace.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["owner", "admin", "member", "viewer"] }).notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique("workspace_membership_workspace_user_unique").on(table.workspaceId, table.userId),
  unique("workspace_membership_workspace_id_unique").on(table.workspaceId, table.id),
  index("workspace_membership_user_active_idx").on(table.userId, table.active),
]);

export const workspaceRelations = relations(workspace, ({ many }) => ({ memberships: many(workspaceMembership) }));
export const workspaceMembershipRelations = relations(workspaceMembership, ({ one }) => ({
  workspace: one(workspace, { fields: [workspaceMembership.workspaceId], references: [workspace.id] }),
  user: one(user, { fields: [workspaceMembership.userId], references: [user.id] }),
}));
