import { eq, inArray, sql } from "drizzle-orm";
import { courses } from "@/db/schemas/courses";
import { chapters } from "@/db/schemas/courseChapters";
import { lectures } from "@/db/schemas/lectures";
import { db } from "@/db/index";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { issueCertificate } from "@/utils/certificateIssuer";

export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { id } = params; // Course ID
		const body = await req.json(); // Get the JSON body from the request

		console.log("body.extras", body);

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
		const body = await req.json();

		console.log("Incoming PATCH request body:", body);

		// 1. Check if course exists
		const existingCourse = await db
			.select()
			.from(courses)
			.where(eq(courses.id, id))
			.limit(1);

		if (!existingCourse.length) {
			console.error("❌ Course not found, cannot update.");
			return NextResponse.json(
				{ message: "Course not found." },
				{ status: 404 }
			);
		}
		console.log("✅ Course found, proceeding with update.");

		// 2. Build updateFields
		const updateFields: any = {
			updatedAt: new Date(),
		};

		// Assign the fields if they exist in body
		const fieldsToCheck = [
			"title",
			"slug",
			"lesson",
			"duration",
			"featured",
			"price",
			"estimatedPrice",
			"isFree",
			"tag",
			"skillLevel",
			"categories",
			"insName",
			"thumbnail",
			"demoVideoUrl",
			"isPublished",
			"extras",
			"certificateId",
		];

		for (const field of fieldsToCheck) {
			if (body[field] !== undefined) {
				updateFields[field] = body[field];
			}
		}

		console.log("✅ Final updateFields object:", updateFields);

		// 3. Perform the update
		const updateResult = await db
			.update(courses)
			.set(updateFields)
			.where(eq(courses.id, id))
			.returning();

		console.log(
			"✅ Update executed, affected rows:",
			updateResult.affectedRows
		);

		// 4. Fetch & return updated course
		const updatedCourse = await db
			.select()
			.from(courses)
			.where(eq(courses.id, id))
			.limit(1);

		console.log("✅ Course after update:", updatedCourse[0]);

		return NextResponse.json({
			message: "Course updated successfully",
			data: updatedCourse[0],
		});
	} catch (error) {
		console.error("❌ Error during course update:", error);
		return NextResponse.json(
			{ message: "Error updating course details.", error: error.message },
			{ status: 500 }
		);
	}
}

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
