import { NextResponse } from "next/server";
import { db } from "../../../../db/index";
import { user } from "../../../../db/schemas/user";
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json({ message: "Invalid activation link." }, { status: 400 });
    }

    try {
        const activatedUser = await db
            .update(user)
            .set({ isVerified: true })
            .where(eq(user.activationToken, token))
            .returning()
            .then((res) => res);

        if (!activatedUser.length) {
            return NextResponse.json({ message: "Invalid or expired activation link." }, { status: 400 });
        }

        return NextResponse.json({ message: "Account activated successfully." }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Error", error: error.message }, { status: 500 });
    }
}
