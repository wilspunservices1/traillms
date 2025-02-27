import { NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and, desc, isNotNull, inArray } from "drizzle-orm";
import { quizAttempts } from "@/db/schemas/quizAttempts";
import { chapters } from "@/db/schemas/courseChapters";
import { user } from "@/db/schemas/user";

import { getServerSession } from "next-auth/next";
import { options as authOptions } from "@/libs/auth";
import { questions } from "@/db/schemas/questions";
import { getSession } from "next-auth/react";

// Dummy function to get current user id from session; adjust as needed.
async function getCurrentUserId() {
	const session = await getServerSession(authOptions);
	if (!session?.user?.email) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userRecord = await db
		.select({ id: user.id }) // Fetch only required field
		.from(user)
		.where(eq(user.email, session.user.email))
		.limit(1);

	if (!userRecord.length) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	return userRecord[0].id;
}

export async function GET(
	req: Request,
	{ params }: { params: { courseId: string } }
) {
	try {
		const userId = await getCurrentUserId();
		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const questionnaireIds = await db
			.select({ questionnaireId: chapters.questionnaireId })
			.from(chapters)
			.where(
				and(
					eq(chapters.courseId, params.courseId),
					isNotNull(chapters.questionnaireId)
				)
			)
			.then((results) => results.map((c) => c.questionnaireId));

		if (!questionnaireIds.length) {
			return NextResponse.json({
				progress: 0,
				totalScore: 0,
				maxScore: 0,
			});
		}

		// Fetch latest attempt for each quiz
		const latestAttempts = await db
			.select({
				questionnaire_id: quizAttempts.questionnaire_id,
				score: quizAttempts.score,
			})
			.from(quizAttempts)
			.where(
				and(
					eq(quizAttempts.user_id, userId),
					inArray(quizAttempts.questionnaire_id, questionnaireIds)
				)
			)
			.orderBy(desc(quizAttempts.created_at))
			.groupBy(quizAttempts.questionnaire_id); // Ensures we get the latest per quiz

		// Fetch total possible scores (sum of total questions per quiz)
		const maxScores = await db
			.select({
				questionnaire_id: questions.questionnaireId,
				count: db.fn.count(questions.id).as("total_questions"), // Uses `as()` properly
			})
			.from(questions)
			.where(inArray(questions.questionnaireId, questionnaireIds))
			.groupBy(questions.questionnaireId);

		// Calculate total scores
		const totalScore = latestAttempts.length
			? latestAttempts.reduce(
					(sum, attempt) => sum + (attempt.score || 0),
					0
			  )
			: 0;

		const maxScore = maxScores.length
			? maxScores.reduce(
					(sum, max) => sum + (max.total_questions || 0),
					0
			  )
			: 0;

		const progress = maxScore
			? Math.round((totalScore / maxScore) * 100)
			: 0;

		return NextResponse.json({ progress, totalScore, maxScore });
	} catch (error) {
		console.error("Error fetching progress:", error);
		return NextResponse.json(
			{ error: "Failed to fetch progress" },
			{ status: 500 }
		);
	}
}
