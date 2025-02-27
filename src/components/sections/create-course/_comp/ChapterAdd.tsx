"use client"
import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from "react";
import useSweetAlert from "@/hooks/useSweetAlert"; // Assuming you have a custom hook for alerts
import Loader from "./Icons/Loader";
import Tooltip from "./Icons/Tooltip";

interface ChapterDetailsComponentProps {
  title: string;
  description: string;
  initialOrder: number;
  initialDuration: string;
  courseId: string; // Adding courseId to identify the course
  onSave: (details: {
    title: string;
    description: string;
    order: string;
    duration: string;
  }) => void;
  setChapterId: (id: string) => void; // Add setChapterId to the props
}

const ChapterAdd: React.FC<ChapterDetailsComponentProps> = ({
  title,
  description,
  initialOrder,
  initialDuration,
  courseId,
  onSave,
  setChapterId, // Receive setChapterId as a prop
}) => {
  const [localTitle, setLocalTitle] = useState(title);
  const [localDescription, setLocalDescription] = useState(description);
  const [order, setOrder] = useState(initialOrder);
  const [duration, setDuration] = useState(initialDuration);
  const [isEditing, setIsEditing] = useState(!title || !description);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const showAlert = useSweetAlert();

  

  useEffect(() => {
    if (!initialOrder && !title && !description) {
      setOrder(1); // Default order for the first chapter
      setDuration("0 minutes"); // Default duration for the first chapter
    }
  }, [initialOrder, title, description]);

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalTitle(e.target.value);
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setLocalDescription(e.target.value);
  };

  const handleSave = async () => {
    if (!localTitle.trim()) {
      showAlert("error", "Title cannot be empty.");
      return;
    }
    if (!localDescription.trim()) {
      showAlert("error", "Description cannot be empty.");
      return;
    }

    const chapterDetails = {
      title: localTitle,
      description: localDescription,
      order: order.toString(),
      duration,
    };

    try {
      setIsLoading(true); // Start loading state

      const response = await fetch("/api/courses/chapters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...chapterDetails,
          courseId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        onSave(chapterDetails); // Update the parent component with the new chapter details
        setChapterId(result); // Update the chapterId in the parent component
        showAlert("success", result.message);
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        showAlert("error", `Failed to create chapter: ${errorData.message}`);
      }
    } catch (error) {
      console.error("An error occurred:", error);
      showAlert("error", "An unexpected error occurred.");
    } finally {
      setIsLoading(false); // End loading state
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  return (
    <div className="relative p-4 bg-white shadow-md rounded-md w-full">
      <div className="flex items-center w-full">
        {isEditing ? (
          <div className="flex flex-col w-full">
            <input
              type="text"
              value={localTitle}
              onChange={handleTitleChange}
              onKeyPress={handleKeyPress}
              className="text-xl font-semibold w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none mb-2"
              placeholder="Chapter Title"
              disabled={isLoading} // Disable input during loading
            />
            <textarea
              value={localDescription}
              onChange={handleDescriptionChange}
              placeholder="Chapter Description"
              className="text-lg font-semibold w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none mb-4"
              disabled={isLoading} // Disable input during loading
            />
            <button
              onClick={handleSave}
              className={`self-end bg-blue text-white py-2 px-4 rounded-md flex items-center justify-center ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={isLoading} // Disable button during loading
            >
              {isLoading ? <Loader text={"Creating..."} /> : "Save"}
            </button>
          </div>
        ) : (
          <>
            <div>
              <h3
                onClick={() => setIsEditing(true)}
                className="text-2xl font-bold cursor-pointer"
              >
                <Tooltip content="Click here to create Chapter" position="top">
                  {localTitle}
                </Tooltip>
              </h3>
              <p className="text-lg">{localDescription}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChapterAdd;
