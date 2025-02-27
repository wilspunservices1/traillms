// src/components/icons/RefreshIcon.tsx

import React from 'react';

interface RefreshIconProps {
  size?: number | string;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

const RefreshIcon: React.FC<RefreshIconProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
  ariaLabel,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
    >
      <path
        d="M202.238 167.072c.974-1.973 3.388-2.796 5.372-1.847l7.893 3.775s-22.5 53.5-85.5 56c-60-1.5-96.627-48.626-97-96.5-.373-47.874 37-95.5 95.5-96 57.5-1 79.555 45.004 79.555 45.004 1.074 1.93 1.945 1.698 1.945-.501V51.997a4 4 0 0 1 4-3.997h6.5c2.209 0 4 1.8 4 4.008v48.984a3.998 3.998 0 0 1-3.998 4.008H170a3.995 3.995 0 0 1-3.998-3.993v-6.014c0-2.205 1.789-4.02 4.007-4.053l25.485-.38c2.213-.033 3.223-1.679 2.182-3.628 0 0-18.174-41.932-68.674-41.432-49 .5-82.751 41.929-82.5 83.242 3 55.258 45 82.258 83.5 81.258 54.5 0 72.235-42.928 72.235-42.928z"
        fill={color}
        fillRule="evenodd"
      />
    </svg>
  );
};

export default RefreshIcon;
