"use client";

import React, { useEffect, useState, FC } from 'react';
import Link from 'next/link';
import useSweetAlert from '@/hooks/useSweetAlert';
import EditQuiz from './EditQuiz';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Questionnaire {
  id: string;
  title: string;
  courseId: string;
  questions: Question[];
  createdAt: string;
  status: 'active' | 'draft' | 'archived';
}

interface Course {
  id: string;
  title: string;
  chapters: Chapter[];
}

interface Chapter {
  id: string;
  title: string;
}

interface ManageQuestionnaireProps {
  questionnaireId: string;
  mode: 'take' | 'manage';
  onComplete?: () => void;
  onClose: () => void;
}

const ManageQuestionnaire: FC<ManageQuestionnaireProps> = ({
  questionnaireId,
  mode,
  onComplete,
  onClose,
}) => {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuestionnaire, setExpandedQuestionnaire] = useState<string | null>(null);
  const showAlert = useSweetAlert();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState<string>('');
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (mode === 'take') {
      fetchSingleQuestionnaire();
    } else {
      fetchQuestionnaires();
    }
  }, [questionnaireId, mode]);

  const fetchQuestionnaires = async () => {
    try {
      const response = await fetch('/api/questionnaire/list');
      if (!response.ok) throw new Error('Failed to fetch questionnaires');
      const data = await response.json();
      setQuestionnaires(data.questionnaires);
    } catch (error) {
      console.error('Error fetching questionnaires:', error);
      showAlert('error', 'Failed to load questionnaires');
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleQuestionnaire = async () => {
    try {
      const response = await fetch(`/api/courses/chapters/lectures/questionnaires/${questionnaireId}`);
      if (!response.ok) throw new Error('Failed to fetch questionnaire');
      const data = await response.json();
      setQuestionnaire(data.questionnaire);
    } catch (error) {
      console.error('Error fetching questionnaire:', error);
      showAlert('error', 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestionnaireExpansion = (id: string) => {
    setExpandedQuestionnaire(expandedQuestionnaire === id ? null : id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this questionnaire?')) {
      try {
        const response = await fetch(`/api/courses/chapters/lectures/questionnaires/?id=${id}`, {
          method: 'DELETE',
        });
  
        const result = await response.json();
  
        if (!response.ok) {
          throw new Error(result.error || 'Failed to delete questionnaire');
        }
  
        if (result.success) {
          setQuestionnaires(questionnaires.filter(q => q.id !== id));
          showAlert('success', 'Questionnaire deleted successfully');
        } else {
          throw new Error(result.error || 'Failed to delete questionnaire');
        }
      } catch (error) {
        console.error('Error deleting questionnaire:', error);
        showAlert('error', `Failed to delete questionnaire: ${error.message}`);
      }
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      setCourses(data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      showAlert('error', 'Failed to load courses');
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitQuiz = async () => {
    try {
      const response = await fetch('/api/questionnaire/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionnaireId,
          answers: userAnswers
        }),
      });

      if (!response.ok) throw new Error('Failed to submit quiz');
      
      const result = await response.json();
      showAlert('success', `Quiz completed! Score: ${result.score}%`);
      onComplete?.();
      onClose();
    } catch (error) {
      console.error('Error submitting quiz:', error);
      showAlert('error', 'Failed to submit quiz');
    }
  };

  if (mode === 'take') {
    if (loading) {
      return <div className="text-center py-4">Loading quiz...</div>;
    }

    if (!questionnaire) {
      return <div className="text-center py-4">Quiz not found</div>;
    }

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">{questionnaire.title}</h2>
        
        {questionnaire.questions.map((question, index) => (
          <div key={question.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <p className="font-medium mb-3">
              Question {index + 1}: {question.question}
            </p>
            <div className="space-y-2">
              {question.options.map((option, optIndex) => (
                <label key={optIndex} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    checked={userAnswers[question.id] === option}
                    onChange={() => handleAnswerSelect(question.id, option)}
                    className="form-radio"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitQuiz}
            className="px-4 py-2 bg-primaryColor text-white rounded hover:bg-secondaryColor"
          >
            Submit Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Questionnaires</h1>
        <Link 
          href="/dashboards/questionnaire/add"
          className="bg-primaryColor text-white px-4 py-2 rounded hover:bg-secondaryColor transition-colors"
        >
          Create New Questionnaire
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading questionnaires...</div>
      ) : questionnaires.length === 0 ? (
        <div className="text-center py-4">No questionnaires found</div>
      ) : (
        <div className="space-y-4">
          {questionnaires.map((questionnaire) => (
            <div key={questionnaire.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => toggleQuestionnaireExpansion(questionnaire.id)}
              >
                <div>
                  <h3 className="text-lg font-semibold">{questionnaire.title}</h3>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(questionnaire.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 text-sm rounded-full ${
                    questionnaire.status === 'active' ? 'bg-green-100 text-green-800' :
                    questionnaire.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {questionnaire.status}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(questionnaire.id);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingQuizId(questionnaire.id);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {expandedQuestionnaire === questionnaire.id && (
                <div className="p-4 border-t">
                  <h4 className="font-medium mb-3">Questions ({questionnaire.questions.length})</h4>
                  <div className="space-y-4">
                    {questionnaire.questions.map((question, index) => (
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
              )}
            </div>
          ))}
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Assign Questionnaire</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCourse && (
                <div>
                  <label className="block text-sm font-medium mb-1">Select Chapter</label>
                  <select
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select a chapter</option>
                    {courses
                      .find(c => c.id === selectedCourse)
                      ?.chapters.map((chapter) => (
                        <option key={chapter.id} value={chapter.id}>
                          {chapter.title}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingQuizId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
            <EditQuiz
              quizId={editingQuizId}
              onClose={() => setEditingQuizId(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageQuestionnaire;