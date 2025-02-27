import { useState, useEffect } from "react";
import CourseCard from "../courses/CourseCard";
import { getEnrollCoursesFromIds } from "@/actions/getEnrollCourses"; // Ensure this function is available to fetch courses by ID
// import useSweetAlert from "@/hooks/useSweetAlert"; // Assuming you're using SweetAlert for notifications

const CompletedContent = ({ enrolledCourses }) => {
  const [loading, setLoading] = useState(false);
  const [completedCourses, setCompletedCourses] = useState([]);
  // const showAlert = useSweetAlert();

  // console.log("Enrolled courses provided:courses,completedCourses", completedCourses?.data);

  // Fetch enrolled courses details
  useEffect(() => {
    const fetchCompletedCourses = async () => {
      if (!enrolledCourses?.length) {
        console.warn("No enrolled courses provided.");
        return;
      }

      setLoading(true);

      try {
        // Filter enrolled courses where progress is 100%
        const completedEnrolledCourses = enrolledCourses.filter(
          (course) => course.progress === 100
        );

        // If no courses have 100% progress, show a message
        if (!completedEnrolledCourses.length) {
          console.warn("No completed courses found.");
          setCompletedCourses([]); // Set an empty array
          return;
        }

        // Fetch the course details for courses with 100% progress
        const courseDetails = await getEnrollCoursesFromIds(completedEnrolledCourses);

        if (Array.isArray(courseDetails)) {
          setCompletedCourses(courseDetails);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Failed to fetch completed courses:", err);
        // showAlert.error("Failed to load completed courses.");
        setCompletedCourses([]); // Set an empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedCourses();
  }, [enrolledCourses]);

  if (loading) {
    return <p>Loading completed courses...</p>;
  }

  if (!completedCourses.length) {
    return <p>No completed courses found.</p>;
  }

  return completedCourses?.map((course, idx) => (
    <CourseCard key={idx} course={course?.data} enrolledCourses={enrolledCourses} type={"primary"} />
  ));
};

export default CompletedContent;





// import CourseCard from "../courses/CourseCard";

// const CompletedContent = ({ courses }) => {

  
//   return courses?.map((course, idx) => (
//     <CourseCard key={idx} course={course} type={"primary"} />
//   ));
// };

// export default CompletedContent;
