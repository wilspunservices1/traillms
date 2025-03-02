"use client";
// src/components/sections/create-course/_comp/CourseRight.tsx
import React, { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { MultiValue } from "react-select";
import useSweetAlert from "@/hooks/useSweetAlert";
import FileModal from "./FileModal"; // Adjust the path as necessary
import FileUploadField from "./FileUploadField";

type Props = {
  courseId: string;
  extras?: {
    languages: string[];
    links: string[];
    filePaths: string[];
  };
};

type LanguageOption = {
  value: string;
  label: string;
};

const languageOptions: LanguageOption[] = [
  { value: "english", label: "English" },
  { value: "spanish", label: "Spanish" },
  { value: "french", label: "French" },
  { value: "german", label: "German" },
  { value: "chinese", label: "Chinese" },
];

const CourseRight: React.FC<Props> = ({ courseId, extras }) => {
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [links, setLinks] = useState<string[]>([""]);
  const [filePaths, setFilePaths] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedFilePath, setSelectedFilePath] = useState<string>("");
  const [selectedFileType, setSelectedFileType] = useState<string>("");
  const showAlert = useSweetAlert();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (extras) {
      if (extras.languages) {
        const initialLanguages = extras.languages.map((lang) => ({
          value: lang.toLowerCase(),
          label: lang.charAt(0).toUpperCase() + lang.slice(1),
        }));
        setLanguages(initialLanguages);
      }
      if (extras.links) {
        setLinks(extras.links.length > 0 ? extras.links : [""]);
      }
      if (extras.filePaths) {
        const urlFilePaths = extras.filePaths.map((path) => {
          // Convert file system paths to relative URLs
          return path.replace(/^[a-zA-Z]:\\AI_LMS\\public\\/, "/");
        });
        setFilePaths(urlFilePaths);
      }
    }
  }, [extras]);

  const handleLanguagesChange = (newValue: MultiValue<LanguageOption>) => {
    setLanguages(newValue.map((option) => option));
  };

  const handleAddLink = () => {
    setLinks([...links, ""]);
  };

  const handleLinkChange = (index: number, value: string) => {
    const updatedLinks = [...links];
    updatedLinks[index] = value;
    setLinks(updatedLinks);
  };

  // Handle multiple file uploads and update file paths
  const handleMultipleFiles = (paths: string[]) => {
    setFilePaths(paths);
  };

  const handleOpenModal = (filePath: string) => {
    const fileType = filePath.split(".").pop()?.toLowerCase() || "unknown";
    setSelectedFileType(fileType);
    setSelectedFilePath(filePath);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFilePath("");
    setSelectedFileType("");
  };
  // Handle save action
  const handleSave = async () => {
    setIsSaving(true);

    const courseExtras = {
      languages: languages.map((lang) => lang.value), // Only save language values
      links,
      filePaths,
    };

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ extras: courseExtras }), // Send extras to update
      });

      const data = await response.json();

      if (response.ok) {
        showAlert("success", "Course extras updated successfully.");
      } else {
        showAlert("error", `Failed to update course: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating course extras:", error);
      showAlert("error", `An unexpected error occurred: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // const handleSave = async () => {
  //   setIsSaving(true);

  //   // Filter out empty links before saving
  //   const validLinks = links.filter((link) => link.trim() !== "");

  //   const courseExtras = {
  //     languages: languages.map((lang) => lang.value),
  //     links: validLinks, // Use filtered links to remove empty strings
  //     filePaths,
  //   };

  //   const formData = new FormData();
  //   formData.append("extras", JSON.stringify(courseExtras));

  //   try {
  //     const response = await fetch(`/api/courses/${courseId}`, {
  //       method: "PATCH",
  //       body: formData,
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       showAlert("success", "Course extras updated successfully.");
  //       if (data.updatedFilePaths) {
  //         setFilePaths(data.updatedFilePaths);
  //       }
  //     } else {
  //       showAlert(
  //         "error",
  //         `Failed to update course: ${data.error || "Unknown error"}`
  //       );
  //     }
  //   } catch (error: any) {
  //     console.error("Error updating course extras:", error);
  //     showAlert("error", `An unexpected error occurred: ${error.message}`);
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  return (
    <div className="lg:col-start-9 lg:col-span-4" data-aos="fade-up">
      <div className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <h3 className="text-xl font-semibold text-blue-600 mb-4">
          Course Setup
        </h3>

        {/* File Upload Input */}
        <div className="mb-6">
          <FileUploadField
            setFilePaths={handleMultipleFiles}
            showAlert={showAlert}
            labelText={"Upload course files (multiple)"}
            multiple={true} // Enable multiple file uploads
            accept="*/*" // Accept any file type
          />

          {/* Existing Files (edit mode) */}
          {filePaths.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Existing Files:
              </label>
              <ul>
                {filePaths.map((filePath, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-600 dark:text-gray-400 mb-2"
                  >
                    {/* Extract and display the file name */}
                    <p className="font-semibold">{filePath.split("/").pop()}</p>
                    <button
                      type="button"
                      className="text-blue-500 underline"
                      onClick={() => handleOpenModal(filePath)} // Open the file modal
                    >
                      View File
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={() => setFilePaths([...filePaths, ""])}
            className="text-sm text-white bg-blue hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-md px-4 py-2"
          >
            + Add More Files
          </button>
        </div>

        {/* Language Multi-Select with Custom Language Option */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Course Languages
          </label>
          <CreatableSelect
            isMulti
            options={languageOptions}
            value={languages}
            onChange={handleLanguagesChange}
            placeholder="Select or add languages"
            className="text-sm"
          />
        </div>

        {/* Links Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Add Relevant Links
          </label>
          {links.map((link, index) => (
            <input
              key={index}
              type="url"
              value={link}
              placeholder={`Link ${index + 1}`}
              onChange={(e) => handleLinkChange(index, e.target.value)}
              className="block w-full text-sm text-gray-900 dark:text-gray-300 border border-gray-300 rounded-md p-2 mb-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          ))}
          <button
            type="button"
            onClick={handleAddLink}
            className="text-sm text-white bg-blue hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-md px-4 py-2"
          >
            Add Another Link
          </button>
        </div>

        {/* Save Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full text-sm text-white bg-blue hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-md px-4 py-2"
          >
            {isSaving ? "Saving..." : "Save Course Data"}
          </button>
        </div>
      </div>

      {/* File Modal to view files */}
      <FileModal
        isOpen={isModalOpen}
        filePath={selectedFilePath}
        fileType={selectedFileType}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default CourseRight;
