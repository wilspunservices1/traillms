import { NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schemas/user";
import { eq } from "drizzle-orm";
// import bcrypt from "bcrypt";
import bcrypt from 'bcryptjs';
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    // Check if the token is provided
    if (!token) {
      return NextResponse.json(
        { error: "Invalid or missing token." },
        { status: 400 }
      );
    }

    // Hash the provided token to match with the stored token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find the user with the matching activation token
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.activationToken, hashedToken))
      .limit(1)
      .then((rows) => rows[0]);

    if (!existingUser) {
      return NextResponse.json(
        { error: "Token is invalid or has expired." },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the activation token and expiry
    await db
      .update(user)
      .set({
        password: hashPassword,
        activationToken: null,
        activationExpires: null,
      })
      .where(eq(user.id, existingUser.id));

    return NextResponse.json(
      { message: "Password reset successfully. You can now log in with your new password." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "An error occurred while resetting the password." },
      { status: 500 }
    );
  }
}
