// src/components/UserCertificate.tsx

import React, { useEffect, useState } from 'react';
// import { Stage, Layer } from 'react-konva';
import dynamic from 'next/dynamic';
import { TextElement, ImageElement } from '@/types/type';
import DraggableText from '../DraggableText'; // Adjusted import path
import DraggableImage from '../DraggableImage'; // Adjusted import path
import { replacePlaceholders } from '@/utils/replacePlaceholders';

interface UserCertificateProps {
  certificateId: string; // The ID of the certificate template
  userData: { name: string; course: string; date: string; achievement?: string }; // User-specific data for placeholders
}

const UserCertificate: React.FC<UserCertificateProps> = ({ certificateId, userData }) => {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [texts, setTexts] = useState<TextElement[]>([]);
  const [images, setImages] = useState<ImageElement[]>([]);
  const Stage = dynamic(
    () => import("react-konva").then((mod) => mod.Stage),
    { ssr: false }
  );
  const Layer = dynamic(
    () => import("react-konva").then((mod) => mod.Layer),
    { ssr: false }
  );
  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await fetch(`/api/certificates/${certificateId}`);
        const data = await response.json();

        if (response.ok) {
          setBackgroundImage(data.backgroundImage || null);
          setTexts(data.texts || []);
          setImages(data.images || []);
        } else {
          console.error('Failed to fetch certificate:', data.message);
        }
      } catch (error) {
        console.error('Error fetching certificate:', error);
      }
    };

    fetchCertificate();
  }, [certificateId]);

  const getReplacedText = (text: string): string => {
    return replacePlaceholders(text, userData);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Stage width={800} height={600} className="border">
        <Layer>
          {backgroundImage && (
            <DraggableImage
              image={{ id: 'background', src: backgroundImage, x: 0, y: 0, width: 800, height: 600 }}
              isSelected={false}
              onSelect={() => {}}
              setImages={() => {}}
              images={images}
              containerWidth={800}
              containerHeight={600}
            />
          )}
          {images.map((image) => (
            <DraggableImage
              key={image.id}
              image={image}
              isSelected={false}
              onSelect={() => {}}
              setImages={() => {}}
              images={images}
              containerWidth={800}
              containerHeight={600}
            />
          ))}
          {texts.map((text) => (
            <DraggableText
              key={text.id}
              text={{ ...text, text: getReplacedText(text.text) }}
              isSelected={false}
              onSelect={() => {}}
              setTexts={() => {}}
              texts={texts}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default UserCertificate;
