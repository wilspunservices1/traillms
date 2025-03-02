// components/UserDetails.tsx

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { UserDetailsType } from "@/types/type";
import DotLoader from "@/components/sections/create-course/_comp/Icons/DotLoader";

interface UserDetailsProps {
  userId: string;
}

const UserDetails: React.FC<UserDetailsProps> = ({ userId }) => {
  const [userDetails, setUserDetails] = useState<UserDetailsType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) {
        setLoading(false);
        console.log("No user ID provided");
        return;
      }

      try {
        const response = await fetch(`/api/user/${userId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch user details.");
        }

        const data: UserDetailsType = await response.json();
        setUserDetails(data);
      } catch (err: any) {
        console.error("[FETCH_USER_DETAILS]", err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  if (loading) {
    return <DotLoader className="h-6 w-6 mx-auto" />;
  }

  if (error) {
    return <p className="text-red-500 text-center">Error: {error}</p>;
  }

  if (!userDetails) {
    return <p className="text-gray-500 text-center">No details available.</p>;
  }

  // Helper function to render social links
  const renderSocialLink = (
    platform: keyof UserDetailsType["socials"],
    url: string
  ) => {
    if (!url) return null;

    const icons: { [key in keyof UserDetailsType["socials"]]: JSX.Element } = {
      facebook: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 320 512"
          className="h-6"
        >
          <path
            fill="currentColor"
            d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"
          ></path>
        </svg>
      ),
      twitter: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          className="h-6"
        >
          <path
            fill="currentColor"
            d="M459.37 151.716c0.325 4.548 0.325 9.097 0.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447 0.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-0.975-84.792-31.188-98.112-72.772 6.498 0.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"
          ></path>
        </svg>
      ),
      linkedin: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          className="h-6"
        >
          <path
            fill="currentColor"
            d="M100.28 448H7.4V148.9h92.88V448zM53.79 108.1C24.09 108.1 0 83.5 0 53.8 0 24.1 24.09 0 53.79 0s53.79 24.09 53.79 53.8c0 29.7-24.09 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7 0.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"
          ></path>
        </svg>
      ),
      website: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 512"
          className="h-6"
        >
          <path
            fill="currentColor"
            d="M320 0C143.06 0 0 143.06 0 320s143.06 320 320 320 320-143.06 320-320S496.94 0 320 0zm0 480c-88.37 0-168-53.22-200.93-128h401.86C488 426.78 408.37 480 320 480zm-200.93-160C152 269.22 231.63 216 320 216s168 53.22 200.93 128H119.07z"
          ></path>
        </svg>
      ),
      github: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 496 512"
          className="h-6"
        >
          <path
            fill="currentColor"
            d="M165.9 397.4c0 2-2.3 3.7-5.2 3.7-2.9 0-5.2-1.7-5.2-3.7 0-2 2.3-3.7 5.2-3.7 2.9 0 5.2 1.7 5.2 3.7zm-25.1-1.3c0.7 2.3-0.2 4.8-2.3 5.8-2.1 1-4.6 0.1-5.8-2-1.1-2.1-0.2-4.6 2-5.8 2.1-1.1 4.6-0.2 5.8 2zm29.1 1.3c0 2-2.3 3.7-5.2 3.7-2.9 0-5.2-1.7-5.2-3.7 0-2 2.3-3.7 5.2-3.7 2.9 0 5.2 1.7 5.2 3.7zm28.9-1.3c0.7 2.3-0.2 4.8-2.3 5.8-2.1 1-4.6 0.1-5.8-2-1.1-2.1-0.2-4.6 2-5.8 2.1-1.1 4.6-0.2 5.8 2zM248 8C111 8 0 119 0 256c0 136.96 111 248 248 248s248-111.04 248-248C496 119 385 8 248 8zM272 432h-48V288h48v144zm-24-160c-13.2 0-24-10.8-24-24 0-13.26 10.8-24 24-24 13.26 0 24 10.74 24 24 0 13.2-10.74 24-24 24zm176 160h-48V288h48v144zm-24-160c-13.2 0-24-10.8-24-24 0-13.26 10.8-24 24-24 13.26 0 24 10.74 24 24 0 13.2-10.74 24-24 24z"
          ></path>
        </svg>
      ),
    };

    return (
      <a
        key={platform}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-600 hover:text-gray-800"
      >
        {icons[platform]}
      </a>
    );
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center">
        <Image
          src={userDetails.image || "/user.png"}
          alt={`${userDetails.name}'s profile`}
          width={128}
          height={128}
          className="w-32 h-32 bg-gray-300 rounded-full mb-4 object-cover"
        />
        <h1 className="text-3xl font-bold">{userDetails.name}</h1>
        <p className="text-gray-600 capitalize">{userDetails.roles.join(", ")}</p>
      </div>

      {/* Contact Information */}
      <div className="mt-6 flex flex-col items-center space-y-2">
        <p className="text-gray-700">
          <strong>Email:</strong> {userDetails.email}
        </p>
        {userDetails.phone && (
          <p className="text-gray-700">
            <strong>Phone:</strong> {userDetails.phone}
          </p>
        )}
        {/* Social Links */}
        <div className="flex space-x-4 mt-4">
          {Object.entries(userDetails.socials).map(([platform, url]) =>
            url
              ? renderSocialLink(
                  platform as keyof UserDetailsType["socials"],
                  url
                )
              : null
          )}
        </div>
      </div>

      {/* Biography */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-2">About Me</h2>
        <p className="text-gray-700">
          {userDetails.biography !== "Biography not provided."
            ? userDetails.biography
            : "No biography provided."}
        </p>
      </div>

      {/* Skills */}
      {userDetails.expertise.length > 0 &&
        userDetails.expertise[0] !== "No expertise provided." && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-2">Skills</h2>
            <ul className="list-disc list-inside text-gray-700">
              {userDetails.expertise.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </div>
        )}

      {/* Enrolled Courses or Experience */}
      {userDetails.enrolledCourses && userDetails.enrolledCourses.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-2">Experience</h2>
          <p className="text-gray-700">Details about enrolled courses or experience.</p>
        </div>
      )}

      {/* Wishlist (Optional) */}
      {userDetails.wishlist && userDetails.wishlist.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-2">Wishlist</h2>
          <p className="text-gray-700">Details about wishlist items.</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 flex justify-center">
        <a
          href={`mailto:${userDetails.email}`}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Contact Me
        </a>
      </div>
    </div>
  );
};

export default UserDetails;


// // components/UserDetails.tsx

// import React, { useEffect, useState } from "react";
// import Image from "next/image";
// import { UserDetailsType } from "@/types/type";
// // Removed unused import: formatDate
// import DotLoader from "@/components/sections/create-course/_comp/Icons/DotLoader";

// interface UserDetailsProps {
//   userId: string;
// }

// const UserDetails: React.FC<UserDetailsProps> = ({ userId }) => {
//   const [userDetails, setUserDetails] = useState<UserDetailsType | null>(null);
//   const [courses, setCourses] = useState<{ [key: string]: any }>({});
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   // Fetch user details
//   useEffect(() => {
//     const fetchUserDetails = async () => {
//       if (!userId) {
//         setLoading(false);
//         console.log("No user ID provided");
//         return;
//       }

//       try {
//         const response = await fetch(`/api/user/${userId}`);

//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.error || "Failed to fetch user details.");
//         }

//         const data: UserDetailsType = await response.json();
//         setUserDetails(data);
//       } catch (err: any) {
//         console.error("[FETCH_USER_DETAILS]", err);
//         // Ensure error is a string
//         setError(
//           err instanceof Error ? err.message : "An unexpected error occurred."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserDetails();
//   }, [userId]);

//   console.log("userDetails from User Custom model", userDetails);
//   console.log("Error state:", error);
//   console.log("Courses:", courses);

//   // Fetch course details if userDetails are available
//   useEffect(() => {
//     if (!userDetails) return;

//     const fetchCourseDetails = async (courseId: string) => {
//       try {
//         const response = await fetch(`/api/courses/${courseId}`); // Corrected path
//         if (!response.ok) {
//           console.warn(`Course with ID ${courseId} not found.`);
//           return; // Skip if course not found
//         }
//         const courseData = await response.json();
//         setCourses((prev) => ({ ...prev, [courseId]: courseData }));
//       } catch (err: any) {
//         console.error("Error fetching course details:", err);
//         // Optionally, set a separate error state for courses
//       }
//     };

//     userDetails.enrolledCourses &&
//       userDetails.enrolledCourses.forEach((course) => {
//         if (!courses[course.courseId]) {
//           fetchCourseDetails(course.courseId);
//         }
//       });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [userDetails]); // Removed 'courses' from dependencies

//   if (loading) {
//     return <DotLoader className="h-6 w-6 mx-auto" />;
//   }

//   if (error) {
//     // Ensure error is a string
//     const errorMessage =
//       typeof error === "string" ? error : "An unexpected error occurred.";
//     return <p className="text-red-500 text-center">Error: {errorMessage}</p>;
//   }

//   if (!userDetails) {
//     return <p className="text-gray-500 text-center">No details available.</p>;
//   }

//   // Helper function to render social links
//   const renderSocialLink = (
//     platform: keyof UserDetailsType["socials"],
//     url: string
//   ) => {
//     if (!url) return null;

//     const icons: { [key in keyof UserDetailsType["socials"]]: JSX.Element } = {
//       facebook: (
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           viewBox="0 0 320 512"
//           className="h-6"
//         >
//           <path
//             fill="currentColor"
//             d="m279.14 288 14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"
//           ></path>
//         </svg>
//       ),
//       twitter: (
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           viewBox="0 0 512 512"
//           className="h-6"
//         >
//           <path
//             fill="currentColor"
//             d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"
//           ></path>
//         </svg>
//       ),
//       linkedin: (
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           viewBox="0 0 448 512"
//           className="h-6"
//         >
//           <path
//             fill="currentColor"
//             d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"
//           ></path>
//         </svg>
//       ),
//       website: (
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           viewBox="0 0 384 512"
//           className="h-6"
//         >
//           <path
//             fill="currentColor"
//             d="M168 352h48c13.3 0 24-10.7 24-24v-48c0-13.3-10.7-24-24-24h-48c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24zm192-240H24C10.7 112 0 122.7 0 136v240c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V136c0-13.3-10.7-24-24-24zM144 184h96v48h-96v-48zm0 80h96v48h-96v-48zm0 80h96v48h-96v-48z"
//           ></path>
//         </svg>
//       ),
//       github: (
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           viewBox="0 0 496 512"
//           className="h-6"
//         >
//           <path
//             fill="currentColor"
//             d="M165.9 397.4c0 2-2.3 3.7-5.2 3.7-2.9 0-5.2-1.7-5.2-3.7 0-2 2.3-3.7 5.2-3.7 2.9 0 5.2 1.7 5.2 3.7zm-25.1-1.3c-.7 2.3-2.6 3.8-5 3.8-2.4 0-4.3-1.5-5-3.8-.7-2.3 2.3-3.8 5-3.8 2.4 0 4.3 1.5 5 3.8zm30.3-1.3c0 2-2.3 3.7-5.2 3.7-2.9 0-5.2-1.7-5.2-3.7 0-2 2.3-3.7 5.2-3.7 2.9 0 5.2 1.7 5.2 3.7zm25.1-1.3c-.7 2.3-2.6 3.8-5 3.8-2.4 0-4.3-1.5-5-3.8-.7-2.3 2.3-3.8 5-3.8 2.4 0 4.3 1.5 5 3.8zm30.3-1.3c0 2-2.3 3.7-5.2 3.7-2.9 0-5.2-1.7-5.2-3.7 0-2 2.3-3.7 5.2-3.7 2.9 0 5.2 1.7 5.2 3.7zM248 8C111 8 0 119 0 256c0 111.2 72.2 205.6 172.8 238.8 12.6 2.3 17.3-5.5 17.3-12.2 0-6-0.2-21.8-0.3-42.7-70.1 15.3-85-33.9-85-33.9-11.5-29.2-28.1-36.9-28.1-36.9-23-15.7 1.7-15.4 1.7-15.4 25.5 1.8 38.9 26.2 38.9 26.2 22.5 38.6 59.1 27.4 73.6 20.9 2.3-16.3 8.8-27.4 16-33.6-56.3-6.4-115.4-28.1-115.4-125.4 0-27.7 9.9-50.4 26.3-68.3-2.6-6.4-11.4-32.2 2.5-67.3 0 0 21.5-6.9 70.3 26.3 20.4-5.7 42.2-8.5 64.1-8.6 21.9 0.1 43.7 2.9 64.1 8.6 48.8-33.2 70.3-26.3 70.3-26.3 14 35.1 5.1 60.9 2.5 67.3 16.4 17.9 26.3 40.6 26.3 68.3 0 97.5-59.2 118.9-115.6 125.3 9 7.8 17.1 23.2 17.1 46.6 0 33.7-0.3 60.9-0.3 69.3 0 6.7 4.6 14.5 17.3 12.2C423.8 461.6 496 367.2 496 256 496 119 385 8 248 8z"
//           ></path>
//         </svg>
//       ),
//     };

//     return (
//       <a
//         href={url}
//         target="_blank"
//         rel="noopener noreferrer"
//         className="text-gray-600 hover:text-gray-800"
//       >
//         {icons[platform]}
//       </a>
//     );
//   };

//   return (
//     <div className="bg-gray-100">
//       <div className="container mx-auto py-8">
//         <div className="grid grid-cols-4 sm:grid-cols-12 gap-6 px-4">
//           {/* Sidebar */}
//           <div className="col-span-4 max-w-6xl sm:col-span-3">
//             <div className="bg-white shadow rounded-lg p-6">
//               <div className="flex flex-col items-center">
//                 {/* Next.js Image Component with fallback */}
//                 <Image
//                   src={userDetails.image || "/user.png"} // Ensure you have a default image in the public folder
//                   alt={`${userDetails.name}'s profile`}
//                   width={128}
//                   height={128}
//                   className="w-32 h-32 bg-gray-300 rounded-full mb-4 shrink-0 object-cover"
//                 />

//                 <h1 className="text-xl font-bold">{userDetails.name}</h1>
//                 <p className="text-gray-700">{userDetails.roles.join(", ")}</p>
//                 <div className="mt-6 flex flex-wrap gap-4 justify-center">
//                   <a
//                     href={`mailto:${userDetails.email}`}
//                     className="bg-blue hover:bg-blueDark text-white py-2 px-4 rounded"
//                   >
//                     Contact
//                   </a>
//                   {/* Resume Button - Adjust the href as needed */}
//                   <a
//                     href="#"
//                     className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded"
//                   >
//                     Resume
//                   </a>
//                 </div>
//               </div>
//               <hr className="my-6 border-t border-gray-300" />
//               <div className="flex flex-col">
//                 <span className="text-gray-700 uppercase font-bold tracking-wider mb-2">
//                   Skills
//                 </span>
//                 <ul>
//                   {userDetails.expertise.length > 0 ? (
//                     userDetails.expertise.map((skill, index) => (
//                       <li key={index} className="mb-2">
//                         {skill}
//                       </li>
//                     ))
//                   ) : (
//                     <li className="mb-2">No skills provided.</li>
//                   )}
//                 </ul>
//               </div>
//             </div>
//           </div>

//           {/* Main Content */}
//           <div className="col-span-4 sm:col-span-9">
//             <div className="bg-white shadow rounded-lg p-6">
//               <h2 className="text-xl font-bold mb-4">About Me</h2>
//               <p className="text-gray-700">{userDetails.biography}</p>

//               {/* Social Links */}
//               <h3 className="font-semibold text-center mt-3 -mb-2">
//                 Find me on
//               </h3>
//               <div className="flex justify-center items-center gap-6 my-6">
//                 {Object.entries(userDetails.socials).map(
//                   ([platform, url]) =>
//                     url &&
//                     renderSocialLink(
//                       platform as keyof UserDetailsType["socials"],
//                       url
//                     )
//                 )}
//               </div>

//               {/* Experience Section */}
//               <h2 className="text-xl font-bold mt-6 mb-4">Experience</h2>
//               {userDetails.enrolledCourses &&
//               userDetails.enrolledCourses.length > 0 ? (
//                 userDetails.enrolledCourses.map((course) => (
//                   <div key={course.courseId} className="mb-6">
//                     <div className="flex justify-between flex-wrap gap-2 w-full">
//                       <span className="text-gray-700 font-bold">
//                         {courses[course.courseId]?.title ||
//                           `Course ID: ${course.courseId}`}
//                       </span>
//                       <p>
//                         <span className="text-gray-700 mr-2">Progress:</span>
//                         <span className="text-gray-700">
//                           {course.progress}%
//                         </span>
//                       </p>
//                     </div>
//                     <p className="mt-2">
//                       {courses[course.courseId]?.description ||
//                         `Completed Lectures: ${course.completedLectures.length}`}
//                     </p>
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-gray-500">No experience listed.</p>
//               )}

//               {/* Wishlist Section (Optional) */}
//               <h2 className="text-xl font-bold mt-6 mb-4">Wishlist</h2>
//               {userDetails.wishlist && userDetails.wishlist.length > 0 ? (
//                 <ul className="list-disc list-inside">
//                   {userDetails.wishlist.map((courseId) => (
//                     <li key={courseId}>
//                       {courses[courseId]?.title || `Course ID: ${courseId}`}
//                     </li>
//                   ))}
//                 </ul>
//               ) : (
//                 <p className="text-gray-500">No items in wishlist.</p>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserDetails;

