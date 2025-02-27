import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { CertificateData, CertificatePlaceHolders } from '@/types/certificates';
import Image from "next/image";


interface UploadCertificateProps {
  onTemplateSelect: (templateId: string) => void;
  courseTitle: string;
  savedCertificate?: CertificateData;
}

const UploadCertificate: React.FC<UploadCertificateProps> = ({ onTemplateSelect, courseTitle, savedCertificate }) => {
  const { data: session, status } = useSession();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Add helper function to strip HTML tags
  const stripHtmlTags = (html: string) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const formatDate = (date: string | Date) => {
    try {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const fetchPlaceholders = async (certificateId: string) => {
    try {
      const response = await fetch(`/api/certificates/${certificateId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch placeholders');
      }

      const data = await response.json();
      return data.certificate.placeholders; // Adjust based on your response structure
    } catch (error) {
      console.error('Error fetching placeholders:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchSavedCertificate = async (certificateId: string) => {
      try {
        setLoading(true);
        const response = await fetch(`/api/certificates/${certificateId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch saved certificate');
        }

        const data = await response.json();
        const fetchedCertificate = data.certificate; // Adjust based on your response structure

        // Process fetched certificate and set it to state
        const placeholders = await fetchPlaceholders(fetchedCertificate.id);
        setCertificate({
          ...fetchedCertificate,
          placeholders: placeholders || [],
        });
        
        onTemplateSelect(fetchedCertificate.id);
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'Failed to load certificate');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && savedCertificate) {
      if (savedCertificate.id) {
        fetchSavedCertificate(savedCertificate.id);
      }
    }
  }, [status, savedCertificate, onTemplateSelect]); // Add savedCertificate to dependencies

  return (
    <div className="relative w-full aspect-[1.414] bg-white border rounded-md shadow-md p-4">
      {loading && (
        <div className="flex items-center justify-center h-full">
          <span className="loader animate-spin text-indigo-600 w-6 h-6 border-4 border-transparent border-t-indigo-600 rounded-full"></span>
          <span className="ml-2 text-gray-700">Loading certificate template...</span>
        </div>
      )}
      {error && (
        <div className="text-red-600 text-center mt-4">
          {error}
        </div>
      )}
      {certificate && (
        <div className="relative">
          {certificate.certificate_data_url ? (
            <Image
              src={certificate.certificate_data_url}
              alt="Certificate Template"
              className="w-full h-auto object-contain rounded"
              crossOrigin="anonymous"
            />
          ) : (
            <p>No certificate data available</p>
          )}
          {certificate.placeholders?.map((placeholder) => (
            <div
              key={placeholder.id}
              style={{
                position: 'absolute',
                left: `${placeholder.x}%`,
                top: `${placeholder.y}%`,
                transform: 'translate(-50%, -50%)',
                fontSize: `${placeholder.font_size}px`,
                fontWeight: 'bold',
                color: '#4B5563', // Tailwind's gray-700
              }}
              className="placeholder"
            >
              {placeholder.value}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadCertificate;
