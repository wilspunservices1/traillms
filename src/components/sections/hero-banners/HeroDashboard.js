"use client";

import dashboardImage2 from "@/assets/images/dashbord/dashbord__2.jpg";
import teacherImage2 from "@/assets/images/teacher/teacher__2.png";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import CustomFileUpload from "./_comp/camera"; // Ensure this path is correct
// import CustomFileUpload from "./CustomFileUpload"; // Import your custom file upload component
import { fetchUserDetailsFromApi, changeProfileImage } from "@/actions/getUser"; // API for fetching and updating user details
import { CldImage } from "next-cloudinary";
import DropdownSwitcher from "./_comp/DropdownSwitcher";
import { redirect } from "next/navigation";
import SkeletonText from "@/components/Loaders/SkeletonText";
import SkeletonResultsText from "@/components/Loaders/LineSkeleton";



const HeroDashboard = () => {
  const pathname = usePathname();
  const partOfPathName = pathname.split("/")[2].split("-")[0];
  const isAdmin = partOfPathName === "admin";
  const isInstructor = partOfPathName === "instructor";
  const { data: session } = useSession();

  const [userDetails, setUserDetails] = useState(null);
  const [image, setImage] = useState(null); // Manage the image upload
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  if(!session) {
    redirect("/login");
  }


  useEffect(() => {
    const fetchUserDetails = async () => {
      if (session?.user?.id) {
        try {
          const userData = await fetchUserDetailsFromApi(session.user.id);
          setUserDetails(userData);
          setImage(userData.image || (isAdmin || isInstructor ? dashboardImage2 : teacherImage2));
        } catch (error) {
          console.error("Failed to fetch user details:", error);
          setError("Failed to fetch user details.");
        }
      }
    };

    fetchUserDetails();
  }, [isAdmin, isInstructor, session]);

  // Handle image upload completion from the CustomFileUpload component
  const handleImageUpload = async (imagePath) => {
    setIsUploading(true);
    try {
      const response = await changeProfileImage(session.user.id, imagePath);
      console.log("Image updated successfully:", response);
      setImage(imagePath); // Update the image with the new one
      setError(null); // Reset any previous error
    } catch (error) {
      console.error("Error updating profile image:", error);
      setError("Failed to update profile image.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section>
      <div className="container-fluid-2">
        <div
          className={`${isAdmin
            ? "bg-primaryColor"
            : isInstructor
              ? "bg-naveBlue"
              : "bg-skycolor"
            } p-5 md:p-10 rounded-5 flex justify-center md:justify-between items-center flex-wrap gap-2`}
        >
          <div className="flex items-center flex-wrap justify-center sm:justify-start relative group">
            <div className="mr-10px lg:mr-5 relative">
              {/* <Image
                src={isInstructor || (isAdmin || isInstructor ? dashboardImage2 : teacherImage2)}
                alt="User profile"
                className="w-27 h-27 md:w-22 md:h-22 lg:w-27 lg:h-27 rounded-full p-1 border-2 border-darkdeep7 box-content"
              /> */}
              {
                userDetails && userDetails?.image ? (
                  <CldImage
                    width="200"
                    height="200"
                    src={image || (isAdmin || isInstructor ? dashboardImage2 : teacherImage2)}
                    alt="User profile"
                    className="w-27 h-27 md:w-22 md:h-22 lg:w-27 lg:h-27 rounded-full p-1 border-2 border-darkdeep7 box-content"
                  />
                ) : (
                  <Image
                    src={isInstructor || (isAdmin || isInstructor ? dashboardImage2 : teacherImage2)}
                    alt="User profile"
                    className="w-27 h-27 md:w-22 md:h-22 lg:w-27 lg:h-27 rounded-full p-1 border-2 border-darkdeep7 box-content"
                  />
                )
              }

              {/* Hidden input for file upload */}
              <CustomFileUpload setImageUrl={handleImageUpload} />
            </div>

            {isAdmin || isInstructor ? (
              <div className="text-whiteColor font-bold text-center sm:text-start">
                <h5 className="text-xl leading-1.2 mb-5px">Hello</h5>
                <h2 className="text-2xl leading-1.24">
                  {userDetails ? userDetails.name : <SkeletonResultsText />}
                </h2>
              </div>
            ) : (
              <div className="text-whiteColor font-bold text-center sm:text-start">
                <h5 className="text-2xl leading-1.24 mb-5px">
                  {userDetails ? userDetails.username : <SkeletonResultsText />}
                </h5>
                <ul className="flex items-center gap-15px">
                  <li className="text-sm font-normal flex items-center gap-0.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="feather feather-book-open mr-0.5"
                    >
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>{" "}
                    {userDetails?.enrolledCourses?.length || 0} Courses Enrolled
                  </li>
                  {/* <li className="text-sm font-normal flex items-center gap-0.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="feather feather-award"
                    >
                      <circle cx="12" cy="8" r="7"></circle>
                      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                    </svg>
                    {userDetails ? userDetails.certificates : 0} Certificates
                  </li> */}
                </ul>
              </div>
            )}
          </div>
          {isUploading && <p className="text-yellow">Uploading...</p>}
          {error && <p className="text-red-500">{error}</p>} {/* Display error message */}
          <div>


            {
              session?.user.roles[0] === "user" ? (
                <Link
                  href={`/courses`}
                  className={`text-size-15 border text-whiteColor   ${isAdmin
                    ? "bg-primaryColor border-whiteColor hover:text-primaryColor"
                    : isInstructor
                      ? "bg-primaryColor  border-primaryColor hover:text-primaryColor"
                      : "bg-secondaryColor border-secondaryColor hover:text-secondaryColor"
                    }  px-25px py-10px hover:bg-whiteColor rounded group text-nowrap flex gap-1 items-center`}
                >
                  {isAdmin || isInstructor
                    ? "Create a New Course"
                    : "Enroll A New Course "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-arrow-right"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              ) : (
                <Link
                  href={`/dashboards/create-course`}
                  className={`text-size-15 border text-whiteColor   ${isAdmin
                    ? "bg-primaryColor border-whiteColor hover:text-primaryColor"
                    : isInstructor
                      ? "bg-primaryColor  border-primaryColor hover:text-primaryColor"
                      : "bg-secondaryColor border-secondaryColor hover:text-secondaryColor"
                    }  px-25px py-10px hover:bg-whiteColor rounded group text-nowrap flex gap-1 items-center`}
                >
                  {isAdmin || isInstructor
                    ? "Create a New Course"
                    : "Enroll A New Course "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-arrow-right"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              )
            }

          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroDashboard;

{/* <div className="text-whiteColor mt-4 flex ml-auto">
{
  userDetails && userDetails.roles?.length > 0 && (
    <div>
      <DropdownSwitcher options={userDetails.roles} defaultOption={userDetails.roles[0]} />
    </div>
  )
}
</div> */}







// "use client";

// import dashboardImage2 from "@/assets/images/dashbord/dashbord__2.jpg";
// import teacherImage2 from "@/assets/images/teacher/teacher__2.png";
// import Image from "next/image";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useSession } from "next-auth/react";
// import { useEffect, useState } from "react";
// import { fetchUserDetailsFromApi } from "@/actions/getUser";

// const HeroDashboard = () => {
//   const pathname = usePathname();
//   const partOfPathNaem = pathname.split("/")[2].split("-")[0];
//   const isAdmin = partOfPathNaem === "admin" ? true : false;
//   const isInstructor = partOfPathNaem === "instructor" ? true : false;
//   const { data: session } = useSession();

//   const [userDetails, setUserDetails] = useState(null);

//   console.log("userDetails",userDetails)

//   useEffect(() => {
//     const fetchUserDetails = async () => {
//       if (session?.user?.id) {
//         try {
//           const userData = await fetchUserDetailsFromApi(session.user.id);
//           setUserDetails(userData);
//         } catch (error) {
//           console.error("Failed to fetch user details:", error);
//         }
//       }
//     };

//     fetchUserDetails();
//   }, [session]);

//   return (
//     <section>
//       <div className="container-fluid-2">
//         <div
//           className={`${
//             isAdmin
//               ? "bg-primaryColor"
//               : isInstructor
//               ? "bg-naveBlue"
//               : "bg-skycolor"
//           } p-5 md:p-10 rounded-5 flex justify-center md:justify-between items-center flex-wrap gap-2`}
//         >
//           <div className="flex items-center flex-wrap justify-center sm:justify-start">
//             <div className="mr-10px lg:mr-5">
//               <Image
//                 src={isAdmin || isInstructor ? dashboardImage2 : teacherImage2}
//                 alt=""
//                 className="w-27 h-27 md:w-22 md:h-22 lg:w-27 lg:h-27 rounded-full p-1 border-2 border-darkdeep7 box-content"
//               />
//             </div>
//             {isAdmin || isInstructor ? (
//               <div className="text-whiteColor font-bold text-center sm:text-start">
//                 <h5 className="text-xl leading-1.2 mb-5px">Hello</h5>
//                 <h2 className="text-2xl leading-1.24">
//                   {userDetails ? userDetails.name : "Loading..."}
//                 </h2>
//               </div>
//             ) : (
//               <div className="text-whiteColor font-bold text-center sm:text-start">
//                 <h5 className="text-2xl leading-1.24 mb-5px">
//                   {userDetails ? userDetails.username : "Loading..."}
//                 </h5>
//                 <ul className="flex items-center gap-15px">
//                   <li className="text-sm font-normal flex items-center gap-0.5">
// <svg
//   xmlns="http://www.w3.org/2000/svg"
//   width="18"
//   height="18"
//   viewBox="0 0 24 24"
//   fill="none"
//   stroke="currentColor"
//   strokeWidth="2"
//   strokeLinecap="round"
//   strokeLinejoin="round"
//   className="feather feather-book-open mr-0.5"
// >
//   <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
//   <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
// </svg>{" "}
//                     {userDetails ? userDetails.coursesEnrolled : 0} Courses Enroled
//                   </li>
//                   <li className="text-sm font-normal flex items-center gap-0.5">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       width="18"
//                       height="18"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       className="feather feather-award"
//                     >
//                       <circle cx="12" cy="8" r="7"></circle>
//                       <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
//                     </svg>
//                     {userDetails ? userDetails.certificates : 0} Certificate
//                   </li>
//                 </ul>
//               </div>
//             )}
//           </div>
//           {isAdmin || isInstructor ? (
//             <div className="text-center">
//               <div className="text-yellow">
//                 {" "}
//                 <i className="icofont-star"></i>{" "}
//                 <i className="icofont-star"></i>{" "}
//                 <i className="icofont-star"></i>{" "}
//                 <i className="icofont-star"></i>{" "}
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="16"
//                   height="24"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   className="feather feather-star inline-block"
//                 >
//                   <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
//                 </svg>
//               </div>
//               <p className="text-whiteColor">4.0 (120 Reviews)</p>
//             </div>
//           ) : (
//             ""
//           )}
//           <div>
//             <Link
//               href={`/courses`}
//               className={`text-size-15 border text-whiteColor   ${
//                 isAdmin
//                   ? "bg-primaryColor border-whiteColor hover:text-primaryColor  "
//                   : isInstructor
//                   ? "bg-primaryColor  border-primaryColor hover:text-primaryColor "
//                   : "bg-secondaryColor border-secondaryColor hover:text-secondaryColor"
//               }  px-25px py-10px hover:bg-whiteColor rounded group text-nowrap flex gap-1 items-center`}
//             >
//               {isAdmin || isInstructor
//                 ? " Create a New Course"
//                 : "Enroll A New Course "}
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="24"
//                 height="24"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 className="feather feather-arrow-right"
//               >
//                 <line x1="5" y1="12" x2="19" y2="12"></line>
//                 <polyline points="12 5 19 12 12 19"></polyline>
//               </svg>
//             </Link>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default HeroDashboard;
