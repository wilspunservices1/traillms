// pATH ->  /api/certificates/[id]/placeholders
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { placeholders as placeHolderSchema } from '@/db/schemas/placeholders'; // Ensure correct import path
import { z } from 'zod';
import { getSession } from '@/libs/auth';
import { eq } from 'drizzle-orm';

// Define validation schemas
const IdSchema = z.string().uuid(); // Certificate ID validation

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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
        // Fetch all placeholders for the given certificate ID from the database
        const placeholders = await db
            .select()
            .from(placeHolderSchema)
            .where(eq(placeHolderSchema.certificationId, id)) // Use the correct column name for the certificate ID
            .execute();

        return NextResponse.json({ placeholders }, { status: 200 });
    } catch (error) {
        console.error('Error fetching placeholders:', error);
        return NextResponse.json({ message: 'Failed to fetch placeholders' }, { status: 500 });
    }
}