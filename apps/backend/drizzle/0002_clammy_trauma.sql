
ALTER TABLE "document_recipients" ADD COLUMN "consent_given" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "document_recipients" ADD COLUMN "consent_given_at" timestamp;--> statement-breakpoint
ALTER TABLE "document_recipients" ADD COLUMN "signature_positions" jsonb;--> statement-breakpoint
ALTER TABLE "document_recipients" ADD COLUMN "sequence_order" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "must_change_password" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'CUSTOMER' NOT NULL;