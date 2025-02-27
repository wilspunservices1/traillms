import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db'; // Assuming db is your Drizzle ORM instance
import { courses } from '@/db/schemas/courses'; // Import courses schema
import { inArray } from 'drizzle-orm'; // For handling array-based queries

export async function POST(req: NextRequest) {
  try {
    // Parse the JSON body from the request
    const { enrolledCourses } = await req.json();

    // Validate if the body contains valid data
    if (!Array.isArray(enrolledCourses) || enrolledCourses.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or empty enrolledCourses array provided',
      }, { status: 400 });
    }

    // Extract unique course IDs from the enrolledCourses array
    const courseIds = Array.from(new Set(enrolledCourses.map((course) => course.courseId))); // Convert Set to array

    // Fetch the course details for the provided course IDs
    const fetchedCourses = await db
      .select({
        id: courses.id,
        title: courses.title,
        lesson: courses.lesson,
        duration: courses.duration,
        thumbnail: courses.thumbnail,
        price: courses.price,
        estimatedPrice: courses.estimatedPrice,
        isFree: courses.isFree,
        categories: courses.categories,
        insName: courses.insName,
        enrolledCount: courses.enrolledCount,
      })
      .from(courses)
      .where(inArray(courses.id, courseIds));

    // If no courses are found, return a 404 response
    if (!fetchedCourses || fetchedCourses.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No courses found for the provided course IDs',
      }, { status: 404 });
    }

    // Combine fetched course details with progress data from enrolledCourses
    const enrichedCourses = fetchedCourses.map((course) => {
      const courseProgress = enrolledCourses.find((enroll) => enroll.courseId === course.id);
      return {
        ...course,
        progress: courseProgress ? courseProgress.progress : 0,
      };
    });

    // Return the enriched course data
    return NextResponse.json({
      success: true,
      data: enrichedCourses,
    });
  } catch (error) {
    console.error('Error fetching enrolled courses with progress:', error);
    return NextResponse.json({
      success: false,
      message: 'Error fetching enrolled courses with progress',
      error: error.message,
    }, { status: 500 });
  }
}
