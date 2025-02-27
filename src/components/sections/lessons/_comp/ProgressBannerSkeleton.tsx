"use client";

import React from "react";

const ProgressBannerSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-between bg-gray-100 p-6 rounded-lg shadow-md animate-pulse">
      {/* Circular Skeleton for Progress */}
      <div className="w-24 h-24 bg-gray-300 rounded-full"></div>

      {/* Placeholder for Completion Counter */}
      <div className="flex-1 ml-6">
        <div className="w-36 h-6 bg-gray-300 rounded mb-2"></div>
        <div className="w-24 h-6 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
};

export default ProgressBannerSkeleton;
