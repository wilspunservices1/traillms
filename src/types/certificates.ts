// Define the interfaces
export interface CertificateMetadata {
    courseName: string;
    instructor: string;
    courseDuration: string;
}

export interface CertificateData {
    id: string;
    ownerId: string;
    certificateData: string;
    description?: string;
    isPublished: boolean;
    uniqueIdentifier: string;
    title: string;
    expirationDate?: string;
    isRevocable: boolean;
    metadata: CertificateMetadata;
    createdAt: string;
    updatedAt: string;
}

export type CertificatePlaceHolders = {
    id: string;
    label: string;
    isVisible: boolean;
    fontSize: number;
    value: string;
    x: number; // X-coordinate for positioning
    y: number; // Y-coordinate for positioning
};
