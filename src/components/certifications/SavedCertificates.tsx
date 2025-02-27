// components/certifications/SavedCertificates.tsx

import React, { useEffect, useState } from "react";
import useSweetAlert from "@/hooks/useSweetAlert";
import Swal from "sweetalert2";

interface Certificate {
  id: string;
  certificateData: string; // URL or HTML content
  description: string;
  uniqueIdentifier: string;
  isPublished: boolean;
}

const SavedCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const showAlert = useSweetAlert();

  useEffect(() => {
    // Fetch saved certificates from the backend
    const fetchCertificates = async () => {
      try {
        const response = await fetch("/api/certificates/get-saved");
        const data = await response.json();
        if (response.ok) {
          setCertificates(data.certificates);
        } else {
          showAlert("Error", data.message || "Failed to fetch certificates.");
        }
      } catch (error: any) {
        console.error("Error fetching certificates:", error);
        showAlert("Error", "An unexpected error occurred.");
      }
    };

    fetchCertificates();
  }, [showAlert]);

  const handlePreview = (certificate: Certificate) => {
    if (certificate.certificateData.startsWith("data:image/")) {
      // Image-based certificate
      Swal.fire({
        title: "Certificate Preview",
        imageUrl: certificate.certificateData,
        imageAlt: "Certificate Image",
        showCloseButton: true,
        showConfirmButton: false,
        width: '80%',
        heightAuto: true,
      });
    } else {
      // HTML-based certificate
      Swal.fire({
        title: "Certificate Preview",
        html: certificate.certificateData,
        showCloseButton: true,
        showConfirmButton: false,
        width: '80%',
        heightAuto: true,
      });
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Saved Certificates</h2>
      {certificates.length === 0 ? (
        <p>No certificates saved yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((cert) => (
            <div key={cert.id} className="border rounded-md p-4">
              <h3 className="text-lg font-medium">{cert.description}</h3>
              <p className="text-sm text-gray-500 mb-2">ID: {cert.uniqueIdentifier}</p>
              <button
                onClick={() => handlePreview(cert)}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Preview
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedCertificates;
