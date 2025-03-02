// components/CertificatesTemp.tsx

"use client";

import React, { useEffect, useState, useRef } from "react";
import { toPng } from "html-to-image";
import useSweetAlert from "@/hooks/useSweetAlert";
import CertificateCard from "./Certificate/CertificateCard"; // Adjust the import path as needed
import CertificateModal from "./Certificate/CertificateModel"; // Corrected import path
import { useRouter } from "next/navigation";

type Certificate = {
  id: string;
  ownerId: string;
  certificateData: string; // Image URL
  description: string;
  isPublished: boolean;
  uniqueIdentifier: string;
  createdAt: string;
  updatedAt: string;
};

interface Props {
  courseId: string;
}

const CertificatesTemp: React.FC<Props> = ({ courseId }) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Global loading state for initial fetch
  const [error, setError] = useState<Error | null>(null);
  const [convertedImages, setConvertedImages] = useState<{ [key: string]: string }>({});
  const certificateRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [selectedCertificateId, setSelectedCertificateId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false); // Accordion open state
  const [loadingCertificates, setLoadingCertificates] = useState<{ [key: string]: boolean }>({}); // Per-certificate loading state
  const showAlert = useSweetAlert();
  const router = useRouter();

  // State for Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  // Helper function to check if the certificateData is a valid image URL
  const isValidImageUrl = (url: string): boolean => {
    return /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  // Fetch certificates data from the API
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await fetch("/api/certificates/get-saved");
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();

        // Ensure data.certificates is an array
        if (!Array.isArray(data.certificates)) {
          throw new Error("Invalid data format: certificates should be an array.");
        }

        setCertificates(data.certificates);
      } catch (err) {
        // Ensure err is an instance of Error
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error("An unexpected error occurred."));
        }
      } finally {
        setIsLoading(false); // Stop loading regardless of success or failure
      }
    };

    fetchCertificates();
  }, []);

  // Function to handle certificate selection and send the PATCH request
  const handleCertificateSelect = async (certificateId: string) => {
    setSelectedCertificateId(certificateId); // Set the selected certificate's ID
    setLoadingCertificates((prev) => ({ ...prev, [certificateId]: true })); // Start loading for this certificate

    if (!courseId) {
      showAlert("error", "Course ID is missing. Please provide a valid course ID.");
      setLoadingCertificates((prev) => ({ ...prev, [certificateId]: false })); // Stop loading on early return
      return;
    }

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ certificateId }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to update certificate";
        try {
          const errorData = await response.json();
          errorMessage = errorData?.message || errorMessage;
        } catch (jsonError) {
          console.error("Error parsing error response:", jsonError);
        }
        throw new Error(errorMessage);
      }

      showAlert("success", "Certificate selected and updated successfully!");

      // Automatically preview the certificate after updating it
      handlePreview(certificateId);
    } catch (err: any) {
      console.error("Error updating certificate:", err);
      // Ensure that err.message is a string
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      showAlert("error", `Error: ${errorMessage}`);
    } finally {
      setLoadingCertificates((prev) => ({ ...prev, [certificateId]: false })); // Stop loading in all cases
    }
  };

  // Automatically convert HTML content to image
  useEffect(() => {
    const convertHtmlToImage = async () => {
      const updatedImages: { [key: string]: string } = {};
      for (const certificate of certificates) {
        if (!isValidImageUrl(certificate.certificateData) && certificateRefs.current[certificate.id]) {
          try {
            const dataUrl = await toPng(certificateRefs.current[certificate.id] as HTMLElement);
            updatedImages[certificate.id] = dataUrl;
          } catch (err) {
            console.error("Failed to convert HTML to image:", err);
          }
        }
      }
      setConvertedImages(updatedImages); // Update state after all conversions
    };

    if (certificates.length > 0) convertHtmlToImage(); // Convert images after certificates are fetched
  }, [certificates]);

  // Function to handle preview (opens modal)
  const handlePreview = (certificateId: string) => {
    const certificate = certificates.find((cert) => cert.id === certificateId);
    if (certificate) {
      setSelectedCertificate(certificate);
      setIsModalOpen(true);
    }
  };

  // Function to close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCertificate(null);
  };

  // Handler for Create and Download actions
  const handleCreate = (certificateId: string) => {
    // Implement your create certificate logic here
    console.log(`Create certificate with ID: ${certificateId}`);
    showAlert("info", "Create Certificate action triggered.");
    router.push("/courses/certificate/create-certificate");
    // For example, navigate to a create page or open a different modal
  };

  const handleDownload = (certificateId: string) => {
    // Implement your download certificate logic here
    console.log(`Download certificate with ID: ${certificateId}`);
    // Example: Trigger a download of the certificate image
    const certificate = certificates.find((cert) => cert.id === certificateId);
    if (certificate && isValidImageUrl(certificate.certificateData)) {
      window.open(certificate.certificateData, "_blank");
    } else {
      showAlert("error", "Certificate image not available for download.");
    }
  };

  return (
    <div className="bg-whiteColor dark:bg-whiteColor-dark shadow-accordion dark:shadow-accordion-dark rounded-b-md">
      {/* Controller */}
      <div className="cursor-pointer py-5 px-8" onClick={() => setIsOpen(!isOpen)}>
        <div className="accordion-controller flex justify-between items-center text-lg text-headingColor font-semibold w-full dark:text-headingColor-dark font-hind leading-7 rounded-b-md">
          <div>
            <span>Certificate Template</span>
          </div>
          <svg
            className={`transition-transform duration-500 ${isOpen ? "rotate-180" : "rotate-0"}`}
            width="20"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="#212529"
          >
            <path
              fillRule="evenodd"
              d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Content */}
      <div
        className={`accordion-content transition-max-height duration-500 ease-in-out ${
          isOpen ? "max-h-screen" : "max-h-0"
        } overflow-hidden`}
      >
        <div className="content-wrapper py-4 px-5">
          {isLoading ? (
            // Initial Loading Skeleton Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="relative max-w-xs mb-4">
                  <div className="w-full h-48 bg-gray-200 animate-shimmer rounded-lg"></div>
                  <div className="mt-4 space-y-2">
                    <div className="skeleton-text animate-shimmer h-6 w-3/4"></div>
                    <div className="skeleton-text animate-shimmer h-4 w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            // Render only error.message to prevent rendering Error objects
            <p className="text-red-500">Error loading certificates: {error.message}</p>
          ) : certificates.length === 0 ? (
            // No Certificates Message
            <p>No certificates available.</p>
          ) : (
            // Certificates Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {certificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className={`relative group ${
                    selectedCertificateId === certificate.id ? "border-2 border-green-500" : ""
                  }`}
                >
                  <CertificateCard
                    certificate={certificate}
                    convertedImage={convertedImages[certificate.id]}
                    isSelected={selectedCertificateId === certificate.id}
                    onSelect={handleCertificateSelect}
                    onPreview={handlePreview}
                    onCreate={handleCreate}
                    onDownload={handleDownload}
                    isLoading={loadingCertificates[certificate.id] || false} // Pass per-certificate loading state
                  />

                  {/* Hidden Ref for HTML to Image Conversion */}
                  {!isValidImageUrl(certificate.certificateData) && !convertedImages[certificate.id] && (
                    <div
                      ref={(el) => {
                        certificateRefs.current[certificate.id] = el;
                      }}
                      className="hidden"
                    >
                      {/* Add any HTML content you want to convert to image here */}
                      <div className="bg-white dark:bg-gray-800 text-black dark:text-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-2">Certificate of Achievement</h2>
                        <p className="text-lg mb-2">This is to certify that</p>
                        <h3 className="text-xl font-semibold mb-2">[Recipient Name]</h3>
                        <p className="text-lg">has successfully completed the course.</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Certificate Modal */}
      {isModalOpen && selectedCertificate && (
        <CertificateModal
          certificate={selectedCertificate}
          onClose={closeModal} // Pass the close function to the modal
        />
      )}

      {/* Initialize Tooltips */}
      {/* Assuming ReactTooltip is used globally or initialized elsewhere */}
    </div>
  );
};

export default CertificatesTemp;
