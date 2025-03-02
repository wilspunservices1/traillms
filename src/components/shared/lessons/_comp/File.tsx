"use client";

import React from "react";

type Props = {
  files: string[]; // Array of file paths passed as a prop
};

const Attachments: React.FC<Props> = ({ files }) => {
  return (
    <div>
      <h5 className="font-semibold">Downloadable Files:</h5>
      <ul className="ml-4 list-disc">
        {files && files.length > 0 ? (
          files.map((filePath, index) => {
            // Extract file name from the file path
            const fileName = filePath.split("\\").pop(); // For Windows paths

            // Convert the file path to a proper URL
            const fileUrl = filePath.replace(/^D:\\WIlspun-LMS-FE\\public\\uploads\\/, "/uploads/");

            return (
              <li key={index} className="mb-2">
                <a
                  href={fileUrl}
                  download={fileName}
                  className="text-primaryColor underline"
                >
                  {fileName}
                </a>
              </li>
            );
          })
        ) : (
          <li>No files available for download.</li>
        )}
      </ul>
    </div>
  );
};

export default Attachments;
