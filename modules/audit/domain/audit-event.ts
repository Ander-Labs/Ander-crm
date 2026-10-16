import type { CredentialKind } from "@/modules/identity/public";

export interface AuditEventInput {
  actorUserId: string | null;
  credentialKind: CredentialKind;
  workspaceId?: string;
  projectId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  outcome: "succeeded" | "denied" | "failed";
  correlationId: string;
  metadata?: Readonly<Record<string, string | number | boolean | null>>;
}

const safeMetadataKeys = new Set(["reasonCode", "targetRole", "changedFields", "count", "approvalId", "source"]);
const sensitiveKey = /token|secret|password|email|phone|address|name|body|prompt|content|authorization|cookie/i;

export function createAuditEvent(input: AuditEventInput) {
  if (!input.action.trim() || !input.resourceType.trim() || input.correlationId.length < 8) {
    throw new Error("Audit action, resource type and correlation ID are required.");
  }
  const metadata = Object.fromEntries(
    Object.entries(input.metadata ?? {}).filter(([key]) => safeMetadataKeys.has(key) && !sensitiveKey.test(key)),
  );
  return {
    ...input,
    action: input.action.slice(0, 120),
    resourceType: input.resourceType.slice(0, 80),
    resourceId: input.resourceId?.slice(0, 160),
    correlationId: input.correlationId.slice(0, 160),
    metadata,
  };
}
