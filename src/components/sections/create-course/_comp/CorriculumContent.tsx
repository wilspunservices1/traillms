"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Chapter, Lecture } from "@/types/type";
import DotLoader from "./Icons/DotLoader";

interface CurriculumContentProps {
  chapters: Chapter[];
  onEditLecture?: (lecture: Lecture, index: number) => void; // Updated to pass lecture and index
  removeLecture: (index: number) => void;
  loading: boolean;
}

const CurriculumContent: React.FC<CurriculumContentProps> = ({
  chapters,
  onEditLecture,
  removeLecture,
  loading,
}) => {
  const [loadingLectureId, setLoadingLectureId] = useState<string | null>(null); // Track which lecture is being removed

  const handleRemoveLecture = (lectureId: string, idx: number) => {
    setLoadingLectureId(lectureId); // Set the loading state for the specific lecture
    removeLecture(idx);
  };

  console.log(chapters); // Check if lecture object is valid
  console.log(chapters[0].lectures); // Check if duration exists and is valid

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow">
      <ul className="accordion-container curriculum">
        {chapters.map((chapter) => (
          <li key={chapter.id} className="mb-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
              {/* Chapter Header */}
              <div className="flex justify-between items-center text-lg font-semibold text-gray-900 dark:text-gray-100 p-4 rounded-t-md">
                <div className="flex items-center">
                  <span>{chapter.title}</span>
                  <p className="ml-4 px-3 py-1 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-full">
                    {chapter.duration}
                  </p>
                </div>
              </div>
              {/* Chapter Content */}
              <div className="p-4">
                <ul>
                  {chapter?.lectures?.filter(lecture => lecture !== undefined).map((lecture, idx) => (
                    <li
                      key={lecture.id} // Use lecture.id as the key
                      className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center">
                        <i className="icofont-video-alt h-7 w-7 mr-3 text-lg"></i>
                        <div>
                          <h4 className="text-md font-medium">
                            {lecture.title}
                          </h4>
                          <p className="text-md text-gray-500 dark:text-gray-400">
                            {lecture?.duration
                              ? `${lecture.duration} min`
                              : "Duration not available"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {lecture.isPreview && (
                          <Link
                            href={`/lessons/${lecture.id}`}
                            className="text-primary-600 hover:underline"
                          >
                            Preview
                          </Link>
                        )}
                        {lecture.isLocked && (
                          <i className="icofont-lock ml-3 text-gray-400"></i>
                        )}
                        {onEditLecture && (
                          <button
                            type="button"
                            onClick={() => onEditLecture(lecture, idx)} // Pass the lecture and index
                            className="text-blue-500 ml-3"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleRemoveLecture.bind(
                            null,
                            lecture.id,
                            idx
                          )}
                          className="text-red-500 ml-3"
                        >
                          {loadingLectureId === lecture.id ? (
                            <DotLoader />
                          ) : (
                            "Remove"
                          )}
                          {/* {loading ? <DotLoader /> : "Remove"} */}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CurriculumContent;

// import React from "react";
// import Link from "next/link";
// import { Chapter } from "@/types/type";
// import DotLoader from "./Icons/DotLoader";

// interface CurriculumContentProps {
//   chapters: Chapter[];
//   onEditLecture?: (index: number) => void; // Make onEditLecture optional
//   removeLecture: (index: number) => void;
//   loading : boolean
// }

// const CurriculumContent: React.FC<CurriculumContentProps> = ({
//   chapters,
//   onEditLecture,
//   removeLecture,
//   loading
// }) => {

//   return (
//     <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow">
//       <ul className="accordion-container curriculum">
//         {chapters.map((chapter) => (
//           <li key={chapter.id} className="mb-4">
//             <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
//               {/* Chapter Header */}
//               <div className="flex justify-between items-center text-lg font-semibold text-gray-900 dark:text-gray-100 p-4 rounded-t-md">
//                 <div className="flex items-center">
//                   <span>{chapter.name}</span>
//                   <p className="ml-4 px-3 py-1 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-full">
//                     {chapter.duration}
//                   </p>
//                 </div>
//               </div>
//               {/* Chapter Content */}
//               <div className="p-4">
//                 <ul>
//                   {chapter.lectures.map((lecture, idx) => (
//                     <li
//                       key={idx}
//                       className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700"
//                     >
//                       <div className="flex items-center">
//                         <i className="icofont-video-alt h-7 w-7 mr-3 text-lg"></i>
//                         <div>
//                           <h4 className="text-md font-medium">{lecture.title}</h4>
//                           <p className="text-md text-gray-500 dark:text-gray-400">
//                             {lecture.duration} min
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-center">
//                         {lecture.isPreview && (
//                           <Link
//                             href={"#"}
//                             className="text-primary-600 hover:underline"
//                           >
//                             Preview
//                           </Link>
//                         )}
//                         {lecture.isLocked && (
//                           <i className="icofont-lock ml-3 text-gray-400"></i>
//                         )}
//                         {onEditLecture && (
//                           <button
//                             type="button"
//                             onClick={() => onEditLecture(idx)}
//                             className="text-blue-500 ml-3"
//                           >
//                             Edit
//                           </button>
//                         )}
//                         <button
//                           type="button"
//                           onClick={() => removeLecture(idx)}
//                           className="text-red-500 ml-3"
//                         >
//                           {loading ? <DotLoader /> : "Remove"}
//                         </button>
//                       </div>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default CurriculumContent;
