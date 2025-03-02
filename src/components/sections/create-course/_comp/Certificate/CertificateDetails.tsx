// components/CertificateDetails.tsx

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface Certificate {
  id: string;
  ownerId: string;
  certificateData: string;
  description: string;
  uniqueIdentifier: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CertificateDetailsProps {
  isModal: boolean;
  certificate: Certificate;
}

const CertificateDetails: React.FC<CertificateDetailsProps> = ({ isModal, certificate }) => {
  const { id, certificateData, description, uniqueIdentifier } = certificate || {};

  // If 'uniqueIdentifier' is not available, use 'description' or a generic string
  const displayTitle = uniqueIdentifier || "Certificate";

  // Additional Validation for Image URL
  const isImageUrlValid = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  return certificate ? (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Details Left */}
      <div className="relative">
        <div className="md:sticky top-20">
          {/* Display Certificate Image */}
          {certificateData && isImageUrlValid(certificateData) ? (
            <Image
              src={certificateData}
              alt={description || "Certificate Image"}
              className="w-full object-cover rounded-lg shadow-md"
              width={600}
              height={400}
              placeholder="blur"
              blurDataURL="/placeholder.png" // Ensure this placeholder image exists in your public folder
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg">
              <span>No Valid Image Available</span>
            </div>
          )}
        </div>
      </div>

      {/* Details Right */}
      <div className="text-blackColor dark:text-whiteColor-dark">
        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          {isModal ? (
            <Link
              href={`/certificates/${id}`} // Adjust the href as needed
              className="hover:text-primaryColor dark:hover:text-primaryColor"
            >
              {displayTitle}
            </Link>
          ) : (
            <span>{displayTitle}</span>
          )}
        </h2>

        {/* Description */}
        <p className="text-lg leading-6 mb-6">{description}</p>

        {/* Additional Information (Optional) */}
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <p><strong>Unique ID:</strong> {uniqueIdentifier}</p>
          <p><strong>Owner ID:</strong> {certificate.ownerId}</p>
          <p><strong>Created At:</strong> {new Date(certificate.createdAt).toLocaleString()}</p>
          <p><strong>Last Updated:</strong> {new Date(certificate.updatedAt).toLocaleString()}</p>
          <p><strong>Published:</strong> {certificate.isPublished ? "Yes" : "No"}</p>
        </div>
      </div>
    </div>
  ) : (
    <h2 className="text-center text-red-500">No Certificate Data Available</h2>
  );
};

export default CertificateDetails;
