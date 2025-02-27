import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/index';
import { getSession } from '@/libs/auth';
import { certification } from '@/db/schemas/certification';
import { courses } from '@/db/schemas/courses';
import { eq, and, isNull } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    let session = await getSession(req);

    if (!session) {
        console.error('No session found');
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('Session:', session); // Log session details

    const userRoles: string[] =
    Array.isArray(session.user.roles)?
    session.user.roles : [session.user.roles];
    console.log('User Roles:', userRoles);

    const allowedRoles = ['superAdmin', 'instructor', 'admin'];
    const hasAccess = userRoles.some((role) => allowedRoles.includes(role));

    console.log('Has Access:', hasAccess);
    if (!hasAccess) {
        console.error('Forbidden access by user:', session.user.id);
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const certificates = await db
            .select({
                id: certification.id,
                course_id: certification.course_id,
                unique_identifier:certification.unique_identifier,
                owner_id: certification.owner_id,
                title: certification.title,
                description: certification.description,
                isPublished: certification.is_published,
                created_at: certification.created_at,
                updated_at: certification.updated_at,
                deleted_at: certification.deleted_at,
                is_deleted: certification.is_deleted,
                courseTitle: courses.title
            })
            .from(certification)
            .leftJoin(courses, eq(certification.course_id, courses.id))
            .execute();

        return NextResponse.json(certificates);
    } catch (error) {
        console.error('Error fetching certificates:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch certificates',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
};

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Get session
        const session = await getSession(req);
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized - No valid session' },
                { status: 401 }
            );
        }

        const data = await req.json();
        const { title, description, isPublished, placeholders } = data;

        // Log the incoming data for debugging
        console.log('Updating certificate with data:', { id: params.id, title, description, isPublished, placeholders });

        // Update the certificate
        let updatedCertificate: { id: string; title: string; description: string | null; isPublished: boolean; }[];
        try {
            updatedCertificate = await db
                .update(certification)
                .set({
                    title,
                    description,
                    isPublished,
                    updatedAt: new Date().toISOString(),
                    metadata: JSON.stringify({ placeholders }),
                })
                .where(eq(certification.id, params.id))
                .returning();
        } catch (dbError) {
            console.error('Database update error:', dbError);
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Database update failed', 
                    details: dbError instanceof Error ? dbError.message : 'Unknown database error' 
                },
                { status: 500 }
            );
        }

        if (!updatedCertificate || updatedCertificate.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Certificate not found' },
                { status: 404 }
            );
        }

        // Fetch the updated certificate with course information
        type CertificateWithCourse = {
            id: string;
            courseid: string;
            title: string;
            description: string | null;
            isPublished: boolean;
            createdAt: Date;
            deletedAt: Date | null;
            isDeleted: boolean;
            metadata?: string | null;
            courseTitle: string | null;
            placeholders?: any[];
        };
        let updatedCertificateWithCourse: CertificateWithCourse[];
        try {
            updatedCertificateWithCourse = await db
                .select({
                    id: certification.id,
                    courseid: certification.course_id,
                    title: certification.title,
                    description: certification.description,
                    isPublished: certification.is_published,
                    createdAt: certification.created_at,
                    deletedAt: certification.deleted_at,
                    isDeleted: certification.is_deleted,
                    metadata: certification.metadata,
                    courseTitle: courses.title
                })
                .from(certification)
                .leftJoin(
                    courses,
                    eq(certification.id, courses.certificateId)
                )
                .where(eq(certification.id, params.id))
                .execute();
        } catch (fetchError) {
            console.error('Error fetching updated certificate:', fetchError);
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Failed to fetch updated certificate', 
                    details: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error' 
                },
                { status: 500 }
            );
        }

        // Parse the metadata to include placeholders in the response
        const result = updatedCertificateWithCourse[0];
        if (result && result.metadata) {
            try {
                const parsedMetadata = JSON.parse(result.metadata);
                result.placeholders = parsedMetadata.placeholders;
                delete result.metadata; // Remove the raw metadata from the response
            } catch (parseError) {
                console.error('Error parsing metadata:', parseError);
                // Continue without parsing metadata
            }
        }

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error('Error updating certificate:', error);
        return NextResponse.json(
            { 
                success: false,
                error: 'Failed to update certificate',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}