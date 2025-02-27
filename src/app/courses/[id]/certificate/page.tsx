'use client';

import React, { useState, useEffect } from 'react';
import UserCertificate from '@/components/certifications/user/UserCertificate';
import UploadCertificate from '@/components/certifications/UploadCertificate';
import PlaceholderPicker from '@/components/certifications/PlaceholderPicker';
import SignaturePad from '@/components/certifications/SignaturePad';
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

type Props = {};

interface UserData {
  name: string;
  date: string;
  achievement: string;
  course: string;
}

const AssignCertificate: React.FC<Props> = () => {
  const params = useParams();
  const courseId = params.id as string;
  const { data: session } = useSession();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [userData, setUserData] = useState<UserData>({
    name: session?.user?.name || '',
    date: new Date().toISOString().split('T')[0],
    achievement: '',
    course: '',
  });
  const [signature, setSignature] = useState<string>('');
  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(false);
  const [courseTitle, setCourseTitle] = useState('');

  // Fetch course details and update user data
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        const result = await response.json();

        if (result.data) {
          setUserData((prev) => ({
            ...prev,
            course: result.data.title,
            achievement: `Successfully completed ${result.data.title}`,
          }));
          setCourseTitle(result.data.title);
        } else {
          throw new Error(result.message || 'Failed to fetch course details');
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
      }
    };

    if (courseId && session?.user) {
      fetchCourseDetails();
    }
  }, [courseId, session]);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setIsPreviewVisible(false); // Hide the preview when selecting a new template
  };

  // Update user data dynamically
  const handleUserDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  // Save the signature data
  const handleSignatureSave = (dataUrl: string) => {
    setSignature(dataUrl);
  };

  // Generate the certificate preview
  const handleGenerateCertificate = () => {
    if (!selectedTemplateId) {
      alert('Please select a certificate template.');
      return;
    }
    setIsPreviewVisible(true);
  };

  // Insert a placeholder into the achievement field
  const handleInsertPlaceholder = (placeholder: string) => {
    setUserData((prev) => ({
      ...prev,
      achievement: prev.achievement + ` ${placeholder}`,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8 pb-2 border-b-2 border-indigo-500">
          Course Certificate
        </h1>

        {/* Certificate Template Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="bg-indigo-600 text-black rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">1</span>
            Get Your Certificate
          </h2>
          <UploadCertificate 
            onTemplateSelect={handleTemplateSelect} 
            courseTitle={courseTitle}
          />
        </div>

        {/* Signature Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="bg-indigo-600 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">4</span>
            Digital Signature
          </h2>
          <SignaturePad onSave={handleSignatureSave} />
        </div>

        {/* Generate Button */}
        <div className="text-center mb-8">
          <button
            onClick={handleGenerateCertificate}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Generate Certificate
          </button>
        </div>

        {/* Certificate Preview */}
        {isPreviewVisible && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Certificate Preview
            </h2>
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <UserCertificate
                certificateId={selectedTemplateId}
                userData={userData}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignCertificate;
