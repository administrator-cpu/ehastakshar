import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { documents, documentRecipients, auditEvents } from "../db/schema.js";
import { desc, eq, sql } from "drizzle-orm";
import { logger } from "../utils/logger.js";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export class DashboardController {
  static async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const uploaderId = req.userId;
      if (!uploaderId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // Aggregate counts
      const countsResult = await db
        .select({
          total: sql<number>`count(*)`,
          pending: sql<number>`sum(case when status = 'PENDING' then 1 else 0 end)`,
          completed: sql<number>`sum(case when status = 'COMPLETED' then 1 else 0 end)`,
        })
        .from(documents)
        .where(eq(documents.uploaderId, uploaderId));

      const stats = {
        total: Number(countsResult[0]?.total || 0),
        pending: Number(countsResult[0]?.pending || 0),
        completed: Number(countsResult[0]?.completed || 0),
      };

      // Get recent documents (top 5)
      const recentDocuments = await db
        .select({
          id: documents.id,
          title: documents.title,
          status: documents.status,
          signType: documents.signType,
          updatedAt: documents.updatedAt,
          transactionId: documents.transactionId,
        })
        .from(documents)
        .where(eq(documents.uploaderId, uploaderId))
        .orderBy(desc(documents.updatedAt))
        .limit(5);

      res.status(200).json({ stats, recentDocuments });
    } catch (error) {
      logger.error({ err: error, path: req.originalUrl }, "Error fetching dashboard stats");
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getDocumentDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const uploaderId = req.userId;
      const documentId = req.params.id as string;

      if (!documentId) {
        res.status(400).json({ error: "Document ID is required" });
        return;
      }

      if (!uploaderId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // Fetch the document
      const docResult = await db
        .select()
        .from(documents)
        .where(sql`${documents.id} = ${documentId} AND ${documents.uploaderId} = ${uploaderId}`);

      if (docResult.length === 0) {
        res.status(404).json({ error: "Document not found" });
        return;
      }

      const document = docResult[0];

      // Fetch recipients
      const recipients = await db
        .select({
          id: documentRecipients.id,
          name: documentRecipients.name,
          email: documentRecipients.email,
          status: documentRecipients.status,
          signedAt: documentRecipients.signedAt,
        })
        .from(documentRecipients)
        .where(eq(documentRecipients.documentId, documentId));

      // Fetch audit trail
      const auditTrail = await db
        .select({
          id: auditEvents.id,
          action: auditEvents.action,
          ipAddress: auditEvents.ipAddress,
          timestamp: auditEvents.timestamp,
          recipientName: documentRecipients.name,
          recipientEmail: documentRecipients.email,
        })
        .from(auditEvents)
        .leftJoin(documentRecipients, eq(auditEvents.recipientId, documentRecipients.id))
        .where(eq(auditEvents.documentId, documentId))
        .orderBy(desc(auditEvents.timestamp));

      res.status(200).json({ document, recipients, auditTrail });
    } catch (error) {
      logger.error({ err: error, path: req.originalUrl }, "Error fetching document details");
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
