CREATE TABLE IF NOT EXISTS "Blog" (
	"id" integer PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"desc" text NOT NULL,
	"date" text NOT NULL,
	"publishDate" text NOT NULL,
	"month" text NOT NULL,
	"authorName" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cart" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"courseId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"courseId" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"order" varchar(50),
	"duration" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"lesson" varchar(100) NOT NULL,
	"duration" varchar(100) NOT NULL,
	"description" text,
	"featured" boolean DEFAULT false,
	"price" numeric(10, 2) NOT NULL,
	"estimatedPrice" numeric(10, 2),
	"isFree" boolean DEFAULT false,
	"tag" varchar(100) NOT NULL,
	"skillLevel" varchar(100) NOT NULL,
	"categories" json DEFAULT ('[]') NOT NULL,
	"insName" varchar(255) NOT NULL,
	"thumbnail" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"userId" uuid NOT NULL,
	"demoVideoUrl" varchar(500),
	"isPublished" boolean DEFAULT false,
	"enrolledCount" numeric(10, 0) DEFAULT '0' NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"extras" json DEFAULT '{}' NOT NULL,
	"reviews" json DEFAULT '[]' NOT NULL,
	"comments" json DEFAULT '[]' NOT NULL,
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Event" (
	"id" integer PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"duration" text NOT NULL,
	"speaker" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "files" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"path" varchar(255),
	"size" integer,
	"courseId" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "InstructorApplications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"instructorBio" text DEFAULT '',
	"qualifications" json DEFAULT '[]' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lectures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chapterId" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"duration" varchar(100) NOT NULL,
	"videoUrl" varchar(500) NOT NULL,
	"isPreview" boolean DEFAULT false,
	"isLocked" boolean DEFAULT true,
	"order" varchar(50)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Meeting" (
	"id" bigint PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"date" text NOT NULL,
	"duration" text NOT NULL,
	"startingTime" text NOT NULL,
	"speakerName" text NOT NULL,
	"department" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"status" text NOT NULL,
	"totalAmount" numeric(10, 2) NOT NULL,
	"paymentMethod" text NOT NULL,
	"items" json NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uniqueIdentifier" text NOT NULL,
	"name" text NOT NULL,
	"username" text,
	"phone" text,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"roles" json DEFAULT '["user"]'::json NOT NULL,
	"enrolledCourses" json DEFAULT '[]'::json NOT NULL,
	"wishlist" json DEFAULT '[]'::json NOT NULL,
	"isVerified" boolean DEFAULT false NOT NULL,
	"activationToken" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"instructorBio" text DEFAULT '',
	"qualifications" json DEFAULT '[]'::json NOT NULL,
	CONSTRAINT "User_uniqueIdentifier_unique" UNIQUE("uniqueIdentifier"),
	CONSTRAINT "User_username_unique" UNIQUE("username"),
	CONSTRAINT "User_phone_unique" UNIQUE("phone"),
	CONSTRAINT "User_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserCategories" (
	"userId" uuid NOT NULL,
	"categoryId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "userDetails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"biography" text,
	"expertise" text[] DEFAULT '{}'::text[] NOT NULL,
	"registrationDate" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserSocials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"facebook" text DEFAULT '' NOT NULL,
	"twitter" text DEFAULT '' NOT NULL,
	"linkedin" text DEFAULT '' NOT NULL,
	"website" text DEFAULT '' NOT NULL,
	"github" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "VerificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "VerificationToken_token_unique" UNIQUE("token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cart" ADD CONSTRAINT "cart_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cart" ADD CONSTRAINT "cart_courseId_courses_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chapters" ADD CONSTRAINT "chapters_courseId_courses_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "courses" ADD CONSTRAINT "courses_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "files" ADD CONSTRAINT "files_courseId_courses_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lectures" ADD CONSTRAINT "lectures_chapterId_chapters_id_fk" FOREIGN KEY ("chapterId") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Orders" ADD CONSTRAINT "Orders_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserCategories" ADD CONSTRAINT "UserCategories_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserCategories" ADD CONSTRAINT "UserCategories_categoryId_Categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."Categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "userDetails" ADD CONSTRAINT "userDetails_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserSocials" ADD CONSTRAINT "UserSocials_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "verificationTokenUnique" ON "VerificationToken" USING btree ("identifier","token");