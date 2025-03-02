CREATE TABLE IF NOT EXISTS "CertificateIssuance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"certificateId" uuid NOT NULL,
	"issuedBy" uuid NOT NULL,
	"issuedTo" uuid NOT NULL,
	"signature" text,
	"description" text,
	"issuanceUniqueIdentifier" text NOT NULL,
	"issuedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "CertificateIssuance_issuanceUniqueIdentifier_unique" UNIQUE("issuanceUniqueIdentifier")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Certification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ownerId" uuid NOT NULL,
	"certificateData" text NOT NULL,
	"description" text,
	"isPublished" boolean DEFAULT false NOT NULL,
	"uniqueIdentifier" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Certification_uniqueIdentifier_unique" UNIQUE("uniqueIdentifier")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CertificateIssuance" ADD CONSTRAINT "CertificateIssuance_certificateId_Certification_id_fk" FOREIGN KEY ("certificateId") REFERENCES "public"."Certification"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CertificateIssuance" ADD CONSTRAINT "CertificateIssuance_issuedBy_User_id_fk" FOREIGN KEY ("issuedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CertificateIssuance" ADD CONSTRAINT "CertificateIssuance_issuedTo_User_id_fk" FOREIGN KEY ("issuedTo") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Certification" ADD CONSTRAINT "Certification_ownerId_User_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
