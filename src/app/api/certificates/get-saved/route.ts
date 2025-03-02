
// src/app/api/certificates/get-saved/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { certification } from '@/db/schemas/certification';
import { z } from 'zod';
import { getSession } from '@/libs/auth';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    // console.log('Received Get Saved Certificates Request');

    // Retrieve the session
    let session = await getSession();

    // For testing: Mock session if null and in development
    if (!session && process.env.NODE_ENV === 'development') {
        console.warn('No session found. Using mock session for testing.');
        session = {
            user: {
                id: '0d78a48d-0128-4351-9aa4-394534ae31c6', // Use your own test user ID
                roles: ['superAdmin'], // Adjust roles as needed for testing
            },
        };
    }

    // Enforce authentication in production
    if (!session || !session.user) {
        console.error('Unauthorized access attempt');
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Extract user roles
    const userRoles: string[] = session.user.roles || [];
    console.log('User Roles:', userRoles);

    // Define allowed roles
    const allowedRoles = ['superAdmin', 'instructor'];

    // Check if the user has at least one of the allowed roles
    const hasAccess = userRoles.some((role) => allowedRoles.includes(role));
    console.log('Has Access:', hasAccess);

    if (!hasAccess) {
        console.error('Forbidden access by user:', session.user.id);
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        // Fetch certificates from the database belonging to the user
        const userCertificates = await db
            .select()
            .from(certification)
            .where(eq(certification.ownerId, session.user.id))
            .execute();

        return NextResponse.json(
            { certificates: userCertificates },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching certificates:', error);
        return NextResponse.json(
            { message: 'Failed to fetch certificates' },
            { status: 500 }
        );
    }
}
