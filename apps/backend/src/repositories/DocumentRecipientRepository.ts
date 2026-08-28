import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { documentRecipients } from "../db/schema.js";

export type NewDocumentRecipient = typeof documentRecipients.$inferInsert;
export type DocumentRecipient = typeof documentRecipients.$inferSelect;

export class DocumentRecipientRepository {
  static async create(recipient: NewDocumentRecipient): Promise<DocumentRecipient> {
    const result = await db.insert(documentRecipients).values(recipient).returning();
    if (!result[0]) {
      throw new Error("Failed to create document recipient");
    }
    return result[0];
  }

  static async createMany(recipients: NewDocumentRecipient[]): Promise<DocumentRecipient[]> {
    if (recipients.length === 0) return [];
    return await db.insert(documentRecipients).values(recipients).returning();
  }

  static async findBySecureToken(token: string): Promise<DocumentRecipient | undefined> {
    const result = await db.select().from(documentRecipients).where(eq(documentRecipients.secureToken, token)).limit(1);
    return result[0];
  }

  static async findById(id: string): Promise<DocumentRecipient | undefined> {
    const result = await db.select().from(documentRecipients).where(eq(documentRecipients.id, id)).limit(1);
    return result[0];
  }

  static async findByDocumentId(documentId: string): Promise<DocumentRecipient[]> {
    return await db.select().from(documentRecipients).where(eq(documentRecipients.documentId, documentId));
  }

  static async markAsSigned(id: string, signatureText: string): Promise<void> {
    await db.update(documentRecipients).set({ 
      status: "SIGNED", 
      signatureText, 
      signedAt: new Date() 
    }).where(eq(documentRecipients.id, id));
  }
}
