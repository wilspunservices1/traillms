// hooks/useChapterEditing.js

import { useState, useCallback } from "react";

/**
 * Custom hook to manage chapter editing.
 */
const useChapterEditing = (initialChapters = []) => {
  const [chapters, setChapters] = useState(initialChapters);

  // Toggle editing state for a chapter
  const toggleEditing = useCallback((index) => {
    setChapters((prevChapters) =>
      prevChapters.map((chapter, i) => ({
        ...chapter,
        editing: i === index ? !chapter.editing : chapter.editing,
      }))
    );
  }, []);

  // Add a new chapter
  const addChapter = useCallback(() => {
    setChapters((prevChapters) => [
      ...prevChapters,
      {
        id: Date.now().toString(), // Use a unique string ID
        name: `Chapter ${prevChapters.length + 1}: New Chapter`,
        description: "",
        lectures: [],
      },
    ]);
  }, []);

  // Remove a chapter by index
  const removeChapter = useCallback((index) => {
    setChapters((prevChapters) => prevChapters.filter((_, i) => i !== index));
  }, []);

  // Update a chapter at a specific index
  const updateChapter = useCallback((index, updatedChapter) => {
    setChapters((prevChapters) => {
      const newChapters = [...prevChapters];
      newChapters[index] = updatedChapter;
      return newChapters;
    });
  }, []);

  // Set initial chapters (used when editing a course)
  const setInitialChaptersCallback = useCallback((initial) => {
    setChapters(initial);
  }, []);

  return {
    chapters,
    toggleEditing,
    addChapter,
    removeChapter,
    updateChapter,
    setInitialChapters: setInitialChaptersCallback,
  };
};

export default useChapterEditing;
