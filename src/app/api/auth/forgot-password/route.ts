import { NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schemas/user";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/libs/emial/emailService"; // Use the unified email service
import crypto from "crypto";
import { BASE_URL } from "@/actions/constant";

export async function POST(req: Request) {
  const { email } = await req.json();

  // Find the user by email
  const existingUser = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1)
    .then((rows) => rows[0]);

  if (!existingUser) {
    return NextResponse.json({ error: "No user found with this email." }, { status: 404 });
  }

  // verify that exieting user is verified or not if not verified then send error message
  // You have not activated your account
  if (!existingUser.isVerified) {
    return NextResponse.json({ error: "Please activate your account." }, { status: 400 });
  }

  // Generate a unique reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  // Set the token expiry time (e.g., 1 hour)
  const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour

  // Update user with reset token and expiry
  await db
    .update(user)
    .set({
      activationToken: hashedToken,
      updatedAt: new Date(), // Update the timestamp for when the token was generated
    })
    .where(eq(user.id, existingUser.id));

  // Send the "Forgot Password" email
  await sendEmail({
    to: email,
    subject: "Forgot Password Request",
    text: `You requested to reset your password. Click the link below to reset your password: ${process.env.BASE_URL}/pass/reset?token=${resetToken}`,
    templateName: "forgot-password",
    templateData: {
      email,
      resetLink: `${BASE_URL}/pass/reset?token=${resetToken}`,
    },
  });

  return NextResponse.json({ message: "Forgot password email sent." });
}

