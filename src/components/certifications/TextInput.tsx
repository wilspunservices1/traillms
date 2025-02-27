// components/TextInput.tsx

'use client';

import React, { useState } from 'react';
import { SketchPicker } from 'react-color';

interface TextInputProps {
  onAddText: (text: string, color: string) => void;
}

const TextInput: React.FC<TextInputProps> = ({ onAddText }) => {
  const [text, setText] = useState('');
  const [color, setColor] = useState('#000000');

  const handleAddText = () => {
    if (text.trim()) {
      onAddText(text, color);
      setText('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Text</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Text
        </label>
        <input
          type="text"
          placeholder="Enter text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue focus:border-blue"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Text Color
        </label>
        <SketchPicker
          color={color}
          onChangeComplete={(newColor) => setColor(newColor.hex)}
        />
      </div>
      <button
        onClick={handleAddText}
        className="w-full px-4 py-2 bg-blue text-white rounded-md hover:bg-blueDark focus:outline-none focus:ring-2 focus:ring-blue"
      >
        Add Text
      </button>
    </div>
  );
};

export default TextInput;
