import React from "react";

// Shimmer effect
const ShimmerEffect = () => (
  <div className="animate-shimmer w-full h-full bg-gray-200 dark:bg-gray-600 rounded-md"></div>
);

// Accordion Skeleton
const AccordionSkeleton = () => {
  const skeletonChapters = Array.from({ length: 3 }, (_, index) => index); // Example 3 skeleton items

  return (
    <ul className="accordion-container curriculum">
      {skeletonChapters.map((_, index) => (
        <li key={index} className="accordion mb-25px overflow-hidden">
          <div className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-t-md">
            {/* Controller Skeleton */}
            <div className="flex justify-between items-center w-full px-5 py-18px">
              <div className="w-2/3 h-6 bg-gray-300 dark:bg-gray-500 rounded-md">
                <ShimmerEffect />
              </div>
              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-500 rounded-full">
                <ShimmerEffect />
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="accordion-content transition-all duration-500 max-h-screen" style={{ overflow: "hidden" }}>
              <div className="content-wrapper p-10px md:px-30px">
                {/* Simulating lessons within the accordion */}
                {Array.from({ length: 4 }).map((_, lessonIndex) => (
                  <div key={lessonIndex} className="mb-2">
                    <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-500 rounded-md">
                      <ShimmerEffect />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

// Shimmer Animation Styles (can be placed in a global stylesheet)
const shimmerAnimationStyles = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .animate-shimmer {
    background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0) 100%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
`;

export default AccordionSkeleton;
