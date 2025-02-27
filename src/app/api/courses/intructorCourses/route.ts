import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db'; // Assuming you have your Drizzle ORM connection here
import { courses } from '@/db/schemas/courses'; // Your courses schema
import { eq } from 'drizzle-orm'; // For where conditions

// Force dynamic behavior to prevent static generation attempts
export const dynamic = 'force-dynamic';

// GET handler to fetch all courses for a specific instructor (both published and draft)
export async function GET(req: NextRequest) {
  try {
    // Extract instructor ID (userId) from the query parameters
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const instructorId = searchParams.get('instructorId');

    // Check if instructorId is provided
    if (!instructorId) {
      return NextResponse.json(
        { error: 'Missing instructorId in query parameters.' },
        { status: 400 }
      );
    }

    // Query the database to fetch all courses by this instructor (both draft and published)
    const instructorCourses = await db
      .select()
      .from(courses)
      .where(eq(courses.userId, instructorId));

    // Check if any courses were found
    if (instructorCourses.length === 0) {
      return NextResponse.json(
        { message: 'No courses found for this instructor.' },
        { status: 404 }
      );
    }

    // Return the courses (published and draft)
    return NextResponse.json(
      { message: 'Courses fetched successfully', courses: instructorCourses },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch instructor courses.', details: error.message },
      { status: 500 }
    );
  }
}