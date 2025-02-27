'use client';
// components/SignaturePad.tsx

import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave }) => {
  const sigCanvas = useRef<SignatureCanvas>(null);

  const handleSave = () => {
    const dataUrl = sigCanvas.current
      ?.getTrimmedCanvas()
      .toDataURL('image/png');
    if (dataUrl) {
      onSave(dataUrl);
    }
  };

  const handleClear = () => {
    sigCanvas.current?.clear();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Signature
      </label>
      <div className="border rounded-md mb-2">
        <SignatureCanvas
          ref={sigCanvas}
          penColor="black"
          canvasProps={{
            width: 500,
            height: 200,
            className: 'sigCanvas',
          }}
        />
      </div>
      <div className="space-x-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Save Signature
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;
