// src/app/api/user/[userId]/enrollCourses/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schemas/user';
import { orders } from '@/db/schemas/orders';
import { chapters } from '@/db/schemas/courseChapters'; // Import the chapters schema
import { lectures } from '@/db/schemas/lectures'; // Import the lectures schema
import { eq, inArray } from 'drizzle-orm';
import { getToken } from 'next-auth/jwt';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = await params;
    const url = new URL(req.url);
    const progressQuery = url.searchParams.get('progress'); // Optional query param for progress

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // **Session Validation Starts Here**
    const token = await getToken({ req });

    // Check if the user is authenticated
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the token user ID matches the userId parameter
    if (token.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // **Session Validation Ends Here**

    // Step 1: Check if the user exists
    const foundUsers = await db
      .select({
        enrolledCourses: user.enrolledCourses,
      })
      .from(user)
      .where(eq(user.id, userId));

    if (foundUsers.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }



    // Extract enrolledCourses from user
    const enrolledCourses = foundUsers[0].enrolledCourses || [];

    // Step 2: Filter by progress if provided
    let filteredCourses = enrolledCourses;
    if (progressQuery !== null) {
      const progressValue = parseInt(progressQuery, 10);
      filteredCourses = enrolledCourses.filter(
        (course: any) => course.progress === progressValue
      );
    }

    // Step 3: Get the list of courseIds from the filtered enrolled courses
    const courseIds = filteredCourses.map((course: any) => course.courseId);

    // console.log("foundUsers ✔️✔️ courseIds",courseIds)

    // Step 4: Fetch all orders for the user
    const userOrders = await db
      .select({
        items: orders.items,
      })
      .from(orders)
      .where(eq(orders.userId, userId));

    // Debugging: Log the fetched orders
    // console.log('Fetched User Orders:', JSON.stringify(userOrders, null, 2));

    // Step 5: Extract purchased courseIds from orders
    const purchasedCourseIds = new Set<string>();
    userOrders.forEach((order) => {
      const items = order.items;

      // Debugging: Log the items
      console.log(`Order ID: ${order.id}, Items: ${JSON.stringify(items)}`);

      if (Array.isArray(items)) {
        items.forEach((item: any) => {
          if (item.courseId) {
            purchasedCourseIds.add(item.courseId);
          }
        });
      } else {
        console.warn(`Order ID: ${order.id} has malformed items:`, items);
        // Optionally, handle single objects or skip
        // If items is an object, you can convert it to an array
        if (typeof items === 'object' && items !== null) {
          if (items.courseId) {
            purchasedCourseIds.add(items.courseId);
          }
        }
      }
    });

    // Step 6: Filter enrolledCourses to only include courses that have been purchased
    const validEnrolledCourses = filteredCourses.filter((course: any) =>
      purchasedCourseIds.has(course.courseId)
    );

    // Step 7: Fetch chapters for valid enrolled courses (only IDs)
    const validCourseIds = validEnrolledCourses.map((course) => course.courseId);

    const chaptersList = await db
      .select({
        id: chapters.id,
        courseId: chapters.courseId,
      })
      .from(chapters)
      .where(inArray(chapters.courseId, validCourseIds));

    // Organize chapter IDs by courseId
    const chaptersByCourseId = chaptersList.reduce((acc: any, chapter: any) => {
      if (!acc[chapter.courseId]) {
        acc[chapter.courseId] = [];
      }
      acc[chapter.courseId].push(chapter.id);
      return acc;
    }, {});

    // Collect chapterIds
    const chapterIds = chaptersList.map((chapter) => chapter.id);

    // Fetch lectures for these chapters (only IDs)
    const lecturesList = await db
      .select({
        id: lectures.id,
        chapterId: lectures.chapterId,
      })
      .from(lectures)
      .where(inArray(lectures.chapterId, chapterIds));

    // Organize lecture IDs by chapterId
    const lecturesByChapterId = lecturesList.reduce((acc: any, lecture: any) => {
      if (!acc[lecture.chapterId]) {
        acc[lecture.chapterId] = [];
      }
      acc[lecture.chapterId].push(lecture.id);
      return acc;
    }, {});

    // Build the response with only IDs
    const coursesWithIds = validEnrolledCourses.map((course: any) => {
      const courseChaptersIds = chaptersByCourseId[course.courseId] || [];

      const chaptersWithLectureIds = courseChaptersIds.map((chapterId: string) => {
        const lectureIds = lecturesByChapterId[chapterId] || [];
        return {
          chapterId,
          lectureIds,
        };
      });

      return {
        courseId: course.courseId,
        progress: course.progress,
        completedLectures: course.completedLectures,
        chapters: chaptersWithLectureIds,
      };
    });

    // Return the valid enrolled courses with only IDs
    return NextResponse.json(coursesWithIds);
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrolled courses' },
      { status: 500 }
    );
  }
}

