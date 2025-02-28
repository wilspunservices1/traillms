"use client";

import React, { useEffect, useRef, useState } from "react";
import TabButtonSecondary from "@/components/shared/buttons/TabButtonSecondary";
import CoursesGrid from "@/components/shared/courses/CoursesGrid";
import CoursesList from "@/components/shared/courses/CoursesList";
import Pagination from "@/components/shared/others/Pagination";
import TabContentWrapper from "@/components/shared/wrappers/TabContentWrapper";
import useTab from "@/hooks/useTab";
import NoData from "@/components/shared/others/NoData";
import SkeletonResultsText from "@/components/Loaders/LineSkeleton";
import CourseGridCardSkeleton from "@/components/Loaders/GridCard";
import { useSession } from "next-auth/react";

const sortInputs = [
	"Sort by New",
	"Title Ascending",
	"Title Descending",
	"Price Ascending",
	"Price Descending",
];

const CoursesPrimary = ({ isNotSidebar, isList, card }) => {
	const [allCourses, setAllCourses] = useState([]); // Store all courses
	const [currentCategories, setCurrentCategories] = useState([]);
	const [currentTags, setCurrentTags] = useState([]);
	const [currentSkillLevels, setCurrentSkillLevels] = useState([]);
	const [filters, setFilters] = useState([]); // Initialize as empty array
	const [sortInput, setSortInput] = useState("Sort by New");
	const [totalCourses, setTotalCourses] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const coursesRef = useRef(null);

	const { data: session } = useSession();
	const [enrolledCourses, setEnrolledCourses] = useState([]);

	const { currentIdx, handleTabClick } = useTab();

	const limit = 12;

	useEffect(() => {
		if (session) {
			// Fetch enrolled courses from your API
			fetch(`/api/user/${session.user.id}/enrollCourses`)
				.then((res) => res.json())
				.then((data) => {
					setEnrolledCourses(data);
				})
				.catch((error) =>
					console.error("Error fetching enrolled courses:", error)
				);
		}
	}, [session]);


	const fetchCourses = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			// Construct query params for filters
			const params = new URLSearchParams();
			params.set("isPublished", "true");

			// Append multiple categories
			(currentCategories ?? []).forEach((category) => {
				params.append("category", category);
			});

			// Append multiple tags
			(currentTags ?? []).forEach((tag) => {
				params.append("tag", tag);
			});

			// Append multiple skill levels
			(currentSkillLevels ?? []).forEach((skillLevel) => {
				params.append("skillLevel", skillLevel);
			});

			if (sortInput) {
				params.set("sort", sortInput);
			}

			// Pagination params
			params.set("page", String(currentPage ?? 1));
			params.set("limit", String(limit ?? 10));

			const response = await fetch(`/api/courses?${params.toString()}`);

			if (!response.ok) {
				throw new Error(
					`Error fetching courses: ${response.status} - ${response.statusText}`
				);
			}

			const result = await response.json();

			if (!result || !result.data || !Array.isArray(result.data)) {
				throw new Error("Invalid response structure from API");
			}

			setAllCourses(result.data);
			setTotalCourses(result.total ?? 0);
		} catch (error) {
			console.error("Fetch Courses Error:", error);
			setError(
				error instanceof Error
					? error.message
					: "An unknown error occurred"
			);
		} finally {
			setIsLoading(false);
		}
	}, [
		currentCategories,
		currentTags,
		currentSkillLevels,
		sortInput,
		currentPage,
		limit,
	]);

	// Fetch filters from API
  const fetchFilters = useCallback(async () => {
      setIsLoading(true);
      setError(null);
  
      try {
          // Fetch filters considering only published courses
          const response = await fetch(`/api/courses/filters?isPublished=true`);
  
          if (!response.ok) {
              throw new Error(`Failed to fetch filters: ${response.status} - ${response.statusText}`);
          }
  
          const filterData = await response.json();
          setFilters(filterData); // Store filter data in state as an array
      } catch (error) {
          console.error("Fetch Filters Error:", error);
          setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
          setIsLoading(false);
      }
  }, []); // Dependencies array is empty since no dynamic values are used inside
  
   
	// Fetch courses and filters when dependencies change
	useEffect(() => {
		fetchFilters(); // Fetch filters
		fetchCourses(); // Fetch courses
	}, [fetchCourses, fetchFilters]); // Now fetchCourses is correctly included

	// Trigger course fetching when filters or sorting changes
	useEffect(() => {
		fetchCourses();
	}, [
		currentCategories,
		currentTags,
		currentSkillLevels,
		sortInput,
		currentPage,
		fetchCourses,
	]);

	// Handle pagination
	const handlePagination = (id) => {
		if (id === "next" && currentPage * limit < totalCourses) {
			setCurrentPage((prev) => prev + 1);
		} else if (id === "prev" && currentPage > 1) {
			setCurrentPage((prev) => prev - 1);
		} else if (typeof id === "number") {
			setCurrentPage(id + 1);
		}
		coursesRef.current.scrollIntoView({ behavior: "smooth" });
	};

	// Get filter inputs based on current state
	const getCurrentFilterInputs = (input, ps) => {
		if (input === "All") {
			return ps.includes("All") ? [] : ["All"];
		} else {
			return ps.includes(input)
				? ps.filter((item) => item !== input && item !== "All")
				: [...ps.filter((item) => item !== "All"), input];
		}
	};

	// Handle filter selection
	const handleFilters = (name, input) => {
		switch (name) {
			case "Categories":
				setCurrentCategories((prev) =>
					getCurrentFilterInputs(input, prev)
				);
				break;
			case "Tags":
				setCurrentTags((prev) => getCurrentFilterInputs(input, prev));
				break;
			case "Skill Levels":
				setCurrentSkillLevels((prev) =>
					getCurrentFilterInputs(input, prev)
				);
				break;
			default:
				break;
		}
		setCurrentPage(1); // Reset to first page on filter change
	};

	const totalPages = Math.ceil(totalCourses / limit);
	const paginationItems = Array.from(
		{ length: totalPages },
		(_, index) => index + 1
	);

	const tapButtons = [
		{
			name: <i className="icofont-layout"></i>,
			content: (
				<CoursesGrid
					isNotSidebar={isNotSidebar}
					courses={allCourses}
					enrolledCourses={enrolledCourses}
				/>
			),
		},
		{
			name: <i className="icofont-listine-dots"></i>,
			content: (
				<CoursesList
					isNotSidebar={isNotSidebar}
					isList={isList}
					courses={allCourses}
					card={card}
					enrolledCourses={enrolledCourses}
				/>
			),
		},
	];

	return (
		<div>
			<div
				className="container tab py-10 md:py-30px lg:py-40px 2xl:py-70px"
				ref={coursesRef}
			>
				{/* Courses Header */}
				<div
					className="courses-header flex justify-between items-center flex-wrap px-13px py-5px border border-borderColor dark:border-borderColor-dark mb-30px gap-y-5"
					data-aos="fade-up"
				>
					<div>
						{isLoading ? (
							<SkeletonResultsText />
						) : allCourses && totalCourses ? (
							<p className="text-blackColor dark:text-blackColor-dark">
								Showing {(currentPage - 1) * limit + 1} -{" "}
								{currentPage * limit >= totalCourses
									? totalCourses
									: currentPage * limit}{" "}
								of {totalCourses} Results
							</p>
						) : (
							<p>No results found</p>
						)}
					</div>
					<div className="flex items-center">
						<div className="tab-links transition-all duraton-300 text-contentColor dark:text-contentColor-dark flex gap-11px">
							{tapButtons?.map(({ name }, idx) => (
								<TabButtonSecondary
									key={idx}
									name={name}
									button={"icon"}
									currentIdx={currentIdx}
									handleTabClick={handleTabClick}
									idx={idx}
								/>
							))}
						</div>
						<div className="pl-50px sm:pl-20 pr-10px">
							<select
								className="text-blackColor bg-whiteColor py-2 pr-2 pl-3 rounded-md outline-none border-4 border-transparent focus:border-blue-light box-border"
								value={sortInput}
								onChange={(e) => setSortInput(e.target.value)}
							>
								{sortInputs.map((input, idx) => (
									<option key={idx} value={input}>
										{input}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				<div
					className={`grid grid-cols-1 ${
						isNotSidebar ? "" : "md:grid-cols-12"
					} gap-30px`}
				>
					{/* Courses Sidebar */}
					{!isNotSidebar && (
						<div className="md:col-start-1 md:col-span-4 lg:col-span-3">
							<div className="flex flex-col">
								{/* Dynamic categories and filters from API */}
								{Array.isArray(filters) &&
								filters.length > 0 ? (
									filters?.map(({ name, inputs }, idx) => (
										<div
											key={idx}
											className="pt-30px pr-15px pl-10px pb-23px 2xl:pt-10 2xl:pr-25px 2xl:pl-5 2xl:pb-33px mb-30px border border-borderColor dark:border-borderColor-dark"
											data-aos="fade-up"
										>
											<h4 className="text-size-22 text-blackColor dark:text-blackColor-dark font-bold leading-30px mb-15px">
												{name}
											</h4>
											<ul
												className={`flex flex-col ${
													name === "Categories"
														? "gap-y-4"
														: name === "Tags"
														? "gap-y-23px"
														: "gap-y-10px"
												}`}
											>
												{inputs?.map((input, idx1) => (
													<li key={idx1}>
														<button
															onClick={() =>
																handleFilters(
																	name,
																	input.name ||
																		input
																)
															}
															className={`${
																(currentCategories.includes(
																	input.name ||
																		input
																) &&
																	name ===
																		"Categories") ||
																(currentTags.includes(
																	input.name ||
																		input
																) &&
																	name ===
																		"Tags") ||
																(currentSkillLevels.includes(
																	input.name ||
																		input
																) &&
																	name ===
																		"Skill Levels")
																	? "bg-primaryColor text-contentColor-dark"
																	: "text-contentColor dark:text-contentColor-dark hover:text-contentColor-dark hover:bg-primaryColor"
															} text-sm font-medium px-13px py-2 border border-borderColor dark:border-borderColor-dark flex justify-between leading-7 transition-all duration-300 w-full`}
														>
															<span>
																{input.name
																	? input.name
																	: input}
															</span>
															{input.totalCount && (
																<span>
																	{
																		input.totalCount
																	}
																</span>
															)}
														</button>
													</li>
												))}
											</ul>
										</div>
									))
								) : (
									<p>No filters available</p>
								)}
							</div>
						</div>
					)}

					{/* Courses Main Section */}
					<div
						className={`${
							isNotSidebar
								? ""
								: "md:col-start-5 md:col-span-8 lg:col-start-4 lg:col-span-9"
						} space-y-[30px]`}
					>
						{isLoading ? (
							<div
								className={`grid grid-cols-1 ${
									isNotSidebar
										? "sm:grid-cols-2 xl:grid-cols-3"
										: "sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
								} gap-30px`}
							>
								{/* Render multiple skeleton cards */}
								{[...Array(6)].map((_, idx) => (
									<CourseGridCardSkeleton key={idx} />
								))}
							</div>
						) : error ? (
							<p> {String(error)}</p>
						) : allCourses?.length ? (
							<>
								<div className="tab-contents">
									{tapButtons?.map(({ content }, idx) => (
										<TabContentWrapper
											key={idx}
											isShow={idx === currentIdx}
										>
											{React.isValidElement(content) ? (
												content
											) : (
												<div>Error loading content</div>
											)}
										</TabContentWrapper>
									))}
								</div>

								{/* Pagination */}
								{totalCourses > limit && (
									<Pagination
										pages={paginationItems}
										totalItems={totalCourses}
										handlePagesnation={handlePagination}
										currentPage={currentPage}
										skip={(currentPage - 1) * limit}
										limit={limit}
									/>
								)}
							</>
						) : (
							<NoData message={"No Courses Found"} />
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default CoursesPrimary;
