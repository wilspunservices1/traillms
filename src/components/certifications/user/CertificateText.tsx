// src/components/CertificateText.tsx

import React from 'react';
import { Text } from 'react-konva';
import { replacePlaceholders } from '@/utils/replacePlaceholders'; // Utility function for replacing

interface CertificateTextProps {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fill: string;
  userData: {
    course: string;
    name: string;
    date: string;
  };
}

const CertificateText: React.FC<CertificateTextProps> = ({ text, x, y, fontSize, fontFamily, fill, userData }) => {
  return (
    <Text
      text={replacePlaceholders(text, userData)} // Pass the userData argument here
      x={x}
      y={y}
      fontSize={fontSize}
      fontFamily={fontFamily}
      fill={fill}
    />
  );
};

export default CertificateText;
