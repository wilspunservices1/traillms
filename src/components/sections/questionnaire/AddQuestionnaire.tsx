"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSweetAlert from '@/hooks/useSweetAlert';

interface AddQuestionnaireProps {
  onClose?: () => void;
}

const AddQuestionnaire: React.FC<AddQuestionnaireProps> = ({ onClose }) => {
  const [quizId, setQuizId] = useState<string>('');
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizzes, setQuizzes] = useState<Array<{ id: string; title: string; }>>([]);
  const router = useRouter();
  const showAlert = useSweetAlert();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [questions, setQuestions] = useState<{ id: string; question: string; options: string; correctAnswer: string; }[]>([]);
  const [courses, setCourses] = useState<Array<{ id: string; title: string; }>>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [title, setTitle] = useState('');
  const [questionnaireId, setQuestionnaireId] = useState<string>('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        setCourses(data.data || []);
      } catch (error) {
        showAlert('error', 'Failed to load courses');
      }
    };
    fetchCourses();
  }, []);

  // Add new option field
  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    } else {
      showAlert('warning', 'Maximum 6 options allowed');
    }
  };

  // Remove option field
  const handleRemoveOption = (indexToRemove: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, index) => index !== indexToRemove);
      setOptions(newOptions);
      if (correctAnswer === options[indexToRemove]) {
        setCorrectAnswer('');
      }
    } else {
      showAlert('warning', 'Minimum 2 options required');
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddQuestion = () => {
    if (!question.trim()) {
      showAlert('error', 'Please enter a question');
      return;
    }

    const filledOptions = options.filter(opt => opt.trim());
    if (filledOptions.length < 2) {
      showAlert('error', 'Please add at least 2 options');
      return;
    }

    if (!correctAnswer) {
      showAlert('error', 'Please select the correct answer');
      return;
    }

    const newQuestion = {
      id: Date.now().toString(),
      question,
      options: JSON.stringify(filledOptions),
      correctAnswer
    };

    setQuestions([...questions, newQuestion]);

    // Reset form
    setQuestion('');
    setOptions(['', '']);
    setCorrectAnswer('');
  };

  const handleSaveQuestionnaire = async () => {
    if (!quizTitle.trim()) {
      showAlert("error", "Quiz title is required");
      return;
    }

    if (!selectedCourse) {
      showAlert("error", "Please select a course");
      return;
    }

    if (questions.length === 0) {
      showAlert("error", "Please add at least one question");
      return;
    }

    try {
      const saveResponse = await fetch("/api/questionnaire/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: quizTitle,
          courseId: selectedCourse,
          questions: questions.map(q => ({
            question: q.question,
            options: JSON.parse(q.options),
            correctAnswer: q.correctAnswer
          })),
          isRequired: true,
          minPassScore: 80
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Failed to save questionnaire');
      }

      const savedData = await saveResponse.json();
      console.log('Saved questionnaire data:', savedData);

      if (savedData.success) {
        setQuestionnaireId(savedData.data.questionnaireId);
        showAlert("success", "Questionnaire saved successfully");
        onClose?.();
        router.refresh();
      } else {
        throw new Error(savedData.error || 'Failed to save questionnaire');
      }
    } catch (error) {
      console.error("Error saving questionnaire:", error);
      showAlert("error", error.message || "Failed to save questionnaire");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white dark:bg-whiteColor-dark p-6 rounded-lg shadow">
        {/* Hidden input for questionnaire ID */}
        <input
          type="hidden"
          name="questionnaire_id"
          id="questionnaire_id"
          value={questionnaireId}
        />

        {/* Course Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Course
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primaryColor focus:border-transparent"
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

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

        {/* Question Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primaryColor outline-none"
            placeholder="Enter your question"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Options</label>
          {options.map((option, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-primaryColor outline-none"
                placeholder={`Option ${index + 1}`}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              )}
              <div className="ml-2">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={correctAnswer === option}
                  onChange={() => setCorrectAnswer(option)}
                  className="mr-1"
                  disabled={!option.trim()}
                />
                <label className="text-sm text-gray-600">Correct</label>
              </div>
            </div>
          ))}

          {options.length < 6 && (
            <button
              type="button"
              onClick={handleAddOption}
              className="mt-2 text-primaryColor hover:text-secondaryColor flex items-center"
            >
              <span className="mr-1">+</span> Add Option
            </button>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={handleAddQuestion}
            className="bg-secondaryColor text-white px-4 py-2 rounded hover:bg-opacity-90"
          >
            Add Question
          </button>
          <button
            type="button"
            onClick={handleSaveQuestionnaire}
            className="bg-primaryColor text-white px-4 py-2 rounded hover:bg-opacity-90"
          >
            Save Questionnaire
          </button>
        </div>
        {/* Save Quiz Button */}
        <div className="mt-4">
          <button
            onClick={handleSaveQuestionnaire}
            className="w-full px-4 py-2 text-white rounded-md bg-primaryColor hover:bg-primaryColor-dark"
          >
            Save Quiz
          </button>
        </div>
      </div>

      {/* Display added questions */}
      {questions.length > 0 && (
        <div className="bg-white dark:bg-whiteColor-dark p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-semibold mb-4">Added Questions</h2>
          {questions.map((q, index) => (
            <div key={q.id} className="mb-4 p-4 border rounded">
              <p className="font-medium">Question {index + 1}: {q.question}</p>
              <ul className="ml-4 mt-2">
                {JSON.parse(q.options).map((opt, i) => (
                  <li
                    key={i}
                    className={opt === q.correctAnswer ? 'text-green-600 font-medium' : ''}
                  >
                    {opt} {opt === q.correctAnswer && '✓'}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddQuestionnaire;