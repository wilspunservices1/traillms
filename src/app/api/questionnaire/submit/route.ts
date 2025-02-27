import { NextResponse } from "next/server";
import { db } from "@/db";
import { getServerSession } from "next-auth/next";
import { questionnaires } from "@/db/schemas/questionnaire";
import { questions } from "@/db/schemas/questions";
import { quizAttempts } from "@/db/schemas/quizAttempts";
import { and, eq } from "drizzle-orm";
import { user } from "@/db/schemas/user";
import { options as authOptions } from "@/libs/auth";



export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		console.log("Session Data:", session);

		if (!session?.user?.email) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const user_id = session.user.id;

		// const user_id = userRecord[0].id; // Extract user ID
		const { questionnaire_id, answers } = await req.json();

		//! --- New: Enforce the three-attempt rule ---

		const existingAttempts = await db
			.select({ id: quizAttempts.id })
			.from(quizAttempts)
			.where(
				and(
					eq(quizAttempts.user_id, user_id),
					eq(quizAttempts.questionnaire_id, questionnaire_id)
				)
			);

		const totalAttempts = existingAttempts.length;
		console.log("Total Attempts:", totalAttempts);

		if (totalAttempts >= 3) {
			return NextResponse.json(
				{
					error: "Maximum quiz attempts reached",
					attemptCount: totalAttempts, // ✅ Return attemptCount in response
				},
				{ status: 400 }
			);
		}

		//! --- End New ---

		/// Fetch questionnaire
		const questionnaire = await db
			.select()
			.from(questionnaires)
			.where(eq(questionnaires.id, questionnaire_id))
			.limit(1);

		if (!questionnaire || questionnaire.length === 0) {
			return NextResponse.json(
				{ error: "Questionnaire not found" },
				{ status: 404 }
			);
		}

		const questionsList = await db
			.select({
				id: questions.id,
				question: questions.question,
				correct_answer: questions.correctAnswer, // Ensure correct answer is fetched
				options: questions.options,
			})
			.from(questions)
			.where(eq(questions.questionnaireId, questionnaire_id));

		console.log("Fetched Questions from DB:", questionsList);

		if (!questionsList || questionsList.length === 0) {
			return NextResponse.json(
				{ error: "No questions found for this quiz" },
				{ status: 400 }
			);
		}

		// Calculate score
		let correctAnswers = 0;
		const totalQuestions = questionsList.length;

		questionsList.forEach((question) => {
			const userAnswer = answers[question.id]
				? answers[question.id].trim().toLowerCase()
				: null;
			const correct_answer = question.correct_answer
				? question.correct_answer.trim().toLowerCase()
				: null;

			if (userAnswer === correct_answer) {
				correctAnswers++;
			}
		});

		// Store user answer data correctly
		const answerDetails = questionsList.map((question) => {
			const userAnswer = answers[question.id]
				? answers[question.id].trim().toLowerCase()
				: null;
			const correct_answer = question.correct_answer
				? question.correct_answer.trim().toLowerCase()
				: null;
			const isCorrect = userAnswer === correct_answer;

			return {
				questionId: question.id,
				userAnswer,
				correct_answer, // Include correct answer for debugging
				isCorrect,
			};
		});

		const score = Math.round((correctAnswers / totalQuestions) * 100);

		const attempt = await db
			.insert(quizAttempts)
			.values({
				user_id,
				questionnaire_id,
				score,
				answers: JSON.stringify(answerDetails), // Ensure correct format
				created_at: new Date(),
				updated_at: new Date(),
			})
			.returning({ id: quizAttempts.id });

		console.log("Insert Result:", attempt);

		if (!attempt || attempt.length === 0) {
			return NextResponse.json(
				{ error: "Quiz submission failed" },
				{ status: 500 }
			);
		}

		// After inserting a new attempt
		const updatedAttemptCount = totalAttempts + 1; 

		return NextResponse.json({
			success: true,
			score,
			attemptCount: updatedAttemptCount,
			correctAnswers,
			totalQuestions,
			feedback: {
				questions: answerDetails,
			},
		});
	} catch (error) {
		console.error("Error submitting quiz:", error);
		return NextResponse.json(
			{ error: "Failed to submit quiz" },
			{ status: 500 }
		);
	}
}
