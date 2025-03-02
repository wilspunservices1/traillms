import React from "react";

const LessonRightSkeleton = () => {
  return (
    <div className="xl:col-start-5 xl:col-span-8 relative" data-aos="fade-up">
      <div>
        {/* Skeleton for Title and Close button */}
        <div className="absolute top-0 left-0 w-full flex justify-between items-center px-5 py-10px bg-gray-300 animate-pulse rounded-lg">
          <div className="w-2/3 h-6 bg-gray-400 rounded animate-pulse"></div>
          <div className="w-1/5 h-6 bg-gray-400 rounded animate-pulse"></div>
        </div>

        {/* Skeleton for Video Area */}
        <div className="relative w-full pt-[30%] h-0 pb-[56.25%] bg-gray-200 animate-pulse flex items-center justify-center rounded-lg mt-10">
          <div className="bg-gray-300 rounded-full p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-12 h-12 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.752 11.168l-4.568 2.647a1 1 0 010-1.731l4.568-2.647A1 1 0 0116 10v4a1 1 0 01-1.248.968z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonRightSkeleton;
