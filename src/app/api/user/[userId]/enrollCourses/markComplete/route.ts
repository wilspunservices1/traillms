// src/app/api/user/[userId]/markComplete/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schemas/user';
import { chapters } from '@/db/schemas/courseChapters';
import { lectures } from '@/db/schemas/lectures';
import { eq, inArray } from 'drizzle-orm';

// UUID validation regex
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Helper function to retrieve all chapter IDs for a given course.
 * @param courseId - The UUID of the course.
 * @returns An array of chapter IDs.
 */
async function getChapterIds(courseId: string): Promise<string[]> {
  const courseChapters = await db
    .select({
      id: chapters.id,
    })
    .from(chapters)
    .where(eq(chapters.courseId, courseId));

  return courseChapters.map((chapter) => chapter.id);
}

/**
 * Helper function to retrieve all lecture IDs for given chapter IDs.
 * @param chapterIds - An array of chapter IDs.
 * @returns An array of lecture IDs.
 */
async function getLectureIds(chapterIds: string[]): Promise<string[]> {
  const courseLectures = await db
    .select({
      id: lectures.id,
    })
    .from(lectures)
    .where(inArray(lectures.chapterId, chapterIds));

  return courseLectures.map((lecture) => lecture.id);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { courseId, lectureId, isCompleted } = body;

    // **Step 1: Validate Request Body**

    // Check if all required fields are present
    if (!courseId || !lectureId || typeof isCompleted !== 'boolean') {
      return NextResponse.json(
        { error: "Missing required fields: 'courseId', 'lectureId', 'isCompleted'." },
        { status: 400 }
      );
    }

    // Validate UUID formats
    if (
      typeof courseId !== 'string' ||
      typeof lectureId !== 'string' ||
      !uuidRegex.test(courseId) ||
      !uuidRegex.test(lectureId)
    ) {
      return NextResponse.json(
        { error: "Invalid 'courseId' or 'lectureId' format. Must be valid UUID strings." },
        { status: 400 }
      );
    }

    // **Step 2: Fetch Existing User Data**

    const existingUser = await db
      .select({
        enrolledCourses: user.enrolledCourses,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!existingUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // **Step 3: Find the Enrolled Course**

    const enrolledCourses = existingUser.enrolledCourses; // Assuming this is an array

    const courseIndex = enrolledCourses.findIndex((course: any) => course.courseId === courseId);

    if (courseIndex === -1) {
      return NextResponse.json(
        { error: "User is not enrolled in the specified course." },
        { status: 400 }
      );
    }

    // **Step 4: Validate Lecture and Chapter**

    // Retrieve all chapter IDs for the course
    const chapterIds = await getChapterIds(courseId);

    if (chapterIds.length === 0) {
      return NextResponse.json(
        { error: "No chapters found for the specified course." },
        { status: 404 }
      );
    }

    // Retrieve all lecture IDs for the chapters
    const lectureIds = await getLectureIds(chapterIds);

    if (lectureIds.length === 0) {
      return NextResponse.json(
        { error: "No lectures found for the specified course." },
        { status: 404 }
      );
    }

    // Check if the provided lectureId exists within the course
    if (!lectureIds.includes(lectureId)) {
      return NextResponse.json(
        { error: "The specified lecture does not belong to the given course." },
        { status: 400 }
      );
    }

    // **Step 5: Update Completed Lectures**

    // Initialize completedLectures if not present
    if (!enrolledCourses[courseIndex].completedLectures) {
      enrolledCourses[courseIndex].completedLectures = [];
    }

    const completedLectures: string[] = enrolledCourses[courseIndex].completedLectures;

    if (isCompleted) {
      // Add lectureId if not already present
      if (!completedLectures.includes(lectureId)) {
        completedLectures.push(lectureId);
      }
    } else {
      // Remove lectureId if present
      const lecturePos = completedLectures.indexOf(lectureId);
      if (lecturePos !== -1) {
        completedLectures.splice(lecturePos, 1);
      }
    }

    // **Step 6: Calculate New Progress**

    const totalLectures = lectureIds.length;
    const completedCount = completedLectures.length;
    const newProgress = totalLectures === 0 ? 0 : Math.floor((completedCount / totalLectures) * 100);

    // **Step 7: Update Enrolled Course**

    enrolledCourses[courseIndex].progress = newProgress;
    enrolledCourses[courseIndex].completedLectures = completedLectures;

    // **Step 8: Update User in the Database**

    const updatedUser = await db
      .update(user)
      .set({ enrolledCourses: enrolledCourses })
      .where(eq(user.id, userId))
      .returning();

    // **Step 9: Prepare Completion Counter**

    const completionCounter = `${completedCount}/${totalLectures} completed`;

    // **Step 10: Return Success Response**

    return NextResponse.json({
      message: "Lecture completion status updated successfully.",
      updatedProgress: newProgress,
      completionCounter: completionCounter,
      updatedEnrolledCourses: enrolledCourses[courseIndex],
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error marking lecture as complete:", error);
    return NextResponse.json(
      { error: "An error occurred while updating lecture completion status.", details: error.message },
      { status: 500 }
    );
  }
}
