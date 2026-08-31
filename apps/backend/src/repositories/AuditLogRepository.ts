import { eq, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { auditEvents } from "../db/schema.js";

export type NewAuditEvent = typeof auditEvents.$inferInsert;
export type AuditEvent = typeof auditEvents.$inferSelect;

export class AuditLogRepository {
  static async logEvent(event: NewAuditEvent): Promise<AuditEvent> {
    const result = await db.insert(auditEvents).values(event).returning();
    if (!result[0]) {
      throw new Error("Failed to log audit event");
    }
    return result[0];
  }

  static async getEventsForDocument(documentId: string): Promise<AuditEvent[]> {
    return await db.select().from(auditEvents)
      .where(eq(auditEvents.documentId, documentId))
      .orderBy(desc(auditEvents.timestamp));
  }
}
