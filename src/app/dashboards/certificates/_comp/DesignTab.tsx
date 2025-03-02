// components/certifications/DesignOptions.tsx
'use client';
import { initialPlaceholders } from '@/assets/mock';
import type { CertificateData, CertificatePlaceHolders } from '@/types/certificates';
import React, { useEffect, useState } from 'react';
import FrameTemplate from './FrameTemplate';
import Select from 'react-select';
import { SettingsIcon, RefreshIcon, TestIcon } from '@/components/icons';
import { BASE_URL } from '@/actions/constant';

interface Props {
  certificateData: CertificateData;
  isEditing: boolean;
  instructorName: string;
  setDesignData: (data: any) => void; // Prop to set design data
  setPlaceholderPosition?: (id: string, x: number, y: number) => void; // Callback prop to set placeholder position
  placeholders: CertificatePlaceHolders[]; // Use the correct type for placeholders
  setPlaceholders: React.Dispatch<React.SetStateAction<CertificatePlaceHolders[]>>; // New prop type for managing placeholders
}

const DesignOptions: React.FC<Props> = ({
  certificateData,
  isEditing,
  instructorName,
  setDesignData,
  placeholders,
  setPlaceholders, // Accept the callback as a prop
  setPlaceholderPosition,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  if (!certificateData) {
    return <div>No certificate data available</div>;
  }

  // Handle change of visibility from multi-select
  const handleVisibilityChange = (selectedOptions: any) => {
    const selectedIds = selectedOptions.map((option: any) => option.value);
    setPlaceholders((prev) =>
      prev.map((placeholder) => ({
        ...placeholder,
        isVisible: selectedIds.includes(placeholder.id),
      }))
    );
  };

  // Handle font size change for the selected placeholder
  const changeFontSize = (id: string, fontSize: number) => {
    setPlaceholders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, fontSize } : p))
    );
  };

  // Reset placeholders to initial state
  const resetPlaceholders = () => {
    setPlaceholders(initialPlaceholders);
  };

  // Options for multi-select
  const options = placeholders.map((placeholder) => ({
    value: placeholder.id,
    label: placeholder.label,
  }));

  // Filter selected options based on the current visibility state
  const selectedOptions = options.filter((option) =>
    placeholders.find((placeholder) => placeholder.id === option.value && placeholder.isVisible)
  );

  // Sample values to replace placeholders
  const assignedValues = {
    STUDENT_NAME: 'Jane Doe',
    INSTRUCTOR_NAME: instructorName,
    SESSION_NAME: 'Advanced JavaScript',
    DATE_GENERATED: new Date().toLocaleDateString(),
    CERTIFICATE_NUMBER: 'CERT-78901234',
  };

  const handleUpdate = (newDesignData: any) => {
    setDesignData(newDesignData); // Update the design data when needed
  };

  return (
    <div className="p-4">
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="flex items-center space-x-2 bg-blue text-white px-4 py-2 rounded-lg shadow-md transition duration-200 ease-in-out hover:bg-blueDark focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          <SettingsIcon size={24} color="white" />
          <span>Options</span>
        </button>
        <button
          onClick={resetPlaceholders}
          className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-md transition duration-200 ease-in-out hover:bg-blueDark focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          <RefreshIcon size={24} color="white" />
          <span>Reset</span>
        </button>
        <button
          onClick={resetPlaceholders}
          className="flex items-center space-x-2 bg-blue text-white px-4 py-2 rounded-lg shadow-md transition duration-200 ease-in-out hover:bg-blueDark focus:outline-none focus:ring-2 focus:ring-blue focus:ring-opacity-50"
        >
          <TestIcon size={24} color="white" />
          <span>Test Certificate</span>
        </button>
      </div>

      {showOptions && (
        <div className="mt-4 p-4 border rounded bg-gray-100">
          <h3 className="text-lg font-bold mb-4">Placeholder Settings</h3>
          <Select
            options={options}
            isMulti
            value={selectedOptions}
            onChange={handleVisibilityChange}
            placeholder="Select placeholders to show"
            className="mb-4"
          />
          {placeholders.map((placeholder) => (
            placeholder.isVisible && (
              <div key={placeholder.id} className="mb-2 flex items-center">
                <label className="mr-4">{placeholder.label}</label>
                <input
                  type="number"
                  value={placeholder.fontSize}
                  onChange={(e) => changeFontSize(placeholder.id, parseInt(e.target.value))}
                  className="border px-2 py-1 w-16 mr-2"
                  min={10}
                  max={50}
                />
              </div>
            )
          ))}
        </div>
      )}

      <FrameTemplate
        certificateData={certificateData}
        placeholders={placeholders}
        isEditing={isEditing}
        setPlaceholderPosition={setPlaceholderPosition} // Pass the callback
      />
    </div>
  );
};

export default DesignOptions;
