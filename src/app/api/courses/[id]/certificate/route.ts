// src/app/api/courses/[id]/certificate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { certificateIssuance } from '@/db/schemas/certificateIssuance';
import { certification } from '@/db/schemas/certification';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id: courseId } = params;

    try {
        // Fetch the certificate issuance related to the given course
        const issuance = await db
            .select()
            .from(certificateIssuance)
            .where(eq(certificateIssuance.certificateId, courseId))
            .limit(1);

        // Check if issuance was found
        if (!issuance || issuance.length === 0) {
            return NextResponse.json({ message: 'Certificate issuance not found for the specified course.' }, { status: 404 });
        }

        const certificateId = issuance[0].certificateId;

        // Fetch the related certificate template data
        const certificateTemplate = await db
            .select()
            .from(certification)
            .where(eq(certification.id, certificateId))
            .limit(1);

        // Check if the certificate template was found
        if (!certificateTemplate || certificateTemplate.length === 0) {
            return NextResponse.json({ message: 'Certificate template not found.' }, { status: 404 });
        }

        // Return the certificate template data along with issuance details
        return NextResponse.json({
            certificateId: certificateTemplate.id,
            certificateData: certificateTemplate[0].certificateData,
            description: certificateTemplate[0].description,
            issuedTo: issuance[0].issuedTo,
            issuedAt: issuance[0].issuedAt,
            signature: issuance[0].signature,
            issuanceUniqueIdentifier: issuance[0].issuanceUniqueIdentifier,
        });
    } catch (error) {
        // Log the error details for debugging
        console.error('Error fetching certificate issuance:', error);
        return NextResponse.json({ message: 'An internal server error occurred while fetching the certificate.' }, { status: 500 });
    }
}
 