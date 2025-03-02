import { eq } from "drizzle-orm";
import { courses } from "@/db/schemas/courses";
import { db } from "@/db/index";
import { NextRequest, NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate the UUID
    if (!uuidValidate(id)) {
      return NextResponse.json(
        { message: "Invalid UUID format." },
        { status: 400 }
      );
    }

    // Fetch the course by ID and select only the isPublished field
    const courseResult = await db
      .select({
        isPublished: courses.isPublished,
      })
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1);

    const course = courseResult[0];

    // Check if the course was found
    if (!course) {
      return NextResponse.json(
        { message: "Course not found." },
        { status: 404 }
      );
    }

    // Return the isPublished status
    return NextResponse.json({
      isPublished: course.isPublished,
    });
  } catch (error) {
    // Handle all other errors
    console.error("Error fetching course status:", error);

    return NextResponse.json(
      { message: "An unexpected error occurred.", error: error.message },
      { status: 500 }
    );
  }
}
