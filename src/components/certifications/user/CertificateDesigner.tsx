// src/components/CertificateDesigner.tsx

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Transformer } from 'react-konva';
import { v4 as uuidv4 } from 'uuid';
import { TextElement, ImageElement } from '@/types/type';
import DraggableText from '../DraggableText'; // Component for draggable text
import DraggableImage from '../DraggableImage'; // Component for draggable images
import { replacePlaceholders } from '@/utils/replacePlaceholders'; // Utility function for replacing placeholders
import { useSession } from 'next-auth/react';
import 'react-toastify/dist/ReactToastify.css';
import { Session } from 'next-auth';
import useSweetAlert from '@/hooks/useSweetAlert';

interface CertificateDesignerProps {
  backgroundImage: string; // The background image for the certificate
  userData: { name: string; course: string; date: string }; // Data for placeholders
}

const CertificateDesigner: React.FC<CertificateDesignerProps> = ({ backgroundImage, userData }) => {
  const { data: session } = useSession() as { data: Session | null };
  const [texts, setTexts] = useState<TextElement[]>([]);
  const [images, setImages] = useState<ImageElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const showAlert = useSweetAlert()

  // Check if user is an instructor
  const isInstructor = session?.user === 'instructor';

  // Add Text Element
  const addText = () => {
    const newText: TextElement = {
      id: uuidv4(),
      text: 'Your Text Here',
      x: 50,
      y: 50,
      fontSize: 24,
      fontFamily: 'Arial',
      fill: '#000000',
    };
    setTexts([...texts, newText]);
    showAlert('info','New text element added.');
  };

  // Add Image Element
  const addImage = (src: string) => {
    const newImage: ImageElement = {
      id: uuidv4(),
      src,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
    };
    setImages([...images, newImage]);
    showAlert('info','New image element added.');
  };

  // Handle Selection
  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  // Replace Placeholders with Actual Data
  const getReplacedText = (text: string): string => {
    return replacePlaceholders(text, userData);
  };

  // Handle Stage Mouse Down (Deselect Elements)
  const handleStageMouseDown = (e: any) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
    }
  };

  // Attach transformer when selected
  useEffect(() => {
    if (selectedId) {
      const selectedNode = stageRef.current.findOne(`#${selectedId}`);
      trRef.current.nodes([selectedNode]);
      trRef.current.getLayer().batchDraw();
    } else {
      trRef.current.nodes([]);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedId]);

  if (!isInstructor) {
    return <div className="text-center text-red-500">Access Denied: Only instructors can access this page.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mb-4 flex space-x-2">
        <button onClick={addText} className="bg-blue text-white px-4 py-2 rounded">Add Text</button>
        <button
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  if (reader.result) {
                    addImage(reader.result as string);
                  }
                };
                reader.readAsDataURL(file);
              }
            };
            input.click();
          }}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add Image
        </button>
      </div>

      <Stage
        width={800}
        height={600}
        ref={stageRef}
        onMouseDown={handleStageMouseDown}
        className="border"
      >
        <Layer>
          {/* Background Image */}
          <DraggableImage
            image={{ id: 'background', src: backgroundImage, x: 0, y: 0, width: 800, height: 600 }}
            isSelected={false}
            onSelect={() => {}}
            setImages={() => {}}
            images={images}
            containerWidth={800}
            containerHeight={600}
          />

          {/* Render Draggable Images */}
          {images.map((image) => (
            <DraggableImage
              key={image.id}
              image={image}
              isSelected={selectedId === image.id}
              onSelect={handleSelect}
              setImages={setImages}
              images={images}
              containerWidth={800}
              containerHeight={600}
            />
          ))}

          {/* Render Draggable Texts */}
          {texts.map((text) => (
            <DraggableText
              key={text.id}
              text={{ ...text, text: getReplacedText(text.text) }}
              isSelected={selectedId === text.id}
              onSelect={handleSelect}
              setTexts={setTexts}
              texts={texts}
            />
          ))}

          <Transformer ref={trRef} />
        </Layer>
      </Stage>
    </div>
  );
};

export default CertificateDesigner;
