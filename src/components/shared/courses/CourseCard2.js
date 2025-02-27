"use client";
import { useWishlistContext } from "@/contexts/WshlistContext";
import { CldImage } from "next-cloudinary";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import getItemsFromLocalstorage from "@/libs/getItemsFromLocalstorage";

const assignColorsToCategories = (categories, depBgs) => {
  if (!categories) {
    return [];
  }

  return categories?.map((category, index) => {
    const assignedColor = depBgs[index % depBgs.length];
    return { category, color: assignedColor };
  });
};

const CourseCard2 = ({
  course,
  card,
  isList,
  isNotSidebar,
  enrolledCourses,
}) => {
  const { addProductToWishlist, deleteProductFromWishlist, wishlistProducts } =
    useWishlistContext();
  const { data: session } = useSession();
  const [isInWishlist, setIsInWishlist] = useState(false);

  const {
    id,
    title,
    lesson,
    duration,
    thumbnail,
    price,
    estimatedPrice,
    isFree,
    insName,
    insImg,
    categories,
    chapters, // Assuming chapters contain the lectures
  } = course;

  // Check if chapters and lectures are available to extract the lessonId
  const lessonId = chapters?.[0]?.lectures?.[0]?.id; // Safely access the first lecture's id as lessonId

  // Check if the user is enrolled in the course using course.id
  const isEnrolled = enrolledCourses?.some(
    (enrolledCourse) => enrolledCourse.courseId === id
  );

  // Find progress for the current course from enrolledCourses
  const progress =
    enrolledCourses?.find((enrolledCourse) => enrolledCourse.courseId === id)
      ?.progress || 0;

  useEffect(() => {
    const wishlistFromLocalStorage = getItemsFromLocalstorage("wishlist") || [];
    const isInLocalWishlist = wishlistFromLocalStorage.includes(id);
    const isInDatabaseWishlist = wishlistProducts.includes(id);

    setIsInWishlist(isInLocalWishlist || isInDatabaseWishlist);
  }, [wishlistProducts, id]);

  const handleWishlistToggle = async () => {
    if (isInWishlist) {
      await deleteProductFromWishlist(id);
    } else {
      await addProductToWishlist(id);
    }
    setIsInWishlist(!isInWishlist);
  };

  const depBgs = [
    "bg-secondaryColor",
    "bg-blue",
    "bg-secondaryColor2",
    "bg-greencolor2",
    "bg-orange",
    "bg-yellow",
    "bg-secondaryColor",
    "bg-blue",
    "bg-secondaryColor2",
    "bg-greencolor2",
    "bg-orange",
    "bg-yellow",
  ];
  const categoryWithColors = assignColorsToCategories(categories, depBgs);

  return (
    <div className="w-full group grid-item rounded">
      <div className="tab-content-wrapper">
        <div
          className={`p-15px lg:pr-30px bg-whiteColor shadow-brand dark:bg-darkdeep3-dark dark:shadow-brand-dark flex flex-wrap ${
            card ? "lg:flex-nowrap" : "md:flex-nowrap"
          } rounded`}
        >
          {/* Card image */}
          <div
            className={`relative overflow-hidden w-full leading-1 ${
              card ? "lg:w-2/5" : "md:w-35%"
            }`}
          >
            <Link
              href={`courses/${id}`}
              className="w-full overflow-hidden rounded"
            >
              <CldImage
                width="400"
                height="300"
                alt=""
                src={thumbnail}
                sizes={"20w"}
                className="object-cover w-full h-full"
              />
            </Link>
            <div className="absolute left-0 top-1 flex justify-between w-full items-center px-2">
              <div className="flex gap-2 flex-wrap">
                {categoryWithColors.map((item, index) => (
                  <div key={index}>
                    <p
                      className={`text-xs text-whiteColor px-4 py-[3px] rounded font-semibold capitalize ${item.color}`}
                    >
                      {item.category}
                    </p>
                  </div>
                ))}
              </div>
              {/* Hide wishlist button if user is enrolled */}
              {!isEnrolled && (
                <button
                  onClick={handleWishlistToggle}
                  className="text-white bg-black bg-opacity-15 rounded hover:bg-primaryColor"
                >
                  <i
                    className={`icofont-heart-alt text-base py-1 px-2 ${
                      isInWishlist ? "text-red-500" : ""
                    }`}
                  />
                </button>
              )}
            </div>
          </div>
          {/* Card content */}
          <div className={`w-full ${card ? "lg:w-3/5" : "md:w-65% "}`}>
            <div
              className={`pl-0 md:pl-5 lg:pl-30px ${
                isNotSidebar ? "2xl:pl-90px" : ""
              }`}
            >
              <div className="grid grid-cols-2 mb-15px">
                <div className="flex items-center">
                  <div>
                    <i className="icofont-book-alt pr-5px text-primaryColor text-lg"></i>
                  </div>
                  <div>
                    <span className="text-sm text-black dark:text-blackColor-dark">
                      {lesson}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div>
                    <i className="icofont-clock-time pr-5px text-primaryColor text-lg"></i>
                  </div>
                  <div>
                    <span className="text-sm text-black dark:text-blackColor-dark">
                      {duration}
                    </span>
                  </div>
                </div>
              </div>
              <h4>
                <Link
                  href={`courses/${id}`}
                  className={`${
                    card
                      ? "text-size-26 leading-30px "
                      : "text-xl 2xl:text-size-34 2xl:!leading-9"
                  } font-semibold text-blackColor mb-10px dark:text-blackColor-dark hover:text-primaryColor dark:hover:text-primaryColor`}
                >
                  {title}
                </Link>
              </h4>
              {/* Price or "Go to Course" button based on enrollment status */}
              {!isEnrolled ? (
                <div className="text-lg font-medium text-black-brerry-light mb-4">
                  ${parseFloat(price).toFixed(2)}
                  <del className="text-sm text-lightGrey4 font-semibold">
                    / ${parseFloat(estimatedPrice).toFixed(2)}
                  </del>
                  <span
                    className={`ml-6 text-base font-semibold ${
                      isFree ? "text-greencolor" : "text-secondaryColor3"
                    }`}
                  >
                    {isFree ? "Free" : "Paid"}
                  </span>
                </div>
              ) : (
                <div className="mb-4">
                  <Link
                    href={`/lessons/${lessonId}`} // Redirect to lesson using lessonId
                    className="text-size-13 text-whiteColor dark:text-whiteColor-dark leading-1 px-5 py-2 md:px-10 bg-primaryColor hover:bg-primaryColor-dark rounded"
                  >
                    Go to Course
                  </Link>
                </div>
              )}
              {/* Course Progress */}
              {isEnrolled && (
                <div>
                  {progress > 0 && (
                    <div className="h-2 sm:h-3 md:h-4 lg:h-5 w-full bg-blue-x-light rounded-md relative mt-5 mb-4 overflow-hidden">
                      <div
                        className="bg-primaryColor absolute top-0 left-0 rounded-md flex items-center justify-center transition-all duration-300"
                        style={{
                          width: `${progress}%`,
                          height: "100%",
                        }}
                      >
                        {progress >= 10 && (
                          <span className="text-size-10 flex pl-1 items-center text-whiteColor leading-none">
                            {progress}% Complete
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {progress === 100 && (
                    <div>
                      <Link
                        href={`/courses/${id}/certificate`}
                        className="text-size-15 text-whiteColor bg-secondaryColor w-full px-25px py-10px border border-secondaryColor hover:text-secondaryColor hover:bg-whiteColor rounded group text-nowrap text-center"
                      >
                        Download Certificate
                      </Link>
                    </div>
                  )}
                </div>
              )}
              {/* Bottom */}
              <div className="flex flex-wrap justify-between sm:flex-nowrap items-center gap-y-2 pt-15px border-t border-borderColor">
                <div className="flex ml-auto">
                  <Link
                    className="text-sm lg:text-base text-blackColor hover:text-primaryColor dark:text-blackColor-dark dark:hover:text-primaryColor"
                    href={`/courses/${id}`}
                  >
                    Know Details
                    <i className="icofont-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard2;

// "use client";
// import { useWishlistContext } from "@/contexts/WshlistContext";
// import { CldImage } from "next-cloudinary";
// import Link from "next/link";
// import React, { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import getItemsFromLocalstorage from "@/libs/getItemsFromLocalstorage";

// const assignColorsToCategories = (categories, depBgs) => {
//   return categories.map((category, index) => {
//     const assignedColor = depBgs[index % depBgs.length];
//     return { category, color: assignedColor };
//   });
// };

// const CourseCard2 = ({
//   course,
//   card,
//   isList,
//   isNotSidebar,
//   enrolledCourses,
// }) => {
//   const {
//     addProductToWishlist,
//     deleteProductFromWishlist,
//     wishlistProducts,
//   } = useWishlistContext();
//   const { data: session } = useSession();
//   const [isInWishlist, setIsInWishlist] = useState(false);

//   const {
//     id,
//     title,
//     lesson,
//     duration,
//     thumbnail,
//     price,
//     estimatedPrice,
//     isFree,
//     insName,
//     insImg,
//     categories,
//   } = course;

//   // Check if the user is enrolled in the course using course.id
//   const isEnrolled = enrolledCourses?.some(
//     (enrolledCourse) => enrolledCourse.courseId === id
//   );

//   // Find progress for the current course from enrolledCourses
//   const progress =
//     enrolledCourses?.find(
//       (enrolledCourse) => enrolledCourse.courseId === id
//     )?.progress || 0;

//   useEffect(() => {
//     const wishlistFromLocalStorage = getItemsFromLocalstorage("wishlist") || [];
//     const isInLocalWishlist = wishlistFromLocalStorage.includes(id);
//     const isInDatabaseWishlist = wishlistProducts.includes(id);

//     setIsInWishlist(isInLocalWishlist || isInDatabaseWishlist);
//   }, [wishlistProducts, id]);

//   const handleWishlistToggle = async () => {
//     if (isInWishlist) {
//       await deleteProductFromWishlist(id);
//     } else {
//       await addProductToWishlist(id);
//     }
//     setIsInWishlist(!isInWishlist);
//   };

//   const depBgs = [
//     "bg-secondaryColor",
//     "bg-blue",
//     "bg-secondaryColor2",
//     "bg-greencolor2",
//     "bg-orange",
//     "bg-yellow",
//     "bg-secondaryColor",
//     "bg-blue",
//     "bg-secondaryColor2",
//     "bg-greencolor2",
//     "bg-orange",
//     "bg-yellow",
//   ];
//   const categoryWithColors = assignColorsToCategories(categories, depBgs);

//   return (
//     <div className="w-full group grid-item rounded">
//       <div className="tab-content-wrapper">
//         <div
//           className={`p-15px lg:pr-30px bg-whiteColor shadow-brand dark:bg-darkdeep3-dark dark:shadow-brand-dark flex flex-wrap ${
//             card ? "lg:flex-nowrap" : "md:flex-nowrap"
//           } rounded`}
//         >
//           {/* Card image */}
//           <div
//             className={`relative overflow-hidden w-full leading-1 ${
//               card ? "lg:w-2/5" : "md:w-35%"
//             }`}
//           >
//             <Link
//               href={`courses/${id}`}
//               className="w-full overflow-hidden rounded"
//             >
//               <CldImage
//                 width="400"
//                 height="300"
//                 src={thumbnail}
//                 sizes={"20w"}
//                 className="object-cover w-full h-full"
//               />
//             </Link>
//             <div className="absolute left-0 top-1 flex justify-between w-full items-center px-2">
//               <div className="flex gap-2 flex-wrap">
//                 {categoryWithColors.map((item, index) => (
//                   <div key={index}>
//                     <p
//                       className={`text-xs text-whiteColor px-4 py-[3px] rounded font-semibold capitalize ${item.color}`}
//                     >
//                       {item.category}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//               {/* Hide wishlist button if user is enrolled */}
//               {!isEnrolled && (
//                 <button
//                   onClick={handleWishlistToggle}
//                   className="text-white bg-black bg-opacity-15 rounded hover:bg-primaryColor"
//                 >
//                   <i
//                     className={`icofont-heart-alt text-base py-1 px-2 ${
//                       isInWishlist ? "text-red-500" : ""
//                     }`}
//                   />
//                 </button>
//               )}
//             </div>
//           </div>
//           {/* Card content */}
//           <div className={`w-full ${card ? "lg:w-3/5" : "md:w-65% "}`}>
//             <div
//               className={`pl-0 md:pl-5 lg:pl-30px ${
//                 isNotSidebar ? "2xl:pl-90px" : ""
//               }`}
//             >
//               <div className="grid grid-cols-2 mb-15px">
//                 <div className="flex items-center">
//                   <div>
//                     <i className="icofont-book-alt pr-5px text-primaryColor text-lg"></i>
//                   </div>
//                   <div>
//                     <span className="text-sm text-black dark:text-blackColor-dark">
//                       {lesson}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="flex items-center">
//                   <div>
//                     <i className="icofont-clock-time pr-5px text-primaryColor text-lg"></i>
//                   </div>
//                   <div>
//                     <span className="text-sm text-black dark:text-blackColor-dark">
//                       {duration}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//               <h4>
//                 <Link
//                   href={`courses/${id}`}
//                   className={`${
//                     card
//                       ? "text-size-26 leading-30px "
//                       : "text-xl 2xl:text-size-34 2xl:!leading-9"
//                   } font-semibold text-blackColor mb-10px dark:text-blackColor-dark hover:text-primaryColor dark:hover:text-primaryColor`}
//                 >
//                   {title}
//                 </Link>
//               </h4>
//               {/* Price or "Go to Course" button based on enrollment status */}
//               {!isEnrolled ? (
//                 <div className="text-lg font-medium text-black-brerry-light mb-4">
//                   ${parseFloat(price).toFixed(2)}
//                   <del className="text-sm text-lightGrey4 font-semibold">
//                     / ${parseFloat(estimatedPrice).toFixed(2)}
//                   </del>
//                   <span
//                     className={`ml-6 text-base font-semibold ${
//                       isFree ? "text-greencolor" : "text-secondaryColor3"
//                     }`}
//                   >
//                     {isFree ? "Free" : "Paid"}
//                   </span>
//                 </div>
//               ) : (
//                 <div className="mb-4">
//                   <Link
//                     href={`/lessons/${id}`}
//                     className="text-size-13 text-whiteColor dark:text-whiteColor-dark leading-1 px-5 py-2 md:px-10 bg-primaryColor hover:bg-primaryColor-dark rounded"
//                   >
//                     Go to Course
//                   </Link>
//                 </div>
//               )}
//               {/* Course Progress */}
//               {isEnrolled && (
//                 <div>
//                   {progress > 0 && (
//                     <div className="h-2 sm:h-3 md:h-4 lg:h-5 w-full bg-blue-x-light rounded-md relative mt-5 mb-4 overflow-hidden">
//                       <div
//                         className="bg-primaryColor  absolute top-0 left-0 rounded-md flex items-center justify-center transition-all duration-300"
//                         style={{
//                           width: `${progress}%`,
//                           height: "100%",
//                         }}
//                       >
//                         {progress >= 10 && (
//                           <span className="text-size-10 flex pl-1 items-center text-whiteColor leading-none">
//                             {progress}% Complete
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                   {progress === 100 && (
//                     <div>
//                       <Link
//                         href={`/courses/${id}/certificate`}
//                         className="text-size-15 text-whiteColor bg-secondaryColor w-full px-25px py-10px border border-secondaryColor hover:text-secondaryColor hover:bg-whiteColor rounded group text-nowrap text-center"
//                       >
//                         Download Certificate
//                       </Link>
//                     </div>
//                   )}
//                 </div>
//               )}
//               {/* Bottom */}
//               <div className="flex flex-wrap justify-between sm:flex-nowrap items-center gap-y-2 pt-15px border-t border-borderColor">
//                 <div className="flex ml-auto">
//                   <Link
//                     className="text-sm lg:text-base text-blackColor hover:text-primaryColor dark:text-blackColor-dark dark:hover:text-primaryColor"
//                     href={`/courses/${id}`}
//                   >
//                     Know Details
//                     <i className="icofont-arrow-right"></i>
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CourseCard2;

// "use client";
// import { useWishlistContext } from "@/contexts/WshlistContext";
// import { CldImage } from "next-cloudinary";
// import Image from "next/image";
// import Link from "next/link";
// import React from "react";
// let insId = 0;

// const assignColorsToCategories = (categories, depBgs) => {
//   return categories.map((category, index) => {
//     const assignedColor = depBgs[index % depBgs.length];
//     return { category, color: assignedColor };
//   });
// };

// const CourseCard2 = ({ course, card, isList, isNotSidebar }) => {
//   const { addProductToWishlist } = useWishlistContext();
//   const {
//     id,
//     title,
//     lesson,
//     duration,
//     thumbnail,
//     price,
//     estimatedPrice,
//     isFree,
//     insName,
//     insImg,
//     categories,
//   } = course;

//   const depBgs = ["bg-secondaryColor", "bg-blue", "bg-secondaryColor2", "bg-greencolor2", "bg-orange", "bg-yellow",
//     "bg-secondaryColor", "bg-blue", "bg-secondaryColor2", "bg-greencolor2", "bg-orange", "bg-yellow",
//   ];
//   const categoryWithColors = assignColorsToCategories(categories, depBgs);

//   insId = id;
//   insId = insId % 6 ? insId % 6 : 6;
//   return (
//     <div className="w-full group grid-item rounded">
//       <div className="tab-content-wrapper">
//         <div
//           className={`p-15px lg:pr-30px bg-whiteColor shadow-brand dark:bg-darkdeep3-dark dark:shadow-brand-dark flex flex-wrap ${card ? "lg:flex-nowrap" : "md:flex-nowrap"
//             } rounded`}
//         >
//           {/*  card image */}
//           <div
//             className={`relative overflow-hidden w-full leading-1 ${card ? " lg:w-2/5" : "md:w-35%"
//               }`}
//           >
//             <Link
//               href={`courses/${id}`}
//               className="w-full overflow-hidden rounded"
//             >
//               <CldImage
//                 width="400"
//                 height="300"
//                 src={thumbnail}
//                 sizes={"20w"}
//               />
//               {/* <img
//                 src={thumbnail}
//                 alt=""
//                 className="w-full transition-all duration-300 scale-105 group-hover:scale-110 -mb-1"
//                 placeholder="blur"
//               /> */}
//             </Link>
//             <div className="absolute left-0 top-1 flex justify-between w-full items-center px-2">
//               {categoryWithColors.map((item, index) => (
//                 <div key={index}>
//                   <p
//                     className={`text-xs text-whiteColor px-4 py-[3px] rounded font-semibold capitalize ${item.color}`}
//                   >
//                     {item.category}
//                   </p>
//                 </div>
//               ))}
//               {/* <button
//                 className="text-white bg-black bg-opacity-15 rounded hover:bg-primaryColor"
//                 onClick={() =>
//                   addProductToWishlist({
//                     ...course,
//                     isCourse: true,
//                     quantity: 1,
//                   })
//                 }
//               >
//                 <i className="icofont-heart-alt text-base py-1 px-2"></i>
//               </button> */}
//             </div>
//           </div>
//           {/*  card content */}
//           <div className={`w-full ${card ? "lg:w-3/5" : "md:w-65% "}`}>
//             <div
//               className={`${`pl-0 md:pl-5  lg:pl-30px  ${isNotSidebar ? "2xl:pl-90px" : ""
//                 }`}
//               `}
//             >
//               <div className="grid grid-cols-2 mb-15px">
//                 <div className="flex items-center">
//                   <div>
//                     <i className="icofont-book-alt pr-5px text-primaryColor text-lg"></i>
//                   </div>
//                   <div>
//                     <span className="text-sm text-black dark:text-blackColor-dark">
//                       {lesson}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="flex items-center">
//                   <div>
//                     <i className="icofont-clock-time pr-5px text-primaryColor text-lg"></i>
//                   </div>
//                   <div>
//                     <span className="text-sm text-black dark:text-blackColor-dark">
//                       {duration}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//               <h4>
//                 <Link
//                   href={`courses/${id}`}
//                   className={`${card
//                     ? "text-size-26 leading-30px "
//                     : "text-xl 2xl:text-size-34 2xl:!leading-9"
//                     }  font-semibold text-blackColor mb-10px  dark:text-blackColor-dark hover:text-primaryColor dark:hover:text-primaryColor`}
//                 >
//                   {title}
//                 </Link>
//               </h4>
//               {/*  price */}
//               <div className="text-lg font-medium text-black-brerry-light mb-4">
//                 ${parseFloat(price).toFixed(2)}
//                 <del className="text-sm text-lightGrey4 font-semibold">
//                   / ${parseFloat(estimatedPrice).toFixed(2)}
//                 </del>
//                 <span
//                   className={`ml-6 text-base font-semibold ${isFree ? " text-greencolor" : " text-secondaryColor3"
//                     }`}
//                 >
//                   {isFree ? "Free" : <del>Free</del>}
//                 </span>
//               </div>
//               {/*  bottom */}
//               <div className="flex flex-wrap justify-between sm:flex-nowrap items-center gap-y-2 pt-15px border-t border-borderColor">

//                 <div className="flex ml-auto ">
//                   <Link
//                     className="text-sm lg:text-base text-blackColor hover:text-primaryColor dark:text-blackColor-dark dark:hover:text-primaryColor"
//                     href={`/courses/${id}`}
//                   >
//                     Know Details
//                     <i className="icofont-arrow-right"></i>
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CourseCard2;
