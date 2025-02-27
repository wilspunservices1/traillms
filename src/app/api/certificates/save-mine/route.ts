import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/libs/auth";
import { db } from "@/db";
import { certification } from "@/db/schemas/certification";

import { placeholders } from "@/db/schemas/placeholders";
import { uploadToCloudinary } from "@/libs/uploadinary/upload";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { certificateIssuance } from "@/db/schemas/certificateIssuance";
import { eq } from "drizzle-orm";

function generateUniqueIdentifier() {
	return "CERT-" + Math.random().toString(36).substring(2, 11).toUpperCase();
}

const saveCertificateSchema = z.object({
	owner_id: z
		.string()
		.uuid({ message: "Invalid owner_id (must be UUID format)" }),

	certificate_data_url: z.string().startsWith("data:image/", {
		message: "certificate_data_url must be a valid image in base64 format",
	}),

	title: z.string().min(1, { message: "Title is required" }),

	description: z.string().optional(),

	file_name: z.string().min(1, { message: "File name is required" }),

	expiration_date: z
		.string()
		.optional()
		.default(() => {
			const defaultExpirationDate = new Date();
			defaultExpirationDate.setFullYear(
				defaultExpirationDate.getFullYear() + 100
			);
			return defaultExpirationDate.toISOString(); // ✅ Always sets current date + 100 years
		}),

	is_revocable: z.boolean().optional().default(true),

	metadata: z.record(z.any()).optional().default({}),

	is_enabled: z.boolean().optional().default(true),

	orientation: z.enum(["landscape", "portrait"], {
		required_error: "Orientation is required",
	}),

	max_download: z.number().optional(),
	is_deleted: z.boolean().optional(),
	course_id: z
		.string()
		.uuid({ message: "Invalid owner_id (must be UUID format)" }),
});

function stripHtmlTags(html: string | undefined): string {
	if (!html) return "";
	return html.replace(/<[^>]+>/g, "").trim();
}

export async function POST(req: NextRequest) {
	try {
		// Authenticate the user
		let session = await getSession(req);
		if (!session || !session.user) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Check user roles
		const userRoles: string[] = session.user.roles || [];
		const allowedRoles = ["superAdmin", "instructor", "admin"];
		const hasAccess = userRoles.some((role) => allowedRoles.includes(role));
		if (!hasAccess) {
			return NextResponse.json({ message: "Forbidden" }, { status: 403 });
		}

		// Validate the request payload
		let payload;
		try {
			const requestBody = await req.json();
			console.log("Received payload:", requestBody);
			payload = saveCertificateSchema.parse(requestBody);
		} catch (error: any) {
			console.error("Validation error:", error);
			if (error instanceof z.ZodError) {
				const errorMessages = error.errors.map(
					(err) => `${err.path.join(".")}: ${err.message}`
				);
				return NextResponse.json(
					{ message: "Invalid input data", errors: errorMessages },
					{ status: 400 }
				);
			}
			return NextResponse.json(
				{ message: "Invalid input data", error: error.message },
				{ status: 400 }
			);
		}

		const {
			//id
			owner_id,
			certificate_data_url,
			description,
			//is_published
			//unique_identifier
			title,
			expiration_date,
			is_revocable,
			//created at
			//deleted at
			metadata,
			is_enabled,
			orientation,
			max_download,
			is_deleted,
			course_id,
			file_name,
		} = payload;

		// // ✅ Ensure metadata is a JSON object and append file_name
		// const updatedMetadata = {
		// 	...(metadata || {}), // Ensure metadata is always an object
		// 	file_name: file_name, // Append file_name
		// };

		// Upload image to Cloudinary
		const uploadResult = await uploadToCloudinary(
			certificate_data_url,
			title + ".png"
		);
		if (!uploadResult.success) {
			return NextResponse.json(
				{
					message: "Failed to upload image to Cloudinary",
					error: uploadResult.error,
				},
				{ status: 500 }
			);
		}

		const { secure_url } = uploadResult.result;

		//! Creation of new certificate ID HERE and insertion into certification table

		const certificateId = uuidv4();

		await db.transaction(async (trx) => {
			// Insert new certificate into the database
			await trx.insert(certification).values({
				id: certificateId,
				owner_id,
				certificate_data_url: secure_url,
				description:
					stripHtmlTags(description) || "No description provided",
				is_published: false,
				unique_identifier: generateUniqueIdentifier(),
				title,
				expiration_date,
				is_revocable: is_revocable,
				created_at: new Date(),
				updated_at: new Date(),
				file_name: file_name,
				metadata: metadata,
				is_enabled,
				orientation,
				max_download: max_download,
				is_deleted: is_deleted ?? false,
				course_id,
			});

			// ✅ Insert default placeholders
			const defaultPlaceholders = [
				{
					key: "studentName",
					label: "Student Name",
					value: "[STUDENT_NAME]",
					x: 20,
					y: 20,
				},
				{
					key: "sessionName",
					label: "Session Name",
					value: "[SESSION_NAME]",
					x: 20,
					y: 60,
				},
				{
					key: "sessionStartDate",
					label: "Session Start Date",
					value: "[SESSION_START_DATE]",
					x: 20,
					y: 100,
				},
				{
					key: "sessionEndDate",
					label: "Session End Date",
					value: "[SESSION_END_DATE]",
					x: 20,
					y: 140,
				},
				{
					key: "dateGenerated",
					label: "Date Generated",
					value: "[DATE_GENERATED]",
					x: 20,
					y: 180,
				},
				{
					key: "companyName",
					label: "Company Name",
					value: "[COMPANY_NAME]",
					x: 20,
					y: 220,
				},
				{
					key: "certificateNumber",
					label: "Certificate Number",
					value: "[CERTIFICATE_NUMBER]",
					x: 20,
					y: 260,
				},
			];

			// Prepare and insert placeholders
			const placeholdersToInsert = defaultPlaceholders.map(
				(placeholder) => ({
					id: uuidv4(),
					certificate_id: certificateId,
					key: placeholder.key,
					discount: 0,
					label: placeholder.label,
					is_visible: true,
					font_size: 14,
					color: "#000000",
					value: placeholder.value,
					x: placeholder.x,
					y: placeholder.y,
				})
			);

			await trx.insert(placeholders).values(placeholdersToInsert);
		});

		// Issue the certificate
		// await issueCertificate({
		//   certificateId,
		//   owner_id,
		//   issuedBy: session.user.id,
		// });

		// ✅ Query all placeholders for the newly created certificate
		const storedPlaceholders = await db
			.select()
			.from(placeholders)
			.where(eq(placeholders.certificate_id, certificateId));

		return NextResponse.json(
			{
				message: "Certificate saved successfully.",
				secure_url,
				certificate_id: certificateId,
				owner_id: owner_id,
				placeholders: storedPlaceholders, // ✅ Return the actual stored placeholders from DB
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error in POST handler:", error);
		return NextResponse.json(
			{
				message: "An unexpected error occurred",
				error: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
}

// async function issueCertificate({
//   certificateId,
//   owner_id,
//   issuedBy,
// }: {
//   certificateId: string;
//   owner_id: string;
//   issuedBy: string;
// }) {
//   try {
//     const issuanceUniqueIdentifier = `CERT-ISSUE-${uuidv4()}`;

//     await db.insert(certificateIssuance).values({
//       id: uuidv4(),
//       certificateId,
//       issuedBy,
//       issuedTo: owner_id,
//       issuanceUniqueIdentifier,
//       description: "Certificate issued directly after saving.",
//       isRevoked: false,
//       isExpired: false,
//       issuedAt: new Date(),
//     });
//   } catch (error) {
//     console.error("Error issuing certificate:", error);
//     throw new Error("Failed to issue certificate.");
//   }
// }
