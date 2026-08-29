ALTER TABLE "audit_events" ADD COLUMN "latitude" varchar(50);--> statement-breakpoint
ALTER TABLE "audit_events" ADD COLUMN "longitude" varchar(50);--> statement-breakpoint
ALTER TABLE "audit_events" ADD COLUMN "photo_url" varchar(1000);--> statement-breakpoint
ALTER TABLE "audit_events" ADD COLUMN "city" varchar(100);--> statement-breakpoint
ALTER TABLE "audit_events" ADD COLUMN "state" varchar(100);--> statement-breakpoint
ALTER TABLE "audit_events" ADD COLUMN "country" varchar(100);--> statement-breakpoint
ALTER TABLE "audit_events" ADD COLUMN "browser" varchar(100);--> statement-breakpoint
ALTER TABLE "audit_events" ADD COLUMN "device_type" varchar(100);--> statement-breakpoint
ALTER TABLE "document_recipients" ADD COLUMN "require_gps" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "document_recipients" ADD COLUMN "require_photo" boolean DEFAULT false NOT NULL;