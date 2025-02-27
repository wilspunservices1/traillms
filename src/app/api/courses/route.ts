import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index"; // Adjust the path to your database connection
import { courses } from "@/db/schemas/courses"; // Adjust path as necessary
import { user } from "@/db/schemas/user";
import { and, desc, eq, inArray, like, SQL, sql } from "drizzle-orm";
import { files } from "@/db/schemas/files";
import { chapters } from "@/db/schemas/courseChapters";
import { lectures } from "@/db/schemas/lectures";

// Utility function to check if the user has the required role
function hasRole(role: string) {
  return role === "teacher" || "instructor" || role === "admin";
}

// Function to ensure slug uniqueness
async function generateUniqueSlug(slug, count = 0) {
  const newSlug = count > 0 ? `${slug}-${count}` : slug;

  const existingCourse = await db
    .select()
    .from(courses)
    .where(eq(courses.slug, newSlug))
    .limit(1)
    .then((res) => res[0]);

  if (existingCourse) {
    return await generateUniqueSlug(slug, count + 1);
  }

  return newSlug;
}

// Create a new course
export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const {
      title,
      slug,
      lesson,
      duration,
      price,
      estimatedPrice,
      isFree,
      tag,
      skillLevel,
      categories,
      insName,
      thumbnail, // URL to the image hosted on Cloudinary
      userId,
      demoVideoUrl,
      description,
    } = body;

    // Fetch the user from the database using the provided userId
    const foundUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)
      .then((res) => res[0]);

    // console.log("foundUser from post req", foundUser);

    // Check if the user exists and has the required role
    if (
      !foundUser ||
      !(
        foundUser.roles.includes("admin") ||
        foundUser.roles.includes("instructor")
      )
    ) {
      return NextResponse.json(
        {
          message: "Unauthorized: Only teachers or admins can create courses.",
        },
        { status: 403 }
      );
    }

    // Ensure price and estimatedPrice are numbers
    const parsedPrice = Number(parseFloat(price));
    const parsedEstimatedPrice = Number(parseFloat(estimatedPrice));

    // console.log("type of parsedPrice", typeof parsedPrice);
    // console.log("type of parsedEstimatedPrice", typeof parsedEstimatedPrice);
    // console.log("parsedPrice + parsedEstimatedPrice", parsedPrice + parsedEstimatedPrice);

    // Validate that price does not exceed estimatedPrice
    if (parsedPrice > parsedEstimatedPrice) {
      return NextResponse.json(
        { message: "Invalid pricing: Price cannot exceed Estimated Price." },
        { status: 400 }
      );
    }

    // Calculate discount
    const discount = ((parsedEstimatedPrice - parsedPrice) / parsedEstimatedPrice) * 100;

    // Ensure the slug is unique
    const uniqueSlug = await generateUniqueSlug(slug);

    // Insert the new course into the database and return the inserted course
    const [newCourse] = await db
      .insert(courses)
      .values({
        title,
        description,
        price: parsedPrice, // Convert to float
        slug: uniqueSlug,
        lesson: lesson || "", // Handle missing optional fields
        duration: duration || "", // Handle missing optional fields
        estimatedPrice: parsedEstimatedPrice, // Convert to float
        isFree: isFree || false,
        tag: tag || "",
        skillLevel: skillLevel || "",
        categories: Array.isArray(categories) ? categories : categories ? [categories] : [],
        insName,
        thumbnail,
        userId,
        demoVideoUrl,
        discount: Number(discount.toFixed(2)), // Store discount percentage as number
      })
      .returning(); // Returning the created course

    // console.log("New course created:", newCourse);

    // Update files with the above-created course ID
    if (demoVideoUrl) {
      await db
        .update(files)
        .set({ courseId: newCourse.id }) // Use the new course ID
        .where(eq(files.path, demoVideoUrl)); // Update files only where the path matches demoVideoUrl

      // console.log("🚀 ~ POST ~ files updated with courseId");
    }

    return NextResponse.json(
      { message: "Course created successfully", course: newCourse },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating course.", error: error.message },
      { status: 500 }
    );
  }
}


export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    const search = searchParams.get("search") || "";
    const categoryFilter = searchParams.get("category") || "";
    const tag = searchParams.get("tag") || "";
    const skillLevel = searchParams.get("skillLevel") || "";
    const languageFilter = searchParams.get("language") || "";
    const slug = searchParams.get("slug") || "";

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const offset = (page - 1) * limit;

    const isPublished = true; // Always fetch only published courses
    const whereConditions: any[] = [eq(courses.isPublished, isPublished)];

    // Handle search
    if (search) {
      whereConditions.push(like(courses.title, `%${search}%`));
    }

    // Handle category
    if (categoryFilter) {
      whereConditions.push(
        sql`EXISTS (
          SELECT 1 FROM json_array_elements_text(${courses.categories}) AS elem
          WHERE elem = ${sql.param(categoryFilter)}
        )`
      );
    }

    // Handle tag
    if (tag) {
      whereConditions.push(
        sql`${sql.param(tag)} = ANY(string_to_array(${courses.tag}, ','))`
      );
    }

    // Handle skill level
    if (skillLevel) {
      whereConditions.push(eq(courses.skillLevel, skillLevel));
    }

    // Handle language
    if (languageFilter) {
      whereConditions.push(
        sql`EXISTS (
          SELECT 1 FROM json_array_elements_text((${
            courses.extras
          }::json -> 'languages')) AS elem
          WHERE elem = ${sql.param(languageFilter)}
        )`
      );
    }

    // Handle slug
    if (slug) {
      whereConditions.push(eq(courses.slug, slug));
    }

    // Fetch filtered courses based on conditions
    const allCourses = await db
      .select()
      .from(courses)
      .where(and(...whereConditions))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(courses.createdAt));

    const courseIds = allCourses.map((course) => course.id);

    // Fetch related chapters and lectures
    const allChapters = await db
      .select()
      .from(chapters)
      .where(inArray(chapters.courseId, courseIds));

    const chapterIds = allChapters.map((chapter) => chapter.id);

    const allLectures = await db
      .select()
      .from(lectures)
      .where(inArray(lectures.chapterId, chapterIds));

    // Map over chapters and courses to construct coursesWithChapters
    const chaptersWithLectures = allChapters.map((chapter) => {
      const chapterLectures = allLectures.filter(
        (lecture) => lecture.chapterId === chapter.id
      );

      const chapterDuration = chapterLectures.reduce((total, lecture) => {
        return total + (parseInt(lecture.duration, 10) || 0);
      }, 0);

      return {
        ...chapter,
        lectures: chapterLectures,
        totalLectures: chapterLectures.length,
        duration: `${chapterDuration} minutes`,
      };
    });

    const coursesWithChapters = allCourses.map((course) => {
      const courseChapters = chaptersWithLectures.filter(
        (chapter) => chapter.courseId === course.id
      );

      const courseDuration = courseChapters.reduce((total, chapter) => {
        return total + (parseInt(chapter.duration, 10) || 0);
      }, 0);

      const totalCourseLectures = courseChapters.reduce((total, chapter) => {
        return total + chapter.totalLectures;
      }, 0);

      return {
        ...course,
        chapters: courseChapters,
        duration: `${courseDuration} minutes`,
        lesson: totalCourseLectures,
      };
    });

    // Calculate total number of matching courses
    const totalCoursesResult = await db.execute(
      sql`SELECT COUNT(*)::int FROM ${courses} WHERE ${and(...whereConditions)}`
    );

    const totalCourses = totalCoursesResult.rows[0]?.count || 0;

    const hasNext = offset + limit < totalCourses;
    const hasPrevious = offset > 0;

    return NextResponse.json({
      message: "Courses fetched successfully",
      length: allCourses.length,
      total: totalCourses,
      page,
      perPage: limit,
      hasNext,
      hasPrevious,
      data: coursesWithChapters,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      {
        message: "Error fetching courses.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
