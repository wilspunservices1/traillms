// src/components/sections/create-course/_comp/FileModal.tsx
import React, { useEffect, useRef } from "react";

export interface FileModalProps {
  isOpen: boolean;
  filePath: string;
  fileType: string;
  onClose: () => void;
}

const FileModal: React.FC<FileModalProps> = ({ isOpen, filePath, fileType, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus the modal
      modalRef.current?.focus();

      // Prevent background scrolling
      document.body.style.overflow = "hidden";
    } else {
      // Restore background scrolling
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const renderFileContent = () => {
    if (fileType === "pdf") {
      return (
        <iframe
          src={filePath}
          className="w-full h-full"
          title="PDF Viewer"
          style={{ minHeight: "400px" }}
        />
      );
    } else if (fileType.startsWith("image")) {
      return <img src={filePath} alt="file" className="w-full h-auto" />;
    } else if (fileType === "txt") {
      return (
        <iframe
          src={filePath}
          className="w-full h-full"
          title="Text File Viewer"
          style={{ minHeight: "400px" }}
        />
      );
    } else {
      return (
        <div className="text-center">
          <p>File preview not supported for this file type.</p>
          <a
            href={filePath}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue underline"
          >
            Download file
          </a>
        </div>
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={modalRef}
        className="relative bg-white dark:bg-gray-700 rounded-lg shadow-lg w-full max-w-2xl mx-4 focus:outline-none transition-transform transform duration-300"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1} // Make the div focusable
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            File Viewer
          </h3>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
            onClick={onClose}
          >
            <svg
              aria-hidden="true"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
            <span className="sr-only">Close modal</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 dark:text-white">
          {renderFileContent()}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center p-4 border-t dark:border-gray-600">
          <button
            type="button"
            className="px-4 py-2 bg-blue text-white rounded-md hover:bg-blueDark focus:ring-4 focus:outline-none focus:ring-blue-light dark:bg-blueDark dark:hover:bg-blueDark dark:focus:ring-naveBlue"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileModal;
