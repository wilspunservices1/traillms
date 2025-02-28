import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { lectures } from '@/db/schemas/lectures';
import { chapters } from '@/db/schemas/courseChapters';
import { user } from '@/db/schemas/user';
import { eq } from 'drizzle-orm';
import { getToken } from 'next-auth/jwt';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = await params.id;

    // Get the user session
    const token = await getToken({ req });

    // Fetch the lesson data with all necessary columns
    const lessonData = await db
      .select({
        id: lectures.id,
        title: lectures.title,
        videoUrl: lectures.videoUrl,
        isLocked: lectures.isLocked,
        isPreview: lectures.isPreview,
        chapterId: lectures.chapterId, // Ensure chapterId is included
        // Include other necessary columns
      })
      .from(lectures)
      .where(eq(lectures.id, lessonId))
      .limit(1);

    if (lessonData.length === 0) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    let lesson = lessonData[0];
    // console.log('Fetched lesson:', lesson); // For debugging

    if (token && token.sub) {
      const userId = token.sub as string;

      // Fetch the user's enrolled courses
      const userData = await db
        .select({
          enrolledCourses: user.enrolledCourses,
        })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (userData.length > 0) {
        const enrolledCourses = userData[0].enrolledCourses || [];

        // Get the chapter data to retrieve the courseId
        const chapterData = await db
          .select({
            courseId: chapters.courseId,
          })
          .from(chapters)
          .where(eq(chapters.id, lesson.chapterId))
          .limit(1);

        if (chapterData.length > 0) {
          const courseId = chapterData[0].courseId;

          // Check if the user is enrolled in this course
          const isEnrolled = enrolledCourses.some(
            (course: any) => course.courseId === courseId
          );

          if (isEnrolled) {
            // Set isLocked to false
            lesson = {
              ...lesson,
              isLocked: false,
            };
          }
        }
      }
    }

    return NextResponse.json(lesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lesson', details: error.message },
      { status: 500 }
    );
  }
}


// // src/app/api/lessons/[id]/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/db';
// import { lectures } from '@/db/schemas/lectures';
// import { chapters } from '@/db/schemas/courseChapters';
// import { user } from '@/db/schemas/user';
// import { eq } from 'drizzle-orm';
// import { getToken } from 'next-auth/jwt';

// export async function GET(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const lessonId = params.id;

//     // Get the user session
//     const token = await getToken({ req });

//     // Fetch the lesson data
//     const lessonData = await db
//       .select()
//       .from(lectures)
//       .where(eq(lectures.id, lessonId))
//       .limit(1);

//     if (lessonData.length === 0) {
//       return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
//     }

//     let lesson = lessonData[0];

//     if (token && token.sub) {
//       const userId = token.sub as string;

//       // Fetch the user's enrolled courses
//       const userData = await db
//         .select({
//           enrolledCourses: user.enrolledCourses,
//         })
//         .from(user)
//         .where(eq(user.id, userId))
//         .limit(1);

//       if (userData.length > 0) {
//         const enrolledCourses = userData[0].enrolledCourses || [];

//         // Get the chapter data to retrieve the courseId
//         const chapterData = await db
//           .select({
//             courseId: chapters.courseId,
//           })
//           .from(chapters)
//           .where(eq(chapters.id, lesson.chapterId))
//           .limit(1);

//         if (chapterData.length > 0) {
//           const courseId = chapterData[0].courseId;

//           // Check if the user is enrolled in this course
//           const isEnrolled = enrolledCourses.some(
//             (course: any) => course.courseId === courseId
//           );

//           if (isEnrolled) {
//             // Set isLocked to false
//             lesson = {
//               ...lesson,
//               isLocked: false,
//             };
//           }
//         }
//       }
//     }

//     return NextResponse.json(lesson);
//   } catch (error) {
//     console.error('Error fetching lesson:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch lesson' },
//       { status: 500 }
//     );
//   }
// }



// import { NextResponse, NextRequest } from 'next/server';
// import { db } from '@/db'; // Assuming this is your Drizzle DB instance
// import { lectures } from '@/db/schemas/lectures'; // Importing the lectures table schema
// import { eq } from 'drizzle-orm';

// // API to get a lecture by its ID
// export async function GET(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { id } = params; // Lecture ID from the URL

//     // Fetch the lecture from the database using Drizzle ORM
//     const lecture = await db
//       .select()
//       .from(lectures)
//       .where(eq(lectures.id, id))
//       .limit(1);

//     // If no lecture is found, return a 404 response
//     if (!lecture || lecture.length === 0) {
//       return NextResponse.json({ message: 'Lecture not found' }, { status: 404 });
//     }

//     // Return the lecture data in the response
//     return NextResponse.json(lecture[0], { status: 200 });
//   } catch (error) {
//     console.error('Error fetching lecture:', error);
//     return NextResponse.json(
//       { message: 'An error occurred while fetching the lecture', error: error.message },
//       { status: 500 }
//     );
//   }
// }
