"use client";
import React, { useState } from "react";
import CurriculumContent from "./CorriculumContent";
import { Lecture, Chapter } from "@/types/type";
import CreateLecture from "./CreateLecture";
import ChapterAdd from "./ChapterAdd";
import useSweetAlert from "@/hooks/useSweetAlert";
import Tooltip from "./Icons/Tooltip";
import DotLoader from "./Icons/DotLoader";

interface ChapterItemProps {
  chapter: Chapter;
  index: number;
  updateChapter: (index: number, updatedChapter: any) => void;
  removeChapter: (index: number) => void;
  courseId: string;
}

const ChapterItem: React.FC<ChapterItemProps> = ({
  chapter,
  index,
  updateChapter,
  removeChapter,
  courseId,
}) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [isAddingLecture, setIsAddingLecture] = useState(false);
  const [lectures, setLectures] = useState<Lecture[]>(chapter.lectures || []);
  const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null);
  const [isSaved, setIsSaved] = useState(!!chapter.title);
  const [chapterId, setChapterId] = useState<string>(
    chapter.id?.toString() || ""
  ); // Ensure chapterId is a string
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const showAlert = useSweetAlert();

  // console.log("chapter of course",chapter)
  // console.log("course add course id from chapter Items",courseId)

  const handleSaveChapterDetails = (details: {
    title: string;
    description: string;
    order: string;
    duration: string;
  }) => {
    const updatedChapter = {
      ...chapter,
      ...details,
    };
    updateChapter(index, updatedChapter);
    setIsSaved(true);
  };

  const handleChapterSaved = (response: any) => {
    if (response && response.chapter && response.chapter.length > 0) {
      setChapterId(response.chapter[0].id); // Set the database ID after saving and ensure it's not null
    } else {
      console.error("Chapter ID not found in response:", response);
      showAlert("error", "Chapter ID not found in response.");
    }
    setIsSaved(true);
  };

  const handleSaveLecture = async (newLecture: Lecture) => {
    // Fetch the latest lectures from the server after saving the lecture
    try {
      // Assuming you have an API to fetch the lectures for the chapter
      const response = await fetch(
        `/api/courses/chapters/lectures?chapterId=${chapterId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching updated lectures:", errorData.message);
        showAlert("error", "Failed to fetch updated lectures.");
        return;
      }

      const updatedLectures = await response.json();

      // Update the lectures state with the new fetched data
      setLectures(updatedLectures.data);

      // Reset the current lecture to null after saving
      setCurrentLecture(null);

      // Calculate the new total duration for the chapter
      const totalDurationInMinutes = updatedLectures.data.reduce(
        (total, lecture) => total + parseInt(lecture.duration),
        0
      );

      // Update the chapter with the new list of lectures and duration
      const updatedChapter = {
        ...chapter,
        lectures: updatedLectures.data,
        order: (updatedLectures.data.length + 1).toString(), // Adjust order
        duration: `${totalDurationInMinutes} minutes`, // Update duration
      };

      // Update the parent component with the new chapter
      updateChapter(index, updatedChapter);
      setIsAddingLecture(false); // Close the lecture form
    } catch (error) {
      console.error("An error occurred while saving the lecture:", error);
      showAlert("error", "Failed to save the lecture.");
    }
  };

  const removeLecture = async (lectureIndex: number) => {
    const lectureToRemove = lectures[lectureIndex];
    setIsLoading(true);

    try {
      // Make the API call to remove the lecture from the database
      const response = await fetch(
        `/api/courses/chapters/lectures/${lectureToRemove.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Remove the lecture from the state only if the API call was successful
        const updatedLectures = lectures.filter(
          (_, idx) => idx !== lectureIndex
        );
        const result = await response.json();
        setLectures(updatedLectures);
        setIsLoading(false);
        showAlert("success", result.message);

        const updatedChapter = {
          ...chapter,
          lectures: updatedLectures,
          duration: `${updatedLectures.reduce(
            (total, lecture) => total + parseInt(lecture.duration),
            0
          )} minutes`,
        };

        updateChapter(index, updatedChapter);
      } else {
        const errorData = await response.json();
        setIsLoading(false);
        console.error(`Failed to remove lecture: ${errorData.message}`);
        showAlert("error", `Failed to remove lecture: ${errorData.message}`);
      }
    } catch (error) {
      setIsLoading(false);
      console.error("An error occurred while removing the lecture:", error);
      showAlert("error", "An error occurred while removing the lecture.");
    }
  };

  const handleEditLecture = async (lecture: Lecture, lectureIndex: number) => {
    console.log(
      "handleEditLecture called with lecture:",
      lecture,
      "and lectureIndex:",
      lectureIndex
    );
    setIsLoading(true);
    try {
      // Make the API call to update the lecture in the database
      const response = await fetch(
        `/api/courses/chapters/lectures?id=${lecture.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(lecture),
        }
      );

      if (response.ok) {
        const result = await response.json();
        const updatedLectures = lectures.map((lec, idx) =>
          idx === lectureIndex ? result.lecture[0] : lec
        );
        setLectures(updatedLectures);

        const updatedChapter = {
          ...chapter,
          lectures: updatedLectures,
          duration: `${updatedLectures.reduce(
            (total, lecture) => total + parseInt(lecture.duration),
            0
          )} minutes`,
        };

        updateChapter(index, updatedChapter);
      } else {
        console.error("Failed to update lecture");
      }
    } catch (error) {
      console.error("An error occurred while updating the lecture:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle canceling lecture creation
  const handleCancelLecture = () => {
    setIsAddingLecture(false); // Close the form when canceled
    setCurrentLecture(null); // Reset current lecture
  };

  const onEditLecture = (lecture: Lecture, lectureIndex: number) => {
    setCurrentLecture(lecture);
    setIsAddingLecture(true); // Show the lecture form for editing
  };

  const toggleAccordion = () => {
    setIsAccordionOpen(!isAccordionOpen);
  };

  const toggleAddLectureForm = () => {
    setCurrentLecture(null); // Clear currentLecture when toggling form
    setIsAddingLecture((prev) => !prev);
  };

  const removeChapterHandler = async () => {
    if (!chapterId) return;

    setIsLoading(true);

    try {
      // Make the API call to remove the chapter from the database
      const response = await fetch(`/api/courses/chapters?id=${chapterId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Remove the chapter from the state only if the API call was successful
        removeChapter(index);
        setIsLoading(false);
      } else {
        const errorData = await response.json();
        setIsLoading(false);
        console.error(`Failed to remove chapter: ${errorData.message}`);
      }
    } catch (error) {
      setIsLoading(false);
      console.error("An error occurred while removing the chapter:", error);
    }
  };

  

  return (
    <li className="mb-5 relative">
      <div className="bg-white dark:bg-gray-800 shadow-accordion dark:shadow-accordion-dark rounded-md p-4">
        <ChapterAdd
          title={chapter.title || ""}
          description={chapter.description || ""}
          initialOrder={chapter.order ? parseInt(chapter.order, 10) : 0}
          initialDuration={chapter.duration || "0 minutes"}
          onSave={handleSaveChapterDetails}
          courseId={courseId || ""}
          setChapterId={handleChapterSaved} // Pass the entire response to set the DB chapter ID
        />
        {isSaved && (
          <div className="absolute top-8 right-6 pr-4 flex items-center">
            <Tooltip content="Click to expand Lessens" position="left">
              <button
                type="button"
                onClick={toggleAccordion}
                className="text-gray-500 flex items-center justify-center ml-2 transform transition-transform"
                style={{
                  transform: isAccordionOpen ? "rotate(90deg)" : "rotate(0)",
                }}
                title="Toggle Details"
              >
                <svg
                  width="20"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                  ></path>
                </svg>
              </button>
            </Tooltip>
            <button
              type="button"
              onClick={toggleAddLectureForm}
              className="text-green-500 ml-2"
              title="Add Lecture"
            >
              <Tooltip content="Click to add lesson" position="top">
                +
              </Tooltip>
            </button>
            <button
              type="button"
              onClick={removeChapterHandler}
              className="text-red-500 ml-2"
              title="Remove Chapter"
            >
              <Tooltip content="Click to del chapter" position="right">
                {isLoading ? <DotLoader /> : "X"}
              </Tooltip>
            </button>
          </div>
        )}
      </div>

      {isAccordionOpen && (
        <div className="mt-4">
          <CurriculumContent
            chapters={[
              {
                id: parseInt(chapterId || chapter.id.toString(), 10), // Ensure ID is a number
                title: chapter.title,
                duration: `${lectures
                  .filter((lecture) => lecture !== undefined) // Ensure only valid lectures are considered
                  .reduce(
                    (total, lecture) =>
                      total + (Number(lecture?.duration) || 0),
                    0
                  )} minutes`,
                lectures,
              },
            ]}
            onEditLecture={onEditLecture}
            removeLecture={removeLecture}
            loading={isLoading}
          />
        </div>
      )}

      {isAddingLecture && (
        <div className="mt-4">
          <CreateLecture
            chapterId={chapterId || ""} // Ensure chapterId is a string
            courseId={courseId || ""}
            onSave={handleSaveLecture}
            onCancel={handleCancelLecture}
            initialData={currentLecture ? currentLecture : undefined} // Pass the current lecture for editing
          />
        </div>
      )}
    </li>
  );
};

export default ChapterItem;

// import React, { useState } from "react";
// import CurriculumContent from "./CorriculumContent";
// import { Lecture, Chapter } from "@/types/type";
// import CreateLecture from "./CreateLecture";
// import ChapterAdd from "./ChapterAdd";

// interface ChapterItemProps {
//   chapter: Chapter;
//   index: number;
//   updateChapter: (index: number, updatedChapter: any) => void;
//   removeChapter: (index: number) => void;
//   courseId: string;
// }

// const ChapterItem: React.FC<ChapterItemProps> = ({
//   chapter,
//   index,
//   updateChapter,
//   removeChapter,
//   courseId,
// }) => {
//   const [isAccordionOpen, setIsAccordionOpen] = useState(false);
//   const [isAddingLecture, setIsAddingLecture] = useState(false);
//   const [lectures, setLectures] = useState<Lecture[]>(chapter.lectures || []);
//   const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null);
//   const [isSaved, setIsSaved] = useState(!!chapter.name);
//   const [chapterId, setChapterId] = useState<string>(chapter.id?.toString() || ""); // Ensure chapterId is a string
//   const [isLoading, setIsLoading] = useState<boolean>(false);

//   console.log("chapterId from ChapterItem:", chapterId);

//   const handleSaveChapterDetails = (details: { title: string; description: string; order: string; duration: string }) => {
//     const updatedChapter = {
//       ...chapter,
//       ...details,
//     };
//     updateChapter(index, updatedChapter);
//     setIsSaved(true);
//   };

//   const handleChapterSaved = (response: any) => {
//     if (response && response.chapter && response.chapter.length > 0) {
//       setChapterId(response.chapter[0].id); // Set the database ID after saving and ensure it's not null
//     } else {
//       console.error("Chapter ID not found in response:", response);
//     }
//     setIsSaved(true);
//   };

//   const handleSaveLecture = (newLecture: Lecture) => {
//     const updatedLectures = currentLecture
//       ? lectures.map((lecture) =>
//           lecture.id === currentLecture.id ? newLecture : lecture
//         )
//       : [...lectures, newLecture];

//     setLectures(updatedLectures);
//     setCurrentLecture(null);

//     const updatedChapter = {
//       ...chapter,
//       lectures: updatedLectures,
//       order: (updatedLectures.length + 1).toString(),
//       duration: `${updatedLectures.reduce(
//         (total, lecture) => total + parseInt(lecture.duration),
//         0
//       )} minutes`,
//     };

//     updateChapter(index, updatedChapter);
//     setIsAddingLecture(false);
//   };

//   const removeLecture = async (lectureIndex: number) => {
//     const lectureToRemove = lectures[lectureIndex];
//     setIsLoading(true);

//     try {
//       // Make the API call to remove the lecture from the database
//       const response = await fetch(`/api/courses/chapters/lectures/${lectureToRemove.id}`, {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         // Remove the lecture from the state only if the API call was successful
//         const updatedLectures = lectures.filter((_, idx) => idx !== lectureIndex);
//         setLectures(updatedLectures);
//         setIsLoading(false);

//         const updatedChapter = {
//           ...chapter,
//           lectures: updatedLectures,
//           duration: `${updatedLectures.reduce(
//             (total, lecture) => total + parseInt(lecture.duration),
//             0
//           )} minutes`,
//         };

//         updateChapter(index, updatedChapter);
//       } else {
//         const errorData = await response.json();
//         setIsLoading(false);
//         console.error(`Failed to remove lecture: ${errorData.message}`);
//       }
//     } catch (error) {
//       setIsLoading(false);
//       console.error("An error occurred while removing the lecture:", error);
//     }
//   };

//   const handleEditLecture = async (lecture: Lecture, lectureIndex: number) => {
//     console.log("handleEditLecture called with lecture:", lecture, "and lectureIndex:", lectureIndex);
//     setIsLoading(true);
//     try {
//       // Make the API call to update the lecture in the database
//       const response = await fetch(`/api/courses/chapters/lectures?id=${lecture.id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(lecture),
//       });

//       if (response.ok) {
//         const result = await response.json();
//         const updatedLectures = lectures.map((lec, idx) =>
//           idx === lectureIndex ? result.lecture[0] : lec
//         );
//         setLectures(updatedLectures);

//         const updatedChapter = {
//           ...chapter,
//           lectures: updatedLectures,
//           duration: `${updatedLectures.reduce(
//             (total, lecture) => total + parseInt(lecture.duration),
//             0
//           )} minutes`,
//         };

//         updateChapter(index, updatedChapter);
//       } else {
//         console.error("Failed to update lecture");
//       }
//     } catch (error) {
//       console.error("An error occurred while updating the lecture:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const onEditLecture = (lecture: Lecture, lectureIndex: number) => {
//     setCurrentLecture(lecture);
//     setIsAddingLecture(true); // Show the lecture form for editing
//   };

//   const toggleAccordion = () => {
//     setIsAccordionOpen(!isAccordionOpen);
//   };

//   const toggleAddLectureForm = () => {
//     setCurrentLecture(null); // Clear currentLecture when toggling form
//     setIsAddingLecture((prev) => !prev);
//   };

//   return (
//     <li className="mb-5 relative">
//       <div className="bg-white dark:bg-gray-800 shadow-accordion dark:shadow-accordion-dark rounded-md p-4">
//         <ChapterAdd
//           title={chapter.name || ""}
//           description={chapter.description || ""}
//           initialOrder={chapter.order ? parseInt(chapter.order, 10) : 0}
//           initialDuration={chapter.duration || "0 minutes"}
//           onSave={handleSaveChapterDetails}
//           courseId={courseId}
//           setChapterId={handleChapterSaved} // Pass the entire response to set the DB chapter ID
//           chapterId={chapterId} // Pass chapterId to determine if it’s an update or create
//         />
//         {isSaved && (
//           <div className="absolute top-8 right-6 pr-4 flex items-center">
//             <button
//               type="button"
//               onClick={toggleAccordion}
//               className="text-gray-500 ml-2 transform transition-transform"
//               style={{
//                 transform: isAccordionOpen ? "rotate(90deg)" : "rotate(0)",
//               }}
//               title="Toggle Details"
//             >
//               <svg
//                 width="20"
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 16 16"
//                 fill="currentColor"
//               >
//                 <path
//                   fillRule="evenodd"
//                   d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
//                 ></path>
//               </svg>
//             </button>
//             <button
//               type="button"
//               onClick={toggleAddLectureForm}
//               className="text-green-500 ml-2"
//               title="Add Lecture"
//             >
//               +
//             </button>
//             <button
//               type="button"
//               onClick={() => removeChapter(index)}
//               className="text-red-500 ml-2"
//               title="Remove Chapter"
//             >
//               X
//             </button>
//           </div>
//         )}
//       </div>

//       {isAccordionOpen && (
//         <div className="mt-4">
//           <CurriculumContent
//             chapters={[
//               {
//                 id: parseInt(chapterId || chapter.id.toString(), 10), // Ensure ID is a number
//                 name: chapter.name,
//                 duration: `${lectures.reduce(
//                   (total, lecture) => total + parseInt(lecture.duration),
//                   0
//                 )} minutes`,
//                 lectures,
//               },
//             ]}
//             onEditLecture={onEditLecture}
//             removeLecture={removeLecture}
//             loading={isLoading}
//           />
//         </div>
//       )}

//       {isAddingLecture && (
//         <div className="mt-4">
//           <CreateLecture
//             chapterId={chapterId || ""} // Ensure chapterId is a string
//             onSave={handleSaveLecture}
//             initialData={currentLecture ? currentLecture : undefined} // Pass the current lecture for editing
//           />
//         </div>
//       )}
//     </li>
//   );
// };

// export default ChapterItem;
