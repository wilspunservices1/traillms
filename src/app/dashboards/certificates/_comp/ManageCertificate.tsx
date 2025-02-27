import React from "react";
import CertificateHead from "./certificateHead";
import ManageCertificate from './ManageCertificateTable';

const AddCertificate: React.FC = () => {
  return (
    <div className="p-10px md:px-10 md:py-50px mb-30px bg-whiteColor dark:bg-whiteColor-dark shadow-accordion dark:shadow-accordion-dark rounded-5">
      <CertificateHead certificateTitle="Manage Certificate" />
      {/* Certificate creation form */}
      {/* <CertificateForm /> */}
      {/* <UserDetails /> */}
      {/* <h1>Hello World</h1> */}
      <ManageCertificate />
    </div>
  );
};

export default AddCertificate;
