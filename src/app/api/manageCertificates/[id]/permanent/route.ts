import { NextResponse } from "next/server";
import { getSession } from "@/libs/auth";
import { db } from "@/db";
import { certification } from "@/db/schemas/certification";
import { courses } from "@/db/schemas/courses"; // Import courses table
import { eq } from "drizzle-orm";

export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getSession(request);
		if (!session?.user) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const certificateId = params.id;

		// 1️⃣ Remove certificateId from courses if any course has it
		await db
			.update(courses)
			.set({ certificateId: null }) // Set certificateId to NULL
			.where(eq(courses.certificateId, certificateId))
			.execute();

		// 2️⃣ Delete the certificate
		await db
			.delete(certification)
			.where(eq(certification.id, certificateId))
			.execute();

		return NextResponse.json({
			success: true,
			message: "Certificate permanently deleted and removed from courses",
		});
	} catch (error) {
		console.error("Error permanently deleting certificate:", error);
		return NextResponse.json(
			{
				message: "Failed to permanently delete certificate",
				details:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
