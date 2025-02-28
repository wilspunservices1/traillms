"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSweetAlert from '@/hooks/useSweetAlert';

interface EditQuizProps {
  quizId: string;
  onClose: () => void;
}

const EditQuiz: React.FC<EditQuizProps> = ({ quizId, onClose }) => {
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState<{ id: string; question: string; options: string[]; correctAnswer: string; }[]>([]);
  const router = useRouter();
  const showAlert = useSweetAlert();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/questionnaire/${quizId}`);
        if (!response.ok) throw new Error('Failed to fetch quiz');
        const data = await response.json();
        setQuizTitle(data.title);
        setQuestions(data.questions);
      } catch (error) {
        showAlert('error', 'Failed to load quiz');
      }
    };
    fetchQuiz();
  }, [quizId,showAlert]);

  const handleSaveQuiz = async () => {
    if (!quizTitle.trim()) {
      showAlert("error", "Quiz title is required");
      return;
    }

    if (questions.length === 0) {
      showAlert("error", "Please add at least one question");
      return;
    }

    try {
      const saveResponse = await fetch(`/api/questionnaire/${quizId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: quizTitle,
          questions: questions.map(q => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer
          })),
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Failed to save quiz');
      }

      const savedData = await saveResponse.json();
      console.log('Saved quiz data:', savedData);

      if (savedData.success) {
        showAlert("success", "Quiz saved successfully");
        onClose();
        router.refresh();
      } else {
        throw new Error(savedData.error || 'Failed to save quiz');
      }
    } catch (error) {
      console.error("Error saving quiz:", error);
      showAlert("error", error.message || "Failed to save quiz");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white dark:bg-whiteColor-dark p-6 rounded-lg shadow">
        {/* Quiz Title Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quiz Title
          </label>
          <input
            type="text"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primaryColor focus:border-transparent"
            placeholder="Enter quiz title"
          />
        </div>

        {/* Questions List */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">Questions ({questions.length})</h4>
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="pl-4 border-l-2 border-gray-200">
                <p className="font-medium">Q{index + 1}: {question.question}</p>
                <div className="ml-4 mt-2">
                  <p className="text-sm font-medium text-gray-500">Options:</p>
                  <ul className="list-disc ml-5 text-sm">
                    {question.options.map((option, optIndex) => (
                      <li 
                        key={optIndex}
                        className={option === question.correctAnswer ? 'text-green-600 font-medium' : ''}
                      >
                        {option} {option === question.correctAnswer && '(Correct)'}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={onClose}
            className="bg-secondaryColor text-white px-4 py-2 rounded hover:bg-opacity-90"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveQuiz}
            className="bg-primaryColor text-white px-4 py-2 rounded hover:bg-opacity-90"
          >
            Save Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditQuiz;
