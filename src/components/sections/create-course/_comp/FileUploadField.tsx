import { BASE_URL } from "@/actions/constant";
import React, { useState } from "react";

interface FileUploadFieldProps {
  setFilePaths: (paths: string[]) => void;
  showAlert: (type: string, message: string) => void;
  labelText: string;
  multiple?: boolean;
  accept?: string;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  setFilePaths,
  showAlert,
  labelText,
  multiple = false,
  accept = "*/*",
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) {
      showAlert("Error", "Please select files to upload.");
      return;
    }

    setLoading(true);
    const formData = new FormData();

    // Append each file with a unique key for the backend to handle multiple files
    selectedFiles.forEach((file) => {
      formData.append("files", file); // Updated key name to "files"
    });

    try {
      const response = await fetch(`${BASE_URL}/api/courses/fileUpload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setFilePaths(data.filePaths); // Assuming `filePaths` is returned from the API
        showAlert("success", "Files uploaded successfully.");
      } else {
        showAlert("error", `Failed to upload files: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      showAlert("error", `An unexpected error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-15px">
      <label className="mb-3 block font-semibold">{labelText ? labelText : ""}</label>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md"
      />
      <button
        onClick={handleFileUpload}
        disabled={loading}
        className="mt-3 px-4 py-2 bg-blue text-white rounded"
      >
        {loading ? "Uploading..." : "Upload Files"}
      </button>
    </div>
  );
};

export default FileUploadField;
