import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export class UserRepository {
  static async findByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  static async create(user: NewUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    
    if (!result[0]) {
      throw new Error("Failed to create user");
    }
    
    return result[0];
  }

  static async markEmailAsVerified(email: string): Promise<void> {
    await db.update(users).set({ isEmailVerified: true }).where(eq(users.email, email));
  }
}
