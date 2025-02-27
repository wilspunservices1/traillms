import { NextResponse } from "next/server";
import { db } from "@/db";
import { getServerSession } from "next-auth/next";
import { quizAttempts } from "@/db/schemas/quizAttempts";
import { eq, count } from "drizzle-orm";
import { options as authOptions } from "@/libs/auth";

export async function GET(req: Request) {
	try {
		// ✅ Step 1: Authenticate User
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const user_id = session.user.id;

		// ✅ Step 2: Fetch All Quiz Attempts for the User
		const attemptsData = await db
			.select({
				questionnaire_id: quizAttempts.questionnaire_id,
				attempt_count: count(quizAttempts.id).as("attempt_count"), // ✅ Simple & working count
			})
			.from(quizAttempts)
			.where(eq(quizAttempts.user_id, user_id))
			.groupBy(quizAttempts.questionnaire_id);

		// ✅ Step 3: Convert Attempts to a Simple Object Format
		const attempts: Record<string, number> = {};
		attemptsData.forEach((row) => {
			attempts[row.questionnaire_id] = row.attempt_count;
		});

		// ✅ Step 4: Return JSON Response
		return NextResponse.json({ attempts });
	} catch (error) {
		console.error("Error fetching quiz attempts:", error);
		return NextResponse.json(
			{ error: "Failed to fetch quiz attempts" },
			{ status: 500 }
		);
	}
}
