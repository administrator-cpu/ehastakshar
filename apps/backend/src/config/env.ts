import { z } from "zod";
import { logger } from "../utils/logger.js";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(10),
  PORT: z.string().optional().default("3001"),
  FRONTEND_URL: z.string().url().optional().default("http://localhost:3000"),
  
  // Storage (R2)
  STORAGE_PROVIDER: z.enum(["LOCAL", "R2"]).default("LOCAL"),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_PUBLIC_URL: z.string().url().optional(),

  // Email API
  EMAIL_SERVICE_API_KEY: z.string().min(1, "EMAIL_SERVICE_API_KEY is required"),
  EMAIL_SERVICE_DOMAIN: z.string().url("EMAIL_SERVICE_DOMAIN must be a valid URL"),
});

const parseEnv = () => {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    logger.fatal({ errors: parsed.error.format() }, "❌ Invalid or missing environment variables. Server cannot start.");
    process.exit(1);
  }
  
  return parsed.data;
};

export const env = parseEnv();
