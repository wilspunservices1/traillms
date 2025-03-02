ALTER TABLE "Certification" ADD COLUMN "title" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "Certification" ADD COLUMN "expirationDate" timestamp;--> statement-breakpoint
ALTER TABLE "Certification" ADD COLUMN "isRevocable" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "Certification" ADD COLUMN "metadata" text;