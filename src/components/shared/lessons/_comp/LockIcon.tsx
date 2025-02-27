// src/components/icons/LockIcon.tsx

import React from 'react';

interface LockIconProps {
  size?: number | string;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

const LockIcon: React.FC<LockIconProps> = ({
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
        d="M12 17a2 2 0 100-4 2 2 0 000 4zM18 8h-1V6a6 6 0 10-12 0v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default LockIcon;
