import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/libs/auth";
import { db } from "@/db";
import { user } from "@/db/schemas/user";
import { eq } from "drizzle-orm";

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getSession(req);
		if (!session?.user) {
			return NextResponse.json({ hasPurchased: false }, { status: 401 });
		}

		const courseId = params.id;
		console.log("Checking purchase for courseId:", courseId);

		// Fetch user's roles and enrolled courses
		const [userData] = await db
			.select({
				roles: user.roles,
				enrolledCourses: user.enrolledCourses,
			})
			.from(user)
			.where(eq(user.id, session.user.id));

		console.log("User enrolled courses:", userData?.enrolledCourses);

		// Allow superAdmin and admin to access the certificate, but not all users
		if (
			userData?.roles?.some((role) =>
				["superAdmin", "admin"].includes(role)
			)
		) {
			return NextResponse.json({ hasPurchased: true });
		}

		// Ensure `enrolledCourses` exists and is an array
		if (
			!Array.isArray(userData?.enrolledCourses) ||
			userData.enrolledCourses.length === 0
		) {
			console.log("No enrolled courses found");
			return NextResponse.json({ hasPurchased: false });
		}

		// Check if user has purchased this specific course
		const hasPurchased = userData.enrolledCourses.some(
			(course: { id: string }) => course.id === courseId
		);

		console.log("Purchase check result:", hasPurchased);

		return NextResponse.json({ hasPurchased });
	} catch (error) {
		console.error("Error checking enrollment:", error);
		return NextResponse.json(
			{ error: "Failed to check course enrollment" },
			{ status: 500 }
		);
	}
}
