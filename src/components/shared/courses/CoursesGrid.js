import CourseCard from "./CourseCard";

const CoursesGrid = ({ courses, isNotSidebar, enrolledCourses }) => {
  // console.log("courses grid", enrolledCourses);
  return (
    <div
      className={`grid grid-cols-1 ${
        isNotSidebar
          ? "sm:grid-cols-2 xl:grid-cols-3"
          : "sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
      } gap-30px items-stretch auto-rows-[1fr]`}
    >
      {courses?.length ? (
        courses.map((course, idx) => (
          <CourseCard
            key={idx}
            course={course}
            type={"primaryMd"}
            enrolledCourses={enrolledCourses}
          />
        ))
      ) : (
        <span>No courses found.</span>
      )}
    </div>
  );
};

export default CoursesGrid;

// import CourseCard from "./CourseCard";

// const CoursesGrid = ({ courses, isNotSidebar }) => {

//   console.log("courses grid", courses && courses);
//   return (
//     <div
//       className={`grid grid-cols-1 ${isNotSidebar
//         ? "sm:grid-cols-2 xl:grid-cols-3"
//         : "sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
//         }   gap-30px`}
//     >
//       {courses?.length ? (
//         courses?.map((course, idx) => (
//           <CourseCard key={idx} course={course} type={"primaryMd"} />
//         ))
//       ) : (
//         <span></span>
//       )}
//     </div>
//   );
// };

// export default CoursesGrid;

{
  /* <CourseCard key={idx} course={course} type={"primaryMd"} /> */
}
