import React, { useState, useEffect } from "react";
import VideoPlayer from "../../lessons/_comp/vedioPlayer"; // Ensure correct import path

interface VideoFieldProps {
  setVideoPath: (path: string) => void;
  showAlert: (type: string, message: string) => void;
  labelText?: string;
  initialVideoUrl?: string; // For initializing video if already available
  title?: string; // Optionally pass the video title
}

const VideoField: React.FC<VideoFieldProps> = ({
  setVideoPath,
  showAlert,
  labelText,
  initialVideoUrl = "",
  title = "Course Video",
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoURL, setVideoURL] = useState(initialVideoUrl); // Initialize with initialVideoUrl
  const [videoType, setVideoType] = useState<"youtube" | "vimeo" | "upload">("upload");
  const [isEditing, setIsEditing] = useState(!initialVideoUrl); // Start in editing mode if no video
  const [isVideoVisible, setIsVideoVisible] = useState(!!initialVideoUrl); // Ensure video visibility if URL is passed

  // Update videoURL and visibility when initialVideoUrl changes
  useEffect(() => {
    if (initialVideoUrl) {
      setVideoURL(initialVideoUrl);
      setIsVideoVisible(true);
      setIsEditing(false); // If there's an initial video, don't start in edit mode
    } else {
      setIsEditing(true); // If no initial video, start in edit mode
    }
  }, [initialVideoUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleVideoUpload = async () => {
    if (videoType === "upload") {
      if (!selectedFile) {
        showAlert("error", "Please select a video to upload.");
        return;
      }

      setLoading(true);

      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const response = await fetch("/api/courses/vedioUpload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (response.ok) {
          setVideoPath(data.filePath); // Set the path in parent component
          setVideoURL(data.filePath); // Update video URL for preview
          showAlert("success", "Video uploaded successfully.");
          setIsVideoVisible(true); // Show the video after upload
          setIsEditing(false); // Return to video preview
        } else {
          showAlert("error", `Failed to upload video: ${data.error || "Unknown error"}`);
        }
      } catch (error: any) {
        console.error("Error uploading video:", error);
        showAlert("error", `An unexpected error occurred: ${error.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      // For YouTube and Vimeo URLs
      if (!videoURL.trim()) {
        showAlert("error", "Please enter a valid video URL.");
        return;
      }

      // Basic URL validation
      const isValidYouTube = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/.test(videoURL);
      const isValidVimeo = /^(https?\:\/\/)?(www\.)?vimeo.com\/.+$/.test(videoURL);

      if (videoType === "youtube" && !isValidYouTube) {
        showAlert("error", "Please enter a valid YouTube URL.");
        return;
      }

      if (videoType === "vimeo" && !isValidVimeo) {
        showAlert("error", "Please enter a valid Vimeo URL.");
        return;
      }

      setVideoPath(videoURL.trim()); // Set the path in parent component
      setIsVideoVisible(true); // Show the video
      showAlert("success", "Video URL saved successfully.");
      setIsEditing(false); // Return to video preview
    }
  };

  const handleEdit = () => {
    setIsEditing(true); // Switch to edit mode
  };

  const handleCancelEdit = () => {
    setIsEditing(false); // Switch back to video preview
  };

  return (
    <div className="mb-15px">
      <label className="mb-3 block font-semibold">{labelText || "Video"}</label>

      {/* Show Video Player if not editing and video URL exists */}
      {!isEditing && isVideoVisible && videoURL && (
        <VideoPlayer
          videoUrl={videoURL}
          title={title}
          onClose={() => setIsVideoVisible(false)} // Hide the video when closed
        />
      )}

      {/* Show video upload or URL form if editing */}
      {isEditing && (
        <>
          <div className="mb-3">
            <label className="mr-4">
              <input
                type="radio"
                value="upload"
                checked={videoType === "upload"}
                onChange={() => setVideoType("upload")}
                className="mr-1"
              />
              Upload Local
            </label>
            <label className="mr-4">
              <input
                type="radio"
                value="youtube"
                checked={videoType === "youtube"}
                onChange={() => setVideoType("youtube")}
                className="mr-1"
              />
              YouTube URL
            </label>
            <label>
              <input
                type="radio"
                value="vimeo"
                checked={videoType === "vimeo"}
                onChange={() => setVideoType("vimeo")}
                className="mr-1"
              />
              Vimeo URL
            </label>
          </div>

          {videoType === "upload" && (
            <>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="w-full py-2 px-3 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-6 rounded-md"
              />
              <button
                type="button"
                onClick={handleVideoUpload}
                disabled={loading}
                className="mt-3 px-4 py-2 bg-blue text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Uploading..." : "Upload Video"}
              </button>
            </>
          )}

          {(videoType === "youtube" || videoType === "vimeo") && (
            <>
              <input
                type="url"
                value={videoURL}
                onChange={(e) => setVideoURL(e.target.value)}
                placeholder={`Enter ${videoType === "youtube" ? "YouTube" : "Vimeo"} URL`}
                className="w-full py-2 px-3 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-6 rounded-md"
              />
              <button
                type="button"
                onClick={handleVideoUpload}
                disabled={loading}
                className="mt-3 px-4 py-2 bg-blue text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save URL"}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleCancelEdit}
            className="mt-3 ml-2 px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Cancel
          </button>
        </>
      )}

      {/* Button to enter edit mode */}
      {!isEditing && isVideoVisible && (
        <button
          type="button"
          onClick={handleEdit}
          className="mt-3 px-4 py-2 bg-blue text-white rounded hover:bg-blue-600"
        >
          Edit Video
        </button>
      )}
    </div>
  );
};

export default VideoField;


// import React, { useState, useEffect } from "react";
// import VideoPlayer from "../../lessons/_comp/vedioPlayer"; // Ensure correct import path

// interface VideoFieldProps {
//   setVideoPath: (path: string) => void;
//   showAlert: (type: string, message: string) => void;
//   labelText?: string;
//   initialVideoUrl?: string; // For initializing video if already available
//   title?: string; // Optionally pass the video title
// }

// const VideoField: React.FC<VideoFieldProps> = ({
//   setVideoPath,
//   showAlert,
//   labelText,
//   initialVideoUrl = "",
//   title = "Course Video",
// }) => {
//   const [loading, setLoading] = useState(false);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [videoURL, setVideoURL] = useState(initialVideoUrl); // Initialize with initialVideoUrl
//   const [videoType, setVideoType] = useState<"youtube" | "vimeo" | "upload">("upload");
//   const [isEditing, setIsEditing] = useState(false); // For toggling between video player and form
//   const [isVideoVisible, setIsVideoVisible] = useState(!!initialVideoUrl); // Ensure video visibility if URL is passed

//   // Ensure that videoURL and visibility are updated when initialVideoUrl changes
//   useEffect(() => {
//     if (initialVideoUrl) {
//       setVideoURL(initialVideoUrl);
//       setIsVideoVisible(true); // Show the video if URL is available
//     }
//   }, [initialVideoUrl]);

//   // Log current state to debug
//   useEffect(() => {
//     // console.log("Initial Video URL:", initialVideoUrl);
//     // console.log("Current Video URL:", videoURL);
//     // console.log("Is Video Visible:", isVideoVisible);
//   }, [initialVideoUrl, videoURL, isVideoVisible]);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] || null;
//     if (file) {
//       setSelectedFile(file);
//     }
//   };

//   const handleVideoUpload = async () => {
//     if (videoType === "upload") {
//       if (!selectedFile) {
//         showAlert("error", "Please select a video to upload.");
//         return;
//       }

//       setLoading(true);

//       const formData = new FormData();
//       formData.append("file", selectedFile);

//       try {
//         const response = await fetch("/api/courses/videoUpload", {
//           method: "POST",
//           body: formData,
//         });

//         const data = await response.json();
//         if (response.ok) {
//           setVideoPath(data.filePath); // Set the path in parent component
//           setVideoURL(data.filePath); // Update video URL for preview
//           showAlert("success", "Video uploaded successfully.");
//           setIsVideoVisible(true); // Show the video after upload
//           setIsEditing(false); // Return to video preview
//         } else {
//           showAlert("error", `Failed to upload video: ${data.error || "Unknown error"}`);
//         }
//       } catch (error: any) {
//         console.error("Error uploading video:", error);
//         showAlert("error", `An unexpected error occurred: ${error.message}`);
//       } finally {
//         setLoading(false);
//       }
//     } else {
//       // For YouTube and Vimeo URLs
//       if (!videoURL.trim()) {
//         showAlert("error", "Please enter a valid video URL.");
//         return;
//       }

//       // Basic URL validation
//       const isValidYouTube = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/.test(videoURL);
//       const isValidVimeo = /^(https?\:\/\/)?(www\.)?vimeo.com\/.+$/.test(videoURL);

//       if (videoType === "youtube" && !isValidYouTube) {
//         showAlert("error", "Please enter a valid YouTube URL.");
//         return;
//       }

//       if (videoType === "vimeo" && !isValidVimeo) {
//         showAlert("error", "Please enter a valid Vimeo URL.");
//         return;
//       }

//       setVideoPath(videoURL.trim()); // Set the path in parent component
//       setIsVideoVisible(true); // Show the video
//       showAlert("success", "Video URL saved successfully.");
//       setIsEditing(false); // Return to video preview
//     }
//   };

//   const handleEdit = () => {
//     setIsEditing(true); // Switch to edit mode
//   };

//   const handleCancelEdit = () => {
//     setIsEditing(false); // Switch back to video preview
//   };

//   return (
//     <div className="mb-15px">
//       <label className="mb-3 block font-semibold">{labelText || "Video"}</label>

//       {/* Debug log to inspect variables */}
//       {/* <pre>{`isEditing: ${isEditing}, isVideoVisible: ${isVideoVisible}, videoURL: ${videoURL}`}</pre> */}

//       {/* Show Video Player if not editing and video URL exists */}
//       {!isEditing && isVideoVisible && videoURL && (
//         <VideoPlayer
//           videoUrl={videoURL}
//           title={title}
//           onClose={() => setIsVideoVisible(false)} // Hide the video when closed
//         />
//       )}

//       {/* Show video upload or URL form if editing */}
//       {isEditing && (
//         <>
//           <div className="mb-3">
//             <label className="mr-4">
//               <input
//                 type="radio"
//                 value="upload"
//                 checked={videoType === "upload"}
//                 onChange={() => setVideoType("upload")}
//                 className="mr-1"
//               />
//               Upload Local
//             </label>
//             <label className="mr-4">
//               <input
//                 type="radio"
//                 value="youtube"
//                 checked={videoType === "youtube"}
//                 onChange={() => setVideoType("youtube")}
//                 className="mr-1"
//               />
//               YouTube URL
//             </label>
//             <label>
//               <input
//                 type="radio"
//                 value="vimeo"
//                 checked={videoType === "vimeo"}
//                 onChange={() => setVideoType("vimeo")}
//                 className="mr-1"
//               />
//               Vimeo URL
//             </label>
//           </div>

//           {videoType === "upload" && (
//             <>
//               <input
//                 type="file"
//                 accept="video/*"
//                 onChange={handleFileChange}
//                 className="w-full py-2 px-3 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-6 rounded-md"
//               />
//               <button
//                 type="button"
//                 onClick={handleVideoUpload}
//                 disabled={loading}
//                 className="mt-3 px-4 py-2 bg-blue text-white rounded hover:bg-blue-600 disabled:opacity-50"
//               >
//                 {loading ? "Uploading..." : "Upload Video"}
//               </button>
//             </>
//           )}

//           {(videoType === "youtube" || videoType === "vimeo") && (
//             <>
//               <input
//                 type="url"
//                 value={videoURL}
//                 onChange={(e) => setVideoURL(e.target.value)}
//                 placeholder={`Enter ${videoType === "youtube" ? "YouTube" : "Vimeo"} URL`}
//                 className="w-full py-2 px-3 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-6 rounded-md"
//               />
//               <button
//                 type="button"
//                 onClick={handleVideoUpload}
//                 disabled={loading}
//                 className="mt-3 px-4 py-2 bg-blue text-white rounded hover:bg-blue-600 disabled:opacity-50"
//               >
//                 {loading ? "Saving..." : "Save URL"}
//               </button>
//             </>
//           )}

//           <button
//             type="button"
//             onClick={handleCancelEdit}
//             className="mt-3 ml-2 px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 disabled:opacity-50"
//           >
//             Cancel
//           </button>
//         </>
//       )}

//       {/* Button to enter edit mode */}
//       {!isEditing && isVideoVisible && (
//         <button
//           type="button"
//           onClick={handleEdit}
//           className="mt-3 px-4 py-2 bg-blue text-white rounded hover:bg-blue-600"
//         >
//           Edit Video
//         </button>
//       )}
//     </div>
//   );
// };

// export default VideoField;
