import { NextResponse } from "next/server";
import { db } from "@/db";
import { questionnaires } from "@/db/schemas/questionnaire";
import { questions } from "@/db/schemas/questions";
import { courseQuestionnaires } from "@/db/schemas/coursequestionnaires"; //edited by jayesh chak on 03/02/2025
import { z } from "zod";

const questionnaireSchema = z.object({
  title: z.string().min(1, "Title is required"),
  courseId: z.string().min(1, "Course ID is required"),
  questions: z
    .array(
      z.object({
        question: z.string().min(1, "Question is required"),
        options: z.array(z.string().min(1, "Option cannot be empty")),
        correctAnswer: z.string().min(1, "Correct answer is required"),
      })
    )
    .min(1, "At least one question is required"),
  isRequired: z.boolean().default(true),
  minPassScore: z.number().default(80),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Incoming request body:", body);

    const parsedData = questionnaireSchema.parse(body);
    console.log("Parsed data:", parsedData);

    const {
      title,
      courseId,
      questions: questionData,
      isRequired,
      minPassScore,
    } = parsedData;

    // First create the questionnaire
    const [newQuestionnaire] = await db
      .insert(questionnaires)
      .values({
        title,
        courseId,
        isRequired,
        minPassScore,
      })
      .returning({
        id: questionnaires.id,
        title: questionnaires.title,
      });

    if (!newQuestionnaire?.id) {
      throw new Error("Failed to create questionnaire");
    }

    // Then create the questions
    const questionValues = questionData.map((q) => ({
      questionnaireId: newQuestionnaire.id,
      question: q.question,
      options: JSON.stringify(q.options),
      correctAnswer: q.correctAnswer,
    }));

    await db.insert(questions).values(questionValues);

    // Insert into course_questionnaires                   //edited by jayesh chak on 03/02/2025
    await db.insert(courseQuestionnaires).values({
      courseId,
      questionnaireId: newQuestionnaire.id,
      isActive: true,
    }); //edited by jayesh chak on 03/02/2025

    return NextResponse.json(
      {
        success: true,
        message: "Questionnaire saved successfully",
        data: {
          questionnaireId: newQuestionnaire.id,
          title: newQuestionnaire.title,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving questionnaire:", error);
    
    // Improved error handling
    const errorMessage = error instanceof z.ZodError 
      ? error.errors.map(e => e.message).join(', ')
      : error instanceof Error 
        ? error.message 
        : 'An unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: "Failed to save questionnaire",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
