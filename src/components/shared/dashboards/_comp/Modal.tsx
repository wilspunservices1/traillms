// components/shared/dashboards/_comp/Modal.tsx

import React, { useEffect, useRef } from "react";

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
  confirmText: string;
  cancelText?: string; // Optional
  onConfirm: () => void;
  onCancel?: () => void; // Optional
  size?: "sm" | "md" | "lg" | "xl"; // Extended to include 'xl'
  customClasses?: string; // New prop for additional classes
}

const Modal: React.FC<ModalProps> = ({
  isVisible,
  onClose,
  title,
  content,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  size = "md", // Default size
  customClasses = "", // Default empty
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      if (isVisible) {
        document.removeEventListener("mousedown", handleClickOutside);
      }
    };
  }, [isVisible, onClose]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      if (isVisible) {
        document.removeEventListener("keydown", handleEscape);
      }
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  // Determine modal width based on size
  const sizeClasses: Record<string, string> = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "xl:max-w-4xl",
  };

  return (
    <div
      id="hs-scale-animation-modal"
      tabIndex={-1}
      className="hs-overlay fixed inset-0 z-50 overflow-x-hidden overflow-y-auto pointer-events-auto bg-gray-900 bg-opacity-50 flex justify-center items-center"
      role="dialog"
      aria-labelledby="hs-scale-animation-modal-label"
    >
      <div
        className={`hs-overlay-animation-target transition-all duration-200 ease-in-out ${sizeClasses[size]} sm:w-full m-3 sm:mx-auto ${customClasses}`}
      >
        <div
          className="w-full flex flex-col bg-white border shadow-sm rounded-xl dark:bg-neutral-800 dark:border-neutral-700 dark:shadow-neutral-700/70"
          ref={modalRef} // Attach ref to the modal content
        >
          {/* Header */}
          <div className="flex justify-between items-center py-3 px-4 border-b dark:border-neutral-700">
            <h3
              id="hs-scale-animation-modal-label"
              className="font-bold text-gray-800 dark:text-white"
            >
              {title}
            </h3>
            <button
              type="button"
              className="inline-flex justify-center items-center rounded-full border bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-400"
              aria-label="Close"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg
                className="shrink-0 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto">
            <div className="mt-1 text-gray-800 dark:text-neutral-400">{content}</div>
          </div>

          {/* Footer */}
          <div className="flex justify-end items-center gap-x-2 py-3 px-4 border-t dark:border-neutral-700">
            {cancelText && onCancel && (
              <button
                type="button"
                className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700"
                onClick={onCancel}
              >
                {cancelText}
              </button>
            )}
            <button
              type="button"
              className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue text-white hover:bg-blueDark focus:outline-none"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
