// TabsButton.tsx
'use client';
import React from 'react';

interface TabsButtonProps {
  name: string;
  idx: number;
  currentIdx: number;
  handleTabClick: (idx: number) => void;
  disabled?: boolean;
}

const TabsButton: React.FC<TabsButtonProps> = ({
  name,
  idx,
  currentIdx,
  handleTabClick,
  disabled = false,
}) => {
  return (
    <li className="mr-2">
      <button
        onClick={() => handleTabClick(idx)}
        disabled={disabled}
        className={`inline-block p-4 border-b-2 hover:border-b-primaryColor rounded-t-lg ${
          idx === currentIdx
            ? 'text-blackColor  border-b-2 border-b-primaryColor  shadow-overview-button dark:bg-whiteColor-dark dark:text-blackColor-dark whitespace-nowrap before:w-0t'
            : 'border-transparent text-gray-500  hover:text-gray-600 hover:border-primaryColor dark:text-gray-400 dark:hover:text-gray-300'
        } ${disabled ? 'cursor-not-allowed text-gray-400 dark:text-gray-500' : ''}`}
      >
        {name}
      </button>
    </li>
  );
};

export default TabsButton;
