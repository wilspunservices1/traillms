// src/app/api/instructors/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { user } from "@/db/schemas/user";
import { instructorApplications } from "@/db/schemas/instructor"; // Import the new schema
import { eq, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "@/libs/emial/emailService";
import { BASE_URL } from "@/actions/constant";
import { generateUniqueIdentifier } from "@/utils/generateUniqueIdentifier";

function generateNameFromUsername(username: string) {
  const parts = username.split(" ");
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1]}`;
  }
  return username;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, phone, username, password, instructorBio, qualifications } =
      body;

    // Check for required fields
    if (!email || !password || !username) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .then((res: any[]) => res[0]);

    if (!existingUser) {
      // If user doesn't exist, create a new user account
      const hashPassword = await bcrypt.hash(password, 10);
      // Check if the role has changed and update the uniqueIdentifier accordingly
      const uniqueIdentifier = await generateUniqueIdentifier("instructor");
      const activationToken = uuidv4();

      const newUser = await db
        .insert(user)
        .values({
          email,
          phone,
          password: hashPassword,
          username,
          uniqueIdentifier,
          name: generateNameFromUsername(username).trim(),
          roles: sql`'["instructor"]'::json`,
          isVerified: false,
          activationToken,
        })
        .returning()
        .then((res: any[]) => res[0]);

      // Send activation email
      await sendEmail({
        to: email,
        subject: "Activate Your Account",
        text: "Please activate your account.",
        templateName: "activationEmailTemplate",
        templateData: {
          name: username,
          activationLink: `${BASE_URL}/pass/activate?token=${activationToken}`,
        },
      });

      // Create instructor application
      await db.insert(instructorApplications).values({
        userId: newUser.id,
        instructorBio,
        qualifications: qualifications ? JSON.stringify(qualifications) : "[]",
      });

      // Optionally, notify admin about the new application
      await sendEmail({
        to: "aqeelshahzad1215@gmail.com", // Replace with admin email
        subject: "New Instructor Application",
        text: `User ${username} has applied to become an instructor.`,
        templateName: "newInstructorApplication",
        templateData: {
          username,
          email,
          link: `${BASE_URL}/dashboards/roles`,
        },
      });

      return NextResponse.json(
        {
          message:
            "Your application has been submitted. Please check your email to activate your account.",
        },
        { status: 201 }
      );
    } else {
      // If user exists, create instructor application
      await db.insert(instructorApplications).values({
        userId: existingUser.id,
        instructorBio,
        qualifications: qualifications ? JSON.stringify(qualifications) : "[]",
      });

      // Notify admin about the new application
      await sendEmail({
        to: "admin@example.com", // Replace with admin email
        subject: "New Instructor Application",
        text: `User ${username} has applied to become an instructor.`,
        templateName: "newInstructorApplication",
        templateData: {
          username,
          email,
          link: `${BASE_URL}/admin/instructor-applications`,
        },
      });

      return NextResponse.json(
        {
          message: "Your application has been submitted.",
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error", error: error.message },
      { status: 500 }
    );
  }
}
