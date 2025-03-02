// FrameTemplate.tsx
'use client';
import React from 'react';
import Draggable from 'react-draggable';
import type { CertificatePlaceHolders, CertificateData } from '@/types/certificates';
import { CldImage } from 'next-cloudinary';

interface FrameTemplateProps {
  certificateData?: CertificateData;
  placeholders?: CertificatePlaceHolders[];
  isEditing: boolean;
  assignedValues?: { [key: string]: string };
  handleSetPlaceholderPosition: (id: string, x: number, y: number) => void; // Add this line
}

const FrameTemplate: React.FC<FrameTemplateProps> = ({
  certificateData,
  placeholders = [],
  isEditing,
  assignedValues = {},
  handleSetPlaceholderPosition, // Add this line
}) => {
  if (!certificateData) {
    return <div>No certificate data available</div>;
  }

  const renderContent = (value: string, fontSize: number) => {
    if (isEditing) {
      return value;
    }
    const key = value.replace(/\[|\]/g, '');
    return assignedValues[key] || value;
  };

  const handleDrag = (e: any, data: any, placeholder: CertificatePlaceHolders) => {
    e.preventDefault(); // Prevent default behavior
    const newX = placeholder.x + data.deltaX;
    const newY = placeholder.y + data.deltaY;
    handleSetPlaceholderPosition(placeholder.id, newX, newY); // Update position
  };

  return (
    <div
      className="mt-8 border border-gray-300 rounded shadow-md relative"
      style={{ width: '842px', height: '595px' }}
    >
      {certificateData.certificateData && (
        <CldImage
          src={certificateData.certificateData}
          alt="Certificate Background"
          className="absolute top-0 left-0 w-full h-full object-cover"
          width={842}
          height={595}
          sizes="(max-width: 842px) 100vw, 842px"
        />
      )}

      {placeholders.map((placeholder) =>
        placeholder.isVisible ? (
          <Draggable
            key={placeholder.id}
            onDrag={(e, data) => handleDrag(e, data, placeholder)}
            disabled={!isEditing}
            position={{ x: placeholder.x, y: placeholder.y }} // Control the position of the draggable
          >
            <div
              className="p-2 rounded bg-transparent"
              style={{
                fontSize: placeholder.fontSize,
                display: 'inline-block',
                position: 'absolute',
                left: 0, // We set these to zero because we're controlling the position with Draggable
                top: 0,
                zIndex: 1,
              }}
            >
              {renderContent(placeholder.value, placeholder.fontSize)}
            </div>
          </Draggable>
        ) : null
      )}
    </div>
  );
};

export default FrameTemplate;





// 'use client';
// import React, { useEffect } from 'react';
// import Draggable from 'react-draggable';
// import type { CertificatePlaceHolders, CertificateData } from '@/types/certificates';
// import { CldImage } from 'next-cloudinary';

// interface FrameTemplateProps {
//   certificateData?: CertificateData;
//   placeholders?: CertificatePlaceHolders[];
//   isEditing: boolean;
//   assignedValues?: { [key: string]: string };
// }

// const FrameTemplate: React.FC<FrameTemplateProps> = ({
//   certificateData,
//   placeholders = [],
//   isEditing,
//   assignedValues = {},
// }) => {
//   if (!certificateData) {
//     return <div>No certificate data available</div>;
//   }

//   const renderContent = (value: string, fontSize: number) => {
//     // During editing, show placeholders; otherwise, replace with actual values
//     if (isEditing) {
//       return value;
//     }
//     const key = value.replace(/\[|\]/g, ''); // Extract key from placeholder format
//     return assignedValues[key] || value; // Replace with actual value or keep placeholder if not found
//   };

//   // Log all placeholder data and computed values
//   useEffect(() => {
//     console.log('Placeholders data:');
//     placeholders.forEach((placeholder) => {
//       const key = placeholder.value.replace(/\[|\]/g, ''); // Extract key from placeholder format
//       const actualValue = assignedValues[key] || placeholder.value; // Compute actual value
//       console.log(`Placeholder ID: ${placeholder.id}`);
//       console.log(`Label: ${placeholder.label}`);
//       console.log(`Is Visible: ${placeholder.isVisible}`);
//       console.log(`Font Size: ${placeholder.fontSize}`);
//       console.log(`Position: (${placeholder.x}, ${placeholder.y})`);
//       console.log(`Computed Value: ${actualValue}`);
//       console.log('-------------------------');
//     });
//   }, [placeholders, assignedValues]); // Re-run effect when placeholders or assignedValues change

//   // Handle drag event
//   const handleDrag = (e: any, data: any, placeholder: CertificatePlaceHolders) => {
//     console.log(`Dragging Placeholder ID: ${placeholder.id}`);
//     console.log(`New Position: (${data.x}, ${data.y})`);
//   };

//   return (
//     <div
//       className="mt-8 border border-gray-300 rounded shadow-md relative"
//       style={{ width: '842px', height: '595px' }}
//     >
//       {/* Render certificate background image */}
//       {certificateData.certificateData && (
//         <CldImage
//           src={certificateData.certificateData}
//           alt="Certificate Background"
//           className="absolute top-0 left-0 w-full h-full object-cover"
//           width={842}
//           height={595}
//           sizes="(max-width: 842px) 100vw, 842px"
//         />
//       )}

//       {/* Render placeholders or actual content */}
//       {placeholders.map((placeholder) =>
//         placeholder.isVisible ? (
//           <Draggable key={placeholder.id} onDrag={(e, data) => handleDrag(e, data, placeholder)} disabled={!isEditing}>
//             <div
//               className="p-2 rounded bg-transparent"
//               style={{
//                 fontSize: placeholder.fontSize,
//                 display: 'inline-block',
//                 position: 'absolute',
//                 left: placeholder.x,
//                 top: placeholder.y,
//                 zIndex: 1, // Ensure placeholders are above the image
//               }}
//             >
//               {renderContent(placeholder.value, placeholder.fontSize)}
//             </div>
//           </Draggable>
//         ) : null
//       )}
//     </div>
//   );
// };

// export default FrameTemplate;



// // components/certifications/FrameTemplate.tsx
// 'use client';
// import React from 'react';
// import Draggable from 'react-draggable';
// import type { CertificatePlaceHolders, CertificateData } from '@/types/certificates';
// import { CldImage } from 'next-cloudinary';

// interface FrameTemplateProps {
//   certificateData?: CertificateData;
//   placeholders?: CertificatePlaceHolders[];
//   isEditing: boolean;
//   assignedValues?: { [key: string]: string };
//   // setDesignData?:
// }

// const FrameTemplate: React.FC<FrameTemplateProps> = ({
//   certificateData,
//   placeholders = [],
//   isEditing,
//   assignedValues = {},
// }) => {
//   if (!certificateData) {
//     return <div>No certificate data available</div>;
//   }

//   const renderContent = (value: string, fontSize: number) => {
//     // During editing, show placeholders; otherwise, replace with actual values
//     if (isEditing) {
//       return value;
//     }
//     const key = value.replace(/\[|\]/g, ''); // Extract key from placeholder format
//     return assignedValues[key] || value; // Replace with actual value or keep placeholder if not found
//   };

//   return (
//     <div
//       className="mt-8 border border-gray-300 rounded shadow-md relative"
//       style={{ width: '842px', height: '595px' }}
//     >
//       {/* Render certificate background image */}
//       {certificateData.certificateData && (
//         <CldImage
//           src={certificateData.certificateData}
//           alt="Certificate Background"
//           className="absolute top-0 left-0 w-full h-full object-cover"
//           width={842}
//           height={595}
//           sizes="(max-width: 842px) 100vw, 842px"
//         />
//       )}

//       {/* Render placeholders or actual content */}
//       {placeholders.map((placeholder) =>
//         placeholder.isVisible ? (
//           <Draggable key={placeholder.id} disabled={!isEditing}>
//             <div
//               className="p-2 rounded bg-transparent"
//               style={{
//                 fontSize: placeholder.fontSize,
//                 display: 'inline-block',
//                 position: 'absolute',
//                 left: placeholder.x,
//                 top: placeholder.y,
//                 zIndex: 1, // Ensure placeholders are above the image
//               }}
//             >
//               {renderContent(placeholder.value, placeholder.fontSize)}
//             </div>
//           </Draggable>
//         ) : null
//       )}
//     </div>
//   );
// };

// export default FrameTemplate;
