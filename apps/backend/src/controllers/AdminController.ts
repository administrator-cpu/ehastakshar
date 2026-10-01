import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { users, documents } from "../db/schema.js";
import { eq, sql, desc } from "drizzle-orm";
import { logger } from "../utils/logger.js";

export class AdminController {
  static async getCustomers(req: Request, res: Response): Promise<void> {
    try {
      // Get all customers and aggregate document stats in a single query to prevent connection exhaustion
      const customersWithStats = await db
        .select({
          id: users.id,
          name: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
          email: users.email,
          createdAt: users.createdAt,
          totalDocuments: sql<number>`count(${documents.id})::int`,
          completedDocuments: sql<number>`coalesce(sum(case when ${documents.status} = 'COMPLETED' then 1 else 0 end), 0)::int`,
        })
        .from(users)
        .leftJoin(documents, eq(users.id, documents.uploaderId))
        .where(eq(users.role, "CUSTOMER"))
        .groupBy(users.id)
        .orderBy(desc(users.createdAt));

      res.status(200).json(customersWithStats);
    } catch (error) {
      logger.error({ err: error, path: req.originalUrl }, "Failed to fetch customers");
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
