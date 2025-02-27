'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import HeroPrimary from '@/components/sections/hero-banners/HeroPrimary';
import { ImageElement, TextElement } from '@/types/type';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { redirect } from 'next/navigation';

const ImageUploader = dynamic(
  () => import('@/components/certifications/ImageUploader'),
  { ssr: false }
);
const TextInput = dynamic(
  () => import('@/components/certifications/TextInput'),
  { ssr: false }
);
const SignaturePad = dynamic(
  () => import('@/components/certifications/SignaturePad'),
  { ssr: false }
);
const CertificateCanvas = dynamic(
  () => import('@/components/certifications/CertificateCanvas'),
  { ssr: false }
);
const PlaceholderPicker = dynamic(
  () => import('@/components/certifications/PlaceholderPicker'),
  { ssr: false }
);
const ImageMultiSelect = dynamic(
  () => import('@/components/certifications/ImageMultiSelect'),
  { ssr: false }
);

const CreateCertificationPage: React.FC = () => {
  const router = useRouter();
  const [images, setImages] = useState<ImageElement[]>([]);
  const [texts, setTexts] = useState<TextElement[]>([]);
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [designMode, setDesignMode] = useState<'image' | 'html'>('image');
  const { data: session } = useSession() as { data: Session | null };
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [placeholders, setPlaceholders] = useState<string[]>([
    '%{{username}}',
    '%{{signature}}',
    '%{{date}}',
    '%{{course}}',
  ]);

  if(!session) {
    redirect("/")
  }

  const handleSaveCertificate = async () => {
    try {
      // Your existing save logic here
      const certificateData = {
        images,
        texts,
        htmlContent,
        designMode,
        // Add any other data you need to save
      };

      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(certificateData),
      });

      if (!response.ok) {
        throw new Error('Failed to save certificate');
      }

      // Navigate to create-certificate page after successful save
      router.push('/courses/certificate/create-certificate');
      
    } catch (error) {
      console.error('Error saving certificate:', error);
    }
  };

  const handleImageUpload = (src: string) => {
    const newImage: ImageElement = {
      id: `image-${Date.now()}`,
      src,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
    };
    setImages((prev) => [...prev, newImage]);
  };

  const handleAddText = (text: string) => {
    const newText: TextElement = {
      id: `text-${Date.now()}`,
      text,
      x: 50,
      y: 50,
      fontSize: 24,
      fontFamily: 'Arial',
      fill: '#000000',
    };
    setTexts((prev) => [...prev, newText]);
  };

  const handleSignatureSave = (dataUrl: string) => {
    handleImageUpload(dataUrl);
  };

  const handleSelectExistingImages = () => {
    selectedImages.forEach((image) => {
      if (!images.find((img) => img.src === image.value)) {
        const existingImage: ImageElement = {
          id: `image-${Date.now()}-${Math.random()}`,
          src: image.value,
          x: 50 + images.length * 10,
          y: 50 + images.length * 10,
          width: 100,
          height: 100,
        };
        setImages((prev) => [...prev, existingImage]);
      }
    });
  };

  const handleDesignModeChange = (mode: 'image' | 'html') => {
    setDesignMode(mode);
    setImages([]);
    setTexts([]);
    setHtmlContent('');
  };

  const htmlTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsertPlaceholder = (placeholder: string) => {
    if (htmlTextareaRef.current) {
      const textarea = htmlTextareaRef.current;
      const startPos = textarea.selectionStart;
      const endPos = textarea.selectionEnd;
      const before = htmlContent.substring(0, startPos);
      const after = htmlContent.substring(endPos, htmlContent.length);
      const newContent = before + placeholder + after;
      setHtmlContent(newContent);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = startPos + placeholder.length;
        textarea.focus();
      }, 0);
    }
  };

  return (
    <>
      <HeroPrimary
        path={'Courses > certificate > create-certificate'}
        title={'Certificate Designer'}
      />
      <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
        <div className="w-full max-w-7xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Design Mode:
            </label>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="designMode"
                  value="image"
                  checked={designMode === 'image'}
                  onChange={() => handleDesignModeChange('image')}
                  className="form-radio h-4 w-4 text-indigo-600"
                />
                <span className="ml-2">Design from Image</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="designMode"
                  value="html"
                  checked={designMode === 'html'}
                  onChange={() => handleDesignModeChange('html')}
                  className="form-radio h-4 w-4 text-indigo-600"
                />
                <span className="ml-2">Design from HTML</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
              {designMode === 'image' ? (
                <>
                  <ImageUploader onImageUpload={handleImageUpload} />
                  <ImageMultiSelect
                    selectedImages={selectedImages}
                    setSelectedImages={setSelectedImages}
                  />
                  <button
                    onClick={handleSelectExistingImages}
                    className="mt-4 w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors duration-300"
                  >
                    Add Selected Images
                  </button>
                  <TextInput onAddText={handleAddText} />
                  <SignaturePad onSave={handleSignatureSave} />
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Paste HTML Code:
                    </label>
                    <textarea
                      ref={htmlTextareaRef}
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      rows={10}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="<html><body><h1>Certificate</h1><p>%{{username}}</p><p>%{{signature}}</p></body></html>"
                    />
                  </div>
                  <div className="space-y-4">
                    <PlaceholderPicker
                      placeholders={placeholders}
                      onInsertPlaceholder={handleInsertPlaceholder}
                    />
                  </div>
                </>
              )}
              
              {/* Save Button */}
              <button
                onClick={handleSaveCertificate}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-300"
              >
                Save Certificate
              </button>
            </div>

            <div className="lg:col-span-2 flex flex-col">
              <CertificateCanvas
                images={images}
                texts={texts}
                setImages={setImages}
                setTexts={setTexts}
                designMode={designMode}
                htmlContent={htmlContent}
                setHtmlContent={setHtmlContent}
                placeholders={placeholders}
                issuedTo={session?.user?.id}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateCertificationPage;