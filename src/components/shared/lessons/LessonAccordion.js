"use client";

import React, { useEffect, useState } from "react";
import LessonList from "./_comp/LessonList"; // Import the LessonList component
import Extras from "./_comp/Extras";
import AccordionSkeleton from "@/components/Loaders/AccordianSkel";
import { BASE_URL } from "@/actions/constant";
import QuestionnaireQuiz from "@/components/shared/lessons/_comp/QuizModal";
import Swal from "sweetalert2";

// Function to fetch chapters by chapterId
const fetchChaptersByChapterId = async (chapterId) => {
	try {
		const res = await fetch(
			`${BASE_URL}/api/courses/chapters/${chapterId}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			}
		);
		if (!res.ok) {
			throw new Error("Failed to fetch chapters");
		}
		const data = await res.json();
		return data;
	} catch (error) {
		console.error("Error fetching chapters:", error);
		return null;
	}
};

const LessonAccordion = ({
	chapterId,
	extra = null, // Default value if extra is not provided
	isEnrolled = false,
	courseOwnerId = "",
	userRoles = [], // Default to empty array to prevent undefined errors
}) => {
	const [chapters, setChapters] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeIndex, setActiveIndex] = useState(-1); // Initialize to -1 (no accordion open)
	const [questionnaires, setQuestionnaires] = useState({});

	const [progressRefresh, setProgressRefresh] = useState(0); // 👈 Add this line

	const [activeQuiz, setActiveQuiz] = useState(null);
	const [courseQuizzes, setCourseQuizzes] = useState(null);
	const [questionnaireId, setQuestionnaireId] = useState(null);
	const [showQuiz, setShowQuiz] = useState(false);

	const [quizScores, setQuizScores] = useState({}); // Stores scores
	const [quizAttempts, setQuizAttempts] = useState({}); // ✅ Define quizAttempts state
	const [attemptsLoaded, setAttemptsLoaded] = useState(false); // ✅ Track whether attempts have been fetched

	// Determine user roles
	const isSuperAdmin = userRoles.includes("superAdmin");
	const isInstructor = userRoles.includes("instructor");
	const isCourseOwner = courseOwnerId !== "" && isInstructor;

	// Determine if the user can access all lessons
	const canAccessAll = isSuperAdmin || isEnrolled || isCourseOwner;

	useEffect(() => {
		console.log("Updated attempts:", quizAttempts);
	}, [quizAttempts]); // ✅ Logs whenever quizAttempts state updates

	useEffect(() => {
		const fetchQuizAttempts = async () => {
			try {
				const response = await fetch(
					`${BASE_URL}/api/get-quiz-attempts`,
					{
						method: "GET",
						headers: { "Content-Type": "application/json" },
						credentials: "include",
					}
				);

				const data = await response.json();

				if (response.ok && data.attempts) {
					setQuizAttempts(data.attempts);
				} else {
					console.error("Failed to fetch quiz attempts");
				}
			} catch (error) {
				console.error("Error fetching quiz attempts:", error);
			} finally {
				setAttemptsLoaded(true);
			}
		};

		fetchQuizAttempts();
	}, [progressRefresh]);

	useEffect(() => {
		const fetchProgress = async () => {
			try {
				const res = await fetch(`${BASE_URL}/api/progress`, {
					method: "GET",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
				});
				if (res.ok) {
					const data = await res.json();
					setQuizScores(data.scores); // Store scores in state
				} else {
					console.error("Failed to fetch progress");
				}
			} catch (error) {
				console.error("Error fetching progress:", error);
			}
		};

		fetchProgress();
	}, [chapterId, progressRefresh]); // ✅ Runs again when progress changes

	useEffect(() => {
		const loadChaptersAndQuestionnaires = async () => {
			setLoading(true);
			console.log("Fetching chapters for chapterId:", chapterId);

			const fetchedChapters = await fetchChaptersByChapterId(chapterId);

			if (fetchedChapters?.chapters) {
				setChapters(fetchedChapters.chapters);
				// Collect questionnaire IDs
				const chapterQuestionnaires = fetchedChapters.chapters
					.filter((chapter) => chapter.questionnaireId != null)
					.map((chapter) => ({
						chapterId: chapter.id,
						questionnaireId: chapter.questionnaireId,
					}));

				console.log("Questionnaire IDs found:", chapterQuestionnaires);

				if (chapterQuestionnaires.length > 0) {
					try {
						const quizPromises = chapterQuestionnaires.map(
							({ chapterId, questionnaireId }) =>
								// .filter(({ questionnaireId }) => questionnaireId !== null)
								fetch(
									`${BASE_URL}/api/courses/chapters/lectures/questionnaires/${questionnaireId}`
								)
									.then((res) =>
										res.ok
											? res.json()
											: Promise.reject(
													`Failed to fetch quiz for chapter ${chapterId}`
											  )
									)
									.then((quizData) => ({
										chapterId,
										quizData,
									}))
						);

						const quizResults = await Promise.allSettled(
							quizPromises
						);
						const quizzes = {};
						quizResults.forEach((result) => {
							if (result.status === "fulfilled") {
								const { chapterId, quizData } = result.value;
								quizzes[chapterId] = {
									id: quizData.id,
									title: quizData.title,
									questions: quizData.questions,
									questionnaireId: quizData.id,
								};
							} else {
								console.error(
									"Quiz fetch error:",
									result.reason
								);
							}
						});

						setQuestionnaires(quizzes);
					} catch (error) {
						console.error("Error fetching questionnaires:", error);
					}
				}
			}

			setLoading(false);
		};

		loadChaptersAndQuestionnaires();
	}, [chapterId, progressRefresh]);

	const updateScoreInAccordion = (questionnaireId, scorePercentage) => {
		const quizSection = document.querySelector(
			`[data-questionnaire-id="${questionnaireId}"]`
		);

		if (!quizSection) return;

		// Create a score box
		let scoreBox = quizSection.querySelector(".quiz-score-box");

		if (!scoreBox) {
			scoreBox = document.createElement("div");
			scoreBox.className = "quiz-score-box";
			scoreBox.style.background = "#F2277E";
			scoreBox.style.color = "white";
			scoreBox.style.padding = "5px 10px";
			scoreBox.style.borderRadius = "6px";
			scoreBox.style.fontSize = "14px";
			scoreBox.style.fontWeight = "bold";
			scoreBox.style.marginTop = "5px";
			scoreBox.style.display = "inline-block"; // Ensure it's visible
			scoreBox.style.marginLeft = "10px";
			quizSection.appendChild(scoreBox);
		}

		// Update score text and ensure visibility
		scoreBox.innerText = `Score: ${scorePercentage}%`;
		scoreBox.style.display = "inline-block"; // Ensure it becomes visible
	};

	const handleQuizStart = (quiz) => {
		// ✅ Step 1: Check if an overlay already exists
		const existingOverlay = document.getElementById("quiz-overlay");
		if (existingOverlay) {
			existingOverlay.remove(); // ✅ Remove the existing overlay before creating a new one
		}

		// Create the modal overlay
		const overlay = document.createElement("div");
		overlay.id = "quiz-overlay";
		overlay.style.position = "fixed";
		overlay.style.top = "0";
		overlay.style.left = "0";
		overlay.style.width = "100%";
		overlay.style.height = "100%";
		overlay.style.background = "rgba(0, 0, 0, 0.5)";
		overlay.style.display = "flex";
		overlay.style.justifyContent = "center";
		overlay.style.alignItems = "center";
		overlay.style.zIndex = "1000";

		// Create the modal box
		const modal = document.createElement("div");
		modal.style.width = "90%";
		modal.style.maxWidth = "900px";
		modal.style.background = "#fff";
		modal.style.padding = "30px";
		modal.style.borderRadius = "15px";
		modal.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
		modal.style.position = "relative";
		modal.style.maxHeight = "80vh";
		modal.style.overflowY = "auto";

		// Close button
		const closeButton = document.createElement("button");
		closeButton.innerHTML = "✖";
		closeButton.style.position = "absolute";
		closeButton.style.top = "10px";
		closeButton.style.right = "15px";
		closeButton.style.border = "none";
		closeButton.style.background = "none";
		closeButton.style.color = "black";
		closeButton.style.fontSize = "20px";
		closeButton.style.cursor = "pointer";
		closeButton.onclick = () => document.body.removeChild(overlay);

		// Quiz title
		const title = document.createElement("h2");
		title.innerText = quiz.title;
		title.style.textAlign = "center";
		title.style.marginBottom = "15px";
		title.style.fontSize = "30px";
		title.style.fontWeight = "bold";
		title.style.borderBottom = "2px solid #ccc";

		// Scrollable content container
		const contentContainer = document.createElement("div");
		contentContainer.style.maxHeight = "60vh";
		contentContainer.style.overflowY = "auto";

		// Generate questions
		quiz.questions.forEach((q, i) => {
			const questionBox = document.createElement("div");
			questionBox.style.border = "1px solid #ccc";
			questionBox.style.borderRadius = "8px";
			questionBox.style.padding = "10px";
			questionBox.style.marginBottom = "10px";
			questionBox.style.background = "#f8f8f8";

			const questionTitle = document.createElement("p");
			questionTitle.innerHTML = `<strong>${i + 1}. ${
				q.question
			}</strong>`;

			let options;
			try {
				options = JSON.parse(q.options);
			} catch (error) {
				console.error(
					"Failed to parse options for question:",
					q.question,
					error
				);
				options = [];
			}

			const optionsContainer = document.createElement("div");
			options.forEach((option) => {
				const label = document.createElement("label");
				label.style.display = "block";
				label.style.marginTop = "5px";

				const input = document.createElement("input");
				input.type = "radio";
				input.name = `q${i}`;
				input.value = option;
				input.style.marginRight = "5px";

				label.appendChild(input);
				label.appendChild(document.createTextNode(option));
				optionsContainer.appendChild(label);
			});

			questionBox.appendChild(questionTitle);
			questionBox.appendChild(optionsContainer);
			contentContainer.appendChild(questionBox);
		});

		// Create the submit button
		const submitButton = document.createElement("button");
		submitButton.innerText = "Submit Quiz";
		submitButton.style.padding = "10px 20px";
		submitButton.style.background = "#5F2DED";
		submitButton.style.color = "white";
		submitButton.style.border = "none";
		submitButton.style.borderRadius = "6px";
		submitButton.style.cursor = "pointer";
		submitButton.style.fontSize = "16px";
		submitButton.style.display = "block";
		submitButton.style.marginLeft = "auto";
		submitButton.style.marginTop = "auto";

		// Create a score field (Initially Hidden)
		const scoreField = document.createElement("p");
		scoreField.innerText = "Score: 0%";
		scoreField.style.textAlign = "center";
		scoreField.style.fontSize = "18px";
		scoreField.style.fontWeight = "bold";
		scoreField.style.color = "#F2277E";
		scoreField.style.marginBottom = "15px";
		scoreField.style.display = "none";

		// Submit Button Click Event
		submitButton.onclick = async () => {
			try {
				// ✅ Collect user answers before submitting
				let userAnswers = {};
				let correctAnswers = 0;

				quiz.questions.forEach((q, index) => {
					const selectedOption = document.querySelector(
						`input[name="q${index}"]:checked`
					);

					const correctAnswer =
						q.correct_answer || q.correctAnswer
							? String(q.correct_answer || q.correctAnswer)
									.trim()
									.toLowerCase()
							: null;

					const selectedAnswer = selectedOption
						? String(selectedOption.value).trim().toLowerCase()
						: null;

					if (selectedAnswer === correctAnswer) correctAnswers++;

					userAnswers[q.id] = selectedAnswer;
				});

				const totalQuestions = quiz.questions.length;
				const scorePercentage =
					totalQuestions > 0
						? Math.round((correctAnswers / totalQuestions) * 100)
						: 0;

				// ✅ Now define `quizAttemptData` before using it
				const quizAttemptData = {
					questionnaire_id: quiz.questionnaireId,
					answers: userAnswers,
				};

				// ✅ API Request
				const response = await fetch(
					`${BASE_URL}/api/questionnaire/submit`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(quizAttemptData),
					}
				);

				let data;
				try {
					const text = await response.text();
					data = JSON.parse(text);
				} catch {
					throw new Error("Invalid server response");
				}

				if (!response.ok) {
					throw new Error(data.error || "Failed to submit quiz");
				}

				console.log("Quiz submitted successfully!", data);

				const updatedAttempts = Number(data.attemptCount) || 0;

				// ✅ Ensure the score updates immediately in UI
				setQuizScores((prev) => ({
					...prev,
					[quiz.questionnaireId]: scorePercentage, // ✅ Store the latest score
				}));

				// ✅ Update the state with the latest attempt count
				setQuizAttempts((prev) => ({
					...prev,
					[quiz.questionnaireId]: Number(updatedAttempts) || 0,
				}));

				// ✅ Ensure state always has a valid number
				if (!Number.isFinite(updatedAttempts)) {
					setQuizAttempts((prev) => ({
						...prev,
						[quiz.questionnaireId]: 3, // Assume max attempts to prevent rendering error
					}));
				}

				// ✅ Update UI without a full page reload
				setProgressRefresh((prev) => prev + 1);

				// ✅ Check if max attempts are reached
				const attemptsLeft = Math.max(0, 3 - updatedAttempts);

				// ✅ Show SweetAlert based on attempts left
				Swal.fire({
					icon: attemptsLeft > 0 ? "warning" : "error",
					title:
						attemptsLeft > 0
							? "Quiz Attempted"
							: "No more attempts left!",
					text:
						attemptsLeft > 0
							? `${attemptsLeft} attempt(s) left out of 3`
							: "You have reached the maximum quiz attempts.",
					timer: 3000,
					showConfirmButton: false,
				});

				// ✅ Remove "Start Quiz" button dynamically when attempts reach 3
				if (updatedAttempts >= 3) {
					const startQuizButton = document.querySelector(
						`[data-questionnaire-id="${quiz.questionnaireId}"] .start-quiz-btn`
					);
					if (startQuizButton) startQuizButton.remove();
				}
			} catch (error) {
				console.error("Error submitting quiz:", error);

				// ✅ Ensure error doesn't break state
				setQuizAttempts((prev) => ({
					...prev,
					[quiz.questionnaireId]: 3, // Assume max attempts
				}));

				Swal.fire({
					icon: "error",
					title: "Submission Error",
					text:
						error.message ||
						"Something went wrong. Please try again.",
				});
			}
		};

		// Append elements in correct order
		modal.prepend(title);
		modal.appendChild(closeButton);
		modal.appendChild(contentContainer);
		modal.appendChild(submitButton);
		modal.insertBefore(scoreField, contentContainer);
		overlay.appendChild(modal);
		document.body.appendChild(overlay); // ✅ Add to body
	};

	if (loading) {
		return (
			<div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark rounded-t-md">
				<AccordionSkeleton />
			</div>
		);
	}

	if (!chapters || chapters.length === 0) {
		return <p>No chapters available.</p>;
	}

	// Toggle the active state of the accordion
	const toggleAccordion = (index) => {
		setActiveIndex((prevIndex) => (prevIndex === index ? -1 : index));
	};

	// Determine if Extras should be displayed outside LessonList
	const canAccessExtras = canAccessAll && extra;

	if (loading) {
		return (
			<div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark rounded-t-md">
				<AccordionSkeleton />
			</div>
		);
	}

	if (!chapters || chapters.length === 0) {
		return <p>No chapters available.</p>;
	}

	// Define a unique index for "Course Materials"
	const courseMaterialsIndex = chapters.length;

	// Add after courseMaterialsIndex definition
	const quizSectionIndex = courseMaterialsIndex + 1;

	return (
		<div>
			<ul className="accordion-container curriculum">
				{chapters.map((chapter, index) => (
					<li
						key={chapter.id}
						className={`accordion mb-25px overflow-hidden ${
							activeIndex === index ? "active" : ""
						}`}
					>
						<div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark rounded-t-md">
							{/* Controller */}
							<div>
								<button
									className="accordion-controller flex justify-between items-center text-xl text-headingColor font-bold w-full px-5 py-18px dark:text-headingColor-dark font-hind leading-[20px]"
									onClick={() => toggleAccordion(index)} // Handle accordion toggle
									aria-expanded={activeIndex === index}
									aria-controls={`chapter-content-${index}`}
								>
									<span>{chapter.title}</span>

									<svg
										className={`transition-all duration-500 ${
											activeIndex === index
												? "rotate-180"
												: "rotate-0"
										}`}
										width="20"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 16 16"
										fill="#212529"
									>
										<path
											fillRule="evenodd"
											d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
										></path>
									</svg>
								</button>
							</div>

							{/* Content */}
							<div
								id={`chapter-content-${index}`}
								className={`accordion-content transition-all duration-500 ${
									activeIndex === index
										? "max-h-screen"
										: "max-h-0"
								}`}
								style={{ overflow: "hidden" }}
							>
								<div className="content-wrapper p-10px md:px-30px">
									<LessonList lessons={chapter.lessons} />

									{/* Quiz Button */}
									{questionnaires[chapter.id] && (
										<div
											className="mt-4 border-t pt-4"
											data-questionnaire-id={
												questionnaires[chapter.id].id
											}
										>
											<div className="flex items-center justify-between">
												<h3 className="text-lg font-medium">
													Chapter Quiz:{" "}
													{
														questionnaires[
															chapter.id
														].title
													}
												</h3>

												<div className="flex items-center">
													{/* Start Quiz Button */}
													{(() => {
														const quizId =
															questionnaires[
																chapter.id
															]?.id;

														// ✅ Ensure quiz attempts are loaded before rendering the button
														if (!attemptsLoaded)
															return null;

														// ✅ Get attempts from state, default to 0 if not found
														const attempts =
															quizId &&
															typeof quizAttempts[
																quizId
															] === "number"
																? quizAttempts[
																		quizId
																  ]
																: 0;

														// ✅ Ensure we are always working with a valid number
														const validAttempts =
															Number.isFinite(
																attempts
															)
																? attempts
																: 3;

														// ✅ Calculate remaining attempts
														const attemptsLeft =
															Math.max(
																0,
																3 -
																	validAttempts
															);

														// ✅ Prevent Rendering Errors
														if (
															Number.isNaN(
																attemptsLeft
															) ||
															attemptsLeft < 0
														) {
															console.error(
																"Invalid attempt count detected:",
																quizAttempts[
																	quizId
																]
															);
															return null; // Prevent React from rendering an invalid state
														}

														return attemptsLeft >
															0 ? (
															<button
																onClick={() =>
																	handleQuizStart(
																		{
																			...questionnaires[
																				chapter
																					.id
																			],
																			questions:
																				questionnaires[
																					chapter
																						.id
																				].questions.map(
																					(
																						q
																					) => ({
																						...q,
																						correct_answer:
																							q.correct_answer ||
																							q.correctAnswer,
																					})
																				),
																		}
																	)
																}
																className="ml-2 flex items-center bg-primaryColor text-whiteColor text-sm rounded py-1 px-3 hover:bg-primaryColor-dark transition-colors start-quiz-btn"
															>
																Start Quiz
															</button>
														) : (
															<p
																style={{
																	color: "red",
																	fontWeight:
																		"bold",
																}}
															>
																No more attempts
																left
															</p>
														);
													})()}
												</div>
											</div>

											<p className="text-sm text-gray-600">
												{
													questionnaires[chapter.id]
														.questions.length
												}{" "}
												Questions
											</p>
											{/* Show the latest score from the API */}
											<div className="quiz-score-box bg-pink-500 text-white text-sm px-3 py-1 rounded mt-2">
												Score:{" "}
												{Number(
													quizScores[
														questionnaires[
															chapter.id
														]?.id
													]
												) || 0}
												%
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</li>
				))}

				{/* Course Materials */}
				{isEnrolled && (
					<li
						className={`accordion mb-25px overflow-hidden ${
							activeIndex === courseMaterialsIndex ? "active" : ""
						}`}
					>
						<div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark rounded-t-md">
							<button
								className="accordion-controller flex justify-between items-center text-xl text-headingColor font-bold w-full px-5 py-18px dark:text-headingColor-dark font-hind leading-[20px]"
								onClick={() =>
									toggleAccordion(courseMaterialsIndex)
								}
							>
								<span>Course Materials</span>
								<svg
									className={`transition-all duration-500 ${
										activeIndex === courseMaterialsIndex
											? "rotate-180"
											: "rotate-0"
									}`}
									width="20"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 16 16"
									fill="#212529"
								>
									<path
										fillRule="evenodd"
										d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
									></path>
								</svg>
							</button>
							<div
								id={`course-materials-content-${courseMaterialsIndex}`}
								className={`accordion-content transition-all duration-500 ${
									activeIndex === courseMaterialsIndex
										? "max-h-screen"
										: "max-h-0"
								}`}
								style={{ overflow: "hidden" }}
							>
								<div className="content-wrapper p-10px md:px-30px">
									<Extras lessonId={chapters[0]?.id} />
								</div>
							</div>
						</div>
					</li>
				)}
			</ul>
		</div>
	);
};

export default LessonAccordion;
