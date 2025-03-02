// components/certifications/CertificateCanvas.tsx

'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import DraggableImage from './DraggableImage';
import DraggableText from './DraggableText';
import TextAdjustments from './TextAdjustments';
import { ImageElement, TextElement } from '@/types/type';
import useSweetAlert from '@/hooks/useSweetAlert';
import DOMPurify from 'dompurify';
import HtmlCertificate from './HtmlCertificate';
import { toPng } from 'html-to-image'; // Import toPng from html-to-image

interface CertificateCanvasProps {
  images: ImageElement[];
  texts: TextElement[];
  setImages: React.Dispatch<React.SetStateAction<ImageElement[]>>;
  setTexts: React.Dispatch<React.SetStateAction<TextElement[]>>;
  designMode: 'image' | 'html';
  htmlContent: string;
  setHtmlContent: React.Dispatch<React.SetStateAction<string>>;
  placeholders: string[];
  issuedTo : string
}

const CertificateCanvas: React.FC<CertificateCanvasProps> = ({
  images,
  texts,
  setImages,
  setTexts,
  designMode,
  htmlContent,
  setHtmlContent,
  placeholders,
  issuedTo
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const stageRef = useRef<any>(null);
  const htmlCertificateRef = useRef<HTMLDivElement>(null); // Add ref for HTML certificate
  const showAlert = useSweetAlert();

  // Undo/Redo stacks
  const [history, setHistory] = useState<
    { images: ImageElement[]; texts: TextElement[] }[]
  >([]);
  const [future, setFuture] = useState<
    { images: ImageElement[]; texts: TextElement[] }[]
  >([]);

  // Canvas dimensions
  const containerWidth = 800; // Adjust as needed
  const containerHeight = 600; // Adjust as needed

  // Preview data state
  const [previewData, setPreviewData] = useState<{
    dataUrl?: string;
    htmlContent?: string;
    fileName: string;
  } | null>(null);

  // Handle selection
  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const handleDeselect = () => {
    setSelectedId(null);
  };

  // Wrapper functions for undo/redo
  const updateImages = (newImages: ImageElement[]) => {
    setHistory((prev) => [...prev, { images, texts }]);
    setImages(newImages);
    setFuture([]);
  };

  const updateTexts = (newTexts: TextElement[]) => {
    setHistory((prev) => [...prev, { images, texts }]);
    setTexts(newTexts);
    setFuture([]);
  };

  // Function to update a single text element
  const handleUpdateText = (updatedText: TextElement) => {
    const newTexts = texts.map((txt) =>
      txt.id === updatedText.id ? updatedText : txt
    );
    updateTexts(newTexts);
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setFuture((prev) => [{ images, texts }, ...prev]);
      setImages(previousState.images);
      setTexts(previousState.texts);
      setHistory((prev) => prev.slice(0, prev.length - 1));
    }
  };

  const handleRedo = () => {
    if (future.length > 0) {
      const nextState = future[0];
      setHistory((prev) => [...prev, { images, texts }]);
      setImages(nextState.images);
      setTexts(nextState.texts);
      setFuture((prev) => prev.slice(1));
    }
  };

  const handleDelete = () => {
    if (selectedId) {
      const isImage = images.some((img) => img.id === selectedId);
      if (isImage) {
        const newImages = images.filter((img) => img.id !== selectedId);
        updateImages(newImages);
      } else {
        const newTexts = texts.filter((txt) => txt.id !== selectedId);
        updateTexts(newTexts);
      }
      setSelectedId(null);
    }
  };

  // Modified handleExport to capture HTML as image
  const handleExport = async () => {
    if (designMode === 'image') {
      if (stageRef.current) {
        const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = 'certificate.png';
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else if (designMode === 'html') {
      if (htmlCertificateRef.current) {
        try {
          const dataUrl = await toPng(htmlCertificateRef.current, {
            cacheBust: true,
            backgroundColor: '#ffffff', // Ensure background is white
          });

          const link = document.createElement('a');
          link.download = 'certificate.png';
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          console.error('Failed to export certificate:', error);
          showAlert('error', 'Failed to export certificate as image.');
        }
      } else {
        showAlert('error', 'Certificate content is not available.');
      }
    }
  };

  const handleSaveMine = async () => {
    if (uploading) return;
    setUploading(true);

    // Dynamically import Swal
    const Swal = (await import('sweetalert2')).default;

    // Show loading alert
    Swal.fire({
      title: 'Saving...',
      text: 'Please wait while your certificate is being saved.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      let response;

      if (designMode === 'image') {
        if (!stageRef.current) {
          throw new Error('Stage reference is not available.');
        }

        if (images.length === 0 && texts.length === 0) {
          throw new Error(
            'Canvas is empty. Please add images or text before saving.'
          );
        }

        const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
        const fileName = `certificate-${Date.now()}.png`;

        if (!dataUrl.startsWith('data:image/')) {
          throw new Error('Invalid image data.');
        }

        const payload = {
          dataUrl,
          description: 'My Certificate',
          fileName,
          issuedTo
        };

        response = await fetch('/api/certificates/save-mine', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
          Swal.close();
          showAlert(
            'success',
            data.message || 'Certificate saved successfully.'
          );
          const savedData = { dataUrl: data.secure_url, fileName };
          setPreviewData(savedData);
        } else {
          Swal.close();
          showAlert('error', data.message || 'Failed to save certificate.');
          return;
        }
      } else if (designMode === 'html') {
        if (!htmlContent) {
          throw new Error('HTML content is empty.');
        }

        const fileName = `certificate-${Date.now()}.html`;

        const payload = {
          htmlContent,
          description: 'My HTML Certificate',
          fileName,
          issuedTo
        };

        response = await fetch('/api/certificates/save-mine-html', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
          Swal.close();
          showAlert(
            'success',
            data.message || 'HTML Certificate saved successfully.'
          );
          const savedData = { htmlContent: data.htmlContent, fileName };
          setPreviewData(savedData);
        } else {
          Swal.close();
          showAlert('error', data.message || 'Failed to save HTML certificate.');
          return;
        }
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      Swal.close();
      showAlert('error', error.message || 'An unexpected error occurred.');
    } finally {
      setUploading(false);
    }
  };

  // Show preview when previewData is updated
  useEffect(() => {
    const showPreview = async () => {
      if (previewData) {
        const Swal = (await import('sweetalert2')).default;

        if (previewData.dataUrl) {
          Swal.fire({
            title: 'Certificate Preview',
            imageUrl: previewData.dataUrl,
            imageAlt: 'Certificate Image',
            showCloseButton: true,
            showConfirmButton: false,
            width: '80%',
            heightAuto: true,
          });
        } else if (previewData.htmlContent) {
          Swal.fire({
            title: 'Certificate Preview',
            html: previewData.htmlContent,
            showCloseButton: true,
            showConfirmButton: false,
            width: '80%',
            heightAuto: true,
          });
        }
      }
    };

    showPreview();
  }, [previewData]);

  // Function to replace placeholders with sample data for preview
  const getPreviewHtml = () => {
    let previewHtml = htmlContent;
    const sampleData: { [key: string]: string } = {
      username: 'John Doe',
      signature:
        '<img src="https://example.com/signature.png" alt="Signature" style="width:100px;height:auto;" />',
      date: new Date().toLocaleDateString(),
      course: 'Introduction to Programming',
      // Add more sample data as needed
    };

    // Replace placeholders with sample data
    placeholders.forEach((placeholder) => {
      const key = placeholder.replace('%{{', '').replace('}}', '');
      const value = sampleData[key] || '';
      const regex = new RegExp(placeholder, 'g');
      previewHtml = previewHtml.replace(regex, value);
    });

    // Sanitize the HTML before rendering
    const sanitizedHtml = DOMPurify.sanitize(previewHtml);

    return sanitizedHtml;
  };

  const base64Signature = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'; // Replace with your actual Base64 data

  const sampleData: { [key: string]: string } = {
    username: 'John Doe',
    signature: `<img src="${base64Signature}" alt="Signature" style="width:200px;" />`,
    date: new Date().toLocaleDateString(),
    course: 'Introduction to Programming',
  };

  return (
    <div>
      <div className="mb-4 flex space-x-2">
        {designMode === 'image' && (
          <>
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              className={`px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none ${
                history.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={future.length === 0}
              className={`px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none ${
                future.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Redo
            </button>
            <button
              onClick={handleDelete}
              disabled={!selectedId}
              className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none ${
                !selectedId ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Delete Selected
            </button>
          </>
        )}
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue text-white rounded-md"
        >
          Download Certificate
        </button>
        <button
          onClick={handleSaveMine}
          disabled={uploading}
          className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? 'Saving...' : 'Save Mine'}
        </button>
      </div>
      <div className="flex">
        {designMode === 'image' ? (
          <div className="relative">
            <Stage
              width={containerWidth}
              height={containerHeight}
              ref={stageRef}
              className="bg-white border rounded-md overflow-hidden"
              onMouseDown={(e) => {
                if (e.target === e.target.getStage()) {
                  handleDeselect();
                }
              }}
            >
              <Layer>
                {images.map((image) => (
                  <DraggableImage
                    key={image.id}
                    image={image}
                    isSelected={image.id === selectedId}
                    onSelect={handleSelect}
                    setImages={updateImages}
                    images={images}
                    containerWidth={containerWidth}
                    containerHeight={containerHeight}
                  />
                ))}
                {texts.map((text) => (
                  <DraggableText
                    key={text.id}
                    text={text}
                    isSelected={text.id === selectedId}
                    onSelect={handleSelect}
                    setTexts={updateTexts}
                    texts={texts}
                  />
                ))}
              </Layer>
            </Stage>
            {/* Text Adjustments */}
            {selectedId && texts.some((txt) => txt.id === selectedId) && (
              <TextAdjustments
                selectedText={texts.find((txt) => txt.id === selectedId)!}
                onUpdateText={handleUpdateText}
              />
            )}
          </div>
        ) : (
          <div
            className="w-full bg-white rounded-md shadow-md p-4 overflow-auto border"
            ref={htmlCertificateRef} // Attach ref here
          >
            <HtmlCertificate
              username={sampleData.username}
              course={sampleData.course}
              date={sampleData.date}
              signature={sampleData.signature}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateCanvas;
