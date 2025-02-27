import { db } from "@/db";
import { sql } from "drizzle-orm";
import { courses } from "@/db/schemas/courses";
import { orders } from "@/db/schemas/orders";
import { user } from "@/db/schemas/user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    const result = await db
      .select({
        instructorId: user.id,
        instructorName: user.name,
        profileImage: user.image,
        courseCount: sql`COUNT(DISTINCT ${courses.id}) AS course_count`,
        totalEnrollments: sql`COALESCE(SUM(${courses.enrolledCount}), 0) AS total_enrollments`,
        totalRevenue: sql`COALESCE(SUM(${orders.totalAmount}), 0) AS total_revenue`,
        reviewCount: sql`COALESCE(SUM(jsonb_array_length(${courses.reviews}::jsonb)), 0) AS review_count`,
        avgRating: sql`COALESCE(AVG((review->>'rating')::numeric), 0) AS avg_rating`, // Lateral join for individual review ratings
        wishlistCount: sql`COALESCE(SUM(jsonb_array_length(${user.wishlist}::jsonb)), 0) AS wishlist_count`,
        enrolledCoursesCount: sql`COALESCE(SUM(jsonb_array_length(${user.enrolledCourses}::jsonb)), 0) AS enrolled_courses_count`,
        popularityScore: sql`
          COALESCE(SUM(${courses.enrolledCount}), 0) * 0.3 + 
          COALESCE(SUM(${orders.totalAmount}), 0) * 0.2 + 
          COALESCE(SUM(jsonb_array_length(${courses.reviews}::jsonb)), 0) * 0.1 + 
          COALESCE(AVG((review->>'rating')::numeric), 0) * 0.3 + 
          COALESCE(SUM(jsonb_array_length(${user.wishlist}::jsonb)), 0) * 0.1 + 
          COUNT(DISTINCT ${courses.id}) * 0.1
        `.as("popularity_score"),
      })
      .from(user)
      .leftJoin(courses, sql`${courses.userId} = ${user.id}`)
      .leftJoin(
        orders,
        sql`${orders.userId} = ${user.id} AND ${orders.items}::jsonb @> jsonb_build_object('courseId', ${courses.id}::text)::jsonb`
      )
      .leftJoin(
        sql`LATERAL jsonb_array_elements(${courses.reviews}::jsonb) AS review`,
        true
      )
      .where(sql`${user.roles}::jsonb @> '[\"instructor\"]'::jsonb`)
      .groupBy(user.id)
      .orderBy(sql`popularity_score DESC`)
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ instructors: result });
  } catch (error) {
    console.error("Error fetching instructors:", error);
    return NextResponse.json(
      { error: "Failed to fetch instructors" },
      { status: 500 }
    );
  }
}


// import { db } from "@/db";
// import { sql } from "drizzle-orm";
// import { courses } from "@/db/schemas/courses";
// import { orders } from "@/db/schemas/orders";
// import { user } from "@/db/schemas/user";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(req: NextRequest) {
//   const url = new URL(req.url);
//   const page = parseInt(url.searchParams.get('page') || '1');
//   const limit = 10;
//   const offset = (page - 1) * limit;

//   try {
//     const result = await db
//       .select({
//         instructorId: user.id,
//         instructorName: user.name,
//         profileImage: user.image,
//         courseCount: sql`COUNT(DISTINCT ${courses.id}) AS course_count`,
//         totalEnrollments: sql`COALESCE(SUM(${courses.enrolledCount}), 0) AS total_enrollments`,
//         totalRevenue: sql`COALESCE(SUM(${orders.totalAmount}), 0) AS total_revenue`,
//         reviewCount: sql`COALESCE(SUM(jsonb_array_length(${courses.reviews}::jsonb)), 0) AS review_count`,
//         avgRating: sql`COALESCE(AVG((review->>'rating')::numeric), 0) AS avg_rating`, // Lateral join for individual review ratings
//         wishlistCount: sql`COALESCE(SUM(jsonb_array_length(${user.wishlist}::jsonb)), 0) AS wishlist_count`,
//         popularityScore: sql`
//           COALESCE(SUM(${courses.enrolledCount}), 0) * 0.3 + 
//           COALESCE(SUM(${orders.totalAmount}), 0) * 0.2 + 
//           COALESCE(SUM(jsonb_array_length(${courses.reviews}::jsonb)), 0) * 0.1 + 
//           COALESCE(AVG((review->>'rating')::numeric), 0) * 0.3 + 
//           COALESCE(SUM(jsonb_array_length(${user.wishlist}::jsonb)), 0) * 0.1 + 
//           COUNT(DISTINCT ${courses.id}) * 0.1
//         `.as("popularity_score"),
//       })
//       .from(user)
//       .leftJoin(courses, sql`${courses.userId} = ${user.id}`)
//       .leftJoin(orders, sql`${orders.userId} = ${user.id} AND ${orders.items}::jsonb @> jsonb_build_object('courseId', ${courses.id}::text)::jsonb`)
//       .leftJoin(
//         sql`LATERAL jsonb_array_elements(${courses.reviews}::jsonb) AS review`,
//         true
//       )
//       .where(sql`${user.roles}::jsonb @> '[\"instructor\"]'::jsonb`)
//       .groupBy(user.id)
//       .orderBy(sql`popularity_score DESC`)
//       .limit(limit)
//       .offset(offset);

//     return NextResponse.json({ instructors: result });
//   } catch (error) {
//     console.error("Error fetching instructors:", error);
//     return NextResponse.json({ error: "Failed to fetch instructors" }, { status: 500 });
//   }
// }
