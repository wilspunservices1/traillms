ALTER TABLE "courses" ADD COLUMN "certificateId" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "courses" ADD CONSTRAINT "courses_certificateId_Certification_id_fk" FOREIGN KEY ("certificateId") REFERENCES "public"."Certification"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
