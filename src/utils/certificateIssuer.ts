// src/utils/certificateIssuer.ts

import { db } from '@/db';
import { certificateIssuance } from '@/db/schemas/certificateIssuance';
import { v4 as uuidv4 } from 'uuid';

interface IssueCertificateParams {
    courseId: string;
    certificateId: string;
    issuedBy: string; // User ID of the person issuing the certificate
    issuedTo: string; // User ID of the recipient
}

/**
 * Utility function to issue a certificate.
 * @param {IssueCertificateParams} params - Parameters required to issue a certificate.
 * @returns {Promise<string>} - Returns the unique identifier of the issued certificate.
 */
export async function issueCertificate(params: IssueCertificateParams): Promise<string> {
    const { courseId, certificateId, issuedBy, issuedTo } = params;

    // Generate a unique identifier for the issued certificate
    const issuanceUniqueIdentifier = `CERT-ISSUE-${uuidv4()}`;

    // Insert the issued certificate into the database
    await db.insert(certificateIssuance).values({
        id: uuidv4(), // Generate a unique ID for the issuance
        certificateId,
        issuedBy, // The person issuing the certificate
        issuedTo, // The recipient
        issuanceUniqueIdentifier,
        description: `Certificate issued for course ${courseId}`,
        issuedAt: new Date(), // Timestamp of issuance
    });

    return issuanceUniqueIdentifier;
}
