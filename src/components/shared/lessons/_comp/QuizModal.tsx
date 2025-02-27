"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface QuizModalProps {
  quiz: {
    title: string;
    questions: { id: number; question: string; options: string[]; correct_answer: string }[];
    questionnaireId: number;
  };
  onClose: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ quiz, onClose }) => {
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleOptionSelect = (questionId: number, answer: string) => {
    setUserAnswers({ ...userAnswers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    let correctAnswers = 0;

    quiz.questions.forEach((q) => {
      if (userAnswers[q.id]?.toLowerCase() === q.correct_answer.toLowerCase()) {
        correctAnswers++;
      }
    });

    const scorePercentage = Math.round((correctAnswers / quiz.questions.length) * 100);
    setScore(scorePercentage);
    setSubmitted(true);

    // Simulate API call
    console.log("Submitted Quiz Data:", { questionnaireId: quiz.questionnaireId, answers: userAnswers });

    // Call backend API
    try {
      const response = await fetch("/api/questionnaire/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionnaireId: quiz.questionnaireId, answers: userAnswers }),
      });

      if (!response.ok) {
        console.error("Error submitting quiz:", response.statusText);
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error);
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
      >
        {/* Close Button */}
        <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" onClick={onClose}>
          ✖
        </button>

        {/* Quiz Title */}
        <h2 className="text-xl font-bold text-center border-b pb-2">{quiz.title}</h2>

        {/* Questions List */}
        <div className="mt-4 space-y-4">
          {quiz.questions.map((q, index) => (
            <div key={q.id} className="border p-4 rounded-lg bg-gray-100">
              <p className="font-semibold">{index + 1}. {q.question}</p>
              <div className="mt-2 space-y-1">
                {q.options.map((option, i) => (
                  <label key={i} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`q${q.id}`}
                      value={option}
                      checked={userAnswers[q.id] === option}
                      onChange={() => handleOptionSelect(q.id, option)}
                      className="text-indigo-500 focus:ring-indigo-400"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit & Score */}
        <div className="mt-6 text-center">
          {!submitted ? (
            <button 
              onClick={handleSubmit}
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition"
            >
              Submit Quiz
            </button>
          ) : (
            <p className="mt-4 text-lg font-semibold text-indigo-700">
              You scored {score}%!
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuizModal;
