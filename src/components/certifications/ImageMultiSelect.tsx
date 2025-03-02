// components/certifications/ImageMultiSelect.tsx

"use client";

import React, { useEffect, useState, useCallback } from "react";
import Select, { components, ActionMeta, MultiValue } from "react-select";
import { CldImage } from "next-cloudinary";
import type { StylesConfig } from "react-select";

// Define the structure of each certificate as returned by the API
interface Certificate {
  id: string;
  certificateData: string; // Image URL
  description: string;
  uniqueIdentifier: string;
}

// Define the structure of each option in the select component
export interface ImageOption {
  value: string; // Image URL
  label: string; // Description or Name
}

// Define the props for the component
interface ImageMultiSelectProps {
  selectedImages: ImageOption[];
  setSelectedImages: React.Dispatch<React.SetStateAction<ImageOption[]>>;
}

// Custom Option Component with Overlayed Label on Hover
const CustomOption: React.FC<any> = (props) => (
  <components.Option {...props}>
    <div className="relative w-full h-full group cursor-pointer">
      <CldImage
        src={props.data.value}
        alt={props.data.label}
        className="w-full h-[200px] object-cover rounded transition-transform duration-300 transform group-hover:scale-105"
        width={200}
        height={150}
        priority
      />
      {/* Label Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 rounded">
        <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {props.data.label}
        </span>
      </div>
    </div>
  </components.Option>
);

// Custom MultiValue Label Component with Thumbnail and Transparent Background
const CustomMultiValueLabel: React.FC<any> = (props) => (
  <components.MultiValueLabel {...props}>
    <div className="flex items-center space-x-1">
      <CldImage
        src={props.data.value}
        alt={props.data.label}
        className="w-5 h-5 object-cover rounded"
        width={50}
        height={50}
        priority
      />
      <span className="text-xs text-gray-700 dark:text-gray-300">
        {props.data.label}
      </span>
    </div>
  </components.MultiValueLabel>
);

// Styles Configuration for react-select
const customStyles: StylesConfig<ImageOption, true> = {
  // Your custom styles here
};

const ImageMultiSelect: React.FC<ImageMultiSelectProps> = ({
  selectedImages,
  setSelectedImages,
}) => {
  const [options, setOptions] = useState<ImageOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch saved certificates from the API
  const fetchImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/certificates/get-saved");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.certificates || !Array.isArray(data.certificates)) {
        throw new Error("Invalid data format received from API.");
      }

      // Map the certificates to ImageOption format
      const fetchedImages: ImageOption[] = data.certificates.map(
        (cert: Certificate) => ({
          value: cert.certificateData,
          label: cert.description || `Certificate ${cert.uniqueIdentifier}`,
        })
      );

      setOptions(fetchedImages);
    } catch (error: any) {
      console.error("Error fetching existing images:", error);
      setError("Failed to load certificates. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Handle selection changes
  const handleChange = (
    selected: MultiValue<ImageOption>,
    actionMeta: ActionMeta<ImageOption>
  ) => {
    const selectedOptions = selected ? [...selected] : [];
    setSelectedImages(selectedOptions);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Select Existing Certificates
      </label>
      {error && (
        <p className="text-sm text-red-600 mb-2" role="alert">
          {error}
        </p>
      )}
      <Select
        isMulti
        options={options}
        value={selectedImages}
        onChange={handleChange}
        isLoading={loading}
        placeholder="Select certificates..."
        className="react-select-container"
        classNamePrefix="react-select"
        components={{
          Option: CustomOption,
          MultiValueLabel: CustomMultiValueLabel,
        }}
        styles={customStyles}
        noOptionsMessage={() =>
          loading ? "Loading certificates..." : "No certificates available"
        }
        isSearchable
        aria-label="Select Existing Certificates"
      />
    </div>
  );
};

export default ImageMultiSelect;




// // components/certifications/ImageMultiSelect.tsx

// "use client";

// import React, { useEffect, useState, useCallback } from "react";
// import Select, {
//   components,
//   MultiValueGenericProps,
//   OptionProps as ReactSelectOptionProps,
// } from "react-select";
// import { CldImage } from "next-cloudinary";
// import type { StylesConfig, MultiValue } from "react-select";

// // Define the structure of each certificate as returned by the API
// interface Certificate {
//   id: string;
//   ownerId: string;
//   certificateData: string; // Image URL
//   description: string;
//   isPublished: boolean;
//   uniqueIdentifier: string;
//   createdAt: string;
//   updatedAt: string;
// }

// // Define the structure of the API response
// interface GetSavedCertificatesResponse {
//   certificates: Certificate[];
// }

// // Define the structure of each option in the select component
// interface ImageOption {
//   value: string; // Image URL
//   label: string; // Description or Name
// }

// interface ImageMultiSelectProps {
//   selectedImages: ImageOption[];
//   setSelectedImages: React.Dispatch<React.SetStateAction<ImageOption[]>>;
// }

// // Custom Option Component with Overlayed Label on Hover
// const CustomOption: React.FC<ReactSelectOptionProps<ImageOption, true>> = React.memo(
//   (props) => {
//     return (
//       <components.Option {...props}>
//         <div className="relative w-full h-full group cursor-pointer">
//           <CldImage
//             src={props.data.value}
//             alt={props.data.label}
//             className="w-full h-[200px] object-cover rounded transition-transform duration-300 transform group-hover:scale-105"
//             width={200}
//             height={150}
//             priority
//           />
//           {/* Label Overlay */}
//           <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 rounded">
//             <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//               {props.data.label}
//             </span>
//           </div>
//         </div>
//       </components.Option>
//     );
//   }
// );

// // Custom MultiValue Label Component with Thumbnail and Transparent Background
// const CustomMultiValueLabel: React.FC<MultiValueGenericProps<ImageOption>> = React.memo(
//   (props) => (
//     <components.MultiValueLabel {...props}>
//       <div className="flex items-center space-x-1">
//         <CldImage
//           src={props.data.value}
//           alt={props.data.label}
//           className="w-5 h-5 object-cover rounded"
//           width={50}
//           height={50}
//           priority
//         />
//         <span className="text-xs text-gray-700 dark:text-gray-300">
//           {props.data.label}
//         </span>
//       </div>
//     </components.MultiValueLabel>
//   )
// );

// // Styles Configuration for react-select
// const customStyles: StylesConfig<ImageOption, true> = {
//   control: (provided) => ({
//     ...provided,
//     borderColor: "#CBD5E0",
//     boxShadow: "none",
//     "&:hover": {
//       borderColor: "#A0AEC0",
//     },
//     padding: "2px",
//   }),
//   menu: (provided) => ({
//     ...provided,
//     zIndex: 9999, // Ensure the menu appears above other elements
//   }),
//   option: (provided, state) => ({
//     ...provided,
//     padding: 0, // Remove default padding to make the image fit
//     backgroundColor: state.isFocused
//       ? "rgba(66, 153, 225, 0.1)" // Light blue on hover
//       : state.isSelected
//       ? "rgba(66, 153, 225, 0.2)" // Slightly darker blue if selected
//       : "transparent",
//   }),
//   multiValue: (provided) => ({
//     ...provided,
//     backgroundColor: "rgba(66, 153, 225, 0.1)", // Light blue background for selected values
//     padding: "2px 5px",
//     borderRadius: "4px",
//   }),
//   multiValueLabel: (provided) => ({
//     ...provided,
//     display: "flex",
//     alignItems: "center",
//     padding: 0,
//   }),
//   multiValueRemove: (provided) => ({
//     ...provided,
//     color: "#2D3748",
//     paddingLeft: "5px",
//     paddingRight: "5px",
//     "&:hover": {
//       backgroundColor: "#E2E8F0",
//       color: "#1A202C",
//     },
//   }),
// };

// // ImageMultiSelect Component
// const ImageMultiSelect: React.FC<ImageMultiSelectProps> = ({
//   selectedImages,
//   setSelectedImages,
// }) => {
//   const [options, setOptions] = useState<ImageOption[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   // Fetch saved certificates from the API
//   const fetchImages = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await fetch("/api/certificates/get-saved");

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data: GetSavedCertificatesResponse = await response.json();

//       if (!data.certificates || !Array.isArray(data.certificates)) {
//         throw new Error("Invalid data format received from API.");
//       }

//       // Map the certificates to ImageOption format
//       const fetchedImages: ImageOption[] = data.certificates.map((cert) => ({
//         value: cert.certificateData,
//         label: cert.description || `Certificate ${cert.uniqueIdentifier}`,
//       }));

//       setOptions(fetchedImages);
//     } catch (error: any) {
//       console.error("Error fetching existing images:", error);
//       setError("Failed to load certificates. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchImages();
//   }, [fetchImages]);

//   // Handle selection changes
//   const handleChange = (selected: MultiValue<ImageOption>) => {
//     setSelectedImages(selected as ImageOption[]);
//   };

//   return (
//     <div className="w-full">
//       <label className="block text-sm font-medium text-gray-700 mb-1">
//         Select Existing Certificates
//       </label>
//       {error && (
//         <p className="text-sm text-red-600 mb-2" role="alert">
//           {error}
//         </p>
//       )}
//       <Select
//         isMulti
//         options={options}
//         value={selectedImages}
//         onChange={handleChange}
//         isLoading={loading}
//         placeholder="Select certificates..."
//         className="react-select-container"
//         classNamePrefix="react-select"
//         components={{ Option: CustomOption, MultiValueLabel: CustomMultiValueLabel }}
//         styles={customStyles}
//         noOptionsMessage={() =>
//           loading ? "Loading certificates..." : "No certificates available"
//         }
//         isSearchable
//         aria-label="Select Existing Certificates"
//       />
//     </div>
//   );
// };

// export default ImageMultiSelect;
