"use client"
import React, { useState } from "react";
import CertificateHead from "./certificateHead";
import CertificateForm from "./CertificateForm";
import EditCertiFields from "./EditCertiFields";
// import UserDetails from "./_comp/UserDetails"

const EditCertificate = () => {

   // State to hold design data
   const [designData, setDesignData] = useState<any>(null);

   // Callback function to handle button click
   const handleSave = () => {
     // Here you can perform actions with designData
     console.log("Saving design data:", designData);
     // You might want to send this data to an API or perform some logic here
   };

  return (
    <div className="p-10px md:px-10 md:py-50px mb-30px bg-whiteColor dark:bg-whiteColor-dark shadow-accordion dark:shadow-accordion-dark rounded-5">
      <CertificateHead 
        certificateTitle="Edit Certificate"
        onButtonClick={handleSave} // Pass the callback
      />
      {/* Editting certificate at id creation form */}
      <EditCertiFields setDesignData={setDesignData} />
    </div>
  );
};

export default EditCertificate;
