"use client";

import React from "react";
import CourseCard from "@/components/shared/courses/CourseCard";

const QuestionnaireContent = ({ enrolledCourses }) => {
  // Filter courses that have questionnaires
  const coursesWithQuestionnaires =
    enrolledCourses?.filter(
      (course) => course.progress >= 80 // Only show questionnaires for courses with 80% or more progress
    ) || [];

  if (!coursesWithQuestionnaires.length) {
    return (
      <div className="col-span-full text-center py-10">
        <p className="text-gray-500 dark:text-gray-400">
          Complete at least 80% of a course to unlock its questionnaire.
        </p>
      </div>
    );
  }

  return (
    <>
      {coursesWithQuestionnaires.map((course, idx) => (
        <div key={idx} className="w-full sm:w-auto sm:px-15px mb-30px">
          <CourseCard
            id={course.courseId}
            type="questionnaire"
            progress={course.progress}
            completedLectures={course.completedLectures}
            isQuestionnaire={true}
          />
        </div>
      ))}
    </>
  );
};

export default QuestionnaireContent;
