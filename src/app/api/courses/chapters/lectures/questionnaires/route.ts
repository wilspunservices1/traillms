import { NextResponse } from "next/server";
import { db } from "@/db";
import { lectures } from "@/db/schemas/lectures";
import { chapters } from "@/db/schemas/courseChapters";
import { courseQuestionnaires } from "@/db/schemas/coursequestionnaires";
import { questionnaires } from "@/db/schemas/questionnaire";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("Fetching course questionnaires for lecture ID:", params.id);

    // Step 1: Get chapterId from the lectures table
    const lecture = await db
      .select({ chapterId: lectures.chapterId })
      .from(lectures)
      .where(eq(lectures.id, params.id))
      .limit(1);

    if (!lecture || lecture.length === 0) {
      return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
    }

    const chapterId = lecture[0].chapterId;

    // Step 2: Get courseId from the chapters table
    const chapter = await db
      .select({ courseId: chapters.courseId })
      .from(chapters)
      .where(eq(chapters.id, chapterId))
      .limit(1);

    if (!chapter || chapter.length === 0) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    const courseId = chapter[0].courseId;

    // Step 3: Fetch all questionnaires associated with this courseId
    const questionnairesList = await db
      .select({
        id: questionnaires.id,
        title: questionnaires.title,
      })
      .from(courseQuestionnaires)
      .innerJoin(
        questionnaires,
        eq(courseQuestionnaires.questionnaireId, questionnaires.id)
      )
      .where(eq(courseQuestionnaires.courseId, courseId));

    return NextResponse.json({
      courseId,
      questionnaires: questionnairesList,
    });
  } catch (error) {
    console.error("Error fetching course questionnaires:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
