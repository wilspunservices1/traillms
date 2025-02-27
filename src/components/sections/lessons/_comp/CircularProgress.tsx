// src/components/CircularProgress.tsx

"use client";

import React from "react";

interface CircularProgressProps {
  progress: number; // Progress percentage (0-100)
  size?: number; // Diameter of the circle in pixels
  strokeWidth?: number; // Width of the circle stroke
  color?: string; // Color of the progress stroke
  backgroundColor?: string; // Color of the background circle
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 100,
  strokeWidth = 10,
  color = "#4ade80", // Tailwind's green-400
  backgroundColor = "#d1d5db", // Tailwind's gray-300
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size}>
      {/* Background Circle */}
      <circle
        stroke={backgroundColor}
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      {/* Progress Circle */}
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
      {/* Text in the center */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fontSize="1em"
        fill="#000"
      >
        {progress}%
      </text>
    </svg>
  );
};

export default CircularProgress;
