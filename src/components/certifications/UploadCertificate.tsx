// src/components/UploadCertificate.tsx

import React, { useState } from 'react';

const UploadCertificate = () => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Convert the file to a base64 string
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result as string;

        // Extract the file name without extension for Cloudinary (optional)
        const fileName = file.name.split('.')[0];

        // Send the data to the API route
        const response = await fetch('/api/certificates/save-mine', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dataUrl: base64data,
            description,
            fileName: `${fileName}-${Date.now()}`, // Ensure unique file names
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccessMessage(data.message);
          setFile(null);
          setDescription('');
        } else {
          setErrorMessage(data.message);
        }
      };
    } catch (error) {
      console.error('Unexpected error:', error);
      setErrorMessage('An unexpected error occurred.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2>Upload Certificate</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <br />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ width: '300px', height: '100px', marginTop: '10px' }}
      />
      <br />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Save Mine'}
      </button>
      <br />
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
};

export default UploadCertificate;
