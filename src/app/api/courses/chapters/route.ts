import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { chapters } from "@/db/schemas/courseChapters";
import { courses } from "@/db/schemas/courses";
import { sql, eq } from "drizzle-orm";
import { lectures } from "@/db/schemas/lectures";

// Utility function to convert a duration string (e.g., "0 minutes") into total minutes
function convertDurationToMinutes(duration: string) {
  const minutesMatch = duration.match(/(\d+)\s*minute/);
  const hoursMatch = duration.match(/(\d+)\s*hour/);
  
  let totalMinutes = 0;
  
  if (hoursMatch) {
    totalMinutes += parseInt(hoursMatch[1], 10) * 60; // Convert hours to minutes
  }
  
  if (minutesMatch) {
    totalMinutes += parseInt(minutesMatch[1], 10); // Add minutes
  }

  return totalMinutes;
}

// Create a new chapter
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courseId, title, description, order, duration } = body;

    // Ensure courseId, title, and duration are provided
    if (!courseId || !title || !duration) {
      return NextResponse.json(
        { message: "courseId, title, and duration are required fields." },
        { status: 400 }
      );
    }

    // Convert the duration string into total minutes
    const durationInMinutes = convertDurationToMinutes(duration);

    // Insert the new chapter into the database with the converted duration
    const newChapter = await db
      .insert(chapters)
      .values({
        courseId,
        title,
        description: description || "",
        order: order || "1",
        duration: durationInMinutes, // Store duration as an integer in minutes
      })
      .returning();

    return NextResponse.json(
      { message: "Chapter created successfully", chapter: newChapter },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating chapter.", error: error.message },
      { status: 500 }
    );
  }
}




// Delete a chapter by ID
export async function DELETE(req: NextRequest) {
  try {
    // Parse the request URL to get the chapter ID
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // Validate the id parameter
    if (!id) {
      return NextResponse.json({ message: "id is required." }, { status: 400 });
    }

    // Delete the chapter from the database
    const deletedChapter = await db
      .delete(chapters)
      .where(eq(chapters.id, id))
      .returning();

    // Check if the deletion was successful
    if (deletedChapter.length === 0) {
      return NextResponse.json(
        { message: "Chapter not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Chapter deleted successfully", chapter: deletedChapter },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting chapter:", error);
    return NextResponse.json(
      { message: "Error deleting chapter.", error: error.message },
      { status: 500 }
    );
  }
}

// Helper function to convert duration strings to minutes
function parseDuration(duration: string): number {
  const [amount, unit] = duration.split(" ");
  const parsedAmount = parseInt(amount, 10);

  if (isNaN(parsedAmount)) return 0;

  if (unit.includes("minute")) {
    return parsedAmount;
  } else if (unit.includes("hour")) {
    return parsedAmount * 60;
  }

  return 0;
}

// Get all chapters by course ID with filtering and pagination
export async function GET(req: NextRequest) {
  try {
    // Extract the query parameters
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    // Validate the courseId parameter
    if (!courseId) {
      return NextResponse.json(
        { message: "courseId is required." },
        { status: 400 }
      );
    }

    // Fetch chapters by courseId without additional filters
    const courseChapters = await db
      .select()
      .from(chapters)
      .where(eq(chapters.courseId, courseId));

    // If no chapters found for the course
    if (!courseChapters || courseChapters.length === 0) {
      return NextResponse.json(
        { message: "No chapters found for this course." },
        { status: 404 }
      );
    }

    // Calculate total duration and number of chapters
    let totalDuration = 0;
    for (const chapter of courseChapters) {
      totalDuration += parseDuration(chapter.duration);
    }

    const totalChapters = courseChapters.length;

    // Return the chapters with total duration and number of chapters
    return NextResponse.json(
      {
        message: "Chapters fetched successfully",
        totalDuration: `${Math.floor(totalDuration / 60)} hours ${
          totalDuration % 60
        } minutes`,
        totalChapters,
        data: courseChapters,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return NextResponse.json(
      { message: "Error fetching chapters.", error: error.message },
      { status: 500 }
    );
  }
}

// Helper function to format minutes into hours and minutes
function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} hours ${minutes} minutes`;
}

// Update a chapter's duration by summing up the durations of all lectures
export async function PUT(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { chapterId } = body;

    // Validate the required fields
    if (!chapterId) {
      return NextResponse.json(
        { message: "chapterId is required." },
        { status: 400 }
      );
    }

    // Fetch all lectures associated with the chapter
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

    // Calculate the total duration of all lectures
    let totalDuration = 0;
    chapterLectures.forEach((lecture) => {
      totalDuration += parseDuration(lecture.duration);
    });

    // Format the total duration
    const formattedDuration = formatDuration(totalDuration);

    // Update the chapter's duration
    const updatedChapter = await db
      .update(chapters)
      .set({ duration: formattedDuration })
      .where(eq(chapters.id, chapterId))
      .returning();

    // Check if the update was successful
    if (updatedChapter.length === 0) {
      return NextResponse.json(
        { message: "Chapter not found or no changes made." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Chapter duration updated successfully",
        chapter: updatedChapter,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating chapter:", error);
    return NextResponse.json(
      { message: "Error updating chapter.", error: error.message },
      { status: 500 }
    );
  }
}

// // Update a chapter by ID
//   export async function PUT(req: NextRequest) {
//     try {
//       // Parse the request body
//       const body = await req.json();
//       const { id, title, description, order, duration } = body;

//       // Validate the required fields
//       if (!id || !title || !duration) {
//         return NextResponse.json(
//           { message: "id, title, and duration are required fields." },
//           { status: 400 }
//         );
//       }

//       // Update the chapter in the database
//       const updatedChapter = await db
//         .update(chapters)
//         .set({
//           title,
//           description,
//           order,
//           duration,
//         })
//         .where(eq(chapters.id, id))
//         .returning();

//       // Check if the update was successful
//       if (updatedChapter.length === 0) {
//         return NextResponse.json(
//           { message: "Chapter not found or no changes made." },
//           { status: 404 }
//         );
//       }

//       return NextResponse.json(
//         { message: "Chapter updated successfully", chapter: updatedChapter },
//         { status: 200 }
//       );
//     } catch (error) {
//       console.error("Error updating chapter:", error);
//       return NextResponse.json(
//         { message: "Error updating chapter.", error: error.message },
//         { status: 500 }
//       );
//     }
//   }
