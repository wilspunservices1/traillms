"use client"
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import ThemeController from "@/components/shared/others/ThemeController";
import CreateCerMain from "../_comp/CreateCerMain";

const page: React.FC = () => {
  

  return (
    <PageWrapper>
      <main>
        <CreateCerMain />
      </main>
      <ThemeController />
    </PageWrapper>
  );
};

export default page;


// // pages/create-certification.tsx

// 'use client'; // Ensure this is the first line

// import React, { useState, useRef } from 'react';
// import {
//   ImageUploader,
//   TextInput,
//   SignaturePad,
//   CertificateCanvas,
//   PlaceholderPicker
// } from '@/components/certifications/index';
// import ImageMultiSelect from '@/components/certifications/ImageMultiSelect'; // Correct import path
// import { ImageElement, TextElement } from '@/types/type';

// const CreateCertificationPage: React.FC = () => {
//   const [images, setImages] = useState<ImageElement[]>([]);
//   const [texts, setTexts] = useState<TextElement[]>([]);

//   // State for multi-select
//   const [selectedImages, setSelectedImages] = useState<any[]>([]); // Use proper typing if possible

//   // New State for Design Mode
//   const [designMode, setDesignMode] = useState<'image' | 'html'>('image');

//   // State for HTML Design
//   const [htmlContent, setHtmlContent] = useState<string>('');
//   const [placeholders, setPlaceholders] = useState<string[]>([
//     '%{{username}}',
//     '%{{signature}}',
//     '%{{date}}',
//     '%{{course}}',
//     // Add more placeholders as needed
//   ]);

//   const handleImageUpload = (src: string) => {
//     const newImage: ImageElement = {
//       id: `image-${Date.now()}`,
//       src,
//       x: 50,
//       y: 50,
//     };
//     setImages((prev) => [...prev, newImage]);
//   };

//   const handleAddText = (text: string) => {
//     const newText: TextElement = {
//       id: `text-${Date.now()}`,
//       text,
//       x: 50,
//       y: 50,
//       fontSize: 24,
//       fontFamily: 'Arial',
//       fill: '#000000',
//     };
//     setTexts((prev) => [...prev, newText]);
//   };

//   const handleSignatureSave = (dataUrl: string) => {
//     handleImageUpload(dataUrl);
//   };

//   // Handle selection from multi-select
//   const handleSelectExistingImages = () => {
//     selectedImages.forEach((image: any) => {
//       // Prevent adding duplicate images
//       if (!images.find((img) => img.src === image.value)) {
//         const existingImage: ImageElement = {
//           id: `image-${Date.now()}-${Math.random()}`,
//           src: image.value,
//           x: 50 + images.length * 10, // Offset to prevent overlap
//           y: 50 + images.length * 10,
//         };
//         setImages((prev) => [...prev, existingImage]);
//       }
//     });
//   };

//   // Handle Design Mode Change
//   const handleDesignModeChange = (mode: 'image' | 'html') => {
//     setDesignMode(mode);
//     // Reset relevant states when switching modes
//     setImages([]);
//     setTexts([]);
//     setHtmlContent('');
//   };

//   // Handle Placeholder Selection
//   const handlePlaceholdersChange = (selected: string[]) => {
//     setPlaceholders(selected);
//   };

//   // Handle inserting placeholder into HTML content
//   const htmlTextareaRef = useRef<HTMLTextAreaElement>(null);

//   const handleInsertPlaceholder = (placeholder: string) => {
//     if (htmlTextareaRef.current) {
//       const textarea = htmlTextareaRef.current;
//       const startPos = textarea.selectionStart;
//       const endPos = textarea.selectionEnd;
//       const before = htmlContent.substring(0, startPos);
//       const after = htmlContent.substring(endPos, htmlContent.length);
//       const newContent = before + placeholder + after;
//       setHtmlContent(newContent);
//       // Move the cursor position after the inserted placeholder
//       setTimeout(() => {
//         textarea.selectionStart = textarea.selectionEnd = startPos + placeholder.length;
//         textarea.focus();
//       }, 0);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
//       <h1 className="text-4xl font-extrabold text-gray-800 mb-6">
//         Certificate Designer
//       </h1>
//       <div className="w-full max-w-7xl bg-white rounded-xl shadow-lg p-8">
//         {/* Design Mode Selection */}
//         <div className="mb-8">
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Choose Design Mode:
//           </label>
//           <div className="flex items-center space-x-4">
//             <label className="inline-flex items-center">
//               <input
//                 type="radio"
//                 name="designMode"
//                 value="image"
//                 checked={designMode === 'image'}
//                 onChange={() => handleDesignModeChange('image')}
//                 className="form-radio h-4 w-4 text-indigo-600"
//               />
//               <span className="ml-2">Design from Image</span>
//             </label>
//             <label className="inline-flex items-center">
//               <input
//                 type="radio"
//                 name="designMode"
//                 value="html"
//                 checked={designMode === 'html'}
//                 onChange={() => handleDesignModeChange('html')}
//                 className="form-radio h-4 w-4 text-indigo-600"
//               />
//               <span className="ml-2">Design from HTML</span>
//             </label>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Column: Controls */}
//           <div className="lg:col-span-1 space-y-8">
//             {designMode === 'image' ? (
//               <>
//                 <ImageUploader onImageUpload={handleImageUpload} />
//                 <ImageMultiSelect
//                   selectedImages={selectedImages}
//                   setSelectedImages={setSelectedImages}
//                 />
//                 <button
//                   onClick={handleSelectExistingImages}
//                   className="mt-4 w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
//                 >
//                   Add Selected Images
//                 </button>
//                 <TextInput onAddText={handleAddText} />
//                 <SignaturePad onSave={handleSignatureSave} />
//                 {/* Additional controls can be added here */}
//               </>
//             ) : (
//               <>
//                 {/* HTML Design Controls */}
//                 <div className="space-y-4">
//                   <label className="block text-sm font-medium text-gray-700">
//                     Paste HTML Code:
//                   </label>
//                   <textarea
//                     ref={htmlTextareaRef}
//                     value={htmlContent}
//                     onChange={(e) => setHtmlContent(e.target.value)}
//                     rows={10}
//                     className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
//                     placeholder="<html><body><h1>Certificate</h1><p>%{{username}}</p><p>%{{signature}}</p></body></html>"
//                   />
//                 </div>
//                 {/* Placeholder Picker */}
//                 <div className="space-y-4">
//                   <PlaceholderPicker
//                     placeholders={placeholders}
//                     onInsertPlaceholder={handleInsertPlaceholder}
//                   />
//                 </div>
//               </>
//             )}
//           </div>

//           {/* Right Column: Canvas and Adjustments */}
//           <div className="lg:col-span-2 flex flex-col">
//             <CertificateCanvas
//               images={images}
//               texts={texts}
//               setImages={setImages}
//               setTexts={setTexts}
//               designMode={designMode}
//               htmlContent={htmlContent}
//               setHtmlContent={setHtmlContent}
//               placeholders={placeholders}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateCertificationPage;
