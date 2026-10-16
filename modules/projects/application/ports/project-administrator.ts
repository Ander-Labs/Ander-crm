import type { AuditEventInput } from "@/modules/audit/public";

export interface ProjectAdministrator {
  createWithOwner(input: { workspaceId: string; name: string; slug: string; ownerUserId: string }, audit: AuditEventInput): Promise<string>;
}
