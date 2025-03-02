// components/ImageUploader.tsx

'use client';

import React, { useRef, useState } from 'react';

interface ImageUploaderProps {
  onImageUpload: (imageDataUrl: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Unsupported file type. Please upload a JPEG, PNG, GIF, or WEBP image.');
      return;
    }

    // Validate file size (e.g., max 5MB)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      setError('File size exceeds the 5MB limit.');
      return;
    }

    setError('');

    const reader = new FileReader();
    reader.onload = () => {
      onImageUpload(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Image</h2>
      <label className="block">
        <span className="sr-only">Choose image</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          ref={fileInputRef}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-600 file:text-white
            hover:file:bg-indigo-700
            focus:outline-none"
        />
      </label>
      <p className="mt-2 text-sm text-gray-600">
        Upload images from your device or exported from Canva.
      </p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default ImageUploader;
