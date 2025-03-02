import { CldImage } from "next-cloudinary";
import React, { useState, useEffect, useRef } from "react";

const ImageField = ({ setImagePath, showAlert, initialImagePath="" }) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(initialImagePath || ""); // Initialize with the provided path if available
  const fileInputRef = useRef<any>(null); // Reference for the hidden file input

  // Update the preview if the initialImagePath prop changes
  useEffect(() => {
    if (initialImagePath) {
      setPreview(initialImagePath);
    }
  }, [initialImagePath]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      showAlert("error", "Please select an image to upload.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const imageUrl = data.secure_url || data.imgUrl;
        setImagePath(imageUrl); // Pass the image URL back to the parent component
        setPreview(imageUrl); // Set the preview to the uploaded image
        showAlert("success", "Image uploaded successfully.");
      } else {
        showAlert("error", data.message || "Failed to upload image.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      showAlert("error", "An error occurred during image upload.");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle the click on the edit icon
  const triggerFileInput = () => {
    fileInputRef.current.click(); // Trigger the hidden file input
  };

  return (
    <div className="mb-15px relative">
      <label className="mb-3 block font-semibold">Upload Thumbnail</label>

      {/* Image Preview */}
      {preview && (
        <div className="relative mb-4">
          <CldImage
            src={preview || ""}
            alt="Image Preview"
            className="w-full h-auto rounded-md mb-3"
            width={300}
            height={200}
            sizes={"60w"}
          />

          {/* Edit SVG Icon positioned absolutely */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-500 absolute top-2 right-2 cursor-pointer"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            onClick={triggerFileInput} // Trigger the file input on click
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-2.036a2.5 2.5 0 113.536 3.536L10.5 21H6v-4.5l9.732-9.732z"
            />
          </svg>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden" // Hide the file input
      />

      {/* File input only appears when no preview */}
      {!preview && (
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md"
        />
      )}

      {loading && <p>Uploading...</p>}
    </div>
  );
};

export default ImageField;



// import React, { useState } from 'react';

// const ImageField = ({ setImagePath, showAlert }) => {
//   const [loading, setLoading] = useState(false);

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) {
//       showAlert("error", "Please select an image to upload.");
//       return;
//     }

//     setLoading(true);

//     try {
//       // Create a FormData object to send the file to your Next.js API route
//       const formData = new FormData();
//       formData.append('file', file);

//       // Send the file to the API route that handles the upload to Cloudinary
//       const response = await fetch('/api/upload', {
//         method: 'POST',
//         body: formData,
//       });

//       const data = await response.json();
//       if (response.ok) {
//         setImagePath(data.imgUrl);  // Use the secure_url returned by Cloudinary
//         showAlert("success", "Image uploaded successfully.");
//       } else {
//         showAlert("error", data.message || "Failed to upload image.");
//       }
//     } catch (error) {
//       console.error("error uploading image:", error);
//       showAlert("error", "An error occurred during image upload.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="mb-15px">
//       <label className="mb-3 block font-semibold">Upload Thumbnail</label>
//       <input
//         type="file"
//         accept="image/*"
//         onChange={handleImageUpload}
//         className="w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md"
//       />
//       {loading && <p>Uploading...</p>}
//     </div>
//   );
// };

// export default ImageField;

