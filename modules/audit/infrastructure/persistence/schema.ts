import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { project } from "@/modules/projects/public";
import { workspace } from "@/modules/workspaces/public";
import { user } from "@/modules/identity/public";

export const auditEvent = pgTable("audit_event", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorUserId: text("actor_user_id").references(() => user.id, { onDelete: "set null" }),
  credentialKind: text("credential_kind", { enum: ["session", "api_key", "oauth", "service", "system"] }).notNull(),
  workspaceId: uuid("workspace_id").references(() => workspace.id, { onDelete: "set null" }),
  projectId: uuid("project_id").references(() => project.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id"),
  outcome: text("outcome", { enum: ["succeeded", "denied", "failed"] }).notNull(),
  correlationId: text("correlation_id").notNull(),
  metadata: jsonb("metadata").$type<Record<string, string | number | boolean | null>>().notNull().default({}),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("audit_event_workspace_time_idx").on(table.workspaceId, table.occurredAt),
  index("audit_event_actor_time_idx").on(table.actorUserId, table.occurredAt),
  index("audit_event_correlation_idx").on(table.correlationId),
]);
