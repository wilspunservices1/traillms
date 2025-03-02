// src/components/icons/EmptyIcon.tsx

import React from 'react';

interface EmptyIconProps {
  /**
   * The width and height of the icon. Defaults to 24px.
   */
  size?: number | string;
  
  /**
   * The stroke color of the icon. Defaults to currentColor.
   */
  color?: string;
  
  /**
   * Additional CSS classes for styling.
   */
  className?: string;
  
  /**
   * Accessibility label. If not provided, aria-hidden is set to true.
   */
  ariaLabel?: string;
}

const EmptyIcon: React.FC<EmptyIconProps> = ({
  size = 30,
  color = 'currentColor',
  className = '',
  ariaLabel,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-0.5 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke={color}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
    >
      <path
        d="M21 6H3C2.72 6 2.5 6.22 2.5 6.5V14.5C2.5 14.78 2.72 15 3 15H5.5V19L9.5 15H21C21.28 15 21.5 14.78 21.5 14.5V6.5C21.5 6.23 21.28 6 21 6Z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default EmptyIcon;
