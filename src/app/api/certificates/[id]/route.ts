// path : -> > > /api/certificates/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { placeholders as placeholdersSchema } from '@/db/schemas/placeholders'; // Ensure correct import path
import { z } from 'zod';
import { getSession } from '@/libs/auth';
import { eq } from 'drizzle-orm';

// Define validation schemas
const IdSchema = z.string().uuid(); // Certificate ID validation
const PlaceholdersSchema = z.array(
    z.object({
        id: z.string(),
        value: z.string(),
        x: z.number(),
        y: z.number(),
        fontSize: z.number(),
        isVisible: z.boolean(),
    })
);

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;

    // Validate the ID
    const parsedId = IdSchema.safeParse(id);
    if (!parsedId.success) {
        return NextResponse.json({ message: 'Invalid certificate ID' }, { status: 400 });
    }

    // Retrieve the session
    let session = await getSession();

    // For testing: Mock session if null and in development
    if (!session && process.env.NODE_ENV === 'development') {
        console.warn('No session found. Using mock session for testing.');
        session = {
            user: {
                id: '0d78a48d-0128-4351-9aa4-394534ae31c6',
                roles: ['superAdmin'],
            },
        };
    }

    // Enforce authentication in production
    if (!session || !session.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Extract user roles
    const userRoles: string[] = session.user.roles || [];
    const hasAccess = userRoles.includes('superAdmin') || userRoles.includes('instructor') || userRoles.includes('admin');

    if (!hasAccess) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        // Parse the request body
        const body = await req.json();
        const placeholdersResult = PlaceholdersSchema.safeParse(body.placeholders);

        if (!placeholdersResult.success) {
            return NextResponse.json({ message: 'Invalid placeholders data' }, { status: 400 });
        }

        // Delete existing placeholders for this certificate if you want to overwrite them
        await db.deleteFrom(placeholdersSchema)
            .where(eq(placeholdersSchema.certificationId, id)) // Use the correct column name for the certificate ID
            .execute();

        // Insert new placeholders
        await db.insertInto(placeholdersSchema).values(
            placeholdersResult.data.map(p => ({
                certificateId: id,  // Use the parsed ID from the parameters
                key: p.id,
                value: p.value,
                x: p.x,
                y: p.y,
                fontSize: p.fontSize,
                isVisible: p.isVisible,
            }))
        ).execute();

        return NextResponse.json({ message: 'Placeholders saved successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error saving placeholders:', error);
        return NextResponse.json({ message: 'Failed to save placeholders' }, { status: 500 });
    }
}
