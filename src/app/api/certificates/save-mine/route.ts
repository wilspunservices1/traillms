import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/libs/auth';
import { db } from '@/db';
import { certification } from '@/db/schemas/certification';
import { uploadToCloudinary } from '@/libs/uploadinary/upload';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { certificateIssuance } from '@/db/schemas/certificateIssuance';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  let session = await getSession();

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userRoles: string[] = session.user.roles || [];
  const allowedRoles = ['superAdmin', 'instructor', 'admin'];
  const hasAccess = userRoles.some((role) => allowedRoles.includes(role));

  if (!hasAccess) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const saveCertificateSchema = z.object({
    dataUrl: z.string().startsWith('data:image/'),
    description: z.string().optional(),
    fileName: z.string().min(1),
    issuedTo: z.string().uuid(),
    title: z.string().min(1), // Use title to check for existing certificates
    expirationDate: z.string().optional(),
    isRevocable: z.boolean().optional().default(true),
    metadata: z.string().optional(),
  });

  let payload;
  try {
    payload = saveCertificateSchema.parse(await req.json());
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Invalid input data', errors: error.errors },
      { status: 400 }
    );
  }

  const {
    dataUrl,
    description,
    fileName,
    issuedTo,
    title,
    expirationDate,
    isRevocable,
    metadata,
  } = payload;

  try {
    // Check if a certificate with the same title already exists
    const existingCertificate = await db
      .select()
      .from(certification)
      .where(eq(certification.title, title))
      .limit(1);

    console.log("❌ existingCertificate", existingCertificate)

    if (existingCertificate.length > 0) {
      // If a certificate already exists with the same title, return a 409 status
      return NextResponse.json(
        { message: 'A certificate with this title already exists.' },
        { status: 409 }
      );
    }

    // Upload the image to Cloudinary
    const uploadResult = await uploadToCloudinary(dataUrl, fileName);
    if (!uploadResult.success) {
      return NextResponse.json(
        { message: 'Failed to upload image to Cloudinary' },
        { status: 500 }
      );
    }

    const { secure_url } = uploadResult.result;

    // Insert the new certificate into the database
    const certificateId = uuidv4();
    await db.insert(certification).values({
      id: certificateId,
      ownerId: session.user.id,
      certificateData: secure_url,
      description: description || 'My Certificate',
      uniqueIdentifier: generateUniqueIdentifier(),
      isPublished: false,
      title,
      expirationDate: expirationDate ? new Date(expirationDate) : null,
      isRevocable,
      metadata,
    });

    // Issue the certificate immediately after saving it
    await issueCertificate({
      certificateId,
      issuedTo,
      issuedBy: session.user.id,
    });

    // Return the certificate ID along with the success message
    return NextResponse.json(
      {
        message: 'Certificate saved and issued successfully.',
        secure_url,
        certificate_id: certificateId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving certificate:', error);
    return NextResponse.json(
      { message: 'Failed to save certificate' },
      { status: 500 }
    );
  }
}

function generateUniqueIdentifier() {
  return 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

async function issueCertificate({
  certificateId,
  issuedTo,
  issuedBy,
}: {
  certificateId: string;
  issuedTo: string;
  issuedBy: string;
}) {
  try {
    const issuanceUniqueIdentifier = `CERT-ISSUE-${uuidv4()}`;

    await db.insert(certificateIssuance).values({
      id: uuidv4(),
      certificateId,
      issuedBy,
      issuedTo,
      issuanceUniqueIdentifier,
      description: 'Certificate issued directly after saving.',
      isRevoked: false,
      isExpired: false,
      issuedAt: new Date(),
    });
  } catch (error) {
    console.error('Error issuing certificate:', error);
    throw new Error('Failed to issue certificate.');
  }
}


// // pages/api/certificates/save-mine.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { getSession } from '@/libs/auth';
// import { db } from '@/db';
// import { certification } from '@/db/schemas/certification';
// import { uploadToCloudinary } from '@/libs/uploadinary/upload';
// import { v4 as uuidv4 } from 'uuid';
// import { z } from 'zod';
// import { certificateIssuance } from '@/db/schemas/certificateIssuance';
// import { eq } from 'drizzle-orm';


// export async function POST(req: NextRequest) {
//   let session = await getSession();

//   if (!session || !session.user) {
//     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//   }

//   const userRoles: string[] = session.user.roles || [];
//   const allowedRoles = ['superAdmin', 'instructor'];
//   const hasAccess = userRoles.some((role) => allowedRoles.includes(role));

//   if (!hasAccess) {
//     return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
//   }

//   const saveCertificateSchema = z.object({
//     dataUrl: z.string().startsWith('data:image/'),
//     description: z.string().optional(),
//     fileName: z.string().min(1),
//     issuedTo: z.string().uuid(),
//     title: z.string().min(1),
//     expirationDate: z.string().optional(),
//     isRevocable: z.boolean().optional().default(true),
//     metadata: z.string().optional(),
//   });

//   let payload;
//   try {
//     payload = saveCertificateSchema.parse(await req.json());
//   } catch (error: any) {
//     return NextResponse.json(
//       { message: 'Invalid input data', errors: error.errors },
//       { status: 400 }
//     );
//   }

//   const {
//     dataUrl,
//     description,
//     fileName,
//     issuedTo,
//     title,
//     expirationDate,
//     isRevocable,
//     metadata,
//   } = payload;

//   try {

//     // Check if the course already has a certificate
//     const existingCertificate = await db
//       .select()
//       .from(certification)
//       .where(eq(certification.title, title))
//       .limit(1);

//     if (existingCertificate.length > 0) {
//       // If a certificate already exists for the course, return a message
//       return NextResponse.json(
//         { message: 'Course already has a certificate.' },
//         { status: 400 }
//       );
//     }

//     const uploadResult = await uploadToCloudinary(dataUrl, fileName);
//     if (!uploadResult.success) {
//       return NextResponse.json(
//         { message: 'Failed to upload image to Cloudinary' },
//         { status: 500 }
//       );
//     }

//     const { secure_url } = uploadResult.result;

//     const certificateId = uuidv4();
//     await db.insert(certification).values({
//       id: certificateId,
//       ownerId: session.user.id,
//       certificateData: secure_url,
//       description: description || 'My Certificate',
//       uniqueIdentifier: generateUniqueIdentifier(),
//       isPublished: false,
//       title,
//       expirationDate: expirationDate ? new Date(expirationDate) : null,
//       isRevocable,
//       metadata,
//     });

//     await issueCertificate({
//       certificateId,
//       issuedTo,
//       issuedBy: session.user.id,
//     });

//     return NextResponse.json(
//       {
//         message: 'Certificate saved and issued successfully.',
//         secure_url,
//         certificate_id: certificateId, // Include certificate_id in response
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     return NextResponse.json(
//       { message: 'Failed to save certificate' },
//       { status: 500 }
//     );
//   }
// }

// function generateUniqueIdentifier() {
//   return 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
// }

// async function issueCertificate({
//   certificateId,
//   issuedTo,
//   issuedBy,
// }: {
//   certificateId: string;
//   issuedTo: string;
//   issuedBy: string;
// }) {
//   try {
//     const issuanceUniqueIdentifier = `CERT-ISSUE-${uuidv4()}`;

//     await db.insert(certificateIssuance).values({
//       id: uuidv4(),
//       certificateId,
//       issuedBy,
//       issuedTo,
//       issuanceUniqueIdentifier,
//       description: 'Certificate issued directly after saving.',
//       issuedAt: new Date(),
//     });
//   } catch (error) {
//     throw new Error('Failed to issue certificate.');
//   }
// }



// import { NextRequest, NextResponse } from 'next/server';
// import { getSession } from '@/libs/auth';
// import { db } from '@/db';
// import { certification } from '@/db/schemas/certification';
// import { uploadToCloudinary } from '@/libs/uploadinary/upload';
// import { v4 as uuidv4 } from 'uuid';
// import { z } from 'zod';
// import { certificateIssuance } from '@/db/schemas/certificateIssuance';

// // Define the POST handler
// export async function POST(req: NextRequest) {
//   console.log('Received Save Mine Request');

//   let session = await getSession();

//   // Retrieve the session
//   if (!session || !session.user) {
//     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//   }

//   // Enforce authentication in production
//   if (!session || !session.user) {
//     console.error('Unauthorized access attempt');
//     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//   }

//   // Extract user roles
//   const userRoles: string[] = session.user.roles || [];
//   console.log('User Roles:', userRoles);

//   // Define allowed roles
//   const allowedRoles = ['superAdmin', 'instructor'];

//   // Check if the user has at least one of the allowed roles
//   const hasAccess = userRoles.some((role) => allowedRoles.includes(role));
//   console.log('Has Access:', hasAccess);

//   if (!hasAccess) {
//     console.error('Forbidden access by user:', session.user.id);
//     return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
//   }

//   // Define the schema for validation
//   const saveCertificateSchema = z.object({
//     dataUrl: z.string().url().startsWith('data:image/'),
//     description: z.string().optional(),
//     fileName: z.string().min(1),
//     issuedTo: z.string().uuid(), // Still needed if issuing the certificate directly after saving
//   });

//   // Parse and validate the request body
//   let payload;
//   try {
//     payload = saveCertificateSchema.parse(await req.json());
//     console.log('Validated Payload:', payload);
//   } catch (error: any) {
//     console.error('Validation Error:', error.errors);
//     return NextResponse.json(
//       { message: 'Invalid input data', errors: error.errors },
//       { status: 400 }
//     );
//   }

//   const { dataUrl, description, fileName, issuedTo } = payload;

//   try {
//     // Upload the image to Cloudinary
//     console.log('Uploading to Cloudinary:', fileName);
//     const uploadResult = await uploadToCloudinary(dataUrl, fileName);
//     console.log('Upload Result:', uploadResult);

//     if (!uploadResult.success) {
//       console.error('Cloudinary Upload Error:', uploadResult.error);
//       return NextResponse.json(
//         { message: 'Failed to upload image to Cloudinary' },
//         { status: 500 }
//       );
//     }

//     const { secure_url } = uploadResult.result;

//     // Insert the new certificate into the database with the Cloudinary URL
//     const certificateId = uuidv4();
//     await db.insert(certification).values({
//       id: certificateId,
//       ownerId: session.user.id, // Use the authenticated user's ID
//       certificateData: secure_url, // Store the Cloudinary URL
//       description: description || 'My Certificate',
//       uniqueIdentifier: generateUniqueIdentifier(),
//       isPublished: false,
//     });
//     console.log('Certificate saved to database');

//     // Issue the certificate immediately after saving it
//     await issueCertificate({
//       certificateId,
//       issuedTo,
//       issuedBy: session.user.id,
//     });

//     // Optionally, return the secure_url for preview
//     return NextResponse.json(
//       { message: 'Certificate saved and issued successfully.', secure_url },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Error saving certificate:', error);
//     return NextResponse.json(
//       { message: 'Failed to save certificate' },
//       { status: 500 }
//     );
//   }
// }

// // Helper function to generate a unique identifier
// function generateUniqueIdentifier() {
//   return 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
// }

// // Helper function to issue a certificate
// async function issueCertificate({
//   certificateId,
//   issuedTo,
//   issuedBy,
// }: {
//   certificateId: string;
//   issuedTo: string;
//   issuedBy: string;
// }) {
//   try {
//     const issuanceUniqueIdentifier = `CERT-ISSUE-${uuidv4()}`;

//     await db.insert(certificateIssuance).values({
//       id: uuidv4(),
//       certificateId,
//       issuedBy,
//       issuedTo,
//       issuanceUniqueIdentifier,
//       description: 'Certificate issued directly after saving.',
//       issuedAt: new Date(),
//     });

//     console.log('Certificate issued successfully:', issuanceUniqueIdentifier);
//   } catch (error) {
//     console.error('Error issuing certificate:', error);
//     throw new Error('Failed to issue certificate.');
//   }
// }

