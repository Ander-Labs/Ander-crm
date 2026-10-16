import type { AuditWriter } from "@/modules/audit/application/ports/audit-writer";
import { auditEvent } from "@/modules/audit/infrastructure/persistence/schema";
import { getDatabase } from "@/shared/infrastructure/database";

export class DrizzleAuditWriter implements AuditWriter {
  async append(event: Parameters<AuditWriter["append"]>[0]): Promise<void> {
    await getDatabase().insert(auditEvent).values(event);
  }
}
