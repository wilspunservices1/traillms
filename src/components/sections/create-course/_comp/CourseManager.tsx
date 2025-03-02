"use client"
import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles

const ChapterForm = () => {
  const [courseName, setCourseName] = useState('');
  const [courseOutline, setCourseOutline] = useState('');

  const handleCreateChapter = () => {
    // Logic to handle creating a chapter
    console.log('Creating chapter with:', {
      courseName,
      courseOutline,
    });
  };

  const handleCancel = () => {
    // Logic to handle canceling the creation
    setCourseName('');
    setCourseOutline('');
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-6">Create Course</h2>
      <form>
        <div className="mb-4">
          <label htmlFor="courseName" className="block text-sm font-medium text-gray-700">
            Course Name
          </label>
          <input
            type="text"
            id="courseName"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="courseOutline" className="block text-sm font-medium text-gray-700">
            Course Outline
          </label>
          <ReactQuill
            value={courseOutline}
            onChange={setCourseOutline}
            className="mt-1"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleCreateChapter}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Create Chapter
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChapterForm;
