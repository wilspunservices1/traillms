import React from "react";
import { CldImage } from "next-cloudinary";

type Props = {
  reviews: any;
};

const ClientsReviews: React.FC<Props> = ({ reviews }) => {
  console.log("reviews from client reviews", reviews);

  return (
    <div className="mt-60px mb-10">
      <h4 className="text-lg text-blackColor dark:text-blackColor-dark font-bold pl-2 before:w-0.5 relative before:h-[21px] before:bg-secondaryColor before:absolute before:bottom-[5px] before:left-0 leading-1.2 mb-25px">
        Customer Reviews
      </h4>
      <ul>
        {reviews && reviews.length > 0 ? (
          reviews.map((review: any, index: number) => (
            <li
              key={index}
              className="flex gap-30px pt-35px border-t border-borderColor2 dark:border-borderColor2-dark"
            >
              <div className="flex-shrink-0">
                <CldImage
                  width="60"
                  height="60"
                  alt={review.name}
                  src={review.avatar}
                  sizes="60w"
                  className="w-25 h-25 rounded-full"
                />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between">
                  <div>
                    <h4>
                      <a
                        href="#"
                        className="text-lg font-semibold text-blackColor hover:text-secondaryColor dark:text-blackColor-dark dark:hover:text-condaryColor leading-1.2"
                      >
                        {review.name}
                      </a>
                    </h4>
                    <div className="text-secondaryColor leading-1.8">
                      {/* Render stars based on rating */}
                      {Array(review.rating)
                        .fill(0)
                        .map((_, i) => (
                          <i
                            key={i}
                            className="icofont-star text-secondaryColor"
                          ></i>
                        ))}
                      {/* Add empty stars if needed */}
                      {Array(5 - review.rating)
                        .fill(0)
                        .map((_, i) => (
                          <i
                            key={i}
                            className="icofont-star text-gray-300"
                          ></i>
                        ))}
                    </div>
                  </div>
                  <div className="author__icon">
                    <p className="text-sm font-bold text-blackColor dark:text-blackColor-dark leading-9 px-25px mb-5px border-2 border-borderColor2 dark:border-borderColo2-dark hover:border-secondaryColor dark:hover:border-secondaryColor rounded-full transition-all duration-300">
                      {review.date}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-contentColor dark:text-contentColor-dark leading-23px mb-15px">
                  {review.comment}
                </p>
              </div>
            </li>
          ))
        ) : (
          <p>No reviews available.</p>
        )}
      </ul>
    </div>
  );
};

export default ClientsReviews;


// import Image from "next/image";
// import React from "react";
// import teacherImage1 from "@/assets/images/teacher/teacher__1.png";
// import teacherImage2 from "@/assets/images/teacher/teacher__2.png";
// import teacherImage3 from "@/assets/images/teacher/teacher__3.png";
// import { CldImage } from 'next-cloudinary';

// type Props = {
//     reviews: any
// };

// const ClientsReviews : React.FC<Props> = ({reviews}) => {
//     console.log("reviews from client reviews",reviews)
//   return (
//     <div className="mt-60px mb-10">
//       <h4 className="text-lg text-blackColor dark:text-blackColor-dark font-bold pl-2 before:w-0.5 relative before:h-[21px] before:bg-secondaryColor before:absolute before:bottom-[5px] before:left-0 leading-1.2 mb-25px">
//         Customer Reviews
//       </h4>
//       <ul>
//         <li className="flex gap-30px pt-35px border-t border-borderColor2 dark:border-borderColor2-dark">
//           <div className="flex-shrink-0">
//             <div>
//               <Image
//                 src={teacherImage2}
//                 alt=""
//                 className="w-25 h-25 rounded-full"
//               />
//             </div>
//           </div>
//           <div className="flex-grow">
//             <div className="flex justify-between">
//               <div>
//                 <h4>
//                   <a
//                     href="#"
//                     className="text-lg font-semibold text-blackColor hover:text-secondaryColor dark:text-blackColor-dark dark:hover:text-condaryColor leading-1.2"
//                   >
//                     Adam Smit
//                   </a>
//                 </h4>
//                 <div className="text-secondaryColor leading-1.8">
//                   <i className="icofont-star"></i>{" "}
//                   <i className="icofont-star"></i>{" "}
//                   <i className="icofont-star"></i>{" "}
//                   <i className="icofont-star"></i>{" "}
//                   <i className="icofont-star"></i>
//                 </div>
//               </div>
//               <div className="author__icon">
//                 <p className="text-sm font-bold text-blackColor dark:text-blackColor-dark leading-9 px-25px mb-5px border-2 border-borderColor2 dark:border-borderColo2-dark hover:border-secondaryColor dark:hover:border-secondaryColor rounded-full transition-all duration-300">
//                   September 2, 2024
//                 </p>
//               </div>
//             </div>

//             <p className="text-sm text-contentColor dark:text-contentColor-dark leading-23px mb-15px">
//               Lorem ipsum dolor sit amet, consectetur adipisicing elit.
//               Doloribus, omnis fugit corporis iste magnam ratione.
//             </p>
//           </div>
//         </li>
//         <li className="flex gap-30px pt-35px border-t border-borderColor2 dark:border-borderColor2-dark">
//           <div className="flex-shrink-0">
//             <div>
//               <Image
//                 src={teacherImage1}
//                 alt=""
//                 className="w-25 h-25 rounded-full"
//               />
//             </div>
//           </div>
//           <div className="flex-grow">
//             <div className="flex justify-between">
//               <div>
//                 <h4>
//                   <a
//                     href="#"
//                     className="text-lg font-semibold text-blackColor hover:text-secondaryColor dark:text-blackColor-dark dark:hover:text-condaryColor leading-1.2"
//                   >
//                     Adam Smit
//                   </a>
//                 </h4>
//                 <div className="text-secondaryColor leading-1.8">
//                   <i className="icofont-star"></i>{" "}
//                   <i className="icofont-star"></i>{" "}
//                   <i className="icofont-star"></i>{" "}
//                   <i className="icofont-star"></i>{" "}
//                   <i className="icofont-star"></i>
//                 </div>
//               </div>
//               <div className="author__icon">
//                 <p className="text-sm font-bold text-blackColor dark:text-blackColor-dark leading-9 px-25px mb-5px border-2 border-borderColor2 dark:border-borderColo2-dark hover:border-secondaryColor dark:hover:border-secondaryColor rounded-full transition-all duration-300">
//                   September 2, 2024
//                 </p>
//               </div>
//             </div>

//             <p className="text-sm text-contentColor dark:text-contentColor-dark leading-23px mb-15px">
//               Lorem ipsum dolor sit amet, consectetur adipisicing elit.
//               Doloribus, omnis fugit corporis iste magnam ratione.
//             </p>
//           </div>
//         </li>
//         <li className="flex gap-30px pt-35px border-t border-borderColor2 dark:border-borderColor2-dark">
//           <div className="flex-shrink-0">
//             <div>
//               <Image
//                 src={teacherImage3}
//                 alt=""
//                 className="w-25 h-25 rounded-full"
//               />
//             </div>
//           </div>
//           <div className="flex-grow">
//             <div className="flex justify-between">
//               <div>
//                 <h4>
//                   <a
//                     href="#"
//                     className="text-lg font-semibold text-blackColor hover:text-secondaryColor dark:text-blackColor-dark dark:hover:text-condaryColor leading-1.2"
//                   >
//                     Adam Smit
//                   </a>
//                 </h4>
//                 <div className="text-secondaryColor leading-1.8">
//                   {" "}
//                   <i className="icofont-star"></i>{" "}
//                   <i className="icofont-star"></i>{" "}
//                   <i className="icofont-star"></i>{" "}
//                   <i className="icofont-star"></i>{" "}
//                   <i className="icofont-star"></i>
//                 </div>
//               </div>
//               <div className="author__icon">
//                 <p className="text-sm font-bold text-blackColor dark:text-blackColor-dark leading-9 px-25px mb-5px border-2 border-borderColor2 dark:border-borderColo2-dark hover:border-secondaryColor dark:hover:border-secondaryColor rounded-full transition-all duration-300">
//                   September 2, 2024
//                 </p>
//               </div>
//             </div>

//             <p className="text-sm text-contentColor dark:text-contentColor-dark leading-23px mb-15px">
//               Lorem ipsum dolor sit amet, consectetur adipisicing elit.
//               Doloribus, omnis fugit corporis iste magnam ratione.
//             </p>
//           </div>
//         </li>
//       </ul>
//     </div>
//   );
// };

// export default ClientsReviews;
