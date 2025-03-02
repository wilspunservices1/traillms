"use client";

import React, { useState } from "react";
import Image from "next/image";
import cameraImage from "./camera.png"; // Adjust the path as needed
import { BASE_URL } from "@/actions/constant";

interface Props {
  setImageUrl: (path: string) => void;
}

const CustomFileUpload: React.FC<Props> = ({ setImageUrl }) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Using XMLHttpRequest for upload progress tracking
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${BASE_URL}/api/upload`, true);

      // Track the upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(Math.round(progress));
        }
      };

      xhr.onload = () => {
        setIsUploading(false);
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          if (response.imgUrl) {
            // setImageUrl(response.imgUrl);
            setImageUrl(response.imgUrl);
          } else {
            setErrorMessage("Failed to upload the image.");
          }
        } else {
          setErrorMessage("An error occurred during upload.");
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        setErrorMessage("An error occurred during upload.");
      };

      xhr.send(formData);
    } catch (error) {
      setIsUploading(false);
      setErrorMessage("An error occurred during upload.");
    }
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full cursor-pointer">
      <div className="flex flex-col items-center">
        <label className="relative flex items-center justify-center md:w-30 md:h-30 sm:w-20 sm:h-30 lg:w-38 lg:h-38 border rounded-full cursor-pointer">
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
          />
          <div className="text-center text-white">
            {isUploading ? (
              <>
                <progress
                  value={uploadProgress}
                  max="100"
                  className="w-full mt-2"
                />
                <p>{uploadProgress}%</p>
              </>
            ) : (
              // Show Camera Icon instead of "Click to upload"
              <div className="h-6 w-6 right-3 flex">
                <Image
                  src={cameraImage}
                  alt="camera"
                  width={200}
                  height={200}
                  className="filter invert brightness-0"
                />
              </div>
            )}
          </div>
        </label>

        {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default CustomFileUpload;
