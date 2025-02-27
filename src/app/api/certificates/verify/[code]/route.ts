import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/index'
import { certification } from '@/db/schemas/certification'
import { courses } from '@/db/schemas/courses'
import { eq, and, isNull } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: { title: string } }
) {
  try {
    const { title } = params
    const decodedTitle = decodeURIComponent(title)

    // Query using your existing database schema
    const query = db
      .select({
        id: certification.id,
        title: certification.title,
        description: certification.description,
        isPublished: certification.isPublished,
        createdAt: certification.createdAt,
        courseTitle: courses.title
      })
      .from(certification)
      .leftJoin(
        courses,
        eq(certification.id, courses.certificateId)
      )
      .where(
        and(
          eq(certification.title, decodedTitle),
          eq(certification.isDeleted, false),
          isNull(certification.deletedAt)
        )
      );

    const certificates = await query.execute();

    if (!certificates || certificates.length === 0) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(certificates[0])
  } catch (error) {
    console.error('Error finding certificate:', error)
    return NextResponse.json(
      { error: 'Failed to find certificate' },
      { status: 500 }
    )
  }
}