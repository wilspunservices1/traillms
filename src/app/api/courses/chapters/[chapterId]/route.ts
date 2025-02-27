// src/app/api/courses/chapters/[chapterId]/route.js
import { NextResponse } from "next/server";
import { db } from "@/db";
import { chapters } from "@/db/schemas/courseChapters";
import { lectures } from "@/db/schemas/lectures";
import { courses } from "@/db/schemas/courses";
import { eq } from "drizzle-orm";
import { questionnaires } from "@/db/schemas/questionnaire";

// API handler to fetch the chapter by chapterId and then get all chapters of the same course with their lessons and extras
export async function GET(req, { params }) {
  const { chapterId } = params;

  try {
    // 1. Fetch the chapter by chapterId
    const chapterResult = await db
      .select({
        id: chapters.id,
        courseId: chapters.courseId,
        questionnaireId: chapters.questionnaireId, // ediited by jayesh on 2021-09-29
      })
      .from(chapters)
      .where(eq(chapters.id, chapterId))
      .limit(1);

    if (!chapterResult || chapterResult.length === 0) {
      return NextResponse.json(
        { message: "Chapter not found" },
        { status: 404 }
      );
    }

    const chapter = chapterResult[0];
    const courseId = chapter.courseId;

    // 2. Fetch the course to get extras and other course details
    const courseResult = await db
      .select({
        id: courses.id,
        title: courses.title,
        price: courses.price,
        description: courses.description,
        thumbnail: courses.thumbnail,
        extras: courses.extras,
        creatorId: courses.userId, // Ensure this references the course creator
      })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (!courseResult || courseResult.length === 0) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    const course = courseResult[0];

    // 3. Fetch all chapters that belong to the same course
    const allChapters = await db
      .select({
        id: chapters.id,
        title: chapters.title,
        order: chapters.order,
        questionnaireId: chapters.questionnaireId, // ediited by jayesh on 2021-09-29
      })
      .from(chapters)
      .where(eq(chapters.courseId, courseId))
      .orderBy(chapters.order);

    // 4. Fetch lessons for each chapter
    const chaptersWithLessons = await Promise.all(
      allChapters.map(async (chapter) => {
        const chapterLessons = await db
          .select({
            id: lectures.id,
            title: lectures.title,
            description: lectures.description,
            videoUrl: lectures.videoUrl,
            isLocked: lectures.isLocked,
            isPreview: lectures.isPreview,
            duration: lectures.duration,
          })
          .from(lectures)
          .where(eq(lectures.chapterId, chapter.id));

        return {
          ...chapter,
          lessons: chapterLessons,
        };
      })
    );

    // 5. Fetch questionnaires linked to the chapter
    const allQuestionnares = await db
      .select({
        id: questionnaires.id,
        title: questionnaires.title,
      })
      .from(questionnaires)
      .where(eq(questionnaires.chapterId, chapterId));
    // .orderBy(chapters.order);
    console.log("fetch course chapter id", allQuestionnares);

    // 6. Return the response
    return NextResponse.json(
      {
        message: "Chapters with lessons and course extras fetched successfully",
        title: course.title,
        id: course.id,
        price: course.price,
        thumbnail: course.thumbnail,
        creatorId: course.creatorId,
        extras: course.extras,
        chapters: chaptersWithLessons,
        questionnaires: allQuestionnares, // ediited by jayesh on 2021-09-29
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Error fetching chapters, lessons, and course extras:",
      error
    );
    return NextResponse.json(
      {
        message: "Failed to fetch chapters, lessons, and course extras",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// import { NextResponse } from 'next/server';
// import { db } from '@/db';
// import { chapters } from '@/db/schemas/courseChapters';
// import { lectures } from '@/db/schemas/lectures';
// import { courses } from '@/db/schemas/courses';
// import { eq } from 'drizzle-orm';

// // API handler to fetch the chapter by chapterId and then get all chapters of the same course with their lessons and extras
// export async function GET(req, { params }) {
//   const { chapterId } = params;

//   try {
//     // **1. Fetch the chapter by chapterId**
//     const chapterResult = await db
//       .select({
//         id: chapters.id,
//         courseId: chapters.courseId,
//         // Include other necessary columns from the chapters table
//       })
//       .from(chapters)
//       .where(eq(chapters.id, chapterId))
//       .limit(1);

//     if (!chapterResult || chapterResult.length === 0) {
//       return NextResponse.json({ message: 'Chapter not found' }, { status: 404 });
//     }

//     const chapter = chapterResult[0];
//     const courseId = chapter.courseId;

//     // **2. Fetch the course to get extras and other course details**
//     const courseResult = await db
//       .select({
//         id: courses.id,
//         extras: courses.extras,
//         creatorId: courses.userId, // Corrected mapping
//         // Include other necessary columns
//       })
//       .from(courses)
//       .where(eq(courses.id, courseId))
//       .limit(1);

//     if (!courseResult || courseResult.length === 0) {
//       return NextResponse.json({ message: 'Course not found' }, { status: 404 });
//     }

//     const course = courseResult[0];

//     // **3. Fetch all chapters that belong to the same course**
//     const allChapters = await db
//       .select({
//         id: chapters.id,
//         title: chapters.title,
//         order: chapters.order,
//         // Include other necessary columns
//       })
//       .from(chapters)
//       .where(eq(chapters.courseId, courseId))
//       .orderBy(chapters.order);

//     // **4. For each chapter, fetch its lessons**
//     const chaptersWithLessons = await Promise.all(
//       allChapters.map(async (chapter) => {
//         const chapterLessons = await db
//           .select({
//             id: lectures.id,
//             title: lectures.title,
//             videoUrl: lectures.videoUrl,
//             isLocked: lectures.isLocked,
//             isPreview: lectures.isPreview,
//             // Include other necessary columns
//           })
//           .from(lectures)
//           .where(eq(lectures.chapterId, chapter.id));

//         return {
//           ...chapter,
//           lessons: chapterLessons,
//         };
//       })
//     );

//     // **5. Return the response including 'creatorId'**
//     return NextResponse.json(
//       {
//         message: 'Chapters with lessons and course extras fetched successfully',
//         id: course.id,
//         creatorId: course.creatorId, // This now correctly maps to 'userId' from 'courses' table
//         extras: course.extras,
//         chapters: chaptersWithLessons,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Error fetching chapters, lessons, and course extras:', error);
//     return NextResponse.json(
//       { message: 'Failed to fetch chapters, lessons, and course extras', error: error.message },
//       { status: 500 }
//     );
//   }
// }

// import { NextResponse } from 'next/server';
// import { db } from '@/db'; // Assuming you're using Drizzle ORM with a db connection setup
// import { chapters } from '@/db/schemas/courseChapters'; // Import the chapters schema
// import { lectures } from '@/db/schemas/lectures'; // Import the lessons schema
// import { courses } from '@/db/schemas/courses'; // Import the courses schema
// import { eq } from 'drizzle-orm'; // Drizzle ORM query helper

// // API handler to fetch the chapter by chapterId and then get all chapters of the same course with their lessons and extras
// export async function GET(req: Request, { params }: { params: { chapterId: string } }) {
//   const { chapterId } = params;

//   try {
//     // 1. Fetch the chapter by chapterId
//     const chapter = await db
//       .select()
//       .from(chapters)
//       .where(eq(chapters.id, chapterId))
//       .limit(1);

//     if (!chapter || chapter.length === 0) {
//       return NextResponse.json({ message: 'Chapter not found' }, { status: 404 });
//     }

//     const courseId = chapter[0].courseId; // Get courseId from the chapter

//     // 2. Fetch the course to get extras and other course details
// const course = await db
//   .select({
//     extras: courses.extras, // Fetch only the extras field from the course
//   })
//   .from(courses)
//   .where(eq(courses.id, courseId))
//   .limit(1);

// if (!course || course.length === 0) {
//   return NextResponse.json({ message: 'Course not found' }, { status: 404 });
// }

//     // 3. Fetch all chapters that belong to the same course
//     const allChapters = await db
//       .select()
//       .from(chapters)
//       .where(eq(chapters.courseId, courseId))
//       .orderBy(chapters.order); // Optionally, order by chapter order

//     // 4. For each chapter, fetch its lessons
//     const chaptersWithLessons = await Promise.all(
//       allChapters.map(async (chapter) => {
//         const chapterLessons = await db
//           .select()
//           .from(lectures)
//           .where(eq(lectures.chapterId, chapter.id));

//         return {
//           ...chapter,
//           lessons: chapterLessons, // Add lessons to the chapter object
//         };
//       })
//     );

//     return NextResponse.json({
//       message: 'Chapters with lessons and course extras fetched successfully',
//       extras: course[0].extras, // Include course extras in the response
//       chapters: chaptersWithLessons
//     }, { status: 200 });
//   } catch (error) {
//     console.error('Error fetching chapters, lessons, and course extras:', error);
//     return NextResponse.json({ message: 'Failed to fetch chapters, lessons, and course extras', error: error.message }, { status: 500 });
//   }
// }

// import { NextResponse } from 'next/server';
// import { db } from '@/db'; // Assuming you're using Drizzle ORM with a db connection setup
// import { chapters } from '@/db/schemas/courseChapters'; // Import the chapters schema
// import { lectures } from '@/db/schemas/lectures'; // Import the lessons schema
// import { eq } from 'drizzle-orm'; // Drizzle ORM query helper

// // API handler to fetch the chapter by chapterId and then get all chapters of the same course with their lessons
// export async function GET(req: Request, { params }: { params: { chapterId: string } }) {
//   const { chapterId } = params;

//   try {
//     // 1. Fetch the chapter by chapterId
//     const chapter = await db
//       .select()
//       .from(chapters)
//       .where(eq(chapters.id, chapterId))
//       .limit(1);

//     if (!chapter || chapter.length === 0) {
//       return NextResponse.json({ message: 'Chapter not found' }, { status: 404 });
//     }

//     const courseId = chapter[0].courseId; // Get courseId from the chapter

//     // 2. Fetch all chapters that belong to the same course
//     const allChapters = await db
//       .select()
//       .from(chapters)
//       .where(eq(chapters.courseId, courseId))
//       .orderBy(chapters.order); // Optionally, order by chapter order

//     // 3. For each chapter, fetch its lessons
//     const chaptersWithLessons = await Promise.all(
//       allChapters.map(async (chapter) => {
//         const chapterLessons = await db
//           .select()
//           .from(lectures)
//           .where(eq(lectures.chapterId, chapter.id));

//         return {
//           ...chapter,
//           lessons: chapterLessons, // Add lessons to the chapter object
//         };
//       })
//     );

//     return NextResponse.json({
//       message: 'Chapters with lessons fetched successfully',
//       chapters: chaptersWithLessons,
//     }, { status: 200 });
//   } catch (error) {
//     console.error('Error fetching chapters and lessons:', error);
//     return NextResponse.json({ message: 'Failed to fetch chapters and lessons', error: error.message }, { status: 500 });
//   }
// }
