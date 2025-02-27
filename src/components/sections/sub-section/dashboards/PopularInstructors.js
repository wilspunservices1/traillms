"use client"
import { useEffect, useState } from "react";
import HeadingDashboard from "@/components/shared/headings/HeadingDashboard";
import Image from "next/image";
import Link from "next/link";
import { CldImage } from "next-cloudinary";
import { BASE_URL } from "@/actions/constant";

const PopularInstructors = () => {
  // State to hold the instructors data
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch instructors data from the API
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/dashboard/topInstructors`);
        const data = await response.json();

        if (response.ok) {
          setInstructors(data.instructors);
        } else {
          throw new Error(data.error || "Failed to fetch instructors");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  // console.log("totalEnrollments",instructors[0]?.enrolledCoursesCount)

  return (
    <div className="p-10px md:px-10 md:py-50px mb-30px bg-whiteColor dark:bg-whiteColor-dark shadow-accordion dark:shadow-accordion-dark rounded-5 max-h-137.5 overflow-auto">
      <HeadingDashboard path={`/instructors`}>Popular Instructor</HeadingDashboard>

      {/* instrutor */}
      <ul>
        {loading && <p>Loading...</p>}
        {instructors?.map(
          ({ instructorId, instructorName, enrolledCoursesCount, profileImage, reviewCount, totalEnrollments, courseCount }, idx) => (
            <li
              key={idx}
              className={`flex items-center flex-wrap  ${idx === instructors?.length - 1
                ? "pt-15px"
                : "py-15px border-b border-borderColor dark:border-borderColor-dark"
                }`}
            >
              {/* avatar */}
              <div className="max-w-full md:max-w-1/5 pr-10px">

                <CldImage
                  src={profileImage || ""}
                  alt={instructorName || ""}
                  className="w-card-img py-[3px]"
                  width={100}
                  height={100}
                  sizes={"50w"}
                />
                {/* <Image
                  src={profileImage}
                  alt={instructorName}
                  className="w-full rounded-full"
                  width={100}
                  height={100}
                /> */}
              </div>
              {/* details */}
              <div className="max-w-full md:max-w-4/5 pr-10px">
                <div>
                  <h5 className="text-lg leading-1 font-bold text-contentColor dark:text-contentColor-dark mb-5px">
                    <Link
                      className="hover:text-primaryColor"
                      href={`/instructors/${instructorId}`}
                    >
                      {instructorName}
                    </Link>
                  </h5>
                  <div className="flex flex-wrap items-center text-sm text-darkblack dark:text-darkblack-dark gap-x-15px gap-y-10px leading-1.8">
                    <p>
                      <i className="icofont-chat"></i> {reviewCount} Reviews
                    </p>
                    <p>
                      <i className="icofont-student-alt"></i> {enrolledCoursesCount}{" "}
                      Students
                    </p>
                    <p>
                      <i className="icofont-video-alt"></i> {courseCount}+ Courses
                    </p>
                  </div>
                </div>
              </div>
            </li>
          )
        )}
      </ul>
    </div>
  );
};

export default PopularInstructors;


// import teacherImage1 from "@/assets/images/teacher/teacher__1.png";
// import teacherImage2 from "@/assets/images/teacher/teacher__2.png";
// import teacherImage3 from "@/assets/images/teacher/teacher__3.png";
// import teacherImage4 from "@/assets/images/teacher/teacher__4.png";
// import teacherImage5 from "@/assets/images/teacher/teacher__5.png";
// import HeadingDashboard from "@/components/shared/headings/HeadingDashboard";
// import Image from "next/image";
// import Link from "next/link";

// const PopularInstructors = () => {
//   const instructors = [
//     {
//       id: 1,
//       name: "Sanki Jho",
//       avatar: teacherImage1,
//       reviews: "25,895",
//       students: "692",
//       courses: "15",
//     },
//     {
//       id: 2,
//       name: "Nidmjae Mollin",
//       avatar: teacherImage2,
//       reviews: "21,895",
//       students: "95",
//       courses: "10",
//     },
//     {
//       id: 3,
//       name: "Nidmjae Mollin",
//       avatar: teacherImage3,
//       reviews: "17,895",
//       students: "325",
//       courses: "20",
//     },
//     {
//       id: 4,
//       name: "Sndi Jac",
//       avatar: teacherImage4,
//       reviews: "17,895",
//       students: "325",
//       courses: "45",
//     },
//     {
//       id: 5,
//       name: "Sndi Jac",
//       avatar: teacherImage5,
//       reviews: "17,895",
//       students: "325",
//       courses: "45",
//     },
//   ];
//   return (
//     <div className="p-10px md:px-10 md:py-50px mb-30px bg-whiteColor dark:bg-whiteColor-dark shadow-accordion dark:shadow-accordion-dark rounded-5 max-h-137.5 overflow-auto">
//       <HeadingDashboard path={`/instructors`}>
//         Popular Instructor
//       </HeadingDashboard>

//       {/* instrutor */}
//       <ul>
//         {instructors?.map(
//           ({ id, name, avatar, reviews, students, courses }, idx) => (
//             <li
//               key={idx}
//               className={`flex items-center flex-wrap  ${
//                 idx === instructors?.length - 1
//                   ? "pt-15px"
//                   : "py-15px border-b border-borderColor dark:border-borderColor-dark"
//               }`}
//             >
//               {/* avatar */}
//               <div className="max-w-full md:max-w-1/5 pr-10px">
//                 <Image src={avatar} alt="" className="w-full rounded-full" />
//               </div>
//               {/* details */}
//               <div className="max-w-full md:max-w-4/5 pr-10px">
//                 <div>
//                   <h5 className="text-lg leading-1 font-bold text-contentColor dark:text-contentColor-dark mb-5px">
//                     <Link
//                       className="hover:text-primaryColor"
//                       href={`/instructors/${id}`}
//                     >
//                       {name}
//                     </Link>
//                   </h5>
//                   <div className="flex flex-wrap items-center text-sm text-darkblack dark:text-darkblack-dark gap-x-15px gap-y-10px leading-1.8">
//                     <p>
//                       <i className="icofont-chat"></i> {reviews} Reviews
//                     </p>
//                     <p>
//                       <i className="icofont-student-alt"></i> {students}{" "}
//                       Students
//                     </p>
//                     <p>
//                       <i className="icofont-video-alt"></i> {courses}+ Courses
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </li>
//           )
//         )}
//       </ul>
//     </div>
//   );
// };

// export default PopularInstructors;
