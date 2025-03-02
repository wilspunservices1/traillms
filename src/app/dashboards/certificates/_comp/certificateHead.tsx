import React from 'react';
import { DocumentIcon } from '@/components/icons';
import DotLoader from '@/components/sections/create-course/_comp/Icons/DotLoader';

interface CertificateHeadProps {
  certificateTitle: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  showButton?: boolean;
  buttonColor?: string;
  buttonHoverColor?: string;
  iconSize?: number;
  isLoading?: boolean;
}

const CertificateHead: React.FC<CertificateHeadProps> = ({
  certificateTitle,
  buttonLabel = 'Save',
  onButtonClick,
  showButton = true,
  buttonColor = 'bg-blue',
  buttonHoverColor = 'bg-blueDark',
  iconSize = 16,
  isLoading = false,
}) => {
  return (
    <div className="mb-6 pb-5 flex items-center border-b-2 border-borderColor dark:border-borderColor-dark">
      <h2 className="text-2xl font-bold text-blackColor dark:text-blackColor-dark">
        {certificateTitle}
      </h2>
      
      {showButton && (
        <button
          onClick={onButtonClick}
          className={`flex items-center justify-center space-x-2 ${buttonColor} hover:${buttonHoverColor} px-5 py-2 rounded-full text-white font-medium transition-all duration-150 ease-in-out shadow-md ml-4`}
          disabled={isLoading}
          style={{ minWidth: '90px' }}  // Sets a minimum width for button to prevent shrinking
        >
          <DocumentIcon size={iconSize} color="white" />
          {isLoading ? (
            <DotLoader className="w-2 h-2 bg-white" containerClassName="p-0" />
          ) : (
            <span>{buttonLabel}</span>
          )}
        </button>
      )}
    </div>
  );
};

export default CertificateHead;
