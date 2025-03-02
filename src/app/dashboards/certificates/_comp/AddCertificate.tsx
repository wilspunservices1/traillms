import React from "react";
import CertificateHead from "./certificateHead";
import CertificateForm from "./CertificateForm";
// import UserDetails from "./_comp/UserDetails"

const AddCertificate = () => {

  return (
    <div className="p-10px md:px-10 md:py-50px mb-30px bg-whiteColor dark:bg-whiteColor-dark shadow-accordion dark:shadow-accordion-dark rounded-5">
      <CertificateHead certificateTitle="Add Certificate"/>
      {/* Certificate creation form */}
      <CertificateForm />
      {/* <UserDetails /> */}
    </div>
  );
};

export default AddCertificate;
