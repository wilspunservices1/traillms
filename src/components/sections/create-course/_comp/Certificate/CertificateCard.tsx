// components/Certificate/CertificateCard.tsx

"use client";

import React from "react";
import Image from "next/image";
import EyeIcon from "./Icon/EyeIcon";
import DownloadIcon from "./Icon/DownloadIcon";
import EditIcon from "./Icon/EditIcon";

interface Certificate {
  id: string;
  certificateData: string;
  description: string;
}

interface CertificateCardProps {
  certificate: Certificate;
  convertedImage?: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onPreview: (id: string) => void;
  onCreate?: (id: string) => void; // Optional: Handler for creating certificates
  onDownload?: (id: string) => void; // Optional: Handler for downloading certificates
  isLoading?: boolean; // Indicates if an action is in progress
}

const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  convertedImage,
  isSelected,
  onSelect,
  onPreview,
  onCreate,
  onDownload,
  isLoading = false, // Default to false if not provided
}) => {
  const { id, certificateData, description } = certificate;

  const isValidImageUrl = (url: string): boolean => {
    return /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  const handleCreate = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onSelect
    if (onCreate) onCreate(id);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onSelect
    if (onDownload) onDownload(id);
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onSelect
    onPreview(id);
  };

  return (
    <div
      className={`relative max-w-xs mb-4 cursor-pointer group ${
        isSelected ? "border-0 border-green-500" : ""
      }`}
      onClick={() => {
        if (!isLoading) {
          onSelect(id);
        }
      }}
      aria-busy={isLoading} // ARIA attribute for accessibility
    >
      {/* Certificate Image or Skeleton */}
      {isLoading ? (
        <div className="w-full h-48 bg-gray-200 animate-shimmer rounded-lg"></div>
      ) : isValidImageUrl(certificateData) ? (
        <div className="w-full hover:cursor-pointer overflow-hidden block">
          <Image
            src={certificateData}
            alt={description || "Certificate"}
            className="w-full object-cover rounded-lg"
            width={300}
            height={200}
            placeholder="blur"
            blurDataURL="/placeholder.png" // Ensure this placeholder image exists in your public folder
          />
        </div>
      ) : convertedImage ? (
        <Image
          src={convertedImage}
          alt={description || "Converted Certificate"}
          className="w-full object-cover rounded-lg"
          width={300}
          height={200}
          placeholder="blur"
          blurDataURL="/placeholder.png" // Ensure this placeholder image exists in your public folder
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg">
          <span>No Image Available</span>
        </div>
      )}

      {/* Description or Skeleton */}
      {isLoading ? (
        <div className="mt-4 space-y-2">
          <div className="skeleton-text animate-shimmer h-6 w-3/4"></div>
          <div className="skeleton-text animate-shimmer h-4 w-full"></div>
        </div>
      ) : (
        <p className="mt-4 text-gray-700 dark:text-gray-300">{description}</p>
      )}

      {/* Tick mark for selected certificate */}
      {isSelected && !isLoading && (
        <div className="absolute top-2 right-2 px-3 py-2 font-semibold bg-green-500 text-white flex items-center justify-center rounded-full text-sm">
          &#10003; {/* Tick mark */}
        </div>
      )}

      {/* Action Overlay */}
      {!isLoading && (
        <div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex mb-auto items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-hidden={isLoading} // Hide from assistive technologies when loading
        >
          <ul className="flex space-x-4 p-3 bg-white bg-opacity-20 backdrop-blur-md rounded-lg">
            <li>
              <button
                onClick={handleCreate}
                data-tip="Create Certificate"
                className="tooltip p-2 bg-transparent hover:bg-primaryColor hover:text-whiteColor dark:hover:bg-primaryColor dark:hover:text-whiteColor rounded-full transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Create Certificate"
                disabled={isLoading} // Disable button while loading
              >
                <EditIcon width="24px" height="24px" />
              </button>
            </li>
            <li>
              <button
                onClick={handleDownload}
                data-tip="Download Certificate"
                className="tooltip p-2 bg-transparent hover:bg-primaryColor hover:text-whiteColor dark:hover:bg-primaryColor dark:hover:text-whiteColor rounded-full transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Download Certificate"
                disabled={isLoading} // Disable button while loading
              >
                <DownloadIcon width="24px" height="24px" />
              </button>
            </li>
            <li>
              <button
                onClick={handlePreviewClick}
                data-tip="Quick View"
                className="tooltip p-2 bg-transparent hover:bg-primaryColor hover:text-whiteColor dark:hover:bg-primaryColor dark:hover:text-whiteColor rounded-full transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Quick View"
                disabled={isLoading} // Disable button while loading
              >
                <EyeIcon width="24px" height="24px" />
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default CertificateCard;
