"use client"
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ProgressBanner from "./ProgressBanner";
import ProgressBannerSkeleton from "./ProgressBannerSkeleton"; // Import the skeleton

interface EnrolledCourse {
  courseId: string;
  progress: number; // Use this progress value directly from backend
  completedLectures: string[]; // Array of completed lectures
  chapters: Chapter[];
}

interface Chapter {
  chapterId: string;
  lectureIds: string[]; // These are the completed lecture IDs for that chapter
}

interface Course {
  id: string;
  title: string;
  chapters: CourseChapter[];
}

interface CourseChapter {
  id: string;
  lessons: Lesson[]; // These are the total lessons (lectures) in the chapter
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
}

interface UserCoursesProps {
  currentCourseId: string;
  course: Course;
  enrolledCourses: EnrolledCourse[];
}

const UserCourses: React.FC<UserCoursesProps> = ({
  currentCourseId,
  enrolledCourses,
  course,
}) => {
  const { data: session } = useSession();
  const user = session?.user;

  const [courseData, setCourseData] = useState<Course | null>(course || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (course) {
      setCourseData(course);
      setLoading(false);
    }
  }, [course]);

  // If loading, return skeleton
  if (loading) {
    return <ProgressBannerSkeleton />;
  }

  // If there is an error, show the error message
  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  // If course data is not available, show a message
  if (!courseData) {
    return <p className="text-gray-500">No course data available.</p>;
  }

  // Find the enrolled course object for the current course
  const enrolledCourse = enrolledCourses.find(
    (c) => c.courseId === currentCourseId
  );

  if (!enrolledCourse) {
    return <p className="text-gray-500">You are not enrolled in this course.</p>;
  }

  // Use the progress value directly from the enrolled course data
  const progress = enrolledCourse.progress || 0;

  // Calculate total lessons in the course
  let totalLessons = 0;
  courseData.chapters.forEach((chapter) => {
    totalLessons += chapter.lessons.length; // Counting all lessons in the chapter
  });

  // Calculate the number of completed lessons from the backend data
  const completedLessons = enrolledCourse.completedLectures.length;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Display Course Title */}
      <h2 className="text-2xl font-bold mb-6">
        {courseData.title || "Untitled Course"}
      </h2>

      {/* Progress Banner */}
      <ProgressBanner
        progress={progress} // Using progress from backend
        completedLectures={completedLessons} // Completed lessons from backend
        totalLectures={totalLessons} // Total lessons from course data
      />
    </div>
  );
};

export default UserCourses;
