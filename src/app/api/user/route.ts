import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getSession } from "@/libs/auth"; // Ensure this path is correct
import { user } from "@/db/schemas/user"; // Assuming you have the user schema defined in Drizzle
import { eq, and, not, desc } from "drizzle-orm";
import { db } from "@/db";
import { userDetails } from "@/db/schemas/UserDetails";


export async function PATCH(req: Request, { params }: { params: { userId: string } }) {
  const { userId } = params;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required." }, { status: 400 });
  }

  try {
    const newData = await req.json();
    const fullName = `${newData.firstName?.trim() || ''} ${newData.lastName?.trim() || ''}`.trim();

    // Check for existing user
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ message: "User does not exist" }, { status: 404 });
    }

    // Update user data
    const updateUser = await db
      .update(user)
      .set({
        name: fullName || existingUser[0].name,
        username: newData.username || existingUser[0].username,
        phone: newData.phoneNumber || existingUser[0].phone,
        email: existingUser[0].email,
      })
      .where(eq(user.id, userId))
      .returning();

    // Update or insert user details
    const existingDetails = await db
      .select()
      .from(userDetails)
      .where(eq(userDetails.userId, userId))
      .limit(1);

    if (existingDetails.length > 0) {
      await db
        .update(userDetails)
        .set({
          biography: newData.bio || existingDetails[0].biography,
          expertise: newData.skills || existingDetails[0].expertise,
        })
        .where(eq(userDetails.userId, userId));
    } else {
      await db.insert(userDetails).values({
        userId: userId,
        biography: newData.bio || "Biography not provided.",
        expertise: newData.skills || [],
      });
    }

    return NextResponse.json({ message: "User details updated successfully.", updatedUser: updateUser[0] });
  } catch (error) {
    console.error("Error updating user details:", error);
    return NextResponse.json({ error: "An error occurred while updating user details." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Ensure the logged-in user has the 'admin' or 'superAdmin' role
    const currentUser = await db
      .select({
        roles: user.roles,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)
      .then(res => res[0]);

    if (!currentUser) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const isAdmin = currentUser.roles.includes("admin") || currentUser.roles.includes("superAdmin");

    if (!isAdmin) {
      return NextResponse.json({ message: "Forbidden. Only admins can access this resource." }, { status: 403 });
    }

    // Optional: Implement pagination, sorting, and filtering
    // For simplicity, we'll fetch all users here

    const allUsers = await db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        phone: user.phone,
        email: user.email,
        image: user.image,
        uniqueIdentifier: user.uniqueIdentifier,
        roles: user.roles,
        enrolledCoursesCount: db.raw(`(SELECT COUNT(*) FROM enrolled_courses WHERE enrolled_courses.user_id = user.id)`),
        wishlistCount: db.raw(`(SELECT COUNT(*) FROM wishlist WHERE wishlist.user_id = user.id)`),
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .orderBy(desc(user.createdAt))
      .then(res => res);

    // console.log("allUsers",allUsers)

    return NextResponse.json(allUsers, { status: 200 });
  } catch (error: any) {
    console.error("[FETCH_ALL_USERS]", error);
    return NextResponse.json({ message: error.message || "Internal Error" }, { status: 500 });
  }
}

// export async function GET(req: Request) {
//   try {
//     const session = await getSession();
//     const userId = session?.user?.id;

//     if (!userId) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     // Parse query parameters from the URL
//     const url = new URL(req.url);
//     const onlyWishlist = url.searchParams.get("onlyWishlist") === "true";
//     const onlyEnrolledCourses = url.searchParams.get("onlyEnrolledCourses") === "true";

//     // Fetch the full user details
//     const userInfo = await db
//       .select({
//         id: user.id,
//         name: user.name,
//         username: user.username,
//         phone: user.phone,
//         email: user.email,
//         image: user.image,
//         roles: user.roles,
//         enrolledCourses: user.enrolledCourses,
//         wishlist: user.wishlist,
//         isVerified: user.isVerified,
//         createdAt: user.createdAt,
//         updatedAt: user.updatedAt,
//       })
//       .from(user)
//       .where(eq(user.id, userId))
//       .limit(1)
//       .then((res) => res[0]);

//     if (!userInfo) {
//       return NextResponse.json({ message: "User not found." }, { status: 404 });
//     }

//     // Filter the response based on the query parameters
//     if (onlyWishlist) {
//       return NextResponse.json({
//         wishlist: userInfo.wishlist || [],
//       });
//     }

//     if (onlyEnrolledCourses) {
//       return NextResponse.json({
//         enrolledCourses: userInfo.enrolledCourses || [],
//       });
//     }

//     // Return the full user information by default
//     return NextResponse.json(userInfo);
//   } catch (error) {
//     console.log("[USER_INFO]", error);
//     return NextResponse.json({ message: "Internal Error" }, { status: 500 });
//   }
// }