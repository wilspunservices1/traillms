// src/pages/assign-certificate.tsx

'use client';

import React, { useState } from 'react';
import UserCertificate from '@/components/certifications/user/UserCertificate';
import UploadCertificate from '@/components/certifications/UploadCertificate';
import PlaceholderPicker from '@/components/certifications/PlaceholderPicker';
import SignaturePad from '@/components/certifications/SignaturePad';

type Props = {};

interface UserData {
  name: string;
  date: string;
  achievement: string;
  course: string;
}

const AssignCertificate: React.FC<Props> = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [userData, setUserData] = useState<UserData>({
    name: '',
    date: '',
    achievement: '',
    course: '',
  });
  const [signature, setSignature] = useState<string>('');
  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(false);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setIsPreviewVisible(false); // Hide the preview when selecting a new template
  };

  const handleUserDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignatureSave = (dataUrl: string) => {
    setSignature(dataUrl);
  };

  const handleGenerateCertificate = () => {
    if (!selectedTemplateId) {
      alert('Please select a certificate template.');
      return;
    }
    setIsPreviewVisible(true);
  };

  const handleInsertPlaceholder = (placeholder: string) => {
    setUserData((prev) => ({
      ...prev,
      achievement: prev.achievement + ` ${placeholder}`,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Assign Certificate to User</h1>

      {/* Section: Select Certificate Template */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">1. Select Certificate Template</h2>
        {/* <UploadCertificate onTemplateSelect={handleTemplateSelect} /> */}
      </div>

      {/* Section: Enter User Details */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">2. Enter User Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              User Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={userData.name}
              onChange={handleUserDataChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter user's name"
            />
          </div>
          <div>
            <label htmlFor="course" className="block text-sm font-medium text-gray-700">
              Course
            </label>
            <input
              type="text"
              name="course"
              id="course"
              value={userData.course}
              onChange={handleUserDataChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter course name"
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              name="date"
              id="date"
              value={userData.date}
              onChange={handleUserDataChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="achievement" className="block text-sm font-medium text-gray-700">
              Achievement
            </label>
            <textarea
              name="achievement"
              id="achievement"
              value={userData.achievement}
              onChange={handleUserDataChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              placeholder="Describe the achievement"
              rows={3}
            ></textarea>
          </div>
        </div>
      </div>

      {/* Section: Insert Placeholders */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">3. Insert Placeholders</h2>
        <PlaceholderPicker
          placeholders={['{Name}', '{Date}', '{Achievement}', '{Course}']}
          onInsertPlaceholder={handleInsertPlaceholder}
        />
      </div>

      {/* Section: Add Signature */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">4. Add Signature</h2>
        <SignaturePad onSave={handleSignatureSave} />
      </div>

      {/* Section: Generate Certificate */}
      <div className="mb-6 text-center">
        <button
          onClick={handleGenerateCertificate}
          className="px-6 py-3 bg-indigo-600 text-white rounded-md"
        >
          Generate Certificate
        </button>
      </div>

      {/* Section: Preview Certificate */}
      {isPreviewVisible && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Preview Certificate</h2>
          <UserCertificate
            certificateId={selectedTemplateId}
            userData={userData}
          />
        </div>
      )}
    </div>
  );
};

export default AssignCertificate;
