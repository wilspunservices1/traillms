'use client';
import React, { useRef, useState } from 'react';
import Image from 'next/image';
import html2canvas from 'html2canvas';
import type { CertificateData, CertificatePlaceHolders } from '@/types/certificates';

interface FrameTemplateProps {
  certificateData: CertificateData;
  placeholders: CertificatePlaceHolders[];
  isEditing: boolean;
  assignedValues: {
    STUDENT_NAME: string;
    INSTRUCTOR_NAME: string;
    SESSION_NAME: string;
    DATE_GENERATED: string;
    CERTIFICATE_NUMBER: string;
    [key: string]: string;
  };
  handleSetPlaceholderPosition: (id: string, x: number, y: number) => void;
}

const FrameTemplate: React.FC<FrameTemplateProps> = ({
  certificateData,
  placeholders,
  isEditing,
  assignedValues,
  handleSetPlaceholderPosition,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<{ [key: string]: string }>(assignedValues);

  const handleTextEdit = (id: string, value: string) => {
    setEditedValues(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleDownload = async () => {
    if (certificateRef.current) {
      try {
        const canvas = await html2canvas(certificateRef.current);
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'certificate.png';
        link.click();
      } catch (error) {
        console.error('Error downloading certificate:', error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div
        ref={certificateRef}
        className="relative w-full h-auto aspect-[1.414] certificate-container"
        style={{
          backgroundImage: `url(${certificateData?.certificateData})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          boxShadow: 'none'
        }}
      >
        {placeholders.map((placeholder) => (
          placeholder.isVisible && (
            <div
              key={placeholder.id}
              className="absolute"
              style={{
                left: `${placeholder.x}px`,
                top: `${placeholder.y}px`,
                fontSize: `${placeholder.fontSize}px`,
              }}
            >
              {isEditing ? (
                <input
                  type="text"
                  value={editedValues[placeholder.id] || placeholder.value}
                  onChange={(e) => handleTextEdit(placeholder.id, e.target.value)}
                  className={`
                    p-2 bg-transparent border-2 
                    ${editingId === placeholder.id 
                      ? 'border-blue-400' 
                      : 'border-transparent hover:border-gray-200'
                    }
                    focus:outline-none focus:border-blue-400
                    transition-colors
                  `}
                  onFocus={() => setEditingId(placeholder.id)}
                  onBlur={() => setEditingId(null)}
                />
              ) : (
                <span className="p-2">
                  {editedValues[placeholder.id] || placeholder.value}
                </span>
              )}
            </div>
          )
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-4">
        <button
          onClick={handleDownload}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Download Certificate
        </button>
      </div>
    </div>
  );
};

export default FrameTemplate;