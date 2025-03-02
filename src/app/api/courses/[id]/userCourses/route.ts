import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db'; // Assuming db is your Drizzle ORM instance
import { courses } from '@/db/schemas/courses'; // Import courses schema
import { eq, and, sql } from 'drizzle-orm'; // For building conditions

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const courseId = params.id;
  const { searchParams } = new URL(req.url);
  const isPublished = searchParams.get('isPublished') === 'true'; // Convert query param to boolean

  try {
    // First, fetch the current course to find the userId (instructor) who created it
    const currentCourse = await db
      .select({
        id: courses.id,
        userId: courses.userId,
      })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (!currentCourse || currentCourse.length === 0) {
      return NextResponse.json({
        success: false,
        message: `Course not found for ID: ${courseId}`,
      }, { status: 404 });
    }

    const { userId } = currentCourse[0];

    // Fetch all other courses created by the same user (instructor) excluding the current course
    const similarCourses = await db
      .select({
        id: courses.id,
        title: courses.title,
        price: courses.price,
        demoVideoUrl: courses.demoVideoUrl,
        isPublished: courses.isPublished,
        enrolledCount: courses.enrolledCount,
        lesson: courses.lesson,
        duration: courses.duration,
        thumbnail: courses.thumbnail,
        estimatedPrice: courses.estimatedPrice,
        isFree: courses.isFree,
        categories: courses.categories,
      })
      .from(courses)
      .where(
        and(
          eq(courses.userId, userId),
          sql`${courses.id} != ${courseId}`, // Exclude the current course
          eq(courses.isPublished, isPublished) // Use the isPublished query parameter
        )
      );

    if (!similarCourses || similarCourses.length === 0) {
      return NextResponse.json({
        success: false,
        message: `No similar courses found for user ID: ${userId} and isPublished: ${isPublished}`,
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: similarCourses,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching user similar courses',
        error: error.message,
      },
      { status: 500 }
    );
  }
}


// // src/app/api/courses/[id]/userCourses/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/db'; // Assuming db is your Drizzle ORM instance
// import { courses } from '@/db/schemas/courses'; // Import courses schema
// import { eq, and, sql } from 'drizzle-orm'; // For building conditions

// export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
//   const courseId = params.id;

//   try {
//     // First, fetch the current course to find the userId (instructor) who created it
//     const currentCourse = await db
//       .select({
//         id: courses.id,
//         userId: courses.userId,
//       })
//       .from(courses)
//       .where(eq(courses.id, courseId))
//       .limit(1);

//     if (!currentCourse || currentCourse.length === 0) {
//       return NextResponse.json({
//         success: false,
//         message: `Course not found for ID: ${courseId}`,
//       }, { status: 404 });
//     }

//     const { userId } = currentCourse[0];

//     // id, title, lesson, duration, thumbnail, price, estimatedPrice, isFree, categories

//     // Fetch all other courses created by the same user (instructor) excluding the current course
//     const similarCourses = await db
//       .select({
//         id: courses.id,
//         title: courses.title,
//         // description: courses.description,
//         price: courses.price,
//         demoVideoUrl: courses.demoVideoUrl,
//         isPublished: courses.isPublished,
//         enrolledCount: courses.enrolledCount,
//         lesson: courses.lesson,
//         duration: courses.duration,
//         thumbnail: courses.thumbnail,
//         estimatedPrice: courses.estimatedPrice,
//         isFree: courses.isFree,
//         categories: courses.categories,

//       })
//       .from(courses)
//       .where(
//         and(
//           eq(courses.userId, userId),
//           sql`${courses.id} != ${courseId}` // Exclude the current course
//         )
//       );

//     if (!similarCourses || similarCourses.length === 0) {
//       return NextResponse.json({
//         success: false,
//         message: `No similar courses found for user ID: ${userId}`,
//       }, { status: 404 });
//     }

//     return NextResponse.json({
//       success: true,
//       data: similarCourses,
//     });
//   } catch (error) {
//     return NextResponse.json(
//       {
//         success: false,
//         message: 'Error fetching user similar courses',
//         error: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }
