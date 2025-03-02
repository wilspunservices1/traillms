import React from "react";

// SkeletonResultsText Component
const SkeletonResultsText = () => {
  return (
    <div className="w-full h-5 bg-gray-300 relative overflow-hidden rounded px-70px py-10px inline-block">
      <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300"></div>
    </div>
  );
};

export default SkeletonResultsText;
