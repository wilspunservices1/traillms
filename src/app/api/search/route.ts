import { db } from "@/db";
import { desc, eq, ilike, sql } from "drizzle-orm";
import { courses } from "@/db/schemas/courses";
import { NextRequest, NextResponse } from "next/server";
import { htmlToText } from "html-to-text"; // Import the html-to-text package

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 10; // Number of courses per page
  const offset = (page - 1) * limit;

  // Get query parameters for categories and search
  const category = url.searchParams.get("category"); // Category filter
  const searchQuery = url.searchParams.get("q"); // Search query filter

  try {
    // Build base query for fetching courses with optional filters
    let courseQuery = db
      .select({
        id: courses.id,
        title: courses.title,
        image: courses.thumbnail, // Assuming this is the image field
        instructor: courses.insName, // Instructor's name
        categories: courses.categories, // Categories
        description: courses.description, // Get the description to extract tags from it
      })
      .from(courses)
      .where(eq(courses.isPublished, true)) // Only fetch published courses
      .groupBy(courses.id)
      .orderBy(desc(courses.createdAt)) // Get most recent courses first
      .limit(limit)
      .offset(offset);

    // Apply category filter if provided
    if (category) {
      courseQuery = courseQuery.where(
        sql`${courses.categories} @> ${JSON.stringify([category])}::jsonb`
      );
    }

    // Apply search query filter if provided
    if (searchQuery) {
      courseQuery = courseQuery.where(
        ilike(courses.description, `%${searchQuery}%`)
      );
    }

    const result = await courseQuery;

    // Clean HTML from descriptions and extract keywords
    const cleanedResults = result.map((course) => {
      const plainTextDescription = htmlToText(course.description, {
        wordwrap: false,
        ignoreHref: true,
        ignoreImage: true,
      });

      // Extract the first few meaningful words as tags
      const tags = plainTextDescription
        .split(/\s+/) // Split by spaces
        .filter((word) => word.length > 3) // Filter out short words
        .slice(0, 5); // Take the first 5 words for the tags

      return {
        id: course.id,
        title: course.title,
        image: course.image,
        instructor: course.instructor,
        categories: course.categories,
        tags, // Return the cleaned tags
      };
    });

    // Build the query for counting total courses with the same filters
    let totalCoursesQuery = db
      .select({ count: sql`COUNT(*)`.as("total") })
      .from(courses)
      .where(eq(courses.isPublished, true));

    if (category) {
      totalCoursesQuery = totalCoursesQuery.where(
        sql`${courses.categories} @> ${JSON.stringify([category])}::jsonb`
      );
    }

    if (searchQuery) {
      totalCoursesQuery = totalCoursesQuery.where(
        ilike(courses.description, `%${searchQuery}%`)
      );
    }

    const totalCourses = await totalCoursesQuery;

    return NextResponse.json({
      courses: cleanedResults,
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
