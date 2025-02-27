"use client";

import React, { useRef } from 'react';
import { toPng } from 'html-to-image';

interface CertificatePreviewProps {
  userData: {
    name: string;
    date: string;
    achievement: string;
    course: string;
  };
  templateId: string;
  onClose: () => void;
}

const CertificatePreview: React.FC<CertificatePreviewProps> = ({ 
  userData, 
  templateId, 
  onClose 
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (certificateRef.current) {
      try {
        const dataUrl = await toPng(certificateRef.current);
        const link = document.createElement('a');
        link.download = `${userData.name}-certificate.png`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Error generating certificate:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Certificate Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div
          ref={certificateRef}
          className="bg-white p-8 border-8 border-gray-200 rounded-lg mb-4"
        >
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-8">Certificate of Completion</h1>
            <p className="text-xl mb-4">This is to certify that</p>
            <p className="text-3xl font-bold mb-4">{userData.name}</p>
            <p className="text-xl mb-8">has successfully completed</p>
            <p className="text-2xl font-bold mb-4">{userData.course}</p>
            <p className="text-xl mb-8">{userData.achievement}</p>
            <p className="text-xl">Awarded on: {userData.date}</p>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-primaryColor text-white rounded hover:bg-secondaryColor"
          >
            Download Certificate
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificatePreview; 