"use client"
// components/RolesTab.tsx

import React, { useEffect, useState } from "react";
import useTab from "@/hooks/useTab";
import TabButtonSecondary from "../buttons/TabButtonSecondary";
import TabContentWrapper from "../wrappers/TabContentWrapper";
import RolesTable from "./_comp/RolesTable"; // Assume you have this component
import TeacherRequestTable from "./_comp/TeacherRequestTable";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { formatDate } from "@/actions/formatDate";

const RolesTab = () => {
  const { currentIdx, handleTabClick } = useTab();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/user/all");

        if (!response.ok) {
          // Throw a custom error message if the response isn't ok
          throw new Error("Failed to fetch users.");
        }

        const data = await response.json();

        // Ensure that the data is an array of users
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format received.");
        }

        // Make sure each user object is valid
        if (data.some(user => typeof user !== "object" || !user.roles)) {
          throw new Error("Invalid user data received.");
        }

        setUsers(data); // Assuming valid user data is returned here
        console.log("data to test users", data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "An unexpected error occurred.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (error) {
    // Ensure the error is properly displayed as a string
    return <p className="text-red-500">Error: {error}</p>;
  }

  // **This part dynamically updates users based on roles**
  const filterUsersByRole = (role) => users?.filter((user) => user.roles.includes(role));

  // Filter users based on roles
  const trainees = filterUsersByRole("user");
  const trainers = filterUsersByRole("instructor");
  const admins = filterUsersByRole("admin");

  // Tab buttons and content configuration
  const tabbuttons = [
    {
      name: "Trainee",
      content: (
        <RolesTable
          isLoading={loading}
          users={trainees}
          setUsers={setUsers}
          fallbackMessage="No trainees available."
        />
      ),
    },
    {
      name: "Trainers",
      content: (
        <RolesTable
          isLoading={loading}
          users={trainers}
          setUsers={setUsers}
          fallbackMessage="No trainers available."
        />
      ),
    },
    {
      name: "Admins",
      content: (
        <RolesTable
          isLoading={loading}
          users={admins}
          setUsers={setUsers}
          fallbackMessage="No admins available."
        />
      ),
    },
    {
      name: "Requests",
      content: (
        <TeacherRequestTable />
      ),
    },
  ];

  // Function to handle Excel download
  const downloadExcel = () => {
    if (users.length === 0) {
      alert("No users available to download.");
      return;
    }

    // Prepare data for Excel
    const worksheetData = users.map(user => ({
      ID: user.uniqueIdentifier,
      Name: user.name,
      Email: user.email,
      Username: user.username,
      PhoneNumber: user.phoneNumber,
      // UniqueIdentifier: user.uniqueIdentifier,
      EnrolledCoursesCount: user.enrolledCoursesCount,
      CreatedAt: formatDate(user.createdAt),
      Roles: user.roles.join(", "),
    }));

    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Create a workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });

    // Create a Blob from the buffer
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });

    // Trigger file download
    saveAs(data, "users.xlsx");
  };

  return (
    <div className="p-10px min-h-[400px] md:px-4 md:py-50px mb-30px bg-whiteColor dark:bg-whiteColor-dark shadow-accordion dark:shadow-accordion-dark rounded-5">
      {/* Heading */}
      <div className="mb-6 pb-5 border-b-2 border-borderColor dark:border-borderColor-dark flex justify-between items-center">
        <h2 className="text-2xl font-bold text-blackColor dark:text-blackColor-dark">
          Administrative Roles
        </h2>
        {/* Download Button */}
        <button
          onClick={downloadExcel}
          className="px-4 py-2 bg-blue text-white rounded-md hover:bg-blueDark focus:outline-none"
        >
          Download as Excel
        </button>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex flex-wrap mb-10px lg:mb-50px rounded gap-10px">
          {tabbuttons.map(({ name }, idx) => (
            <TabButtonSecondary
              key={idx}
              name={name}
              idx={idx}
              currentIdx={currentIdx}
              handleTabClick={handleTabClick}
              button="small"
            />
          ))}
        </div>

        {/* Tab content */}
        <div>
          {tabbuttons.map(({ content }, idx) => (
            <TabContentWrapper key={idx} isShow={idx === currentIdx}>
              {content}
            </TabContentWrapper>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RolesTab;


// "use client";
// import React, { useEffect, useState } from "react";
// import useTab from "@/hooks/useTab";
// import TabButtonSecondary from "../buttons/TabButtonSecondary";
// import TabContentWrapper from "../wrappers/TabContentWrapper";
// import RolesTable from "./_comp/RolesTable"; // Assume you have this component
// import TeacherRequestTable from "./_comp/TeacherRequestTable";

// const RolesTab = () => {
//   const { currentIdx, handleTabClick } = useTab();
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Fetch users from the API
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const response = await fetch("/api/user/all");

//         if (!response.ok) {
//           // Throw a custom error message if the response isn't ok
//           throw new Error("Failed to fetch users.");
//         }

//         const data = await response.json();

//         // Ensure that the data is an array of users
//         if (!Array.isArray(data)) {
//           throw new Error("Invalid data format received.");
//         }

//         // Make sure each user object is valid
//         if (data.some(user => typeof user !== "object" || !user.roles)) {
//           throw new Error("Invalid user data received.");
//         }

//         setUsers(data); // Assuming valid user data is returned here
//         setLoading(false);
//       } catch (err) {
//         setError(err.message || "An unexpected error occurred.");
//         setLoading(false);
//       }
//     };

//     fetchUsers();
//   }, []);

//   // if (loading) {
//   //   return <p>Loading users...</p>;
//   // }

//   if (error) {
//     // Ensure the error is properly displayed as a string
//     return <p>Error: {error}</p>;
//   }

//   // **This part dynamically updates users based on roles**
//   const filterUsersByRole = (role) => users?.filter((user) => user.roles.includes(role));

//   // Filter users based on roles
//   const trainees = filterUsersByRole("user");
//   const trainers = filterUsersByRole("instructor");
//   const admins = filterUsersByRole("admin");

//   // Tab buttons and content configuration
//   const tabbuttons = [
//     {
//       name: "Trainee",
//       content: (
//         <RolesTable
//           isLoading={loading}
//           users={trainees}
//           setUsers={setUsers}
//           fallbackMessage="No trainees available."
//         />
//       ),
//     },
//     {
//       name: "Trainers",
//       content: (
//         <RolesTable
//           isLoading={loading}
//           users={trainers}
//           setUsers={setUsers}
//           fallbackMessage="No trainers available."
//         />
//       ),
//     },
//     {
//       name: "Admins",
//       content: (
//         <RolesTable
//           isLoading={loading}
//           users={admins}
//           setUsers={setUsers}
//           fallbackMessage="No admins available."
//         />
//       ),
//     },
//     {
//       name: "Requests",
//       content: (
//         <TeacherRequestTable />
//       ),
//     },
//   ];

//   return (
//     <div className="p-10px min-h-[400px] md:px-4 md:py-50px mb-30px bg-whiteColor dark:bg-whiteColor-dark shadow-accordion dark:shadow-accordion-dark rounded-5">
//       {/* heading */}
//       <div className="mb-6 pb-5 border-b-2 border-borderColor dark:border-borderColor-dark">
//         <h2 className="text-2xl font-bold text-blackColor dark:text-blackColor-dark">
//           Administrative Roles
//         </h2>
//       </div>

//       {/* Tabs */}
//       <div>
//         <div className="flex flex-wrap mb-10px lg:mb-50px rounded gap-10px">
//           {tabbuttons?.map(({ name }, idx) => (
//             <TabButtonSecondary
//               key={idx}
//               name={name}
//               idx={idx}
//               currentIdx={currentIdx}
//               handleTabClick={handleTabClick}
//               button={"small"}
//             />
//           ))}
//         </div>

//         {/* Tab content */}
//         <div>
//           {tabbuttons?.map(({ content }, idx) => (
//             <TabContentWrapper key={idx} isShow={idx === currentIdx}>
//               {content}
//             </TabContentWrapper>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RolesTab;


