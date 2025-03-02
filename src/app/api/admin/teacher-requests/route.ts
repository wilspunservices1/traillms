// src/app/api/admin/instructor-applications/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/index';
import { instructorApplications } from '@/db/schemas/instructor';
import { user } from '@/db/schemas/user';
import { desc, eq } from 'drizzle-orm';
import { getSession } from '@/libs/auth';

// src/app/api/admin/instructor-applications/route.ts

export const dynamic = 'force-dynamic';


export async function GET(req: NextRequest) {
  try {
    // Authentication (ensure only admins can access)
    const session = await getSession();
    if (!session || !session.user || !session.user.roles.includes('admin')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch instructor applications with status 'pending'
    const applications = await db
      .select({
        id: instructorApplications.id,
        userId: instructorApplications.userId,
        instructorBio: instructorApplications.instructorBio,
        qualifications: instructorApplications.qualifications,
        status: instructorApplications.status,
        createdAt: instructorApplications.createdAt,
        updatedAt: instructorApplications.updatedAt,
        name: user.name,
        email: user.email,
      })
      .from(instructorApplications)
      .leftJoin(user, eq(instructorApplications.userId, user.id))
      .where(eq(instructorApplications.status, 'pending'))
      .orderBy(desc(instructorApplications.createdAt));

    return NextResponse.json({ applications }, { status: 200 });
  } catch (error) {
    console.error('Error fetching instructor applications:', error);
    return NextResponse.json(
      { message: 'Error fetching instructor applications', error: error.message },
      { status: 500 }
    );
  }
}
