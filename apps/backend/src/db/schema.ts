import { pgTable, uuid, varchar, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";

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

export const documentStatusEnum = pgEnum("document_status", ["DRAFT", "PENDING", "COMPLETED", "EXPIRED"]);
export const signTypeEnum = pgEnum("sign_type", ["DIGITAL", "AADHAR"]);
export const recipientStatusEnum = pgEnum("recipient_status", ["PENDING", "SIGNED"]);

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  transactionId: varchar("transaction_id", { length: 100 }).notNull().unique(),
  uploaderId: uuid("uploader_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  fileUrl: varchar("file_url", { length: 1000 }).notNull(),
  originalHash: varchar("original_hash", { length: 255 }).notNull(),
  status: documentStatusEnum("status").default("PENDING").notNull(),
  signType: signTypeEnum("sign_type").default("DIGITAL").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documentRecipients = pgTable("document_recipients", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id").references(() => documents.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  status: recipientStatusEnum("status").default("PENDING").notNull(),
  secureToken: varchar("secure_token", { length: 100 }).notNull().unique(),
  signatureText: varchar("signature_text", { length: 255 }),
  signedAt: timestamp("signed_at"),
});

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id").references(() => documents.id).notNull(),
  recipientId: uuid("recipient_id").references(() => documentRecipients.id), // Nullable for sender actions
  action: varchar("action", { length: 100 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }), // Supports IPv6
  userAgent: varchar("user_agent", { length: 500 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
