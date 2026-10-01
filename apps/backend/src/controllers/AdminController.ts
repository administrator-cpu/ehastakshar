import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { users, documents } from "../db/schema.js";
import { eq, sql, desc } from "drizzle-orm";
import { logger } from "../utils/logger.js";
import { z } from "zod";
import { UserRepository } from "../repositories/UserRepository.js";
import { AuthService } from "../services/AuthService.js";

const addCustomerSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  tempPassword: z.string().min(8, "Temporary password must be at least 8 characters"),
});

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

  static async addCustomer(req: Request, res: Response): Promise<void> {
    try {
      const parsed = addCustomerSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.format() });
        return;
      }
      const { fullName, email, phone, tempPassword } = parsed.data;

      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        res.status(409).json({ error: "A user with this email already exists" });
        return;
      }

      const nameParts = fullName.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

      const passwordHash = await AuthService.hashString(tempPassword);

      await UserRepository.create({
        firstName,
        lastName,
        email,
        phone,
        passwordHash,
        mustChangePassword: true,
        isEmailVerified: true, // Created by admin
        role: "CUSTOMER",
      });

      // Send the welcome email in the background
      AuthService.sendWelcomeEmail(email, tempPassword).catch((err) => {
        logger.error({ err }, "Failed to send welcome email");
      });

      res.status(201).json({ message: "Customer created successfully" });
    } catch (error) {
      logger.error({ err: error, path: req.originalUrl }, "Failed to add customer");
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
