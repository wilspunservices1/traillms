'use client';
import React, { useState } from 'react';
import { SettingsIcon, RefreshIcon, TestIcon } from '@/components/icons';
import Select from 'react-select';
import { initialPlaceholders } from '@/assets/mock';
import type { CertificateData, CertificatePlaceHolders } from '@/types/certificates';

interface Props {
  certificateData: CertificateData;
  isEditing: boolean;
  instructorName: string;
  setDesignData: (data: any) => void;
  placeholders: CertificatePlaceHolders[];
  setPlaceholders: React.Dispatch<React.SetStateAction<CertificatePlaceHolders[]>>;
}

const DesignTab: React.FC<Props> = ({
  certificateData,
  isEditing,
  instructorName,
  setDesignData,
  placeholders,
  setPlaceholders,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="p-4">
      {/* Options panel */}
      {showOptions && (
        <div className="mb-4 p-4 border rounded bg-gray-100">
          <h3 className="text-lg font-bold mb-4">Placeholder Settings</h3>
          <Select
            isMulti
            options={placeholders.map(p => ({ value: p.id, label: p.label }))}
            value={placeholders.filter(p => p.is_visible).map(p => ({ value: p.id, label: p.label }))}
            onChange={(selected) => {
              const selectedIds = selected.map(option => option.value);
              setPlaceholders(prev => prev.map(p => ({
                ...p,
                isVisible: selectedIds.includes(p.id)
              })));
            }}
            className="mb-4"
          />
        </div>
      )}
    </div>
  );
};

export default DesignTab;