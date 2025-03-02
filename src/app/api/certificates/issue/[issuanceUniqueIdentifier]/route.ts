import { NextRequest, NextResponse } from 'next/server';
import { certificateIssuance } from '@/db/schemas/certificateIssuance';
import { certification } from '@/db/schemas/certification';
import { user } from '@/db/schemas/user';
import { db } from '@/db'; // Your Drizzle ORM database connection
import { eq } from 'drizzle-orm'; // Ensure this is imported

export const GET = async function (request: NextRequest, { params }) {
  try {
    const { issuanceUniqueIdentifier } = params;

    // Step 1: Fetch the basic certificate issuance information
    const issuedCertificate = await db
      .select({
        id: certificateIssuance.id,
        certificateId: certificateIssuance.certificateId,
        issuedBy: certificateIssuance.issuedBy,
        issuedTo: certificateIssuance.issuedTo,
        issuanceUniqueIdentifier: certificateIssuance.issuanceUniqueIdentifier,
        issuedAt: certificateIssuance.issuedAt,
        description: certificateIssuance.description,
        certificateData: certification.certificateData,
      })
      .from(certificateIssuance)
      .leftJoin(certification, eq(certification.id, certificateIssuance.certificateId))
      .where(eq(certificateIssuance.issuanceUniqueIdentifier, issuanceUniqueIdentifier))
      .limit(1);

      if (!issuedCertificate) {
          return NextResponse.json(
              { error: 'Certificate issuance not found' },
              { status: 404 }
            );
        }
        
    // console.log("issuedCertificate",issuedCertificate)
    const { issuedBy, issuedTo } = issuedCertificate[0];

    // console.log("issuedBy",issuedBy)

    // Step 2: Fetch issuedBy (instructor) and issuedTo (student) names separately
    const [issuedByUser] = await db
      .select({
        name: user.name,
      })
      .from(user)
      .where(eq(user.id, issuedBy));

    const [issuedToUser] = await db
      .select({
        name: user.name,
      })
      .from(user)
      .where(eq(user.id, issuedTo));

    // Logging to verify if the queries returned results
    // console.log('Issued By User:', issuedByUser);
    // console.log('Issued To User:', issuedToUser);

    // Combine the result
    const result = {
      ...issuedCertificate,
      issuedByUser: issuedByUser ? issuedByUser.name : 'Unknown Instructor',
      issuedToUser: issuedToUser ? issuedToUser.name : 'Unknown Student',
    };

    return NextResponse.json({
      message: 'Certificate issuance details fetched successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error fetching certificate issuance details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificate issuance details. Please try again.' },
      { status: 500 }
    );
  }
};
