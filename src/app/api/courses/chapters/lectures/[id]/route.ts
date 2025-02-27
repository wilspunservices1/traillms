import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; // Adjust the path to your database connection
import { lectures } from "@/db/schemas/lectures"; // Adjust path as necessary
import { eq, sql } from "drizzle-orm";
import { chapters } from "@/db/schemas/courseChapters";
import { courses } from "@/db/schemas/courses";

// Utility function to convert minutes to hours
const convertMinutesToHours = (totalMinutes: number) => {
  return (totalMinutes / 60).toFixed(2) + ' hours';
};

// Update course duration based on chapter durations
const updateCourseDuration = async (courseId: string) => {
  const totalDurationInMinutes = await db
    .select({ totalDuration: sql`SUM(CAST(SPLIT_PART(chapters.duration, ' ', 1) AS int))` })
    .from(chapters)
    .where(eq(chapters.courseId, courseId))
    .then((res) => res[0]?.totalDuration || 0);

  const newCourseDuration = convertMinutesToHours(totalDurationInMinutes);

  await db
    .update(courses)
    .set({ duration: newCourseDuration })
    .where(eq(courses.id, courseId))
    .returning();
};

// Update chapter duration based on lecture durations
const updateChapterDuration = async (chapterId: string) => {
  const totalDurationInMinutes = await db
    .select({ totalDuration: sql`SUM(CAST(lectures.duration AS int))` })
    .from(lectures)
    .where(eq(lectures.chapterId, chapterId))
    .then((res) => res[0]?.totalDuration || 0);

  const updatedChapter = await db
    .update(chapters)
    .set({ duration: `${totalDurationInMinutes} minutes` })
    .where(eq(chapters.id, chapterId))
    .returning();

  return updatedChapter[0]?.courseId;
};

// Delete a lecture by ID and update durations accordingly
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const lectureId = params.id;

  try {
    if (!lectureId) {
      return NextResponse.json({ message: "Lecture ID is required." }, { status: 400 });
    }

    const lecture = await db
      .select()
      .from(lectures)
      .where(eq(lectures.id, lectureId))
      .then((res) => res[0]);

    if (!lecture) {
      return NextResponse.json({ message: "Lecture not found." }, { status: 404 });
    }

    await db
      .delete(lectures)
      .where(eq(lectures.id, lectureId))
      .returning();

    // Update chapter and course durations
    const courseId = await updateChapterDuration(lecture.chapterId);
    if (courseId) {
      await updateCourseDuration(courseId);
    }

    return NextResponse.json({ message: "Lecture deleted successfully." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting lecture.", error: error.message }, { status: 500 });
  }
}


// Update a lecture by ID
// export async function PATCH(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   const lectureId = params.id;

//   try {
//     const body = await req.json();
//     const { title, description, duration, videoUrl, isPreview, order } = body;

//     // Validate the lecture ID
//     if (!lectureId) {
//       return NextResponse.json(
//         { message: "Lecture ID is required." },
//         { status: 400 }
//       );
//     }

//     // Validate required fields if they need to be updated
//     if (
//       !title &&
//       !duration &&
//       !videoUrl &&
//       !description &&
//       isPreview === undefined &&
//       !order
//     ) {
//       return NextResponse.json(
//         { message: "At least one field is required to update." },
//         { status: 400 }
//       );
//     }

//     // Prepare the update data
//     const updateData: any = {};
//     if (title) updateData.title = title;
//     if (description !== undefined) updateData.description = description;
//     if (duration) updateData.duration = duration;
//     if (videoUrl) updateData.videoUrl = videoUrl;
//     if (isPreview !== undefined) updateData.isPreview = isPreview;
//     if (order) updateData.order = order;

//     // Update the lecture in the database
//     const updatedLecture = await db
//       .update(lectures)
//       .set(updateData)
//       .where(eq(lectures.id, lectureId))
//       .returning();

//     if (!updatedLecture) {
//       return NextResponse.json(
//         { message: "Lecture not found." },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(
//       { message: "Lecture updated successfully.", lecture: updatedLecture },
//       { status: 200 }
//     );
//   } catch (error) {
//     return NextResponse.json(
//       { message: "Error updating lecture.", error: error.message },
//       { status: 500 }
//     );
//   }
// }


// Update a lecture by ID and update durations accordingly
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const lectureId = params.id;

  try {
    const body = await req.json();
    const { title, description, duration, videoUrl, isPreview, order } = body;

    // Validate the lecture ID
    if (!lectureId) {
      return NextResponse.json(
        { message: "Lecture ID is required." },
        { status: 400 }
      );
    }

    // Validate required fields if they need to be updated
    if (
      !title &&
      !duration &&
      !videoUrl &&
      !description &&
      isPreview === undefined &&
      !order
    ) {
      return NextResponse.json(
        { message: "At least one field is required to update." },
        { status: 400 }
      );
    }

    // Prepare the update data
    const updateData: any = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (duration) updateData.duration = duration;
    if (videoUrl) updateData.videoUrl = videoUrl;
    if (isPreview !== undefined) updateData.isPreview = isPreview;
    if (order) updateData.order = order;

    // Update the lecture in the database
    const updatedLecture = await db
      .update(lectures)
      .set(updateData)
      .where(eq(lectures.id, lectureId))
      .returning();

    if (!updatedLecture.length) {
      return NextResponse.json(
        { message: "Lecture not found." },
        { status: 404 }
      );
    }

    // Update chapter and course durations
    const courseId = await updateChapterDuration(updatedLecture[0].chapterId);
    if (courseId) {
      await updateCourseDuration(courseId);
    }

    return NextResponse.json(
      { message: "Lecture updated successfully.", lecture: updatedLecture },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating lecture.", error: error.message },
      { status: 500 }
    );
  }
}