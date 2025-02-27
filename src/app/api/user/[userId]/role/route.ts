import { NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schemas/user";
import { getSession } from "@/libs/auth"; // Ensure correct path to `getSession`
import { eq } from "drizzle-orm";
import {generateUniqueIdentifier} from "@/utils/generateUniqueIdentifier";


// PATCH handler to update user roles via userId or email
export async function PATCH(
  req: Request,
  { params }: { params: { userId?: string } }
) {
  const { userId } = params;

  // Get the session
  const session = await getSession(req);
  console.log("Session data:", session);

  // Ensure the user is logged in
  if (!session?.user?.id) {
    console.log("Unauthorized access - no session user.");
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  // Ensure the logged-in user has the 'admin' or 'superAdmin' role
  const isAdmin =
    session.user.roles.includes("admin") ||
    session.user.roles.includes("superAdmin");
  console.log("Is Admin or SuperAdmin:", isAdmin);
  if (!isAdmin) {
    console.log("Forbidden access - not an admin or superAdmin.");
    return NextResponse.json(
      { error: "Forbidden. Only admins or superAdmins can update roles." },
      { status: 403 }
    );
  }

  try {
    const { role, email } = await req.json(); // Check if role and email are passed
    console.log("Payload received:", { role, email });

    // Check if the role is provided
    if (!role) {
      console.log("No role provided in the payload.");
      return NextResponse.json(
        { error: "Role must be provided." },
        { status: 400 }
      );
    }

    // Validate the provided role
    const validRoles = ["superAdmin", "admin", "instructor", "user"];
    if (!validRoles.includes(role)) {
      console.log("Invalid role provided:", role);
      return NextResponse.json(
        { error: "Invalid role provided." },
        { status: 400 }
      );
    }

    let userToUpdate;

    // If userId is provided, fetch the user by ID
    if (userId) {
      console.log("Searching for user by userId:", userId);
      const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (existingUser.length === 0) {
        console.log("User not found by userId:", userId);
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }

      userToUpdate = existingUser[0];
    } else if (email) {
      // If email is provided, fetch the user by email
      const existingUserByEmail = await db
        .select()
        .from(user)
        .where(eq(user.email, email))
        .limit(1);

      if (existingUserByEmail.length === 0) {
        console.log("User with this email not found:", email);
        return NextResponse.json(
          { error: "User with this email not found." },
          { status: 404 }
        );
      }

      userToUpdate = existingUserByEmail[0];
    } else {
      return NextResponse.json(
        { error: "Either userId or email must be provided." },
        { status: 400 }
      );
    }

    // Check if the role has changed and update the uniqueIdentifier accordingly
    let newUniqueIdentifier = userToUpdate.uniqueIdentifier;
    if (userToUpdate.roles[0] !== role) {
      newUniqueIdentifier = await generateUniqueIdentifier(role);
    }

    // Update the user's role and uniqueIdentifier
    const updatedUser = await db
      .update(user)
      .set({
        roles: [role], // Update with the provided role
        uniqueIdentifier: newUniqueIdentifier, // Update uniqueIdentifier if role has changed
      })
      .where(eq(user.id, userToUpdate.id))
      .returning();

    return NextResponse.json({
      message: "Role updated successfully.",
      updatedUser: updatedUser[0],
    });
  } catch (error) {
    console.error("Error in request processing:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the role." },
      { status: 500 }
    );
  }
}

// // PATCH handler to update user roles via userId or email
// export async function PATCH(req: Request, { params }: { params: { userId?: string } }) {
//   const { userId } = params;

//   // Get the session
//   const session = await getSession();
//   console.log("Session data:", session);

//   // Ensure the user is logged in
//   if (!session?.user?.id) {
//     console.log("Unauthorized access - no session user.");
//     return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
//   }

//   // Ensure the logged-in user has the 'admin' or 'superAdmin' role
//   const isAdmin = session.user.roles.includes("admin") || session.user.roles.includes("superAdmin");
//   console.log("Is Admin or SuperAdmin:", isAdmin);
//   if (!isAdmin) {
//     console.log("Forbidden access - not an admin or superAdmin.");
//     return NextResponse.json({ error: "Forbidden. Only admins or superAdmins can update roles." }, { status: 403 });
//   }

//   try {
//     const { role, email } = await req.json(); // Check if role and email are passed
//     console.log("Payload received:", { role, email });

//     // Check if the role is provided
//     if (!role) {
//       console.log("No role provided in the payload.");
//       return NextResponse.json({ error: "Role must be provided." }, { status: 400 });
//     }

//     // Validate the provided role
//     const validRoles = ["superAdmin", "admin", "instructor", "user"];
//     if (!validRoles.includes(role)) {
//       console.log("Invalid role provided:", role);
//       return NextResponse.json({ error: "Invalid role provided." }, { status: 400 });
//     }

//     let userToUpdate;

//     // If userId is provided, fetch the user by ID
//     if (userId) {
//       console.log("Searching for user by userId:", userId);
//       const existingUser = await db.select().from(user).where(eq(user.id, userId)).limit(1);
//       console.log("Existing user by ID:", existingUser);

//       if (existingUser.length === 0) {
//         console.log("User not found by userId:", userId);
//         return NextResponse.json({ error: "User not found." }, { status: 404 });
//       }

//       userToUpdate = existingUser[0];
//     } else if (email) {
//       // If email is provided, fetch the user by email
//       console.log("Searching for user by email:", email);
//       const existingUserByEmail = await db.select().from(user).where(eq(user.email, email)).limit(1);
//       console.log("Existing user by email:", existingUserByEmail);

//       if (existingUserByEmail.length === 0) {
//         console.log("User with this email not found:", email);
//         return NextResponse.json({ error: "User with this email not found." }, { status: 404 });
//       }

//       userToUpdate = existingUserByEmail[0];
//     } else {
//       console.log("Neither userId nor email provided.");
//       return NextResponse.json({ error: "Either userId or email must be provided." }, { status: 400 });
//     }

//     // Log the user to be updated
//     console.log("User to update:", userToUpdate);

//     // Update the user's role
//     try {
//       const updatedUser = await db
//         .update(user)
//         .set({
//           roles: [role], // Update with the provided role
//         })
//         .where(eq(user.id, userToUpdate.id))
//         .returning();

//       console.log("Updated user:", updatedUser);

//       return NextResponse.json({ message: "Role updated successfully.", updatedUser: updatedUser[0] });
//     } catch (dbError) {
//       console.error("Database error updating user role:", dbError);
//       return NextResponse.json({ error: "Failed to update role in the database." }, { status: 500 });
//     }
//   } catch (error) {
//     console.error("Error in request processing:", error);
//     return NextResponse.json({ error: "An error occurred while updating the role." }, { status: 500 });
//   }
// }
