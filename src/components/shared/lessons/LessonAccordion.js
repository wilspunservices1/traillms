"use client";

import React, { useEffect, useState } from "react";
import LessonList from "./_comp/LessonList"; // Import the LessonList component
import Extras from "./_comp/Extras";
import AccordionSkeleton from "@/components/Loaders/AccordianSkel";
import { BASE_URL } from "@/actions/constant";

// Function to fetch chapters by chapterId
const fetchChaptersByChapterId = async (chapterId) => {
  try {
    const res = await fetch(`${BASE_URL}/api/courses/chapters/${chapterId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include credentials if needed
    });
    if (!res.ok) {
      throw new Error("Failed to fetch chapters");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return null;
  }
};

const LessonAccordion = ({
  chapterId,
  extra = null, // Default value if extra is not provided
  isEnrolled = false,
  courseOwnerId = "",
  userRoles = [], // Default to empty array to prevent undefined errors
}) => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(-1); // Initialize to -1 (no accordion open)

  // Determine user roles
  const isSuperAdmin = userRoles.includes("superAdmin");
  const isInstructor = userRoles.includes("instructor");
  const isCourseOwner = courseOwnerId !== "" && isInstructor;

  // Determine if the user can access all lessons
  const canAccessAll = isSuperAdmin || isEnrolled || isCourseOwner;

  useEffect(() => {
    const loadChapters = async () => {
      setLoading(true);
      const fetchedChapters = await fetchChaptersByChapterId(chapterId);
      if (fetchedChapters && fetchedChapters.chapters) {
        setChapters(fetchedChapters.chapters);
      } else {
        setChapters([]);
      }
      setLoading(false);
    };

    loadChapters();
  }, [chapterId]);

  // Toggle the active state of the accordion
  const toggleAccordion = (index) => {
    setActiveIndex((prevIndex) => (prevIndex === index ? -1 : index));
  };

  // Determine if Extras should be displayed outside LessonList
  const canAccessExtras = canAccessAll && extra;

  if (loading) {
    return (
      <div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark rounded-t-md">
        <AccordionSkeleton />
      </div>
    );
  }

  if (!chapters || chapters.length === 0) {
    return <p>No chapters available.</p>;
  }

  // Define a unique index for "Course Materials"
  const courseMaterialsIndex = chapters.length;

  return (
    <div>
      <ul className="accordion-container curriculum">
        {chapters.map((chapter, index) => (
          <li
            key={chapter.id}
            className={`accordion mb-25px overflow-hidden ${
              activeIndex === index ? "active" : ""
            }`}
          >
            <div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark rounded-t-md">
              {/* Controller */}
              <div>
                <button
                  className="accordion-controller flex justify-between items-center text-xl text-headingColor font-bold w-full px-5 py-18px dark:text-headingColor-dark font-hind leading-[20px]"
                  onClick={() => toggleAccordion(index)} // Handle accordion toggle
                  aria-expanded={activeIndex === index}
                  aria-controls={`chapter-content-${index}`}
                >
                  <span>{chapter.title}</span>

                  <svg
                    className={`transition-all duration-500 ${
                      activeIndex === index ? "rotate-180" : "rotate-0"
                    }`}
                    width="20"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="#212529"
                  >
                    <path
                      fillRule="evenodd"
                      d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                    ></path>
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div
                id={`chapter-content-${index}`}
                className={`accordion-content transition-all duration-500 ${
                  activeIndex === index ? "max-h-screen" : "max-h-0"
                }`}
                style={{ overflow: "hidden" }}
              >
                <div className="content-wrapper p-10px md:px-30px">
                  {/* Pass lessons to the LessonList component */}
                  <LessonList
                    lessons={chapter.lessons}
                    extras={extra}
                    isEnrolled={isEnrolled}
                    courseOwnerId={courseOwnerId}
                  />
                </div>
              </div>
            </div>
          </li>
        ))}

        {/* Course Materials */}
        {canAccessExtras && (
          <li
            className={`accordion mb-25px overflow-hidden ${
              activeIndex === courseMaterialsIndex ? "active" : ""
            }`}
          >
            <div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark rounded-t-md">
              <div>
                <button
                  className="accordion-controller flex justify-between items-center text-xl text-headingColor font-bold w-full px-5 py-18px dark:text-headingColor-dark font-hind leading-[20px]"
                  onClick={() => toggleAccordion(courseMaterialsIndex)} // Handle accordion toggle
                  aria-expanded={activeIndex === courseMaterialsIndex}
                  aria-controls={`course-materials-content-${courseMaterialsIndex}`}
                >
                  <span>Course Materials</span>
                  <svg
                    className={`transition-all duration-500 ${
                      activeIndex === courseMaterialsIndex ? "rotate-180" : "rotate-0"
                    }`}
                    width="20"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="#212529"
                  >
                    <path
                      fillRule="evenodd"
                      d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                    ></path>
                  </svg>
                </button>
              </div>
              {/* Content */}
              <div
                id={`course-materials-content-${courseMaterialsIndex}`}
                className={`accordion-content transition-all duration-500 ${
                  activeIndex === courseMaterialsIndex ? "max-h-screen" : "max-h-0"
                }`}
                style={{ overflow: "hidden" }}
              >
                <div className="content-wrapper p-10px md:px-30px">
                  <div className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
                    {/* Handle potential undefined access to chapters */}
                    {chapters[0] && <Extras lessonId={chapters[0].id} />}
                  </div>
                </div>
              </div>
            </div>
          </li>
        )}
      </ul>
    </div>
  );
};

export default LessonAccordion;




// "use client";

// import React, { useEffect, useState } from "react";
// import LessonList from "./_comp/LessonList"; // Import the LessonList component
// import Extras from "./_comp/Extras";
// import AccordionSkeleton from "@/components/Loaders/AccordianSkel";

// // Function to fetch chapters by chapterId
// const fetchChaptersByChapterId = async (chapterId) => {
//   try {
//     const res = await fetch(`/api/courses/chapters/${chapterId}`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       credentials: "include", // Include credentials if needed
//     });
//     if (!res.ok) {
//       throw new Error("Failed to fetch chapters");
//     }
//     const data = await res.json();
//     return data;
//   } catch (error) {
//     console.error("Error fetching chapters:", error);
//     return null;
//   }
// };

// const LessonAccordion = ({
//   chapterId,
//   extra = null, // Default value if extra is not provided
//   isEnrolled = false,
//   courseOwnerId = "",
//   userRoles = [], // Default to empty array to prevent undefined errors
// }) => {
//   const [chapters, setChapters] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeIndex, setActiveIndex] = useState(0); // State to track active accordion (default is 0 for first chapter)

//   // Ensure userRoles is an array before checking roles
//   const isSuperAdmin = Array.isArray(userRoles) && userRoles.includes("superAdmin");
//   const isInstructor = Array.isArray(userRoles) && userRoles.includes("instructor");
//   const isCourseOwner = courseOwnerId !== "" && isInstructor;

//   // Determine if the user can access all lessons
//   const canAccessAll = isSuperAdmin || isEnrolled || isCourseOwner;

//   useEffect(() => {
//     const loadChapters = async () => {
//       setLoading(true);
//       const fetchedChapters = await fetchChaptersByChapterId(chapterId);
//       if (fetchedChapters && fetchedChapters.chapters) {
//         setChapters(fetchedChapters.chapters);
//       } else {
//         setChapters([]);
//       }
//       setLoading(false);
//     };

//     loadChapters();
//   }, [chapterId]);

//   // Toggle the active state of the accordion
//   const toggleAccordion = (index) => {
//     if (activeIndex === index) {
//       setActiveIndex(-1); // Close the active accordion if it's already open
//     } else {
//       setActiveIndex(index); // Open the clicked accordion
//     }
//   };

//   // Determine if Extras should be displayed outside LessonList
//   const canAccessExtras = canAccessAll && extra;

//   if (loading) {
//     return (
//       <div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark rounded-t-md">
//         <AccordionSkeleton />
//       </div>
//     );
//   }

//   if (!chapters || chapters.length === 0) {
//     return <p>No chapters available.</p>;
//   }

//   return (
//     <div>
//       <ul className="accordion-container curriculum">
//         {chapters.map((chapter, index) => (
//           <li
//             key={chapter.id}
//             className={`accordion mb-25px overflow-hidden ${activeIndex === index ? "active" : ""}`}
//           >
//             <div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark rounded-t-md">
//               {/* Controller */}
//               <div>
//                 <button
//                   className="accordion-controller flex justify-between items-center text-xl text-headingColor font-bold w-full px-5 py-18px dark:text-headingColor-dark font-hind leading-[20px]"
//                   onClick={() => toggleAccordion(index)} // Handle accordion toggle
//                 >
//                   <span>{chapter.title}</span>

//                   <svg
//                     className={`transition-all duration-500 ${activeIndex === index ? "rotate-180" : "rotate-0"}`}
//                     width="20"
//                     xmlns="http://www.w3.org/2000/svg"
//                     viewBox="0 0 16 16"
//                     fill="#212529"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
//                     ></path>
//                   </svg>
//                 </button>
//               </div>

//               {/* Content */}
//               <div
//                 className={`accordion-content transition-all duration-500 ${activeIndex === index ? "max-h-screen" : "max-h-0"
//                   }`}
//                 style={{ overflow: "hidden" }}
//               >
//                 <div className="content-wrapper p-10px md:px-30px">
//                   {/* Pass lessons to the LessonList component */}
//                   <LessonList
//                     lessons={chapter.lessons}
//                     extras={extra}
//                     isEnrolled={isEnrolled}
//                     courseOwnerId={courseOwnerId}
//                   />
//                 </div>
//               </div>
//             </div>
//           </li>
//         ))}
//       </ul>
//       {canAccessExtras && (
//         <div className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
//           {/* Handle potential undefined access to chapters */}
//           {chapters[0] && <Extras lessonId={chapters[0]?.id} />}
//         </div>
//       )}
//     </div>
//   );
// };

// export default LessonAccordion;



// "use client";

// import accordions from "@/libs/accordions";
// import React, { useEffect, useState } from "react";
// import LessonList from "./_comp/LessonList"; // Import the LessonList component
// import Extras from "./_comp/Extras";
// import AccordionSkeleton from "@/components/Loaders/AccordianSkel";

// // Function to fetch chapters by chapterId
// const fetchChaptersByChapterId = async (chapterId) => {
//   try {
//     const res = await fetch(`/api/courses/chapters/${chapterId}`);
//     if (!res.ok) {
//       throw new Error("Failed to fetch chapters");
//     }
//     const data = await res.json();
//     return data;
//   } catch (error) {
//     console.error("Error fetching chapters:", error);
//     return [];
//   }
// };

// const LessonAccordion = ({ chapterId, extra }) => {
//   const [chapters, setChapters] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeIndex, setActiveIndex] = useState(0); // State to track active accordion (default is 0 for first chapter)

//   useEffect(() => {
//     const loadChapters = async () => {
//       setLoading(true);
//       const fetchedChapters = await fetchChaptersByChapterId(chapterId);
//       setChapters(fetchedChapters?.chapters);
//       setLoading(false);
//     };

//     loadChapters();
//     accordions(); // Initialize accordions for the UI
//   }, [chapterId]);

//   // Toggle the active state of the accordion
//   const toggleAccordion = (index) => {
//     if (activeIndex === index) {
//       setActiveIndex(-1); // Close the active accordion if it's already open
//     } else {
//       setActiveIndex(index); // Open the clicked accordion
//     }
//   };

//   if (!chapters || chapters.length === 0) {
//     return <p>No chapters available.</p>;
//   }

//   return (
//     <div>
//       <ul className="accordion-container curriculum">
//         {loading && (
//           <li className="accordion mb-25px overflow-hidden active">
//             <div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark rounded-t-md">
//               <AccordionSkeleton />
//             </div>
//           </li>
//         )}

//         {!loading &&
//           chapters.map((chapter, index) => (
//             <li
//               key={chapter.id}
//               className={`accordion mb-25px overflow-hidden ${activeIndex === index ? "active" : ""}`}
//             >
//               <div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark rounded-t-md">
//                 {/* Controller */}
//                 <div>
//                   <button
//                     className="accordion-controller flex justify-between items-center text-xl text-headingColor font-bold w-full px-5 py-18px dark:text-headingColor-dark font-hind leading-[20px]"
//                     onClick={() => toggleAccordion(index)} // Handle accordion toggle
//                   >
//                     <span>{chapter.title}</span>

//                     <svg
//                       className={`transition-all duration-500 ${activeIndex === index ? "rotate-180" : "rotate-0"}`}
//                       width="20"
//                       xmlns="http://www.w3.org/2000/svg"
//                       viewBox="0 0 16 16"
//                       fill="#212529"
//                     >
//                       <path
//                         fillRule="evenodd"
//                         d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
//                       ></path>
//                     </svg>
//                   </button>
//                 </div>

//                 {/* Content */}
//                 <div
//                   className={`accordion-content transition-all duration-500 ${
//                     activeIndex === index ? "max-h-screen" : "max-h-0"
//                   }`}
//                   style={{ overflow: "hidden" }}
//                 >
//                   <div className="content-wrapper p-10px md:px-30px">
//                     {/* Pass lessons to the LessonList component */}
//                     <LessonList lessons={chapter.lessons} />
//                   </div>
//                 </div>
//               </div>
//             </li>
//           ))}
//       </ul>
//       <div className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark">
//         <Extras lessonId={chapters[0]?.id} />
//       </div>
//     </div>
//   );
// };

// export default LessonAccordion;

