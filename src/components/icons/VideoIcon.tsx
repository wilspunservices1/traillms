// src/components/icons/VideoIcon.tsx

import React from 'react';

interface VideoIconProps {
  size?: number | string;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

const VideoIcon: React.FC<VideoIconProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
  ariaLabel,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke={color}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
    >
      <path
        d="M15 10l4.553-2.276A1 1 0 0121 8v8a1 1 0 01-1.447.894L15 14M5 9V5a2 2 0 012-2h8a2 2 0 012 2v4M5 9l7 3 7-3"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default VideoIcon;
