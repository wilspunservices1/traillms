// src/components/icons/EyeIcon.tsx

import React from 'react';

interface EyeIconProps {
  size?: number | string;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

const EyeIcon: React.FC<EyeIconProps> = ({
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
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default EyeIcon;
