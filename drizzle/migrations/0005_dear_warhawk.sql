CREATE TABLE IF NOT EXISTS "Placeholders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"certificationId" uuid NOT NULL,
	"key" text NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"x" numeric(10, 2) DEFAULT '0' NOT NULL,
	"y" numeric(10, 2) DEFAULT '0' NOT NULL,
	"font_size" numeric(10, 2) DEFAULT '0' NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Placeholders" ADD CONSTRAINT "Placeholders_certificationId_Certification_id_fk" FOREIGN KEY ("certificationId") REFERENCES "public"."Certification"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
