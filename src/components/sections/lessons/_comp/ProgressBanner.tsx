"use client";

import React from "react";
import CircularProgress from "./CircularProgress";

interface ProgressBannerProps {
  progress: number; // Progress percentage (0-100)
  completedLectures: number;
  totalLectures: number;
}

const ProgressBanner: React.FC<ProgressBannerProps> = ({
  progress,
  completedLectures,
  totalLectures,
}) => {
  return (
    <div className="flex items-center justify-between bg-gray-100 p-6 rounded-lg shadow-md">
      {/* Circular Progress */}
      <CircularProgress progress={progress} size={120} />

      {/* Completion Counter */}
      <div className="text-center">
        <h3 className="text-xl font-semibold">Course Progress</h3>
        <p className="text-lg">
          {completedLectures}/{totalLectures} Lectures Completed
        </p>
      </div>
    </div>
  );
};

export default ProgressBanner;
