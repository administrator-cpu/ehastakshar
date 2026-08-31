import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { documents } from "../db/schema.js";

export type NewDocument = typeof documents.$inferInsert;
export type Document = typeof documents.$inferSelect;

export class DocumentRepository {
  static async create(doc: NewDocument): Promise<Document> {
    const result = await db.insert(documents).values(doc).returning();
    if (!result[0]) {
      throw new Error("Failed to create document");
    }
    return result[0];
  }

  static async findById(id: string): Promise<Document | undefined> {
    const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
    return result[0];
  }

  static async findByTransactionId(transactionId: string): Promise<Document | undefined> {
    const result = await db.select().from(documents).where(eq(documents.transactionId, transactionId)).limit(1);
    return result[0];
  }

  static async updateStatus(id: string, status: "DRAFT" | "PENDING" | "COMPLETED" | "EXPIRED"): Promise<void> {
    await db.update(documents).set({ status, updatedAt: new Date() }).where(eq(documents.id, id));
  }

  static async updateFileUrl(id: string, fileUrl: string): Promise<void> {
    await db.update(documents).set({ fileUrl, updatedAt: new Date() }).where(eq(documents.id, id));
  }
}
