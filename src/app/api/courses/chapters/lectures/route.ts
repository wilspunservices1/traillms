import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { lectures } from "@/db/schemas/lectures";
import { chapters } from "@/db/schemas/courseChapters";
import { courses } from "@/db/schemas/courses";
import { eq, sql } from "drizzle-orm";

// Utility function to convert minutes to hours in format `x.xx hours`
const convertMinutesToHours = (totalMinutes: number) => {
  const hours = (totalMinutes / 60).toFixed(2);
  return `${hours} hours`;
};

// Utility function to safely cast strings like "30 minutes" to integers
const extractMinutes = (duration: string) => {
  const match = duration.match(/^(\d+)\s*minutes$/);
  return match ? parseInt(match[1], 10) : 0;
};

// Update chapter duration based on all lecture durations
// Utility function to sum durations in minutes
const updateChapterDuration = async (chapterId: string) => {
  // Sum all lecture durations for the chapter in minutes
  const totalDurationInMinutes = await db
    .select({ totalDuration: sql`SUM(CAST(lectures.duration AS int))` })
    .from(lectures)
    .where(eq(lectures.chapterId, chapterId))
    .then((res) => res[0]?.totalDuration || 0);

  // Update the chapter with the total duration in minutes
  const updatedChapterDeration = await db
    .update(chapters)
    .set({ duration: `${totalDurationInMinutes} minutes` })
    .where(eq(chapters.id, chapterId)).returning();

  
};


// Update course duration based on all chapter durations
const updateCourseDuration = async (courseId: string) => {
  // Sum all chapter durations for the course
  const totalDurationInMinutes = await db
    .select({ totalDuration: sql`SUM(CAST(SPLIT_PART(chapters.duration, ' ', 1) AS int))` })
    .from(chapters)
    .where(eq(chapters.courseId, courseId))
    .then((res) => res[0]?.totalDuration || 0);

  const newCourseDuration = convertMinutesToHours(totalDurationInMinutes);

  // Update the course with the new total duration
  const  updatedCourse = await db
    .update(courses)
    .set({ duration: newCourseDuration })
    .where(eq(courses.id, courseId)).returning();
    // console.log("updatedChapterDeration -> updatedCourse",updatedCourse)
};

// Create or update a lecture
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chapterId, title, description, duration, videoUrl, isPreview, courseId } = body;

    // Validate required fields
    if (!chapterId || !title || !duration || !videoUrl) {
      return NextResponse.json(
        { message: "chapterId, title, duration, and videoUrl are required fields." },
        { status: 400 }
      );
    }

    // Ensure the chapter exists
    const foundChapter = await db
      .select()
      .from(chapters)
      .where(eq(chapters.id, chapterId))
      .limit(1)
      .then((res) => res[0]);

    if (!foundChapter) {
      return NextResponse.json(
        { message: "Chapter not found." },
        { status: 404 }
      );
    }

    // Get the current max order of the lectures in the chapter
    const maxOrderResult = await db
      .select({ maxOrder: sql`MAX("order"::int)` })
      .from(lectures)
      .where(eq(lectures.chapterId, chapterId))
      .then((res) => res[0]?.maxOrder || 0);

    const nextOrder = (maxOrderResult + 1).toString(); // Increment the order by 1

    // Insert the new lecture into the database with the correct order
    const newLecture = await db
      .insert(lectures)
      .values({
        chapterId,
        title,
        description: description || "",
        duration, // Ensure this is passed as a number (minutes) from the frontend
        videoUrl,
        isPreview: isPreview || false,
        isLocked: !isPreview,
        order: nextOrder,
      })
      .returning();

    // After inserting the lecture, update the chapter duration
    await updateChapterDuration(chapterId);

    // After updating the chapter duration, update the course duration
    await updateCourseDuration(courseId);

    return NextResponse.json(
      { message: "Lecture created successfully", lecture: newLecture },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating lecture.", error: error.message },
      { status: 500 }
    );
  }
}


// Helper function to convert duration strings to minutes
function parseDuration(duration: string): number {
  if (!duration) return 0; // Return 0 if duration is undefined or null

  const parts = duration.split(" ");
  const amount = parseInt(parts[0], 10);

  if (isNaN(amount)) return 0; // Return 0 if the amount is not a number

  const unit = parts[1] ? parts[1].toLowerCase() : "minutes"; // Default to minutes if unit is missing

  if (unit.includes("minute")) {
    return amount;
  } else if (unit.includes("hour")) {
    return amount * 60;
  }

  return 0;
}

export async function GET(req: NextRequest) {
  try {
    // Extract the query parameters
    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get("chapterId");

    // Validate the chapterId parameter
    if (!chapterId) {
      return NextResponse.json(
        { message: "chapterId is required." },
        { status: 400 }
      );
    }

    // Fetch lectures by chapterId
    const chapterLectures = await db
      .select()
      .from(lectures)
      .where(eq(lectures.chapterId, chapterId));

    // If no lectures found for the chapter
    if (chapterLectures.length === 0) {
      return NextResponse.json(
        { message: "No lectures found for this chapter." },
        { status: 404 }
      );
    }

    // Calculate total duration
    const totalDurationInMinutes = chapterLectures.reduce((total, lecture) => {
      return total + parseDuration(lecture.duration);
    }, 0);

    // Format total duration as "X hours Y minutes"
    const hours = Math.floor(totalDurationInMinutes / 60);
    const minutes = totalDurationInMinutes % 60;
    const formattedDuration = `${
      hours > 0 ? `${hours} hours ` : ""
    }${minutes} minutes`;

    // Return the lectures with total duration
    return NextResponse.json(
      {
        message: "Lectures fetched successfully",
        totalDuration: formattedDuration,
        data: chapterLectures,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching lectures:", error);
    return NextResponse.json(
      { message: "Error fetching lectures.", error: error.message },
      { status: 500 }
    );
  }
}

// update api for edit lecture
// PUT request to update an existing lecture by ID
// export async function PUT(req: NextRequest) {
//   try {
//     // Extract the lecture ID from the URL (assuming it's passed as a query parameter)
//     const { searchParams } = new URL(req.url);
//     const lectureId = searchParams.get("id");

//     if (!lectureId) {
//       return NextResponse.json(
//         { message: "Lecture ID is required." },
//         { status: 400 }
//       );
//     }

//     // Parse the request body
//     const body = await req.json();
//     const {
//       chapterId,
//       title,
//       description,
//       duration,
//       videoUrl,
//       isPreview,
//       order,
//     } = body;

//     // Validate the required fields
//     if (
//       !title &&
//       !description &&
//       !duration &&
//       !videoUrl &&
//       isPreview === undefined &&
//       !order
//     ) {
//       return NextResponse.json(
//         { message: "At least one field is required to update." },
//         { status: 400 }
//       );
//     }

//     // Check if the lecture exists
//     const existingLecture = await db
//       .select()
//       .from(lectures)
//       .where(eq(lectures.id, lectureId))
//       .limit(1)
//       .then((res) => res[0]);

//     if (!existingLecture) {
//       return NextResponse.json(
//         { message: "Lecture not found." },
//         { status: 404 }
//       );
//     }

//     // Prepare the update data
//     const updateData: Partial<typeof lectures> = {};
//     if (chapterId) updateData.chapterId = chapterId;
//     if (title) updateData.title = title;
//     if (description !== undefined) updateData.description = description;
//     if (duration) updateData.duration = duration;
//     if (videoUrl) updateData.videoUrl = videoUrl;
//     if (isPreview !== undefined) updateData.isPreview = isPreview;
//     if (order) updateData.order = order;
//     updateData.isLocked = !isPreview as any; // Update lock status based on isPreview

//     // Update the lecture in the database
//     const updatedLecture = await db
//       .update(lectures)
//       .set(updateData)
//       .where(eq(lectures.id, lectureId))
//       .returning();

//     return NextResponse.json(
//       { message: "Lecture updated successfully", lecture: updatedLecture },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error updating lecture:", error);
//     return NextResponse.json(
//       { message: "Error updating lecture.", error: error.message },
//       { status: 500 }
//     );
//   }
// }

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lectureId = searchParams.get("id");

    if (!lectureId) {
      return NextResponse.json({ message: "Lecture ID is required." }, { status: 400 });
    }

    const body = await req.json();
    const { chapterId, title, description, duration, videoUrl, isPreview, order } = body;

    if (!title && !description && !duration && !videoUrl && isPreview === undefined && !order) {
      return NextResponse.json({ message: "At least one field is required to update." }, { status: 400 });
    }

    const existingLecture = await db.select().from(lectures).where(eq(lectures.id, lectureId)).limit(1).then(res => res[0]);

    if (!existingLecture) {
      return NextResponse.json({ message: "Lecture not found." }, { status: 404 });
    }

    const updateData = {
      chapterId,
      title,
      description,
      duration,
      videoUrl,
      isPreview,
      order,
      isLocked: !isPreview
    };

    const updatedLecture = await db.update(lectures).set(updateData).where(eq(lectures.id, lectureId)).returning();

    // After updating, recalculate durations
    if (chapterId || duration) {
      await updateChapterDuration(existingLecture.chapterId); // Recalculate using the chapter ID of the lecture
      const chapter = await db.select().from(chapters).where(eq(chapters.id, existingLecture.chapterId)).then(res => res[0]);
      await updateCourseDuration(chapter.courseId);
    }

    return NextResponse.json({ message: "Lecture updated successfully", lecture: updatedLecture }, { status: 200 });
  } catch (error) {
    console.error("Error updating lecture:", error);
    return NextResponse.json({ message: "Error updating lecture.", error: error.message }, { status: 500 });
  }
}
