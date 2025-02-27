"use client";
import Image from "next/image";
import PopupVideo from "../popup/PopupVideo";
import { useCartContext } from "@/contexts/CartContext";
import { formatDate } from "@/actions/formatDate";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSweetAlert from "@/hooks/useSweetAlert";
import getStripe from "@/utils/loadStripe";
import { useState, useEffect } from "react";
import SkeletonButton from "@/components/Loaders/BtnSkeleton";

const CourseEnroll = ({ type, course }) => {
	const {
		title = "Default Title",
		price = "0.00",
		estimatedPrice = "0.00",
		insName = "Unknown Instructor",
		thumbnail,
		updatedAt,
		skillLevel = "Beginner",
		demoVideoUrl,
		id: courseId,
		discount = "0.00",
	} = course || {};

	const { addProductToCart, cartProducts } = useCartContext();
	const { data: session } = useSession();
	const creteAlert = useSweetAlert();
	const router = useRouter();
	const [loading, setLoading] = useState(false); // Loading state for enrollment
	const [error, setError] = useState(""); // Error state to store error message
	const [isEnrolled, setIsEnrolled] = useState(false); // To check if the user is enrolled
	const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(true); // Loading state for enrollment check
	const [firstLectureId, setFirstLectureId] = useState(null); // To store the lecture ID to navigate to

	const userId = session?.user?.id;

	// Check if the course is already in the cart
	const isInCart = cartProducts.some(
		(product) => product.courseId === courseId
	);

	// Fetch the user's enrolled courses and check if the current course is enrolled
	useEffect(() => {
		const checkEnrollment = async () => {
			if (userId) {
				try {
					setIsCheckingEnrollment(true);

					const response = await fetch(
						`/api/user/${userId}/enrollCourses`,
						{
							method: "GET",
							headers: {
								"Content-Type": "application/json",
							},
							credentials: "include", // Include cookies for authentication
						}
					);

					if (!response.ok) {
						throw new Error("Failed to fetch enrolled courses.");
					}

					const enrolledCourses = await response.json();

					// Find the course matching the current courseId
					const enrolledCourse = enrolledCourses.find(
						(enrolledCourse) => enrolledCourse.courseId === courseId
					);

					if (enrolledCourse) {
						setIsEnrolled(true);

						// Extract the first lecture ID
						const chapters = enrolledCourse.chapters || [];

						// Find the first lecture ID
						let foundLectureId = null;
						for (const chapter of chapters) {
							const lectureIds = chapter.lectureIds || [];
							if (lectureIds.length > 0) {
								foundLectureId = lectureIds[0]; // Take the first lecture ID
								break;
							}
						}

						if (foundLectureId) {
							setFirstLectureId(foundLectureId);
						} else {
							// Handle case where no lectures are found
							setError("No lectures found for this course.");
						}
					} else {
						setIsEnrolled(false);
					}
				} catch (error) {
					console.error("Error checking enrollment:", error);
					setError(error.message || "Failed to check enrollment.");
				} finally {
					setIsCheckingEnrollment(false);
				}
			} else {
				setIsEnrolled(false);
				setIsCheckingEnrollment(false);
			}
		};

		checkEnrollment();
	}, [userId, courseId]);

	const handleEnrollClick = async () => {
		if (!session) {
			creteAlert(
				"error",
				"You need to sign in to proceed with enrollment."
			);
			router.push("/login");
		} else {
			// Start the loading process
			setLoading(true);
			setError(""); // Reset error message

			try {
				const stripe = await getStripe();

				// Prepare items for the checkout
				const items = [
					{
						name: title,
						price: parseFloat(price).toFixed(2), // Ensure price is properly formatted
						image: thumbnail,
						quantity: 1, // Default to quantity of 1
						courseId, // Include the courseId in the item data
					},
				];

				const userEmail = session.user.email;

				// Make a request to your checkout API route
				const response = await fetch("/api/stripe/checkout", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ items, email: userEmail, userId }), // Include userId and items with courseId
				});

				const { sessionId } = await response.json();

				// If the session is created, redirect to Stripe Checkout
				if (sessionId) {
					await stripe.redirectToCheckout({ sessionId });
				} else {
					throw new Error("Failed to create checkout session.");
				}
			} catch (error) {
				console.error("Checkout error:", error);
				setError(
					error.message || "Something went wrong during checkout."
				);
			} finally {
				// End the loading process
				setLoading(false);
			}
		}
	};

	return (
		<div
			className="py-33px px-25px shadow-event mb-30px bg-whiteColor dark:bg-whiteColor-dark rounded-md"
			data-aos="fade-up"
		>
			{type !== 3 && (
				<div className="overflow-hidden relative mb-5">
					<Image src={thumbnail} alt={title} className="w-full" />
					<div className="absolute top-0 right-0 left-0 bottom-0 flex items-center justify-center z-10">
						<PopupVideo demoVideoUrl={demoVideoUrl} />
					</div>
				</div>
			)}

			<div
				className={`flex justify-between ${
					type === 2
						? "mt-50px mb-5"
						: type === 3
						? "mb-50px"
						: "mb-5"
				}`}
			>
				<div className="text-size-21 font-bold text-primaryColor font-inter leading-25px">
					${parseFloat(price).toFixed(2)}{" "}
					<del className="text-sm text-lightGrey4 font-semibold">
						/ ${parseFloat(estimatedPrice).toFixed(2)}
					</del>
				</div>
				<div>
					<a
						href="#"
						className="uppercase text-sm font-semibold text-secondaryColor2 leading-27px px-2 bg-whitegrey1 dark:bg-whitegrey1-dark"
					>
						{parseFloat(discount).toFixed(2)}% OFF
					</a>
				</div>
			</div>

			<div className="mb-5" data-aos="fade-up">
				{error && <p className="text-red-500 mb-3">{error}</p>}

				{isCheckingEnrollment ? (
					<div className="flex flex-col">
						<SkeletonButton />
						<SkeletonButton />
					</div>
				) : (
					<>
						{isInCart ? (
							<button
								className="w-full text-size-15 text-whiteColor bg-secondaryColor px-25px py-10px border mb-10px leading-1.8 border-secondaryColor hover:text-secondaryColor hover:bg-whiteColor inline-block rounded group dark:hover:text-secondaryColor dark:hover:bg-whiteColor-dark"
								disabled
							>
								Already Added
							</button>
						) : (
							<button
								onClick={() =>
									addProductToCart({
										courseId,
										discount,
										estimatedPrice,
										insName,
										isFree: course.isFree,
										price,
										thumbnail,
										title,
									})
								}
								className="w-full text-size-15 text-whiteColor bg-secondaryColor px-25px py-10px border mb-10px leading-1.8 border-secondaryColor hover:text-secondaryColor hover:bg-whiteColor inline-block rounded group dark:hover:text-secondaryColor dark:hover:bg-whiteColor-dark"
							>
								Add To Cart
							</button>
						)}

						{/* Conditionally Render "Go to Course" or "Enroll Now" Button */}
						{isEnrolled && firstLectureId ? (
							<button
								onClick={() =>
									router.push(`/lessons/${firstLectureId}`)
								} // Redirect to first lecture
								className="w-full text-size-15 text-whiteColor bg-secondaryColor px-25px py-10px mb-10px leading-1.8 border border-secondaryColor hover:text-secondaryColor hover:bg-whiteColor inline-block rounded group dark:hover:text-secondaryColor dark:hover:bg-whiteColor-dark"
							>
								Go to Course
							</button>
						) : (
							<button
								onClick={handleEnrollClick}
								className={`w-full text-size-15 text-whiteColor bg-secondaryColor px-25px py-10px mb-10px leading-1.8 border border-secondaryColor hover:text-secondaryColor hover:bg-whiteColor inline-block rounded group dark:hover:text-secondaryColor dark:hover:bg-whiteColor-dark ${
									loading
										? "cursor-not-allowed opacity-50"
										: ""
								}`}
								disabled={loading}
							>
								{loading ? "Processing..." : "Enroll Now"}
							</button>
						)}
					</>
				)}

				<span className="text-size-13 text-contentColor dark:text-contentColor-dark leading-1.8">
					<i className="icofont-ui-rotation"></i> 45-Days Money-Back
					Guarantee
				</span>
			</div>

			<ul>
				<li className="flex items-center justify-between py-10px border-b border-borderColor dark:border-borderColor-dark">
					<p className="text-sm font-medium text-contentColor dark:text-contentColor-dark leading-1.8">
						Instructor:
					</p>
					<p className="text-xs text-contentColor dark:text-contentColor-dark px-10px py-6px bg-borderColor dark:bg-borderColor-dark rounded-full leading-13px">
						{insName}
					</p>
				</li>
				<li className="flex items-center justify-between py-10px border-b border-borderColor dark:border-borderColor-dark">
					<p className="text-sm font-medium text-contentColor dark:text-contentColor-dark leading-1.8">
						Start Date
					</p>
					<p className="text-xs text-contentColor dark:text-contentColor-dark px-10px py-6px bg-borderColor dark:bg-borderColor-dark rounded-full leading-13px">
						{formatDate(updatedAt)}
					</p>
				</li>
				<li className="flex items-center justify-between py-10px border-b border-borderColor dark:border-borderColor-dark">
					<p className="text-sm font-medium text-contentColor dark:text-contentColor-dark leading-1.8">
						Skill Level
					</p>
					<p className="text-xs text-contentColor dark:text-contentColor-dark px-10px py-6px bg-borderColor dark:bg-borderColor-dark rounded-full leading-13px">
						{skillLevel}
					</p>
				</li>
			</ul>

			<div className="mt-5" data-aos="fade-up">
				<p className="text-sm text-contentColor dark:text-contentColor-dark leading-1.8 text-center mb-5px">
					More inquiry about course
				</p>
				<button
					type="submit"
					className="w-full text-xl text-primaryColor bg-whiteColor px-25px py-10px mb-10px font-bold leading-1.8 border border-primaryColor hover:text-whiteColor hover:bg-primaryColor inline-block rounded group dark:bg-whiteColor-dark dark:text-whiteColor dark:hover:bg-primaryColor"
				>
					<i className="icofont-phone"></i> +971 58 267 6585
				</button>
			</div>
		</div>
	);
};

export default CourseEnroll;

// "use client";
// import Image from "next/image";
// import PopupVideo from "../popup/PopupVideo";
// import { useCartContext } from "@/contexts/CartContext";
// import { formatDate } from "@/actions/formatDate";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import useSweetAlert from "@/hooks/useSweetAlert";
// import getStripe from "@/utils/loadStripe";
// import { useState, useEffect } from "react";
// import SkeletonButton from "./_comp/SkeletonButton";

// const CourseEnroll = ({ type, course }) => {
//   const {
//     title = "Default Title",
//     price = "0.00",
//     estimatedPrice = "0.00",
//     insName = "Unknown Instructor",
//     thumbnail,
//     updatedAt,
//     skillLevel = "Beginner",
//     demoVideoUrl,
//     id: courseId,
//     discount = "0.00",
//   } = course || {};

//   const { addProductToCart, cartProducts } = useCartContext();
//   const { data: session } = useSession();
//   const creteAlert = useSweetAlert();
//   const router = useRouter();
//   const [loading, setLoading] = useState(false); // Loading state for enrollment
//   const [error, setError] = useState(""); // Error state to store error message
//   const [isEnrolled, setIsEnrolled] = useState(false); // To check if the user is enrolled
//   const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(true); // Loading state for enrollment check

//   const userId = session?.user?.id;

//   // Check if the course is already in the cart
//   const isInCart = cartProducts.some((product) => product.courseId === courseId);

//   // Fetch the user's enrolled courses and check if the current course is enrolled
//   useEffect(() => {
//     const checkEnrollment = async () => {
//       if (userId) {
//         try {
//           setIsCheckingEnrollment(true);

//           const response = await fetch(`/api/user/${userId}/enrollCourses`, {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             credentials: "include", // Include cookies for authentication
//           });

//           if (!response.ok) {
//             throw new Error("Failed to fetch enrolled courses.");
//           }

//           const enrolledCourses = await response.json();

//           const enrolled = enrolledCourses.some(
//             (enrolledCourse) => enrolledCourse.courseId === courseId
//           );
//           setIsEnrolled(enrolled);
//         } catch (error) {
//           console.error("Error checking enrollment:", error);
//           setError(error.message || "Failed to check enrollment.");
//         } finally {
//           setIsCheckingEnrollment(false);
//         }
//       } else {
//         setIsEnrolled(false);
//         setIsCheckingEnrollment(false);
//       }
//     };

//     checkEnrollment();
//   }, [userId, courseId]);

//   const handleEnrollClick = async () => {
//     if (!session) {
//       creteAlert("error", "You need to sign in to proceed with enrollment.");
//       router.push("/login");
//     } else {
//       // Start the loading process
//       setLoading(true);
//       setError(""); // Reset error message

//       try {
//         const stripe = await getStripe();

//         // Prepare items for the checkout
//         const items = [
//           {
//             name: title,
//             price: parseFloat(price).toFixed(2), // Ensure price is properly formatted
//             image: thumbnail,
//             quantity: 1, // Default to quantity of 1
//             courseId, // Include the courseId in the item data
//           },
//         ];

//         const userEmail = session.user.email;

//         // Make a request to your checkout API route
//         const response = await fetch("/api/stripe/checkout", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ items, email: userEmail, userId }), // Include userId and items with courseId
//         });

//         const { sessionId } = await response.json();

//         // If the session is created, redirect to Stripe Checkout
//         if (sessionId) {
//           await stripe.redirectToCheckout({ sessionId });
//         } else {
//           throw new Error("Failed to create checkout session.");
//         }
//       } catch (error) {
//         console.error("Checkout error:", error);
//         setError(error.message || "Something went wrong during checkout.");
//       } finally {
//         // End the loading process
//         setLoading(false);
//       }
//     }
//   };

//   return (
//     <div
//       className="py-33px px-25px shadow-event mb-30px bg-whiteColor dark:bg-whiteColor-dark rounded-md"
//       data-aos="fade-up"
//     >
//       {type !== 3 && (
//         <div className="overflow-hidden relative mb-5">
//           <img src={thumbnail} alt={title} className="w-full" />
//           <div className="absolute top-0 right-0 left-0 bottom-0 flex items-center justify-center z-10">
//             <PopupVideo demoVideoUrl={demoVideoUrl} />
//           </div>
//         </div>
//       )}

//       <div
//         className={`flex justify-between ${
//           type === 2 ? "mt-50px mb-5" : type === 3 ? "mb-50px" : "mb-5"
//         }`}
//       >
//         <div className="text-size-21 font-bold text-primaryColor font-inter leading-25px">
//           ${parseFloat(price).toFixed(2)}{" "}
//           <del className="text-sm text-lightGrey4 font-semibold">
//             / ${parseFloat(estimatedPrice).toFixed(2)}
//           </del>
//         </div>
//         <div>
//           <a
//             href="#"
//             className="uppercase text-sm font-semibold text-secondaryColor2 leading-27px px-2 bg-whitegrey1 dark:bg-whitegrey1-dark"
//           >
//             {parseFloat(discount).toFixed(2)}% OFF
//           </a>
//         </div>
//       </div>

//       <div className="mb-5" data-aos="fade-up">
//         {error && <p className="text-red-500 mb-3">{error}</p>}

//         {isCheckingEnrollment ? (
//           <div className="flex flex-col">
//             <SkeletonButton />
//             <SkeletonButton />
//           </div>
//         ) : (
//           <>
//             {isInCart ? (
//               <button
//                 className="w-full text-size-15 text-whiteColor bg-secondaryColor px-25px py-10px border mb-10px leading-1.8 border-secondaryColor hover:text-secondaryColor hover:bg-whiteColor inline-block rounded group dark:hover:text-secondaryColor dark:hover:bg-whiteColor-dark"
//                 disabled
//               >
//                 Already Added
//               </button>
//             ) : (
//               <button
//                 onClick={() =>
//                   addProductToCart({
//                     courseId,
//                     discount,
//                     estimatedPrice,
//                     insName,
//                     isFree: course.isFree,
//                     price,
//                     thumbnail,
//                     title,
//                   })
//                 }
//                 className="w-full text-size-15 text-whiteColor bg-secondaryColor px-25px py-10px border mb-10px leading-1.8 border-secondaryColor hover:text-secondaryColor hover:bg-whiteColor inline-block rounded group dark:hover:text-secondaryColor dark:hover:bg-whiteColor-dark"
//               >
//                 Add To Cart
//               </button>
//             )}

//             {/* Conditionally Render "Go to Course" or "Enroll Now" Button */}
//             {isEnrolled ? (
//               <button
//                 onClick={() => router.push(`/lessons/${chapters}`)} // Redirect to course page
//                 className="w-full text-size-15 text-whiteColor bg-secondaryColor px-25px py-10px mb-10px leading-1.8 border border-secondaryColor hover:text-secondaryColor hover:bg-whiteColor inline-block rounded group dark:hover:text-secondaryColor dark:hover:bg-whiteColor-dark"
//               >
//                 Go to Course
//               </button>
//             ) : (
//               <button
//                 onClick={handleEnrollClick}
//                 className={`w-full text-size-15 text-whiteColor bg-secondaryColor px-25px py-10px mb-10px leading-1.8 border border-secondaryColor hover:text-secondaryColor hover:bg-whiteColor inline-block rounded group dark:hover:text-secondaryColor dark:hover:bg-whiteColor-dark ${
//                   loading ? "cursor-not-allowed opacity-50" : ""
//                 }`}
//                 disabled={loading}
//               >
//                 {loading ? "Processing..." : "Enroll Now"}
//               </button>
//             )}
//           </>
//         )}

//         <span className="text-size-13 text-contentColor dark:text-contentColor-dark leading-1.8">
//           <i className="icofont-ui-rotation"></i> 45-Days Money-Back Guarantee
//         </span>
//       </div>

//       <ul>
//         <li className="flex items-center justify-between py-10px border-b border-borderColor dark:border-borderColor-dark">
//           <p className="text-sm font-medium text-contentColor dark:text-contentColor-dark leading-1.8">
//             Instructor:
//           </p>
//           <p className="text-xs text-contentColor dark:text-contentColor-dark px-10px py-6px bg-borderColor dark:bg-borderColor-dark rounded-full leading-13px">
//             {insName}
//           </p>
//         </li>
//         <li className="flex items-center justify-between py-10px border-b border-borderColor dark:border-borderColor-dark">
//           <p className="text-sm font-medium text-contentColor dark:text-contentColor-dark leading-1.8">
//             Start Date
//           </p>
//           <p className="text-xs text-contentColor dark:text-contentColor-dark px-10px py-6px bg-borderColor dark:bg-borderColor-dark rounded-full leading-13px">
//             {formatDate(updatedAt)}
//           </p>
//         </li>
//         <li className="flex items-center justify-between py-10px border-b border-borderColor dark:border-borderColor-dark">
//           <p className="text-sm font-medium text-contentColor dark:text-contentColor-dark leading-1.8">
//             Skill Level
//           </p>
//           <p className="text-xs text-contentColor dark:text-contentColor-dark px-10px py-6px bg-borderColor dark:bg-borderColor-dark rounded-full leading-13px">
//             {skillLevel}
//           </p>
//         </li>
//       </ul>

//       <div className="mt-5" data-aos="fade-up">
//         <p className="text-sm text-contentColor dark:text-contentColor-dark leading-1.8 text-center mb-5px">
//           More inquiry about course
//         </p>
//         <button
//           type="submit"
//           className="w-full text-xl text-primaryColor bg-whiteColor px-25px py-10px mb-10px font-bold leading-1.8 border border-primaryColor hover:text-whiteColor hover:bg-primaryColor inline-block rounded group dark:bg-whiteColor-dark dark:text-whiteColor dark:hover:bg-primaryColor"
//         >
//           <i className="icofont-phone"></i> +971 58 267 6585
//         </button>
//       </div>
//     </div>
//   );
// };

// export default CourseEnroll;
