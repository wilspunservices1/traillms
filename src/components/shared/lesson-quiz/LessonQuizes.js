"use client";

import React, { useState, useEffect } from "react";

const LessonQuizes = ({ courseId }) => {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch(`/api/questionnaire/${courseId}`);
        if (!response.ok) throw new Error("Failed to fetch quizzes");
        const data = await response.json();
        setQuizzes(data.questions || []);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };

    if (courseId) {
      fetchQuizzes();
    }
  }, [courseId]);

  return (
    <div>
      <h2>Quizzes</h2>
      {quizzes.length === 0 ? (
        <p>No quizzes available.</p>
      ) : (
        quizzes.map((quiz) => (
          <div key={quiz.id}>
            <h3>{quiz.question}</h3>
            {/* Render options or other quiz details here */}
          </div>
        ))
      )}
    </div>
  );
};

export default LessonQuizes;
