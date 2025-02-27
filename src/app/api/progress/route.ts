import { NextResponse } from "next/server";
import { db } from "@/db";
import { getServerSession } from "next-auth/next";
import { quizAttempts } from "@/db/schemas/quizAttempts";
import { and, eq, desc } from "drizzle-orm";
import { options as authOptions } from "@/libs/auth";

export async function GET(req: Request) {
	try {
		// Get user session
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const user_id = session.user.id;

		// Fetch latest quiz scores for the user
		const latestAttempts = await db
			.select({
				questionnaire_id: quizAttempts.questionnaire_id,
				score: quizAttempts.score,
			})
			.from(quizAttempts)
			.where(eq(quizAttempts.user_id, user_id))
			.orderBy(desc(quizAttempts.created_at));

		// If no attempts found, return empty progress
		if (!latestAttempts.length) {
			return NextResponse.json({ scores: {} });
		}

		// Format scores as an object { questionnaire_id: score }
		const scores = latestAttempts.reduce((acc, attempt) => {
			acc[attempt.questionnaire_id] = attempt.score;
			return acc;
		}, {} as Record<string, number>);

		return NextResponse.json({ scores });
	} catch (error) {
		console.error("Error fetching progress:", error);
		return NextResponse.json(
			{ error: "Failed to fetch progress" },
			{ status: 500 }
		);
	}
}
