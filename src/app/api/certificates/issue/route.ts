// src/app/api/certificates/issue/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/libs/auth';
import { issueCertificate } from '@/utils/certificateIssuer'; // Import the utility function

// Define the POST handler
export const POST = async function (request: NextRequest) {
  try {
    // Get the session (to access the logged-in user's info)
    const session = await getSession();

    // Ensure the user is logged in
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: User must be logged in to issue certificates.' },
        { status: 401 }
      );
    }

    // Parse the request body (make sure to send the data as JSON)
    const { courseId, certificateId, issuedTo } = await request.json();

    // Validate the inputs
    if (!courseId || !certificateId || !issuedTo) {
      return NextResponse.json(
        { error: 'Missing required fields: courseId, certificateId, issuedTo' },
        { status: 400 }
      );
    }

    // Use the logged-in user's UUID as the 'issuedBy'
    const issuedBy = session.user.id; // Get the user ID from the session

    // Call the utility function to issue the certificate
    const issuanceUniqueIdentifier = await issueCertificate({
      courseId,
      certificateId,
      issuedBy,
      issuedTo,
    });

    // Return a success response
    return NextResponse.json({
      message: 'Certificate issued successfully',
      issuanceUniqueIdentifier,
    });
  } catch (error) {
    console.error('Error issuing certificate:', error);
    return NextResponse.json(
      { error: 'Failed to issue certificate. Please try again.' },
      { status: 500 }
    );
  }
};
