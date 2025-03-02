CREATE TABLE IF NOT EXISTS "CertificateTracking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"certificateId" uuid NOT NULL,
	"verificationCode" text NOT NULL,
	"holderName" text NOT NULL,
	"issueDate" timestamp NOT NULL,
	"expiryDate" timestamp,
	"lastVerifiedAt" timestamp,
	"status" text NOT NULL,
	"grade" text,
	"score" text,
	"digitalSignature" text,
	"verificationHistory" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "CertificateTracking_verificationCode_unique" UNIQUE("verificationCode")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_questionnaires" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"questionnaire_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "managecertificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"course_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_deleted" text DEFAULT 'false' NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "questionnaires" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"course_id" uuid NOT NULL,
	"chapter_id" uuid,
	"is_required" boolean DEFAULT true,
	"min_pass_score" integer DEFAULT 80,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"questionnaire_id" uuid,
	"question" text,
	"options" text,
	"correct_answer" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quiz_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"questionnaire_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"answers" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Certification" RENAME TO "certification";--> statement-breakpoint
ALTER TABLE "Placeholders" RENAME TO "placeholders";--> statement-breakpoint
ALTER TABLE "certification" RENAME COLUMN "ownerId" TO "owner_id";--> statement-breakpoint
ALTER TABLE "certification" RENAME COLUMN "certificateData" TO "certificate_data_url";--> statement-breakpoint
ALTER TABLE "certification" RENAME COLUMN "isPublished" TO "is_published";--> statement-breakpoint
ALTER TABLE "certification" RENAME COLUMN "uniqueIdentifier" TO "unique_identifier";--> statement-breakpoint
ALTER TABLE "certification" RENAME COLUMN "expirationDate" TO "expiration_date";--> statement-breakpoint
ALTER TABLE "certification" RENAME COLUMN "isRevocable" TO "is_revocable";--> statement-breakpoint
ALTER TABLE "certification" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "certification" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "placeholders" RENAME COLUMN "certificationId" TO "certificate_id";--> statement-breakpoint
ALTER TABLE "certification" DROP CONSTRAINT "Certification_uniqueIdentifier_unique";--> statement-breakpoint
ALTER TABLE "CertificateIssuance" DROP CONSTRAINT "CertificateIssuance_certificateId_Certification_id_fk";
--> statement-breakpoint
ALTER TABLE "certification" DROP CONSTRAINT "Certification_ownerId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "courses" DROP CONSTRAINT "courses_certificateId_Certification_id_fk";
--> statement-breakpoint
ALTER TABLE "placeholders" DROP CONSTRAINT "Placeholders_certificationId_Certification_id_fk";
--> statement-breakpoint
ALTER TABLE "certification" ALTER COLUMN "description" SET DEFAULT 'description';--> statement-breakpoint
ALTER TABLE "certification" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "certification" ALTER COLUMN "title" SET DEFAULT 'title_here';--> statement-breakpoint
ALTER TABLE "certification" ALTER COLUMN "metadata" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "placeholders" ALTER COLUMN "discount" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "placeholders" ALTER COLUMN "discount" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "placeholders" ALTER COLUMN "discount" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "placeholders" ALTER COLUMN "font_size" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "placeholders" ALTER COLUMN "font_size" SET DEFAULT '12';--> statement-breakpoint
ALTER TABLE "certification" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "certification" ADD COLUMN "is_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "certification" ADD COLUMN "orientation" text DEFAULT 'landscape' NOT NULL;--> statement-breakpoint
ALTER TABLE "certification" ADD COLUMN "max_download" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "certification" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "certification" ADD COLUMN "course_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "chapters" ADD COLUMN "questionnaireId" uuid;--> statement-breakpoint
ALTER TABLE "placeholders" ADD COLUMN "label" text DEFAULT 'PlaceHolderLabel' NOT NULL;--> statement-breakpoint
ALTER TABLE "placeholders" ADD COLUMN "color" text DEFAULT '#000000' NOT NULL;--> statement-breakpoint
ALTER TABLE "placeholders" ADD COLUMN "value" text DEFAULT 'PlaceHolderValue' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CertificateTracking" ADD CONSTRAINT "CertificateTracking_certificateId_certification_id_fk" FOREIGN KEY ("certificateId") REFERENCES "public"."certification"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_questionnaires" ADD CONSTRAINT "course_questionnaires_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_questionnaires" ADD CONSTRAINT "course_questionnaires_questionnaire_id_questionnaires_id_fk" FOREIGN KEY ("questionnaire_id") REFERENCES "public"."questionnaires"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "managecertificates" ADD CONSTRAINT "managecertificates_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "managecertificates" ADD CONSTRAINT "managecertificates_courseFk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "questionnaires" ADD CONSTRAINT "questionnaires_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "questionnaires" ADD CONSTRAINT "questionnaires_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "questions" ADD CONSTRAINT "questions_questionnaire_id_questionnaires_id_fk" FOREIGN KEY ("questionnaire_id") REFERENCES "public"."questionnaires"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_questionnaire_id_questionnaires_id_fk" FOREIGN KEY ("questionnaire_id") REFERENCES "public"."questionnaires"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CertificateIssuance" ADD CONSTRAINT "CertificateIssuance_certificateId_certification_id_fk" FOREIGN KEY ("certificateId") REFERENCES "public"."certification"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "certification" ADD CONSTRAINT "certification_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "certification" ADD CONSTRAINT "Certification_ownerId_User_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "courses" ADD CONSTRAINT "courses_certificateId_certification_id_fk" FOREIGN KEY ("certificateId") REFERENCES "public"."certification"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "placeholders" ADD CONSTRAINT "placeholders_certificate_id_certification_id_fk" FOREIGN KEY ("certificate_id") REFERENCES "public"."certification"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "placeholders" ADD CONSTRAINT "placeholders_certificate_id_certifications_id_fk" FOREIGN KEY ("certificate_id") REFERENCES "public"."certification"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "certification" ADD CONSTRAINT "Certification_uniqueIdentifier_unique" UNIQUE("unique_identifier");