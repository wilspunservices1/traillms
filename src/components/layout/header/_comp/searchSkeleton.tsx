import React from "react";

const Skeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-3 animate-pulse">
      {/* Image skeleton */}
      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
      {/* Text skeleton */}
      <div className="flex-1">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
      </div>
    </div>
  );
};

export default Skeleton;
