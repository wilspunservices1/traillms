'use client';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { formDataSchema, type FormData } from './CertFormSchema';
import { z } from 'zod';
import { BASE_URL } from '@/actions/constant';
import { useSession, signIn } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import useSweetAlert from '@/hooks/useSweetAlert';
import { generateUniqueIdentifier } from '@/utils/generateUniqueIdentifier';

// Dynamically import ReactQuill to avoid 'document is not defined' error during SSR
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const CertificateForm: React.FC = () => {
  // State variables
  const [certificateName, setCertificateName] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<{ value: string; label: string } | null>(null);
  const [enabledOption, setEnabledOption] = useState<{ value: "yes" | "no"; label: string } | null>(null);
  const [orientationOption, setOrientationOption] = useState<{ value: "landscape" | "portrait"; label: string } | null>(null);
  const [maxDownloads, setMaxDownloads] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [certificateImage, setCertificateImage] = useState<File | null>(null);
  const [coursesOptions, setCoursesOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [imageError, setImageError] = useState('');
  const showAlert = useSweetAlert();
  const [exitCer, SetExitCertificate] = useState(false)


  const { data: session, status } = useSession() as { data: Session | null; status: 'loading' | 'authenticated' | 'unauthenticated' };
  const router = useRouter();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn(); // Redirect to login page
    } else if (status === 'authenticated' && !session?.user?.roles.some(role => ['admin', 'instructor', 'superAdmin'].includes(role))) {
      // If authenticated but without the correct roles, redirect to login
      router.push('/login');
    }
  }, [status, session, router]);

  // Fetch courses from the API when the component mounts
  useEffect(() => {
    if (session?.user?.roles.includes('instructor')) {
      const fetchCourses = async () => {
        try {
          const instructorId = session?.user?.id;
          
          const response = await fetch(`${BASE_URL}/api/courses/instructorCourses?instructorId=${instructorId}`);

          if (!response.ok) {
            throw new Error('Failed to fetch courses');
          }



          const data = await response.json();
          const options = data.courses.map((course: { id: string; title: string }) => ({
            value: course.id,
            label: course.title,
          }));
          setCoursesOptions(options);
        } catch (error) {
          console.error('Error fetching courses:', error);
          setFormErrors((prev) => ({ ...prev, global: 'Failed to load courses. Please try again.' }));
        }
      };

      fetchCourses();
    }
  }, [session]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError('');
    const file = e.target.files?.[0];
  
    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);
  
      img.onload = () => {
        const { width, height } = img;
        // Check if dimensions match either portrait (595 x 842) or landscape (842 x 595)
        if ((width === 595 && height === 842) || (width === 842 && height === 595)) {
          setCertificateImage(file);
        } else {
          setImageError('Image dimensions must be 595 x 842 pixels (A4 size) in either orientation.');
          setCertificateImage(null);
        }
      };
  
      img.onerror = () => {
        setImageError('Invalid image file.');
        setCertificateImage(null);
      };
    }
  };

  // Clear error for a field when its value changes
  const clearError = (field: string) => {
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
  
    // Validate form data using Zod schema
    try {
      const formDataToValidate: FormData = {
        certificateName,
        courseId: selectedCourse?.value || '',
        enabled: enabledOption?.value || 'no',
        orientation: orientationOption?.value || 'landscape',
        maxDownloads: typeof maxDownloads === 'number' ? maxDownloads : 0,
        description,
        certificateImage,
      };
      formDataSchema.parse(formDataToValidate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Map Zod errors to field-specific errors
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setFormErrors(errors);
      }
      return;
    }

    // Convert the certificate image to a base64 string
    let base64Image = '';
    if (certificateImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        base64Image = reader.result as string;
        submitCertificateForm(base64Image);
      };
      reader.readAsDataURL(certificateImage);
    } else {
      submitCertificateForm(base64Image);
    }
  };

 
   // Function to submit the certificate form
   const submitCertificateForm = async (base64Image: string) => {
    try {
      setIsLoading(true);
      
      const currentDate = new Date().toLocaleDateString();
      // Generate a unique identifier with a specific format
      const uniqueId = `CERT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      
      const payload = {
        dataUrl: base64Image,
        description,
        fileName: certificateImage?.name || 'certificate.png',
        issuedTo: session?.user?.id || '',
        title: certificateName,
        expirationDate: '2025-12-31T23:59:59.000Z',
        isRevocable: true,
        uniqueIdentifier: uniqueId, // Use the formatted uniqueId
        metadata: JSON.stringify({
          certificateName: certificateName,
          courseName: selectedCourse?.label || '',
          instructor: session?.user?.name || '',
          courseDuration: '3 months',
          dateGenerated: currentDate,
          studentName: session?.user?.name || '',
          companyName: 'Meridian LMS'
        }),
        placeholders: [
          {
            id: '1',
            label: 'CERTIFICATE_NAME',
            value: certificateName,
            isVisible: true,
            fontSize: 24,
            x: 50,
            y: 40
          },
          {
            id: '2',
            label: 'COMPANY_NAME',
            value: 'Meridian LMS',
            isVisible: true,
            fontSize: 20,
            x: 50,
            y: 45
          },
          {
            id: '3',
            label: 'DATE_GENERATED',
            value: currentDate,
            isVisible: true,
            fontSize: 16,
            x: 30,
            y: 70
          },
          {
            id: '4',
            label: 'CERTIFICATE_NUMBER',
            value: uniqueId, // Use the same formatted uniqueId
            isVisible: true,
            fontSize: 16,
            x: 70,
            y: 70
          }
        ]
      };
      console.log('Payload being sent:', JSON.stringify(payload, null, 2));
      // Your existing certificate save
      const response = await fetch('/api/certificates/save-mine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const responseData = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', responseData);
      
      if (response.status === 409) {
        showAlert('error', 'A certificate with this title already exists.');
        SetExitCertificate(true);
        return;
      }
      
      if (!response.ok) {
        showAlert('error', 'Failed to save certificate');
        throw new Error('Failed to save certificate');
      }
  
      // Add only this new part after successful save
      try {
        await fetch('/api/manageCertificates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            certificateId: responseData.certificate_id,
            name: certificateName,
            description: description,
            courseId: selectedCourse?.value
          }),
        });
      } catch (error) {
        console.log('Note: Management sync failed');
      }
  
      // Keep your existing success handling
      showAlert('success', 'Certificate saved successfully');
      router.push(`/dashboards/certificates/edit/${responseData.certificate_id}`);
  
      // Keep your existing form reset
      setCertificateName('');
      setSelectedCourse(null);
      setEnabledOption(null);
      setOrientationOption(null);
      setMaxDownloads('');
      setDescription('');
      setCertificateImage(null);
  
    } catch (error) {
      showAlert('error', 'Error saving certificate');
      setFormErrors((prev) => ({
        ...prev,
        global: 'An error occurred while saving the certificate.',
      }));
    } finally {
      setIsLoading(false);
    }
  };
  // Options for enabled and orientation, correctly typed
  const enabledOptions: Array<{ value: "yes" | "no"; label: string }> = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
  ];

  const orientationOptions: Array<{ value: "landscape" | "portrait"; label: string }> = [
    { value: 'landscape', label: 'Landscape' },
    { value: 'portrait', label: 'Portrait' },
  ];

  if (status === 'loading') {
    return <p>Loading...</p>; // Show a loading state while checking authentication
  }

  return (
    <form
      className="flex flex-col min-h-screen text-sm text-blackColor dark:text-blackColor-dark leading-1.8"
      data-aos="fade-up"
      onSubmit={handleSubmit}
    >
      {formErrors.global && <p className="text-sm text-red-500 mb-4">{formErrors.global}</p>}
      {exitCer && <p className='text-md p-2 rounded-sm bg-red-200 text-black-brerry-light mb-4'>A certificate with this title already exists.</p>}
      <div className="grid grid-cols-1 xl:grid-cols-2 mb-4 gap-y-4 gap-x-6">
        <div>
          <label htmlFor="certificateName" className="form-label flex items-center">
            Certificate Name {formErrors.certificateName && <span className='ml-[3px] flex items-center text-red-400'>*</span>}
          </label>
          <input
            type="text"
            id="certificateName"
            value={certificateName}
            onChange={(e) => { setCertificateName(e.target.value); clearError('certificateName'); }}
            placeholder="Enter certificate name"
            className="form-input font-no"
          />
          {formErrors.certificateName && <p className="text-xs ml-2 text-red-500 mt-1">{formErrors.certificateName}</p>}
        </div>

        <div>
          <label htmlFor="sessionCourse" className="form-label flex items-center">
            Session/Course {formErrors.courseId && <span className='ml-[3px] flex items-center text-red-400'>*</span>}
          </label>
          <Select
            options={coursesOptions}
            value={selectedCourse}
            onChange={(option) => { setSelectedCourse(option); clearError('courseId'); }}
            placeholder="Select a course"
            className="mt-1 font-no"
          />
          {formErrors.courseId && <p className="text-xs ml-2 text-red-500 mt-1">{formErrors.courseId}</p>}
        </div>

        <div>
          <label htmlFor="enabled" className="form-label">Enabled</label>
          <Select
            options={enabledOptions}
            value={enabledOption}
            onChange={(option) => { setEnabledOption(option); clearError('enabled'); }}
            placeholder="Select"
            className="mt-1 font-no"
          />
          {formErrors.enabled && <p className="text-xs text-red-500 mt-1">{formErrors.enabled}</p>}
        </div>

        <div>
          <label htmlFor="orientation" className="form-label">Orientation</label>
          <Select
            options={orientationOptions}
            value={orientationOption}
            onChange={(option) => { setOrientationOption(option); clearError('orientation'); }}
            placeholder="Select Orientation"
            className="mt-1 font-no"
          />
          {formErrors.orientation && <p className="text-xs text-red-500 mt-1">{formErrors.orientation}</p>}
        </div>

        <div>
          <label htmlFor="certificateImage" className="form-label flex items-center">
            Certificate Image {formErrors.certificateImage && <span className='ml-[3px] flex items-center text-red-400'>*</span>}
          </label>
          <input
            type="file"
            id="certificateImage"
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue file:text-white hover:file:bg-blue-light dark:file:bg-gray-700 dark:hover:file:bg-gray-600"
          />
          {imageError && <p className="text-xs text-red-500 mt-1">{imageError}</p>}
          {formErrors.certificateImage && <p className="text-xs ml-2 text-red-500 mt-1">{formErrors.certificateImage}</p>}
        </div>

        <div>
          <label htmlFor="maxDownloads" className="form-label">Maximum Downloads</label>
          <input
            type="number"
            id="maxDownloads"
            value={maxDownloads}
            onChange={(e) => { setMaxDownloads(Number(e.target.value) || ''); clearError('maxDownloads'); }}
            placeholder="Enter maximum downloads"
            className="form-input font-no"
          />
          {formErrors.maxDownloads && <p className="text-xs text-red-500 mt-1">{formErrors.maxDownloads}</p>}
        </div>

        <div className="xl:col-span-2">
          <label htmlFor="description" className="form-label flex items-center">
            Description {formErrors.description && <span className='ml-[3px] flex items-center text-red-400'>*</span>}
          </label>
          <ReactQuill
            id="description"
            value={description}
            onChange={(value) => { setDescription(value); clearError('description'); }}
            placeholder="Enter description"
            className="mt-1 font-no"
            style={{ minHeight: '100px' }}
          />
          {formErrors.description && <p className="text-xs ml-2 text-red-500 mt-1">{formErrors.description}</p>}
        </div>
      </div>

      <div className="text-left mt-2">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue hover:bg-blueDark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default CertificateForm;