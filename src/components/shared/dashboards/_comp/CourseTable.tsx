"use client";
import React, { useState } from "react";
import useSweetAlert from "@/hooks/useSweetAlert";
import DotLoader from "@/components/sections/create-course/_comp/Icons/DotLoader";
import { CldImage } from "next-cloudinary";
import { useRouter } from "next/navigation";

const CourseTable = ({ courses, setCourses }) => {
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const showAlert = useSweetAlert();
  const [loading, setLoading] = useState(null); // Track loading state for each course
  const router = useRouter();

  const handleDropdownToggle = (courseId) => {
    setSelectedCourseId((prevSelectedCourseId) =>
      prevSelectedCourseId === courseId ? null : courseId
    );
  };

  // Function to delete a course
  const deleteCourse = async (courseId) => {
    setLoading(courseId); // Set loading state for this course
    try {
      const response = await fetch(
        `/api/courses/${courseId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete the course");
      }

      // Remove the deleted course from the state
      setCourses((prevCourses) =>
        prevCourses.filter((course) => course.id !== courseId)
      );
      showAlert("success", `Course deleted successfully`);
    } catch (error) {
      console.error(error);
      showAlert("error", "Failed to delete the course");
    } finally {
      setLoading(null); // Reset loading state
    }
  };

  // Function to change the status (publish/draft) of a course
  const changeCourseStatus = async (courseId, isPublished) => {
    setLoading(courseId); // Set loading state for this course
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublished }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to update the course status"
        );
      }

      const data = await response.json();

      // Update the course status in the state
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === courseId ? { ...course, isPublished } : course
        )
      );

      showAlert(
        "success",
        `Course status updated to ${isPublished ? "Published" : "Draft"}`
      );
    } catch (error) {
      console.error(error);
      showAlert("error", `Error updating the course status: ${error.message}`);
    } finally {
      setLoading(null); // Reset loading state
    }
  };

  // Handle action based on button click
  const handleAction = (courseId, action) => {
    setSelectedCourseId(null); // Close the dropdown after action
    if (action === "delete") {
      deleteCourse(courseId);
    } else if (action === "publish") {
      changeCourseStatus(courseId, true); // Set to publish
    } else if (action === "draft") {
      changeCourseStatus(courseId, false); // Set to draft
    }else if (action === "edit") {
      router.push(`/courses/${courseId}/edit-course`);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
              Image
            </th>
            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
              Title
            </th>
            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
              Created At
            </th>
            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
              Price
            </th>
            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {courses.map((course) => (
            <tr key={course.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <CldImage
                  src={course.thumbnail || ""}
                  alt={course.title || ""}
                  className="w-16 h-16 object-cover rounded-md"
                  width={100}
                  height={100}
                  sizes={"60w"}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                {course.title.length > 12
                  ? `${course.title.slice(0, 12)}...`
                  : course.title}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                {new Date(course.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                {course.isFree ? "Free" : `$${course.price}`}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                <span
                  className={`inline-block px-3 py-1 rounded-md text-white text-xs font-bold ${
                    course.isPublished ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {course.isPublished ? "Published" : "Draft"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                <div className="relative inline-block text-left">
                  {/* Show loader when loading this specific course */}
                  {loading === course.id ? (
                    <DotLoader className="h-2 w-2" />
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleDropdownToggle(course.id)}
                        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                      >
                        ...
                      </button>

                      {selectedCourseId === course.id && (
                        <div className="origin-top-right z-[9999] absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                          <div className="py-1">
                            <button
                              onClick={() => handleAction(course.id, "edit")}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleAction(course.id, "delete")}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() =>
                                handleAction(
                                  course.id,
                                  course.isPublished ? "draft" : "publish"
                                )
                              }
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              {course.isPublished ? "Draft" : "Publish"}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CourseTable;

// "use client";
// import React, { useState } from "react";

// const CourseTable = ({ courses }) => {
//   const [selectedCourseId, setSelectedCourseId] = useState(null);

//   const handleDropdownToggle = (courseId) => {
//     setSelectedCourseId((prevSelectedCourseId) =>
//       prevSelectedCourseId === courseId ? null : courseId
//     );
//   };

//   const handleAction = (courseId, action) => {
//     console.log(`Action: ${action}, Course ID: ${courseId}`);
//     setSelectedCourseId(null); // Optionally close dropdown after action
//   };

//   return (
//     <div className="">
//       <table className="min-w-full">
//         <thead className="bg-gray-50">
//           <tr>
//             <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Image</th>
//             <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Title</th>
//             <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Created At</th>
//             <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Price</th>
//             <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Status</th>
//             <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase">Actions</th>
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-gray-200">
//           {courses.map((course) => (
//             <tr key={course.id}>
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <img src={course.thumbnail} alt={course.title} className="w-16 h-16 object-cover rounded-md" />
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
//                 {course.title.length > 12 ? `${course.title.slice(0, 12)}...` : course.title}
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
//                 {new Date(course.createdAt).toLocaleDateString()}
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
//                 {course.isFree ? "Free" : `$${course.price}`}
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
//                 <span className={`inline-block px-3 py-1 rounded-md text-white text-xs font-bold ${course.isPublished ? "bg-green-500" : "bg-red-500"}`}>
//                   {course.isPublished ? "Published" : "Draft"}
//                 </span>
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
//                 <div className="relative inline-block text-left">
//                   <button
//                     type="button"
//                     onClick={() => handleDropdownToggle(course.id)}
//                     className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
//                   >
//                     ...
//                   </button>

//                   {selectedCourseId === course.id && (
//                     <div className="origin-top-right z-[9999] absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
//                       <div className="py-1">
//                         <button
//                           onClick={() => handleAction(course.id, "edit")}
//                           className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//                         >
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => handleAction(course.id, "delete")}
//                           className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//                         >
//                           Delete
//                         </button>
//                         <button
//                           onClick={() => handleAction(course.id, course.isPublished ? "draft" : "publish")}
//                           className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//                         >
//                           {course.isPublished ? "Draft" : "Publish"}
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default CourseTable;
