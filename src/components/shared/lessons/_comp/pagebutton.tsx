import { useState } from "react";

const LessonPage = ({ lessonId }) => {
    const [quizData, setQuizData] = useState(null);

    const fetchQuiz = async () => {
        try {
            const response = await fetch(`/api/lessons/${lessonId}/quiz`);
            const data = await response.json();
            if (response.ok) {
                setQuizData(data);
                openQuizPopup(data);
            } else {
                alert(data.message || "Failed to load quiz");
            }
        } catch (error) {
            console.error("Error fetching quiz:", error);
        }
    };

    const openQuizPopup = (quiz) => {
        const quizWindow = window.open("", "QuizPopup", "width=600,height=700");
        if (quizWindow) {
            quizWindow.document.write(`
                <html>
                    <head>
                        <title>${quiz.title}</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            .question { margin-bottom: 20px; }
                            .options { margin-left: 20px; }
                            .submit-btn { background: #007bff; color: white; padding: 10px; border: none; cursor: pointer; }
                        </style>
                    </head>
                    <body>
                        <h2>${quiz.title}</h2>
                        ${quiz.questions.map((q, i) => `
                            <div class="question">
                                <p><strong>${i + 1}. ${q.text}</strong></p>
                                <div class="options">
                                    ${q.options.map((option, j) => `
                                        <label>
                                            <input type="radio" name="q${i}" value="${option}" /> ${option}
                                        </label><br/>
                                    `).join("")}
                                </div>
                            </div>
                        `).join("")}
                        <button class="submit-btn">Submit Quiz</button>
                    </body>
                </html>
            `);
        }
    };

    return (
        <button className="px-4 py-2 bg-primaryColor text-white rounded hover:bg-opacity-90"
            onClick={fetchQuiz}>
            Start Quiz This
        </button>
    );
};

export default LessonPage;
