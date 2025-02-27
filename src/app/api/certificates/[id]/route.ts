import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { placeholders as placeholdersSchema } from "@/db/schemas/placeholders";
import { z } from "zod";
import { getSession } from "@/libs/auth";
import { eq } from "drizzle-orm";
import { fetchCertificateDetails } from "@/actions/certification"; // Import statement
import { certification } from "@/db/schemas/certification";

const IdSchema = z.string().uuid();
const PlaceholdersSchema = z.array(
	z.object({
		id: z.string(),
		value: z.string(),
		x: z.number(),
		y: z.number(),
		fontSize: z.number(),
		isVisible: z.boolean(),
	})
);

export async function PATCH(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;

	const parsedId = IdSchema.safeParse(id);
	if (!parsedId.success) {
		return NextResponse.json(
			{ message: "Invalid certificate ID" },
			{ status: 400 }
		);
	}

	let session = await getSession(req);
	if (!session || !session.user) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const userRoles: string[] = session.user.roles || [];
	const hasAccess =
		userRoles.includes("superAdmin") ||
		userRoles.includes("instructor") ||
		userRoles.includes("admin");

	if (!hasAccess) {
		return NextResponse.json({ message: "Forbidden" }, { status: 403 });
	}

	try {
		const body = await req.json();
		const { is_published } = body; // Extract is_published from the request

		if (typeof is_published !== "boolean") {
			return NextResponse.json(
				{ message: "Invalid is_published value" },
				{ status: 400 }
			);
		}

		// ✅ Unpublish all certificates in the same course before publishing a new one
		const certificate = await db
			.select()
			.from(certification)
			.where(eq(certification.id, id))
			.execute();

		if (!certificate.length) {
			return NextResponse.json(
				{ message: "Certificate not found" },
				{ status: 404 }
			);
		}

		// ✅ Check if the logged-in user owns this certificate
		if (certificate[0].owner_id !== session.user.id) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 403 }
			);
		}

		const courseId = certificate[0].course_id;

		await db.transaction(async (trx) => {
			await trx
				.update(certification)
				.set({ is_published: false })
				.where(eq(certification.course_id, courseId));

			await trx
				.update(certification)
				.set({ is_published: true })
				.where(eq(certification.id, id));
		});

		return NextResponse.json(
			{ message: "Certificate updated successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error updating certificate:", error);
		return NextResponse.json(
			{ message: "Failed to update certificate" },
			{ status: 500 }
		);
	}
}

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;

	// Extract the actual ID from the Cloudinary URL if necessary
	const actualId = id.split("/").pop()?.split("_").pop()?.split(".")[0] || id;

	console.log("Received ID:", id);
	console.log("Extracted ID:", actualId);

	const parsedId = IdSchema.safeParse(actualId);
	if (!parsedId.success) {
		console.error("Invalid certificate ID:", actualId);
		return NextResponse.json(
			{ message: "Invalid certificate ID" },
			{ status: 400 }
		);
	}

	let session = await getSession(req);

	if (!session && process.env.NODE_ENV === "development") {
		console.warn("No session found. Using mock session for testing.");
		session = {
			user: {
				id: "0d78a48d-0128-4351-9aa4-394534ae31c6",
				roles: ["superAdmin"],
			},
		};
	}

	if (!session || !session.user) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	try {
		// Fetch the certificate details from your database
		const certificate = await fetchCertificateDetails(actualId);

		if (!certificate) {
			return NextResponse.json(
				{ message: "Certificate not found" },
				{ status: 404 }
			);
		}

		const placeholders = await db
			.select()
			.from(placeholdersSchema)
			.where(eq(placeholdersSchema.certificate_id, actualId))
			.execute();

		console.log("Fetched placeholders:", placeholders);

		return NextResponse.json({
			certificate: {
				id: actualId,
				ownerId: certificate.ownerId,
				certificateData: certificate.certificateData,
				description: certificate.description,
				isPublished: certificate.isPublished,
				uniqueIdentifier: certificate.uniqueIdentifier,
				title: certificate.title,
				expirationDate: certificate.expirationDate,
				isRevocable: certificate.isRevocable,
				metadata: certificate.metadata,
				createdAt: certificate.createdAt,
				updatedAt: certificate.updatedAt,
				placeholders: placeholders,
			},
		});
	} catch (error) {
		console.error("Error fetching certificate:", error);
		return NextResponse.json(
			{ message: "Failed to fetch certificate" },
			{ status: 500 }
		);
	}
}

export async function POST(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id } = params;

	const parsedId = IdSchema.safeParse(id);
	if (!parsedId.success) {
		return NextResponse.json(
			{ message: "Invalid certificate ID" },
			{ status: 400 }
		);
	}

	let session = await getSession(req);

	if (!session && process.env.NODE_ENV === "development") {
		console.warn("No session found. Using mock session for testing.");
		session = {
			user: {
				id: "0d78a48d-0128-4351-9aa4-394534ae31c6",
				roles: ["superAdmin"],
			},
		};
	}

	if (!session || !session.user) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const userRoles: string[] = session.user.roles || [];
	const hasAccess =
		userRoles.includes("superAdmin") ||
		userRoles.includes("instructor") ||
		userRoles.includes("admin");

	if (!hasAccess) {
		return NextResponse.json({ message: "Forbidden" }, { status: 403 });
	}

	try {
		const body = await req.json();
		const placeholdersResult = PlaceholdersSchema.safeParse(
			body.placeholders
		);

		if (!placeholdersResult.success) {
			return NextResponse.json(
				{ message: "Invalid placeholders data" },
				{ status: 400 }
			);
		}

		await db
			.deleteFrom(placeholdersSchema)
			.where(eq(placeholdersSchema.certificate_id, id))
			.execute();

		await db
			.insertInto(placeholdersSchema)
			.values(
				placeholdersResult.data.map((p) => ({
					certificateId: id,
					key: p.id,
					value: p.value,
					x: p.x,
					y: p.y,
					fontSize: p.fontSize,
					isVisible: p.isVisible,
				}))
			)
			.execute();

		return NextResponse.json(
			{ message: "Placeholders saved successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error saving placeholders:", error);
		return NextResponse.json(
			{ message: "Failed to save placeholders" },
			{ status: 500 }
		);
	}
}
