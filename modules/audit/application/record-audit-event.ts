import type { AuditWriter } from "@/modules/audit/application/ports/audit-writer";
import { createAuditEvent, type AuditEventInput } from "@/modules/audit/domain/audit-event";

export async function recordAuditEvent(input: AuditEventInput, writer: AuditWriter): Promise<void> {
  await writer.append(createAuditEvent(input));
}
