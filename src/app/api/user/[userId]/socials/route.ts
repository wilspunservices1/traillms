import { NextResponse } from "next/server";
import { db } from "@/db";
import { userSocials } from "@/db/schemas/userSocials";
import { eq } from "drizzle-orm";
import { getSession } from "@/libs/auth"; // Ensure this path is correct

export async function POST(req: Request, { params }: { params: { userId: string } }) {
  // Get the current session
  const session = await getSession();

  // Verify if the user is logged in
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get the userId from the session
  const sessionUserId = session.user.id;

  // Check if the session userId matches the userId in the route parameter
  if (sessionUserId !== params.userId) {
    return NextResponse.json({ error: "Forbidden: You are not allowed to update this user's social links." }, { status: 403 });
  }

  // Extract the social media details from the request body
  const body = await req.json();
  const { facebook, twitter, linkedin, website, github } = body;

  // Validate the userId in the route parameter
  if (!params.userId) {
    return NextResponse.json({ error: "User ID is required." }, { status: 400 });
  }

  try {
    // Check if social links already exist for the user
    const existingSocials = await db
      .select()
      .from(userSocials)
      .where(eq(userSocials.userId, params.userId))
      .limit(1)
      .then((rows) => rows[0]);

    if (existingSocials) {
      // Update existing social links
      await db
        .update(userSocials)
        .set({
          facebook: facebook || existingSocials.facebook,
          twitter: twitter || existingSocials.twitter,
          linkedin: linkedin || existingSocials.linkedin,
          website: website || existingSocials.website,
          github: github || existingSocials.github,
        })
        .where(eq(userSocials.userId, params.userId));
    } else {
      // Insert new social links
      await db.insert(userSocials).values({
        userId: params.userId,
        facebook,
        twitter,
        linkedin,
        website,
        github,
      });
    }

    return NextResponse.json({ message: "Social links updated successfully." });
  } catch (error) {
    console.error("Error updating social links:", error);
    return NextResponse.json({ error: "An error occurred while updating social links." }, { status: 500 });
  }
}


// GET handler for retrieving social links
export async function GET(req: Request, { params }: { params: { userId: string } }) {
  // Get the current session
  const session = await getSession();

  // Verify if the user is logged in
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if the session userId matches the userId in the route parameter
  const sessionUserId = session.user.id;
  if (sessionUserId !== params.userId) {
    return NextResponse.json({ error: "Forbidden: You are not allowed to view this user's social links." }, { status: 403 });
  }

  try {
    // Fetch the user's social links from the database
    const socialLinks = await db
      .select()
      .from(userSocials)
      .where(eq(userSocials.userId, params.userId))
      .limit(1)
      .then((rows) => rows[0]);

    // Return 404 if social links do not exist for the user
    if (!socialLinks) {
      return NextResponse.json({ error: "Social links not found." }, { status: 404 });
    }

    // Return the user's social links
    return NextResponse.json(socialLinks, { status: 200 });
  } catch (error) {
    console.error("Error fetching social links:", error);
    return NextResponse.json({ error: "An error occurred while fetching social links." }, { status: 500 });
  }
}