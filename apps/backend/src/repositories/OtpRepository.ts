import { db } from "../db/index.js";
import { otpRequests } from "../db/schema.js";
import { eq } from "drizzle-orm";

export type NewOtpRequest = typeof otpRequests.$inferInsert;
export type OtpRequest = typeof otpRequests.$inferSelect;

export class OtpRepository {
  static async upsert(otpRequest: NewOtpRequest): Promise<OtpRequest> {
    // We will upsert based on email so a user only has one active OTP at a time
    // Drizzle doesn't have a simple upsert by non-primary unique key without doing a conflict clause, 
    // but email is not unique in the DB schema for otp_requests (oops, I should make it unique or just delete/insert)
    
    // Simplest approach: Delete any existing OTPs for this email, then insert.
    await db.delete(otpRequests).where(eq(otpRequests.email, otpRequest.email));
    
    const result = await db.insert(otpRequests).values(otpRequest).returning();
    
    if (!result[0]) {
      throw new Error("Failed to insert OTP request");
    }
    
    return result[0];
  }

  static async findByEmail(email: string): Promise<OtpRequest | undefined> {
    const result = await db.select().from(otpRequests).where(eq(otpRequests.email, email)).limit(1);
    return result[0];
  }
  
  static async deleteByEmail(email: string): Promise<void> {
    await db.delete(otpRequests).where(eq(otpRequests.email, email));
  }
}
