// src/app/api/user/[userId]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schemas/user";
import { userDetails } from "@/db/schemas/UserDetails";
import { userSocials } from "@/db/schemas/userSocials";
import { eq } from "drizzle-orm";

export async function PUT(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required." },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();

    // Handle update of basic user details, roles, and enrolledCourses
    const updateData = {
      name: body.name !== undefined ? body.name : undefined,
      username: body.username !== undefined ? body.username : undefined,
      phone: body.phone !== undefined ? body.phone : undefined,
      email: body.email !== undefined ? body.email : undefined,
      image: body.image !== undefined ? body.image : undefined,
      roles: body.roles !== undefined ? body.roles : undefined, // Handle roles
      enrolledCourses:
        body.enrolledCourses !== undefined ? body.enrolledCourses : undefined, // Handle enrolledCourses
      isVerified: body.isVerified !== undefined ? body.isVerified : undefined,
      wishlist: body.wishlist !== undefined ? body.wishlist : undefined,
    };

    // Filter out undefined fields from updateData to prevent overwriting with undefined
    const filteredUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== undefined)
    );

    const updatedUser = await db
      .update(user)
      .set(filteredUpdateData)
      .where(eq(user.id, userId))
      .returning();

    // If there's additional data for userDetails, update or insert it
    let updatedUserDetails = null;
    if (body.biography !== undefined || body.expertise !== undefined) {
      const existingDetails = await db
        .select()
        .from(userDetails)
        .where(eq(userDetails.userId, userId))
        .limit(1);

      if (existingDetails.length > 0) {
        updatedUserDetails = await db
          .update(userDetails)
          .set({
            biography:
              body.biography !== undefined
                ? body.biography
                : existingDetails[0].biography,
            expertise:
              body.expertise !== undefined
                ? body.expertise
                : existingDetails[0].expertise,
          })
          .where(eq(userDetails.userId, userId))
          .returning();
      } else {
        updatedUserDetails = await db
          .insert(userDetails)
          .values({
            userId: userId,
            biography: body.biography || "Biography not provided.",
            expertise: body.expertise || [],
          })
          .returning();
      }
    }

    // Combine user and userDetails data for response
    const responseData = {
      message: "User details updated successfully.",
      updatedUser: updatedUser,
      updatedUserDetails: updatedUserDetails ? updatedUserDetails : [],
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error updating user details:", error);
    return NextResponse.json(
      { error: "An error occurred while updating user details." },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a user by userId
export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required." },
      { status: 400 }
    );
  }

  try {
    // Check if the user exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Delete the userDetails associated with the user
    await db.delete(userDetails).where(eq(userDetails.userId, userId));

    // Delete the user
    await db.delete(user).where(eq(user.id, userId));

    return NextResponse.json({
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the user." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required." },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { image, newCourse, wishlist, removeFromWishlist } = body;

    // Fetch current user data to avoid overwriting fields
    const existingUser = await db
      .select({
        enrolledCourses: user.enrolledCourses,
        image: user.image,
        wishlist: user.wishlist,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!existingUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Initialize patchData with the current user data
    let patchData = {
      image: existingUser.image,
      enrolledCourses: existingUser.enrolledCourses,
      wishlist: existingUser.wishlist,
    };

    // Update image if provided
    if (image !== undefined && image !== null) {
      patchData.image = image;
    }

    // Append new course if provided
    if (newCourse !== undefined && newCourse !== null) {
      patchData.enrolledCourses = [...existingUser.enrolledCourses, newCourse];
    }

    // Handle wishlist updates (adding new items)
    if (wishlist !== undefined && wishlist !== null) {
      patchData.wishlist = [...existingUser.wishlist, ...wishlist].filter(
        (item, index, array) => array.indexOf(item) === index // Ensure unique items
      );
    }

    // Handle removal of items from the wishlist
    if (removeFromWishlist !== undefined && removeFromWishlist !== null) {
      const itemsToRemove = Array.isArray(removeFromWishlist)
        ? removeFromWishlist
        : [removeFromWishlist]; // Ensure it's always an array

      patchData.wishlist = existingUser.wishlist.filter(
        (item) => !itemsToRemove.includes(item)
      );
    }

    // Only update fields if they are actually changed
    const fieldsToUpdate = Object.fromEntries(
      Object.entries(patchData).filter(
        ([key, value]) => value !== undefined && value !== null
      )
    );

    if (Object.keys(fieldsToUpdate).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update." },
        { status: 400 }
      );
    }

    // Update user in the database
    const updatedUser = await db
      .update(user)
      .set(fieldsToUpdate)
      .where(eq(user.id, userId))
      .returning();

    return NextResponse.json({
      message: "User details updated successfully.",
      updatedUser,
    });
  } catch (error) {
    console.error("Error updating user details:", error);
    return NextResponse.json(
      { error: "An error occurred while updating user details." },
      { status: 500 }
    );
  }
}

// export async function GET(
//   req: Request,
//   { params }: { params: { userId: string } }
// ) {
//   const { userId } = params;

//   if (!userId) {
//     return NextResponse.json(
//       { error: "User ID is required." },
//       { status: 400 }
//     );
//   }

//   try {
//     // Parse the query parameters from the URL
//     const url = new URL(req.url);
//     const includeEnrolledCourses = url.searchParams.get(
//       "includeEnrolledCourses"
//     );
//     const includeWishlist = url.searchParams.get("includeWishlist");

//     // Perform the base query to fetch user details along with userDetails and userSocials
// const [userWithDetailsAndSocials] = await db
//   .select({
//     id: user.id,
//     name: user.name,
//     username: user.username,
//     phone: user.phone,
//     email: user.email,
//     image: user.image,
//     roles: user.roles,
//     isVerified: user.isVerified,
//     createdAt: user.createdAt,
//     updatedAt: user.updatedAt,
//     biography: userDetails.biography,
//     expertise: userDetails.expertise,
//     registrationDate: userDetails.registrationDate,
//     enrolledCourses: user.enrolledCourses,
//     wishlist: user.wishlist,
//     // Socials fields
//     facebook: userSocials.facebook,
//     twitter: userSocials.twitter,
//     linkedin: userSocials.linkedin,
//     website: userSocials.website,
//     github: userSocials.github,
//   })
//   .from(user)
//   .leftJoin(userDetails, eq(user.id, userDetails.userId))
//   .leftJoin(userSocials, eq(user.id, userSocials.userId))
//   .where(eq(user.id, userId))
//   .limit(1);

//     if (!userWithDetailsAndSocials) {
//       return NextResponse.json(
//         { error: "User details not found." },
//         { status: 404 }
//       );
//     }

//     // Structure the socials data
//     const socials = {
//       facebook: userWithDetailsAndSocials.facebook || "",
//       twitter: userWithDetailsAndSocials.twitter || "",
//       linkedin: userWithDetailsAndSocials.linkedin || "",
//       website: userWithDetailsAndSocials.website || "",
//       github: userWithDetailsAndSocials.github || "",
//     };

//     // Prepare response with all details by default
//     const response = {
//       id: userWithDetailsAndSocials.id,
//       name: userWithDetailsAndSocials.name,
//       username: userWithDetailsAndSocials.username,
//       phone: userWithDetailsAndSocials.phone,
//       email: userWithDetailsAndSocials.email,
//       image: userWithDetailsAndSocials.image,
//       roles: userWithDetailsAndSocials.roles,
//       isVerified: userWithDetailsAndSocials.isVerified,
//       createdAt: userWithDetailsAndSocials.createdAt,
//       updatedAt: userWithDetailsAndSocials.updatedAt,
//       biography: userWithDetailsAndSocials.biography || "Biography not provided.",
//       expertise: userWithDetailsAndSocials.expertise.length > 0 ? userWithDetailsAndSocials.expertise : ["No expertise provided."],
//       registrationDate: userWithDetailsAndSocials.registrationDate || "Date not provided",
//       socials, // Include socials
//     };

//     // Conditionally include enrolledCourses and wishlist
//     if (includeEnrolledCourses !== "false") {
//       response['enrolledCourses'] = userWithDetailsAndSocials.enrolledCourses;
//     }

//     if (includeWishlist !== "false") {
//       response['wishlist'] = userWithDetailsAndSocials.wishlist;
//     }

//     // Return the response
//     return NextResponse.json(response);
//   } catch (error) {
//     console.error("Error fetching user details:", error);
//     return NextResponse.json(
//       { error: "An error occurred while fetching user details." },
//       { status: 500 }
//     );
//   }
// }

// Define precise types based on your schema

// Define precise types based on your schema
interface Course {
  id: string;
  title: string;
  // Add other relevant fields
}

interface Socials {
  facebook: string;
  twitter: string;
  linkedin: string;
  website: string;
  github: string;
}

interface UserResponse {
  id: string;
  name: string;
  username: string;
  phone: string;
  email: string;
  image: string;
  roles: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  biography: string;
  expertise: string[];
  registrationDate: string;
  socials: Socials;
  enrolledCourses: Course[];
  wishlist: Course[];
}

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const { userId } = await params;

  // Validate that userId is provided
  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required." },
      { status: 400 }
    );
  }

  try {
    // Parse the query parameters from the URL
    const url = new URL(req.url);
    const includeEnrolledCourses =
      url.searchParams.get("includeEnrolledCourses") === "true";
    const includeWishlist = url.searchParams.get("includeWishlist") === "true";

    console.log(`Fetching data for userId: ${userId}`);
    console.log(`includeEnrolledCourses: ${includeEnrolledCourses}`);
    console.log(`includeWishlist: ${includeWishlist}`);

    // Perform the base query to fetch user details along with userDetails and userSocials
    const [fetchedUser] = await db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        phone: user.phone,
        email: user.email,
        image: user.image,
        roles: user.roles,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        biography: userDetails.biography,
        expertise: userDetails.expertise,
        registrationDate: userDetails.registrationDate,
        enrolledCourses: user.enrolledCourses,
        wishlist: user.wishlist,
        // Socials fields
        facebook: userSocials.facebook,
        twitter: userSocials.twitter,
        linkedin: userSocials.linkedin,
        website: userSocials.website,
        github: userSocials.github,
      })
      .from(user)
      .leftJoin(userDetails, eq(user.id, userDetails.userId))
      .leftJoin(userSocials, eq(user.id, userSocials.userId))
      .where(eq(user.id, userId))
      .limit(1);

    // If user is not found, return a 404 error
    if (!fetchedUser) {
      console.warn(`User with ID ${userId} not found.`);
      return NextResponse.json(
        { error: "User with the given ID was not found." },
        { status: 404 }
      );
    }

    // Handle 'expertise'
    const expertiseProcessed: string[] =
      Array.isArray(fetchedUser.expertise) && fetchedUser.expertise.length > 0
        ? fetchedUser.expertise
        : ["No expertise provided."];

    // Handle 'enrolledCourses'
    const enrolledCoursesProcessed: Course[] =
      includeEnrolledCourses && Array.isArray(fetchedUser.enrolledCourses)
        ? fetchedUser.enrolledCourses
        : [];

    // Handle 'wishlist'
    const wishlistProcessed: Course[] =
      includeWishlist && Array.isArray(fetchedUser.wishlist)
        ? fetchedUser.wishlist
        : [];

    // Structure the socials data with default values
    const socials: Socials = {
      facebook: fetchedUser.facebook || "",
      twitter: fetchedUser.twitter || "",
      linkedin: fetchedUser.linkedin || "",
      website: fetchedUser.website || "",
      github: fetchedUser.github || "",
    };

    // Prepare the response object with default values where necessary
    const response: UserResponse = {
      id: fetchedUser.id,
      name: fetchedUser.name,
      username: fetchedUser.username,
      phone: fetchedUser.phone,
      email: fetchedUser.email,
      image: fetchedUser.image || "/user.png", // Ensure this default image exists in your public directory
      roles:
        Array.isArray(fetchedUser.roles) && fetchedUser.roles.length > 0
          ? fetchedUser.roles
          : ["user"],
      isVerified: fetchedUser.isVerified ?? false, // Use nullish coalescing to allow false
      createdAt: fetchedUser.createdAt,
      updatedAt: fetchedUser.updatedAt,
      biography: fetchedUser.biography || "Biography not provided.",
      expertise: expertiseProcessed,
      registrationDate: fetchedUser.registrationDate || "Date not provided",
      socials, // Include socials with default values
      enrolledCourses: enrolledCoursesProcessed,
      wishlist: wishlistProcessed,
    };

    console.log("API Response:", response);

    // Return the response
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error fetching user details:", error);

    // Return a 500 error with a generic message
    return NextResponse.json(
      { error: "An error occurred while fetching user details." },
      { status: 500 }
    );
  }
}
