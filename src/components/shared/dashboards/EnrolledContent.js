import { useState, useEffect } from "react";
import CourseCard from "../courses/CourseCard";
import { getEnrollCoursesFromIds } from "@/actions/getEnrollCourses";
import useSweetAlert from "@/hooks/useSweetAlert";

const EnrolledContent = ({ enrolledCourses }) => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const showAlert = useSweetAlert();

  // console.log("Enrolled courses provided:courses", enrolledCourses);

  // Fetch enrolled courses details
  useEffect(() => {
    const fetchCourses = async () => {
      if (!enrolledCourses?.length) {
        console.warn("No enrolled courses provided.");
        return;
      }

      setLoading(true);

      try {
        // console.log("Fetching course details for:", enrolledCourses);
        const courseDetails = await getEnrollCoursesFromIds(enrolledCourses);
        // console.log("Fetched course details:", courseDetails);

        setCourses(courseDetails);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [enrolledCourses]);

  if (loading) {
    return <p>Loading courses...</p>;
  }

  if (!courses.length) {
    return <p>No enrolled courses found.</p>;
  }

  return courses.map((course, idx) => (
    <CourseCard key={idx} course={course?.data} type={"primary"} enrolledCourses={enrolledCourses} />
  ));
};

export default EnrolledContent;
