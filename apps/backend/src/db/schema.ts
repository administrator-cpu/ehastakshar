import { pgTable, uuid, varchar, boolean, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastName: varchar("last_name", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  isEmailVerified: boolean("is_email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const otpRequests = pgTable("otp_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  otpHash: varchar("otp_hash", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  lastSentAt: timestamp("last_sent_at").defaultNow().notNull(),
});
