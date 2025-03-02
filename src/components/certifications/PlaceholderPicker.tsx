// components/PlaceholderPicker.tsx

'use client';

import React from 'react';
import Select from 'react-select';

interface PlaceholderPickerProps {
  placeholders: string[];
  onInsertPlaceholder: (placeholder: string) => void;
}

interface PlaceholderOption {
  value: string;
  label: string;
}

const PlaceholderPicker: React.FC<PlaceholderPickerProps> = ({
  placeholders,
  onInsertPlaceholder,
}) => {
  const options: PlaceholderOption[] = placeholders.map((ph) => ({
    value: ph,
    label: ph,
  }));

  const handleChange = (selected: any) => {
    if (selected && selected.value) {
      onInsertPlaceholder(selected.value);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Insert Placeholder:
      </label>
      <Select
        options={options}
        onChange={handleChange}
        placeholder="Select a placeholder..."
        isClearable
      />
    </div>
  );
};

export default PlaceholderPicker;
