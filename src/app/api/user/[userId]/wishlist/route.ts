import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db'; // Your Drizzle ORM instance
import { user } from '@/db/schemas/user'; // Your user schema
import { courses } from '@/db/schemas/courses'; // Your courses schema
import { eq, inArray } from 'drizzle-orm'; // For handling array-based queries

// GET wishlist based on userId
export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  const userId = params.userId;

  try {
    // Fetch the user's wishlist from the user table
    const userWithWishlist = await db
      .select({
        wishlist: user.wishlist,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    // If the user or wishlist is not found, return an error
    if (!userWithWishlist || userWithWishlist.length === 0) {
      return NextResponse.json({
        success: false,
        message: `User with ID ${userId} not found or has no wishlist`,
      }, { status: 404 });
    }

    const { wishlist } = userWithWishlist[0];

    // If the wishlist is empty, return an empty array
    if (!wishlist || wishlist.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "Wishlist is empty",
      });
    }

    // Fetch course details for each courseId in the wishlist
    const wishlistCourses = await db
      .select({
        id: courses.id,
        title: courses.title,
        lesson: courses.lesson,
        duration: courses.duration,
        thumbnail: courses.thumbnail,
        price: courses.price,
        estimatedPrice: courses.estimatedPrice,
        isFree: courses.isFree,
        categories: courses.categories,
        insName: courses.insName,
        enrolledCount: courses.enrolledCount,
      })
      .from(courses)
      .where(inArray(courses.id, wishlist));

    // Return the fetched wishlist courses
    return NextResponse.json({
      success: true,
      data: wishlistCourses,
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({
      success: false,
      message: 'Error fetching wishlist',
      error: error.message,
    }, { status: 500 });
  }
}
