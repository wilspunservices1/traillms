// components/CertificateModal.tsx

import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import CertificateDetails from "./CertificateDetails";
import {Certificate} from "../../../../../types/certificates"

interface CertificateModalProps {
  certificate: Certificate;
  onClose: () => void;
}

const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {

  console.log("Certificate",certificate)
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Close modal when pressing the Esc key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  // Close modal when clicking outside the modal content
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [onClose]);

  // Focus on close button when modal opens
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  return ReactDOM.createPortal(
    <div
      id="certificate-modal"
      className="fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center bg-lightBlack bg-opacity-50 transition-opacity duration-500"
      aria-modal="true"
      role="dialog"
      aria-labelledby="certificate-modal-title"
    >
      <div
        id="certificate-modal-content"
        ref={modalRef}
        className="relative bg-whiteColor dark:bg-whiteColor-dark p-6 rounded-lg max-w-3xl w-full mx-4 focus:outline-none"
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white focus:outline-none"
          aria-label="Close Modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            className="w-6 h-6 fill-current"
          >
            <path d="M1.646 1.646a.5.5 0 011 0L8 6.293l5.354-4.647a.5.5 0 11.707.708L8.707 7l5.647 6.354a.5.5 0 01-.707.708L8 7.707l-5.647 6.354a.5.5 0 01-.707-.708L7.293 7 .646 1.646a.5.5 0 010-.708z" />
          </svg>
        </button>

        {/* Modal Content */}
        <CertificateDetails isModal={true} certificate={certificate} />
      </div>
    </div>,
    document.body
  );
};

export default CertificateModal;
