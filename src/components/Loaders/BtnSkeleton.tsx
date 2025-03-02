import React from "react";

// SkeletonButton Component
const SkeletonButton = () => {
  return (
    <div className="w-full bg-gray-300 relative overflow-hidden rounded px-25px py-10px mb-10px inline-block">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer"></div>
    </div>
  );
};

export default SkeletonButton;

