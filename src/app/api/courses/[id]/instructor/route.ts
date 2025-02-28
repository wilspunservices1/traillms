
// src/app/api/courses/[id]/instructor/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db'; // Assuming db is your Drizzle ORM instance
import { courses } from '@/db/schemas/courses'; // Import course schema
import { user } from '@/db/schemas/user'; // Import user schema
import { userSocials } from '@/db/schemas/userSocials'; // Import userSocials schema
import { eq } from 'drizzle-orm'; // For building conditions

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const courseId = await params.id;

  try {
    // Fetch the course, instructor, and instructor's social media details based on course ID
    const result = await db
      .select({
        course: {
          id: courses.id,
          title: courses.title,
          description: courses.description,
          price: courses.price,
          demoVideoUrl: courses.demoVideoUrl,
          isPublished: courses.isPublished,
          enrolledCount: courses.enrolledCount,
        },
        instructor: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          roles: user.roles,
        },
        socials: {
          facebook: userSocials.facebook,
          twitter: userSocials.twitter,
          linkedin: userSocials.linkedin,
          website: userSocials.website,
          github: userSocials.github,
        }
      })
      .from(courses)
      .leftJoin(user, eq(courses.userId, user.id)) // Join courses with users table by userId
      .leftJoin(userSocials, eq(userSocials.userId, user.id)) // Join users with userSocials table by userId
      .where(eq(courses.id, courseId)) // Filter by course ID

    if (!result || result.length === 0) {
      return NextResponse.json({
        success: false,
        message: `No course found with ID: ${courseId}`,
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching course, instructor, and socials',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
