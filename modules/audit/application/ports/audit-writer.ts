import { createAuditEvent, type AuditEventInput } from "@/modules/audit/domain/audit-event";

export interface AuditWriter {
  append(event: ReturnType<typeof createAuditEvent>): Promise<void>;
}

export type AuditCommand = AuditEventInput;
