import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { questionnaires } from "@/db/schemas/questionnaire";
import { chapters } from "@/db/schemas/courseChapters"; // Ensure correct import
import { eq } from "drizzle-orm";
import { z } from "zod";
import { courseQuestionnaires } from "@/db/schemas/coursequestionnaires";

// Validation schema for the request body
const assignSchema = z.object({
  questionnaireId: z.string().min(1, "Questionnaire ID is required"),
  courseId: z.string().min(1, "Course ID is required"),
  chapterId: z.string().min(1, "Chapter ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await req.json();
    console.log("Request body:", body);

    const { questionnaireId, courseId, chapterId } = assignSchema.parse(body);
    console.log("Parsed body:", { questionnaireId, courseId, chapterId });

    // 1️⃣ Fetch the questionnaire details
    const [questionnaire] = await db
      .select()
      .from(questionnaires)
      .where(eq(questionnaires.id, questionnaireId))
      .limit(1);

    if (!questionnaire) {
      return NextResponse.json(
        { success: false, error: "Questionnaire not found" },
        { status: 404 }
      );
    }

    // 2️⃣ If a chapter is provided, validate that it exists
    if (chapterId) {
      const [foundChapter] = await db
        .select()
        .from(chapters)
        .where(eq(chapters.id, chapterId))
        .limit(1);

      if (!foundChapter) {
        return NextResponse.json(
          { success: false, error: "Chapter not found" },
          { status: 404 }
        );
      }

      // Ensure the chapter belongs to the same course
      if (courseId !== foundChapter.courseId) {
        return NextResponse.json(
          {
            success: false,
            error: "Questionnaire and Chapter must belong to the same Course",
          },
          { status: 400 }
        );
      }
    }

    // 3️⃣ Check if questionnaire is already linked to the course
    const [existingCourseQuestionnaire] = await db
      .select()
      .from(courseQuestionnaires)
      .where(eq(courseQuestionnaires.questionnaireId, questionnaireId))
      .limit(1);

    let courseQuestionnaireId: string;

    if (!existingCourseQuestionnaire) {
      // 🆕 Insert into `course_questionnaires`
      const [newCourseQuestionnaire] = await db
        .insert(courseQuestionnaires)
        .values({
          courseId,
          questionnaireId,
          isActive: true,
        })
        .returning({ id: courseQuestionnaires.id });

      if (!newCourseQuestionnaire) {
        console.log("Failed to insert into course_questionnaires");
        return NextResponse.json(
          { success: false, error: "Failed to link questionnaire to course" },
          { status: 500 }
        );
      }

      courseQuestionnaireId = newCourseQuestionnaire.id;
    } else {
      courseQuestionnaireId = existingCourseQuestionnaire.id;
    }

    console.log("Course Questionnaire ID:", courseQuestionnaireId);

    // 4️⃣ Update the questionnaire with the assigned chapter (or remove chapterId if not provided)
    console.log("Updating questionnaire with:", { courseId, chapterId });

    const [updatedQuestionnaire] = await db
      .update(questionnaires)
      .set({
        courseId,
        chapterId: chapterId || null, // Save or clear chapterId
        id_course_questionnaires_questionnaire_id: courseQuestionnaireId, // Link it properly
        updatedAt: new Date(),
      })
      .where(eq(questionnaires.id, questionnaireId))
      .returning({
        id: questionnaires.id,
        title: questionnaires.title,
        chapterId: questionnaires.chapterId,
        courseId: questionnaires.courseId,
        // id_course_questionnaires_questionnaire_id: courseQuestionnaireId,
      });

    if (!updatedQuestionnaire) {
      console.log("Failed to update questionnaire");
      return NextResponse.json(
        { success: false, error: "Failed to assign questionnaire" },
        { status: 500 }
      );
    }

    console.log("Successfully assigned questionnaire:", updatedQuestionnaire);

    // 5️⃣ If a chapter is provided, update the chapter's questionnaireId
    if (chapterId) {
      await db
        .update(chapters)
        .set({
          questionnaireId: questionnaireId, // Assign the questionnaire
        })
        .where(eq(chapters.id, chapterId));
    }

    return NextResponse.json({
      success: true,
      message: "Questionnaire assigned successfully",
      data: updatedQuestionnaire,
    });
  } catch (error) {
    console.error("Error assigning questionnaire:", error);
    return NextResponse.json(
      { success: false, error: "Invalid request data", details: error.errors },
      { status: 400 }
    );
  }
}

// GET endpoint to fetch assignment status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const questionnaireId = searchParams.get("questionnaireId");

    if (!questionnaireId) {
      return NextResponse.json(
        { error: "Questionnaire ID is required" },
        { status: 400 }
      );
    }

    const questionnaire = await db
      .select({
        id: questionnaires.id,
        chapterId: questionnaires.chapterId,
        courseId: questionnaires.courseId,
      })
      .from(questionnaires)
      .where(eq(questionnaires.id, questionnaireId))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: questionnaire[0] || null,
    });
  } catch (error) {
    console.error("Error fetching assignment status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch assignment status",
      },
      { status: 500 }
    );
  }
}
