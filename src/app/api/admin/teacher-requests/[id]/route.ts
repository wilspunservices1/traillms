import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { instructorApplications } from "@/db/schemas/instructor";
import { user as users } from "@/db/schemas/user";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/libs/emial/emailService"; // Adjust the path
import { BASE_URL } from "@/actions/constant"; // Adjust the path
import { getSession } from "@/libs/auth";

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } } // ✅ Correct type for Next.js API Routes
) {
  try {
    const session = await getSession();
    if (!session || !session.user || !session.user.roles.includes("admin")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = context.params; // ✅ Ensure correct usage of params
    const { action } = await req.json();

    // Fetch the instructor application
    const [application] = await db
      .select()
      .from(instructorApplications)
      .where(eq(instructorApplications.id, id));

    if (!application) {
      return NextResponse.json({ message: "Application not found" }, { status: 404 });
    }

    // Fetch the user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, application.userId));

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (action === "approve") {
      // Update the user's roles to include "instructor"
      await db
        .update(users)
        .set({
          roles: [...user.roles, "instructor"],
        })
        .where(eq(users.id, user.id));

      // Update the application status
      await db
        .update(instructorApplications)
        .set({ status: "approved" })
        .where(eq(instructorApplications.id, id));

      // Send approval email
      await sendEmail({
        to: user.email,
        subject: "Instructor Application Approved",
        text: "applicationApproved",
        templateData: {
          name: user.name,
          link: `${BASE_URL}/dashboard`,
        },
      });

      return NextResponse.json({ message: "Application approved" }, { status: 200 });
    } else if (action === "reject") {
      // Update the application status
      await db
        .update(instructorApplications)
        .set({ status: "rejected" })
        .where(eq(instructorApplications.id, id));

      // Send rejection email
      await sendEmail({
        to: user.email,
        subject: "Instructor Application Rejected",
        text: "applicationRejected",
        templateData: {
          name: user.name,
          supportLink: `${BASE_URL}/support`,
        },
      });

      return NextResponse.json({ message: "Application rejected" }, { status: 200 });
    } else {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error updating instructor application:", error);
    return NextResponse.json(
      { message: "Error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
