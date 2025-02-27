"use client"
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CldImage } from 'next-cloudinary';

const InstructorContent = ({ id }) => {
  // State to store instructor data
  const [instructorData, setInstructorData] = useState(null);

  // Fetch the data from the API
  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        const response = await fetch(`/api/courses/${id}/instructor`);
        const data = await response.json();
        if (data.success) {
          setInstructorData(data.data);
        }
      } catch (error) {
        console.error("Error fetching instructor data:", error);
      }
    };

    fetchInstructorData();
  }, [id]);

  // If instructor data is not yet available, show a loading state
  if (!instructorData) {
    return <p>Loading instructor information...</p>;
  }

  const { course, instructor, socials } = instructorData;

  console.log("instructor",instructor)

  return (
    <div>
      <div
        className="p-5 md:p-30px lg:p-5 2xl:p-30px mb-30px flex flex-col md:flex-row shadow-autor"
        data-aos="fade-up"
      >
        {/* Instructor avatar */}
        <div className="flex mb-30px mr-5 flex-shrink-0">
          <CldImage
            className="w-24 h-24 rounded-full"
            width="600"
            height="600"
            alt=""
            src={instructor?.image ? instructor.image : "/"}
            sizes={"60w"}
          />
        </div>
        <div>
          {/* Instructor name */}
          <div className="mb-3">
            <h3 className="mb-7px">
              <Link
                href={`/instructors/${id}`}
                className="text-xl font-bold text-blackColor2 dark:text-blackColor2-dark hover:text-primaryColor dark:hover:text-primaryColor"
              >
                {instructor.name ? instructor.name : "Unknown Instructor"}
              </Link>
            </h3>
            <p className="text-xs text-contentColor2 dark:text-contentColor2-dark">
              {course?.title || "Instructor Designation"}
            </p>
          </div>
          {/* Description */}
          <p className="text-sm text-contentColor dark:text-contentColor-dark mb-15px leading-26px">
            {course?.description.replace(/<\/?[^>]+(>|$)/g, "") || "No description available."}
          </p>
          {/* Social Links */}
          <div>
            <ul className="flex gap-10px items-center">
              <li>
                <a
                  href={socials?.facebook || "#"}
                  className="w-35px h-35px leading-35px text-center border border-borderColor2 text-contentColor hover:text-whiteColor hover:bg-primaryColor dark:text-contentColor-dark dark:hover:text-whiteColor dark:hover:bg-primaryColor dark:border-borderColor2-dark rounded"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="icofont-facebook"></i>
                </a>
              </li>
              <li>
                <a
                  href={socials?.youtube || "#"}
                  className="w-35px h-35px leading-35px text-center border border-borderColor2 text-contentColor hover:text-whiteColor hover:bg-primaryColor dark:text-contentColor-dark dark:hover:text-whiteColor dark:hover:bg-primaryColor dark:border-borderColor2-dark rounded"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="icofont-youtube-play"></i>
                </a>
              </li>
              <li>
                <a
                  href={socials?.instagram || "#"}
                  className="w-35px h-35px leading-35px text-center border border-borderColor2 text-contentColor hover:text-whiteColor hover:bg-primaryColor dark:text-contentColor-dark dark:hover:text-whiteColor dark:hover:bg-primaryColor dark:border-borderColor2-dark rounded"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="icofont-instagram"></i>
                </a>
              </li>
              <li>
                <a
                  href={socials?.twitter || "#"}
                  className="w-35px h-35px leading-35px text-center border border-borderColor2 text-contentColor hover:text-whiteColor hover:bg-primaryColor dark:text-contentColor-dark dark:hover:text-whiteColor dark:hover:bg-primaryColor dark:border-borderColor2-dark rounded"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="icofont-twitter"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorContent;


// import Image from "next/image";
// import Link from "next/link";
// import getAllCourses from "@/libs/getAllCourses";
// import getAllInstructors from "@/libs/getAllInstructors";

// const InstructorContent = ({ id }) => {
//   const { image, desig } = getAllInstructors()?.find(
//     ({ id: idx }) => idx === id
//   );
//   const { insName } = getAllCourses()?.find(({ id: idx }) => idx === id);

//   return (
//     <div>
//       <div
//         className="p-5 md:p-30px lg:p-5 2xl:p-30px mb-30px flex flex-col md:flex-row shadow-autor"
//         data-aos="fade-up"
//       >
//         {/* athor avatar  */}
//         <div className="flex mb-30px mr-5 flex-shrink-0">
//           <Image
//             src={image}
//             alt=""
//             className="w-24 h-24 rounded-full"
//             placeholder="blur"
//           />
//         </div>
//         <div>
//           {/* author name  */}
//           <div className="mb-3">
//             <h3 className="mb-7px">
//               <Link
//                 href={`/instructors/${id}`}
//                 className="text-xl font-bold text-blackColor2 dark:text-blackColor2-dark hover:text-primaryColor dark:hover:text-primaryColor"
//               >
//                 {insName ? insName : " Mehar Ali"}
//               </Link>
//             </h3>
//             <p className="text-xs text-contentColor2 dark:text-contentColor2-dark">
//               Blogger/Photographer
//             </p>
//           </div>
//           {/* description  */}
//           <p className="text-sm text-contentColor dark:text-contentColor-dark mb-15px leading-26px">
//              Experience the power and flexibility of our cloud-based <br></br>
//                Learning Management System (LMS), trusted by over 1,000 organizations globally. and typesetting
//             industry. Lorem Ipsum has been the
//             {"industry's"} standard dummy text ever since the 1500s, when an
//             unknown printer took a galley
//           </p>
//           {/* social  */}
//           <div>
//             <ul className="flex gap-10px items-center">
//               <li>
//                 <a
//                   href="https://www.facebook.com/"
//                   className="w-35px h-35px leading-35px text-center border border-borderColor2 text-contentColor hover:text-whiteColor hover:bg-primaryColor dark:text-contentColor-dark dark:hover:text-whiteColor dark:hover:bg-primaryColor dark:border-borderColor2-dark rounded"
//                 >
//                   <i className="icofont-facebook"></i>
//                 </a>
//               </li>
//               <li>
//                 <a
//                   href="https://www.youtube.com/"
//                   className="w-35px h-35px leading-35px text-center border border-borderColor2 text-contentColor hover:text-whiteColor hover:bg-primaryColor dark:text-contentColor-dark dark:hover:text-whiteColor dark:hover:bg-primaryColor dark:border-borderColor2-dark rounded"
//                 >
//                   <i className="icofont-youtube-play"></i>
//                 </a>
//               </li>
//               <li>
//                 <a
//                   href="https://www.instagram.com/"
//                   className="w-35px h-35px leading-35px text-center border border-borderColor2 text-contentColor hover:text-whiteColor hover:bg-primaryColor dark:text-contentColor-dark dark:hover:text-whiteColor dark:hover:bg-primaryColor dark:border-borderColor2-dark rounded"
//                 >
//                   <i className="icofont-instagram"></i>
//                 </a>
//               </li>
//               <li>
//                 <a
//                   href="https://x.com/"
//                   className="w-35px h-35px leading-35px text-center border border-borderColor2 text-contentColor hover:text-whiteColor hover:bg-primaryColor dark:text-contentColor-dark dark:hover:text-whiteColor dark:hover:bg-primaryColor dark:border-borderColor2-dark rounded"
//                 >
//                   <i className="icofont-twitter"></i>
//                 </a>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InstructorContent;
