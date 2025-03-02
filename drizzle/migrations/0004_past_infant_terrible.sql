ALTER TABLE "CertificateIssuance" ADD COLUMN "isRevoked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "CertificateIssuance" ADD COLUMN "revocationReason" text;--> statement-breakpoint
ALTER TABLE "CertificateIssuance" ADD COLUMN "isExpired" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "CertificateIssuance" ADD COLUMN "expirationDate" timestamp;--> statement-breakpoint
ALTER TABLE "CertificateIssuance" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;