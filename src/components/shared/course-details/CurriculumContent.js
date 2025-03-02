"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CurriculumContent = ({ chapters }) => {
  const [activeIndex, setActiveIndex] = useState(null); // Track the open accordion

  // Function to handle accordion toggle
  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index); // Close if already active, open otherwise
  };

  // Determine if a lecture is locked based on its index in the chapter (for Chapter 1 only)
  const isLockedLecture = (chapterIndex, lectureIndex) => {
    // For the first chapter (index 0), only the first two lectures are unlocked
    if (chapterIndex === 0) {
      return lectureIndex >= 2; // Lock lectures after the first two in Chapter 1
    }
    // All lectures in other chapters are locked
    return true;
  };

  return (
    <div className="w-full">
      <ul className="accordion-container curriculum">
        {chapters.map((chapter, chapterIndex) => (
          <li key={chapter.id} className="accordion mb-6 overflow-hidden">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div
                className="cursor-pointer accordion-controller flex justify-between items-center text-xl text-gray-800 dark:text-gray-200 font-bold w-full px-5 py-4 leading-[20px]"
                onClick={() => toggleAccordion(chapterIndex)} // Toggle accordion on click
              >
                <div className="flex items-center">
                  <span>{chapter.title}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 ml-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                    {chapter.duration || "N/A"}

                  </p>
                </div>
                <svg
                  className={`transition-all duration-500 ${activeIndex === chapterIndex ? "rotate-180" : "rotate-0"
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
              </div>

              {/* Only show this section if this accordion is active */}
              <div
                className={`accordion-content transition-all duration-500 ${activeIndex === chapterIndex ? "max-h-full" : "max-h-0"
                  } overflow-hidden`}
              >
                <div className="content-wrapper p-4 md:px-8">
                  <ul>
                    {chapter.lectures.map((lecture, lectureIndex) => (
                      <li
                        key={lecture.id}
                        className="py-4 flex items-center justify-between flex-wrap border-b border-gray-200 dark:border-gray-700"
                      >
                        <div>
                          <h4 className="text-gray-800 dark:text-gray-200 font-light">
                            <i className="icofont-video-alt mr-2"></i>
                            <span className="font-medium">{lecture.title}</span>
                          </h4>
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-sm flex items-center">
                          {/* Show duration only for unlocked videos */}
                          <p>
                            <i className="icofont-clock-time"></i>{" "}
                            {lecture.duration} min
                          </p>
                          {/* If the lecture is previewable and unlocked */}
                          {!isLockedLecture(chapterIndex, lectureIndex) ? (
                            <Link
                              href={`/lessons/${lecture.id}`}
                              className="bg-blue text-white text-sm ml-4 rounded py-1 px-2"
                            >
                              <i className="icofont-eye"></i> Preview
                            </Link>
                          ) : (
                            <p className="ml-4">
                              <i className="icofont-lock"></i>
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CurriculumContent;
