import { describe, expect, it } from "vitest";
import { createAuditEvent } from "@/modules/audit/domain/audit-event";

describe("audit event payload", () => {
  it("keeps only approved metadata keys and omits secrets and personal data", () => {
    const event = createAuditEvent({
      actorUserId: "user-1",
      credentialKind: "session",
      action: "workspace.members.update",
      resourceType: "workspace_membership",
      outcome: "succeeded",
      correlationId: "request-12345678",
      metadata: { targetRole: "admin", email: "person@example.test", token: "secret", unapproved: "value" },
    });
    expect(event.metadata).toEqual({ targetRole: "admin" });
  });
});
