"use client";
import React, { useState, useEffect, useRef } from "react";
import useSweetAlert from "@/hooks/useSweetAlert";
import { Lecture } from "@/db/schemas/lectures";
import Loader from "./Icons/Loader";
import VideoField from "./VideoField";

interface CreateLectureProps {
  chapterId: string;
  onSave: (lecture: Lecture) => void;
  onCancel?: () => void; // Optional callback to close/cancel form
  initialData?: Lecture | null; // Initial data for editing a lecture (optional)
  courseId;
}

const CreateLecture: React.FC<CreateLectureProps> = ({
  chapterId,
  onSave,
  onCancel, // Add cancel functionality
  initialData = null,
  courseId,
}) => {
  const [title, setTitle] = useState<string>(initialData?.title || "");
  const [description, setDescription] = useState<string>(
    initialData?.description || ""
  );
  const [order, setOrder] = useState<string>(initialData?.order || "1");
  const [duration, setDuration] = useState<string>(initialData?.duration || "");
  const [videoUrl, setVideoUrl] = useState<string>(initialData?.videoUrl || "");
  const [isPreview, setIsPreview] = useState<boolean>(
    initialData?.isPreview || false
  );
  const [isLocked, setIsLocked] = useState<boolean>(
    initialData?.isLocked || true
  );
  const [loading, setLoading] = useState<boolean>(false);
  const showAlert = useSweetAlert();

  // console.log("initialData . . . bug", initialData?.duration);

  // Reference for the first input to focus on load
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Focus the title input when the component is rendered
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);

  // Update state when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setOrder(initialData.order || "1");
      setDuration(initialData.duration || "0");
      setVideoUrl(initialData.videoUrl || "");
      setIsPreview(initialData.isPreview || false);
      setIsLocked(initialData.isLocked || true);
    }
  }, [initialData]);

  // const handleSaveOrUpdateLecture = async () => {
  //   if (!title || !description || !duration || !videoUrl) {
  //     showAlert(
  //       "error",
  //       "Title, description, duration, and video URL are required fields."
  //     );
  //     return;
  //   }

  //   const lectureData: any = {
  //     id: initialData?.id || courseId,
  //     courseId: initialData?.id || courseId,
  //     chapterId,
  //     title: title || "Untitled Lecture", // Add fallback if title is missing
  //     description: description || "No description", // Add fallback for description
  //     duration: duration || "0", // Default duration if not provided
  //     videoUrl,
  //     isPreview,
  //     isLocked,
  //     order,
  //   };

  //   try {
  //     setLoading(true);

  //     const response = await fetch(
  //       initialData
  //         ? `/api/courses/chapters/lectures?id=${initialData.id}`
  //         : "/api/courses/chapters/lectures",
  //       {
  //         method: initialData ? "PUT" : "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(lectureData),
  //       }
  //     );

  //     if (response.ok) {
  //       const result = await response.json();
  //       showAlert(
  //         "success",
  //         initialData
  //           ? "Lecture updated successfully!"
  //           : "Lecture created successfully!"
  //       );
  //       onSave(result.lecture[0]); // Pass the updated/created lecture back to the parent component
  //     } else {
  //       const errorData = await response.json();
  //       showAlert(
  //         "error",
  //         `Failed to ${initialData ? "update" : "create"} lecture: ${
  //           errorData.message
  //         }`
  //       );
  //     }
  //   } catch (error) {
  //     console.error("An error occurred:", error);
  //     showAlert("error", "An unexpected error occurred.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSaveOrUpdateLecture = async () => {
    if (!title || !description || !duration || !videoUrl) {
      showAlert(
        "error",
        "Title, description, duration, and video URL are required fields."
      );
      return;
    }

    const lectureData: any = {
      id: initialData?.id || courseId,
      courseId: initialData?.id || courseId,
      chapterId,
      title: title || "Untitled Lecture", // Add fallback if title is missing
      description: description || "No description", // Add fallback for description
      duration: duration || "0", // Default duration if not provided
      videoUrl,
      isPreview,
      isLocked,
      order,
    };

    try {
      setLoading(true);

      const response = await fetch(
        initialData
          ? `/api/courses/chapters/lectures?id=${initialData.id}`
          : "/api/courses/chapters/lectures",
        {
          method: initialData ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(lectureData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        showAlert(
          "success",
          initialData
            ? "Lecture updated successfully!"
            : "Lecture created successfully!"
        );
        onSave(result.lecture); // Ensure this is not wrapped in array
        // close when lecture is saved
        // Close the form after successful save, if onCancel is provided
        if (onCancel) {
          onCancel();
        }
      } else {
        const errorData = await response.json();
        showAlert(
          "error",
          `Failed to ${initialData ? "update" : "create"} lecture: ${
            errorData.message
          }`
        );
      }
    } catch (error) {
      console.error("An error occurred:", error);
      showAlert("error", "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-accordion dark:shadow-accordion-dark rounded-md p-6 mb-5 relative">
      {/* Add "X" button for cancel/close */}
      <button
        onClick={onCancel}
        className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        title="Cancel Lecture Creation"
      >
        X
      </button>

      <div className="mb-4">
        <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100">
          Lecture Title
        </label>
        <input
          ref={titleInputRef} // Focus this input on mount
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter lecture title"
          className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none"
          disabled={loading}
        />
      </div>
      <div className="mb-4">
        <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100">
          Lecture Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter lecture description"
          className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none"
          disabled={loading}
        />
      </div>
      <div className="mb-4">
        <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100">
          Duration
        </label>
        <input
          type="text"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Enter duration (e.g., 30 minutes)"
          className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none"
          disabled={loading}
        />
      </div>
      <div className="mb-4">
        {/* Integrating VideoField for video URL */}
        <VideoField
          setVideoPath={setVideoUrl}
          showAlert={showAlert}
          labelText={"Upload Video"}
          initialVideoUrl={videoUrl}
        />
      </div>
      <div className="mb-4">
        <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100">
          Order
        </label>
        <input
          type="text"
          value={order}
          readOnly
          className="w-full py-2 px-3 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
          disabled={loading}
        />
      </div>
      <div className="flex items-center mb-4">
        <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mr-4">
          Is Preview
        </label>
        <input
          type="checkbox"
          checked={isPreview}
          onChange={(e) => setIsPreview(e.target.checked)}
          className="form-checkbox"
          disabled={loading}
        />
      </div>
      <div className="flex items-center mb-4">
        <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mr-4">
          Is Locked
        </label>
        <input
          type="checkbox"
          checked={isLocked}
          onChange={(e) => setIsLocked(e.target.checked)}
          className="form-checkbox"
          disabled={loading}
        />
      </div>
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSaveOrUpdateLecture}
          className={`bg-blue text-white py-2 px-4 rounded-md flex items-center justify-center ${
            loading ? "bg-gray-400 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
          disabled={loading}
        >
          {loading ? (
            <Loader text={"Saving..."} />
          ) : initialData ? (
            "Update Info"
          ) : (
            "Save Lecture"
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateLecture;

// "use client";
// import React, { useState, useEffect } from "react";
// import useSweetAlert from "@/hooks/useSweetAlert";
// import { Lecture } from "@/db/schemas/lectures";
// import Loader from "./Icons/Loader";
// import VideoField from "./VideoField";

// interface CreateLectureProps {
//   chapterId: string;
//   onSave: (lecture: Lecture) => void; // Callback function to pass the created lecture back to the parent component
//   initialData?: Lecture | null; // Initial data for editing a lecture (optional)
// }

// const CreateLecture: React.FC<CreateLectureProps> = ({
//   chapterId,
//   onSave,
//   initialData = null,
// }) => {
//   const [title, setTitle] = useState<string>(initialData?.title || "");
//   const [description, setDescription] = useState<string>(
//     initialData?.description || ""
//   );
//   const [order, setOrder] = useState<string>(initialData?.order || "1");
//   const [duration, setDuration] = useState<string>(
//     initialData?.duration || ""
//   );
//   const [videoUrl, setVideoUrl] = useState<string>(
//     initialData?.videoUrl || ""
//   );
//   const [isPreview, setIsPreview] = useState<boolean>(
//     initialData?.isPreview || false
//   );
//   const [isLocked, setIsLocked] = useState<boolean>(
//     initialData?.isLocked || true
//   );
//   const [loading, setLoading] = useState<boolean>(false);
//   const showAlert = useSweetAlert();

//   // Update state when initialData changes (for editing)
//   useEffect(() => {
//     if (initialData) {
//       setTitle(initialData.title || "");
//       setDescription(initialData.description || "");
//       setOrder(initialData.order || "1");
//       setDuration(initialData.duration || "");
//       setVideoUrl(initialData.videoUrl || "");
//       setIsPreview(initialData.isPreview || false);
//       setIsLocked(initialData.isLocked || true);
//     }
//   }, [initialData]);

//   const handleSaveOrUpdateLecture = async () => {
//     if (!title || !description || !duration || !videoUrl) {
//       showAlert(
//         "error",
//         "Title, description, duration, and video URL are required fields."
//       );
//       return;
//     }

//     const lectureData: Lecture = {
//       id: initialData?.id || "",
//       chapterId,
//       title,
//       description,
//       duration,
//       videoUrl,
//       isPreview,
//       isLocked,
//       order,
//     };

//     try {
//       setLoading(true);

//       const response = await fetch(
//         initialData
//           ? `/api/courses/chapters/lectures?id=${initialData.id}`
//           : "/api/courses/chapters/lectures",
//         {
//           method: initialData ? "PUT" : "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(lectureData),
//         }
//       );

//       if (response.ok) {
//         const result = await response.json();
//         showAlert(
//           "success",
//           initialData
//             ? "Lecture updated successfully!"
//             : "Lecture created successfully!"
//         );
//         onSave(result.lecture[0]); // Pass the updated/created lecture back to the parent component
//       } else {
//         const errorData = await response.json();
//         showAlert(
//           "error",
//           `Failed to ${
//             initialData ? "update" : "create"
//           } lecture: ${errorData.message}`
//         );
//       }
//     } catch (error) {
//       console.error("An error occurred:", error);
//       showAlert("error", "An unexpected error occurred.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white dark:bg-gray-800 shadow-accordion dark:shadow-accordion-dark rounded-md p-6 mb-5 relative">
//       <div className="mb-4">
//         <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100">
//           Lecture Title
//         </label>
//         <input
//           type="text"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           placeholder="Enter lecture title"
//           className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none"
//           disabled={loading}
//         />
//       </div>
//       <div className="mb-4">
//         <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100">
//           Lecture Description
//         </label>
//         <textarea
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//           placeholder="Enter lecture description"
//           className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none"
//           disabled={loading}
//         />
//       </div>
//       <div className="mb-4">
//         <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100">
//           Duration
//         </label>
//         <input
//           type="text"
//           value={duration}
//           onChange={(e) => setDuration(e.target.value)}
//           placeholder="Enter duration (e.g., 30 minutes)"
//           className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none"
//           disabled={loading}
//         />
//       </div>
//       <div className="mb-4">
//         {/* Integrating VideoField for video URL */}
//         <VideoField
//           setVideoPath={setVideoUrl}
//           showAlert={showAlert}
//           labelText={"Upload Video"}
//           initialVideoUrl={videoUrl}
//         />
//       </div>
//       <div className="mb-4">
//         <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100">
//           Order
//         </label>
//         <input
//           type="text"
//           value={order}
//           readOnly
//           className="w-full py-2 px-3 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
//           disabled={loading}
//         />
//       </div>
//       <div className="flex items-center mb-4">
//         <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mr-4">
//           Is Preview
//         </label>
//         <input
//           type="checkbox"
//           checked={isPreview}
//           onChange={(e) => setIsPreview(e.target.checked)}
//           className="form-checkbox"
//           disabled={loading}
//         />
//       </div>
//       <div className="flex items-center mb-4">
//         <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mr-4">
//           Is Locked
//         </label>
//         <input
//           type="checkbox"
//           checked={isLocked}
//           onChange={(e) => setIsLocked(e.target.checked)}
//           className="form-checkbox"
//           disabled={loading}
//         />
//       </div>
//       <div className="flex justify-end mt-6">
//         <button
//           onClick={handleSaveOrUpdateLecture}
//           className={`bg-blue text-white py-2 px-4 rounded-md flex items-center justify-center ${
//             loading
//               ? "bg-gray-400 cursor-not-allowed"
//               : "hover:bg-blue-700"
//           }`}
//           disabled={loading}
//         >
//           {loading ? (
//             <Loader text={"Saving..."} />
//           ) : (
//             initialData ? "Update Info" : "Save Lecture"
//           )}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default CreateLecture;

// "use client"
// import React, { useState, useEffect } from "react";
// import useSweetAlert from "@/hooks/useSweetAlert";
// import { Lecture } from "@/db/schemas/lectures";
// import Loader from "./Icons/Loader";
// import VideoField from "./VideoField";

// interface CreateLectureProps {
//   chapterId: string;
//   onSave: (lecture: any) => void; // Callback function to pass the created lecture back to the parent component
//   initialData?: Lecture | null; // Initial data for editing a lecture (optional)
// }

// const CreateLecture: React.FC<CreateLectureProps> = ({ chapterId, onSave, initialData = null }) => {
//   const [title, setTitle] = useState<string>(initialData?.title || "");
//   const [description, setDescription] = useState<string>(initialData?.description || "");
//   const [order, setOrder] = useState<string>(initialData?.order || "1");
//   const [duration, setDuration] = useState<string>(initialData?.duration || "");
//   const [videoUrl, setVideoUrl] = useState<string>(initialData?.videoUrl || "");
//   const [isPreview, setIsPreview] = useState<boolean>(initialData?.isPreview || false);
//   const [isLocked, setIsLocked] = useState<boolean>(initialData?.isLocked || true);
//   const [loading, setLoading] = useState<boolean>(false);
//   const showAlert = useSweetAlert();

//   console.log("initialData of create lecture",initialData)

//   // Update the state whenever initialData changes (when editing)
//   useEffect(() => {
//     if (initialData) {
//       setTitle(initialData.title || "");
//       setDescription(initialData.description || "");
//       setOrder(initialData.order || "1");
//       setDuration(initialData.duration || "");
//       setVideoUrl(initialData.videoUrl || "");
//       setIsPreview(initialData.isPreview || false);
//       setIsLocked(initialData.isLocked || true);
//     }
//   }, [initialData]);

//   const handleSaveOrUpdateLecture = async () => {
//     if (!title || !description || !duration || !videoUrl) {
//       showAlert("error", "Title, description, duration, and video URL are required fields.");
//       return;
//     }

//     const lectureData = {
//       chapterId,
//       title,
//       description,
//       duration,
//       videoUrl,
//       isPreview,
//       isLocked,
//       order,
//     };

//     try {
//       setLoading(true);

//       const response = await fetch(
//         initialData ? `/api/courses/chapters/lectures?id=${initialData.id}` : '/api/courses/chapters/lectures',
//         {
//           method: initialData ? 'PUT' : 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(lectureData),
//         }
//       );

//       if (response.ok) {
//         const result = await response.json();
//         showAlert("success", initialData ? "Lecture updated successfully!" : "Lecture created successfully!");
//         onSave(result.lecture[0]); // Pass the updated/created lecture back to the parent component
//       } else {
//         const errorData = await response.json();
//         showAlert("error", `Failed to ${initialData ? 'update' : 'create'} lecture: ${errorData.message}`);
//       }
//     } catch (error) {
//       console.error("An error occurred:", error);
//       showAlert("error", "An unexpected error occurred.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white dark:bg-gray-800 shadow-accordion dark:shadow-accordion-dark rounded-md p-6 mb-5 relative">
//       <div className="mb-4">
//         <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100">
//           Lecture Title
//         </label>
//         <input
//           type="text"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           placeholder="Enter lecture title"
//           className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none"
//           disabled={loading}
//         />
//       </div>
//       <div className="mb-4">
//         <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100">
//           Lecture Description
//         </label>
//         <textarea
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//           placeholder="Enter lecture description"
//           className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none"
//           disabled={loading}
//         />
//       </div>
//       <div className="mb-4">
//         <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100">
//           Duration
//         </label>
//         <input
//           type="text"
//           value={duration}
//           onChange={(e) => setDuration(e.target.value)}
//           placeholder="Enter duration (e.g., 30 minutes)"
//           className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none"
//           disabled={loading}
//         />
//       </div>
//       <div className="mb-4">
//         <VideoField setVideoPath={setVideoUrl} showAlert={showAlert} labelText={"Upload vedio"} />
//       </div>
//       <div className="mb-4">
//         <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100">
//           Order
//         </label>
//         <input
//           type="text"
//           value={order}
//           readOnly
//           className="w-full py-2 px-3 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
//           disabled={loading}
//         />
//       </div>
//       <div className="flex items-center mb-4">
//         <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mr-4">
//           Is Preview
//         </label>
//         <input
//           type="checkbox"
//           checked={isPreview}
//           onChange={(e) => setIsPreview(e.target.checked)}
//           className="form-checkbox"
//           disabled={loading}
//         />
//       </div>
//       <div className="flex items-center mb-4">
//         <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mr-4">
//           Is Locked
//         </label>
//         <input
//           type="checkbox"
//           checked={isLocked}
//           onChange={(e) => setIsLocked(e.target.checked)}
//           className="form-checkbox"
//           disabled={loading}
//         />
//       </div>
//       <div className="flex justify-end mt-6">
//         <button
//           onClick={handleSaveOrUpdateLecture}
//           className={`bg-blue text-white py-2 px-4 rounded-md flex items-center justify-center ${loading ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-blue-700'}`}
//           disabled={loading}
//         >
//           {loading ? (
//             <Loader text={"Saving..."} />
//           ) : (
//             initialData ? "Update Info" : "Save Lecture"
//           )}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default CreateLecture;
