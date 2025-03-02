// @ts-nocheck
 // @ts-expect-error - Override Next.js route type mismatch

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { placeholders as placeholdersTable } from "@/db/schemas/placeholders";
import { eq } from "drizzle-orm";

// PATCH API to update placeholder visibility
export async function PATCH(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { id } = params; // Placeholder ID
		const { is_visible } = await req.json();

		// Validate input
		if (typeof is_visible !== "boolean") {
			return NextResponse.json(
				{ error: "Invalid is_visible value" },
				{ status: 400 }
			);
		}

		// Update the placeholder's visibility in the database
		await db
			.update(placeholdersTable)
			.set({ is_visible })
			.where(eq(placeholdersTable.id, id));

		return NextResponse.json({
			message: "Placeholder visibility updated successfully",
		});
	} catch (error) {
		console.error("Error updating placeholder:", error);
		return NextResponse.json(
			{
				error: "Failed to update placeholder visibility",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
