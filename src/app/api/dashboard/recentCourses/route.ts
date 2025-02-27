import { db } from "@/db";
import { desc, eq, sql } from "drizzle-orm";
import { courses } from "@/db/schemas/courses";
import { chapters } from "@/db/schemas/courseChapters";
import { lectures } from "@/db/schemas/lectures";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 10; // Number of courses per page
  const offset = (page - 1) * limit;

  try {
    const result = await db
      .select({
        courseId: courses.id,
        title: courses.title,
        slug: courses.slug,
        lesson: sql`COUNT(DISTINCT ${lectures.id}) AS lesson_count`, // Total number of lectures (lessons)
        // lesson: courses.lesson,
        featured: courses.featured,
        // price: courses.price,
        // estimatedPrice: courses.estimatedPrice,
        isFree: courses.isFree,
        tag: courses.tag,
        skillLevel: courses.skillLevel,
        categories: courses.categories,
        insName: courses.insName,
        thumbnail: courses.thumbnail,
        createdAt: courses.createdAt,
        enrolledCount: courses.enrolledCount,
        // discount: courses.discount,
        // reviews: courses.reviews,
        // comments: courses.comments,
        // Calculate the total duration of all chapters and lectures
        totalDuration: sql`COALESCE(SUM(TO_NUMBER(NULLIF(${chapters.duration}, '')::TEXT, '9999')), 0) 
                           + COALESCE(SUM(TO_NUMBER(NULLIF(${lectures.duration}, '')::TEXT, '9999')), 0)`.as('total_duration')
      })
      .from(courses)
      .leftJoin(chapters, sql`${chapters.courseId} = ${courses.id}`)
      .leftJoin(lectures, sql`${lectures.chapterId} = ${chapters.id}`)
      .where(eq(courses.isPublished, true)) // Only fetch published courses
      .groupBy(courses.id)
      .orderBy(desc(courses.createdAt)) // Get most recent courses first courses.createdAt.desc()
      .limit(limit)
      .offset(offset);

    // Get total course count for pagination
    const totalCourses = await db
      .select({ count: sql`COUNT(*)`.as("total") })
      .from(courses)
      .where(eq(courses.isPublished, true)); // courses.isPublished.eq(true)

    return NextResponse.json({
      courses: result,
      totalCourses: totalCourses[0].total,
      currentPage: page,
      totalPages: Math.ceil(totalCourses[0].total / limit),
    });
  } catch (error) {
    console.error("Error fetching recent courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent courses" },
      { status: 500 }
    );
  }
}
