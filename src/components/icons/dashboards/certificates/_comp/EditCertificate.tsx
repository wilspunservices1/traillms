"use client"
import React, { useState } from "react";
import CertificateHead from "./certificateHead";
import CertificateForm from "./CertificateForm";
import EditCertiFields from "./EditCertiFields";
import EditCertificateModal from "./EditCertificateModal";
// import UserDetails from "./_comp/UserDetails"

const EditCertificate = () => {
  const [designData, setDesignData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = () => {
    console.log("Saving design data:", designData);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalSave = async (updatedData: any): Promise<void> => {
    setDesignData(updatedData);
    setIsModalOpen(false);
  };

  return (
    <div className="p-10px md:px-10 md:py-50px mb-30px bg-whiteColor dark:bg-whiteColor-dark shadow-accordion dark:shadow-accordion-dark rounded-5">
      <CertificateHead 
        certificateTitle="Edit Certificate"
        onButtonClick={() => setIsModalOpen(true)}
      />
      <EditCertificateModal 
        certificate={designData}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />
    </div>
  );
};



export default EditCertificate;
