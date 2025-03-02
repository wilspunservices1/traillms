import { eq, inArray, sql } from "drizzle-orm";
import { courses } from "@/db/schemas/courses";
import { chapters } from "@/db/schemas/courseChapters";
import { lectures } from "@/db/schemas/lectures";
import { db } from "@/db/index";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import { issueCertificate } from "@/utils/certificateIssuer";



export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params; // Course ID
    const body = await req.json(); // Get the JSON body from the request

    console.log("body.extras", body)

    // Update the course
    await db
      .update(courses)
      .set({
        title: body.title,
        slug: body.slug,
        lesson: body.lesson,
        duration: body.duration,
        featured: body.featured,
        price: body.price,
        estimatedPrice: body.estimatedPrice,
        isFree: body.isFree,
        tag: body.tag,
        skillLevel: body.skillLevel,
        categories: body.categories,
        insName: body.insName,
        thumbnail: body.thumbnail,
        demoVideoUrl: body.demoVideoUrl,
        isPublished: body.isPublished,
        updatedAt: new Date(), // Update the updatedAt timestamp
      })
      .where(eq(courses.id, id));

    // Fetch the updated course data
    const updatedCourse = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id));

    return NextResponse.json({
      message: "Course updated successfully",
      data: updatedCourse[0], // Return the first item in the array
    });
  } catch (error) {
    console.error("Error during course update:", error);
    return NextResponse.json(
      { message: "Error updating course details.", error: error.message },
      { status: 500 }
    );
  }
}


export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params; // Course ID

    // Optional: If you want to delete related chapters and lectures
    await db.delete(lectures).where(eq(lectures.chapterId, id));
    await db.delete(chapters).where(eq(chapters.courseId, id));

    // Delete the course
    const deleteResult = await db.delete(courses).where(eq(courses.id, id));

    if (deleteResult.rowCount === 0) {
      return NextResponse.json(
        { message: "Course not found or already deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { message: "Error deleting course.", error: error.message },
      { status: 500 }
    );
  }
}


export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params; // Course ID
    const body = await req.json(); // Get the JSON body from the request

    const updateFields: any = {};
    const { id: courseId } = params; // Course ID

    // Handle updating replies within comments
    if (body.commentId && body.reply) {
      console.log("Updating reply for commentId:", body.commentId);

      // Fetch the course by its ID
      const existingCourse = await db
        .select()
        .from(courses)
        .where(eq(courses.id, id))
        .limit(1);

      if (existingCourse.length > 0) {
        const existingComments = existingCourse[0].comments || [];

        // Find the comment to which we need to add the reply
        const updatedComments = existingComments.map((comment) => {
          if (comment.id === body.commentId) {
            console.log("Found comment to update:", comment);

            const newReply = {
              ...body.reply,
              id: uuidv4(), // Generate a new UUID for the reply
            };

            console.log("New reply:", newReply);

            // Check if replies exist, if not, initialize the array
            const updatedReplies = comment.replies
              ? [...comment.replies, newReply] // Append new reply if replies exist
              : [newReply]; // Initialize replies array if it doesn't exist

            console.log("Updated replies array:", updatedReplies);

            return { ...comment, replies: updatedReplies }; // Return the updated comment
          }
          return comment; // Return unchanged comments
        });

        updateFields.comments = updatedComments; // Set updated comments in updateFields
        console.log("Updated comments array:", updateFields.comments);
      } else {
        return NextResponse.json(
          { message: "Course not found." },
          { status: 404 }
        );
      }
    }

    // Existing logic for updating course fields
    if (body.title !== undefined) updateFields.title = body.title;
    if (body.slug !== undefined) updateFields.slug = body.slug;
    if (body.lesson !== undefined) updateFields.lesson = body.lesson;
    if (body.duration !== undefined) updateFields.duration = body.duration;
    if (body.featured !== undefined) updateFields.featured = body.featured;
    if (body.price !== undefined) updateFields.price = body.price;
    if (body.estimatedPrice !== undefined)
      updateFields.estimatedPrice = body.estimatedPrice;
    if (body.isFree !== undefined) updateFields.isFree = body.isFree;
    if (body.tag !== undefined) updateFields.tag = body.tag;
    if (body.skillLevel !== undefined)
      updateFields.skillLevel = body.skillLevel;
    if (body.categories !== undefined)
      updateFields.categories = body.categories;
    if (body.insName !== undefined) updateFields.insName = body.insName;
    if (body.thumbnail !== undefined) updateFields.thumbnail = body.thumbnail;
    if (body.demoVideoUrl !== undefined)
      updateFields.demoVideoUrl = body.demoVideoUrl;
    if (body.isPublished !== undefined)
      updateFields.isPublished = body.isPublished;
    if (body.extras !== undefined) updateFields.extras = body.extras;

    // Handle Certification updates
    if (body.certificateId !== undefined) {
      updateFields.certificateId = body.certificateId;

      // Issue the certificate if `issuedTo` is provided
      if (body.issuedTo) {
        const issuedBy = body.issuedBy; // You can get this from the session if needed
        const issuedTo = body.issuedTo;
        const certificateId = body.certificateId;

        try {
          await issueCertificate({
            courseId,
            certificateId,
            issuedBy,
            issuedTo,
          });
        } catch (issueError) {
          console.error('Error issuing certificate:', issueError);
          return NextResponse.json(
            { message: 'Error issuing certificate.', error: issueError.message },
            { status: 500 }
          );
        }
      }
    }


    // Ensure updatedAt is always set when an update occurs
    updateFields.updatedAt = new Date();

    // Update the course with the specified fields
    await db.update(courses).set(updateFields).where(eq(courses.id, id));

    // Fetch the updated course data
    const updatedCourse = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id));

    return NextResponse.json({
      message: "Course updated successfully",
      data: updatedCourse[0], // Return the updated course data
    });
  } catch (error) {
    console.error("Error during course update:", error);
    return NextResponse.json(
      { message: "Error updating course details.", error: error.message },
      { status: 500 }
    );
  }
}


//___________________________________________
//******************* GET Request **********
// * get course details at specific id 
// * if some of the information not found then default will be used
//#________________________________________#

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch the course by ID
    const courseResult = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1);

    const course = courseResult[0];

    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    // Fetch chapters related to the course ID
    const courseChapters = await db
      .select()
      .from(chapters)
      .where(eq(chapters.courseId, id));

    // Extract chapter IDs to fetch related lectures
    const chapterIds = courseChapters.map((chapter) => chapter.id);

    // Fetch lectures related to the chapter IDs
    const courseLectures = await db
      .select()
      .from(lectures)
      .where(inArray(lectures.chapterId, chapterIds));

    // Calculate total lessons (number of lectures)
    const totalLessonCount = courseLectures.length;

    // Nest lectures under their respective chapters
    const chaptersWithLectures = courseChapters.map((chapter) => {
      return {
        ...chapter,
        lectures: courseLectures.filter(
          (lecture) => lecture.chapterId === chapter.id
        ),
      };
    });

    // Nest chapters under the course and add calculated fields
    const courseWithChapters = {
      ...course,
      chapters: chaptersWithLectures,
      lesson: totalLessonCount, // Total number of lectures
      duration: course.duration, // Total course duration
    };

    return NextResponse.json({
      message: "Course details fetched successfully",
      data: courseWithChapters,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching course details.", error: error.message },
      { status: 500 }
    );
  }
}

