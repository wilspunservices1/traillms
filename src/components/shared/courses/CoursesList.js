import React from "react";
import CourseCard2 from "./CourseCard2";

const CoursesList = ({ courses, card, isList, isNotSidebar, enrolledCourses }) => {
  // console.log("courses list", courses && courses);
  return (
    <div className="flex flex-col gap-30px">
      {courses?.length > 0 ? (
        courses.map((course, idx) => (
          <CourseCard2
            key={idx}
            course={course}
            isList={isList}
            card={card}
            isNotSidebar={isNotSidebar}
            enrolledCourses={enrolledCourses} // Pass enrolledCourses to CourseCard2
          />
        ))
      ) : (
        <span>No courses available</span>
      )}
    </div>
  );
};

export default CoursesList;


// import React from "react";
// import CourseCard2 from "./CourseCard2";

// const CoursesList = ({ courses, card, isList, isNotSidebar,enrolledCourses }) => {
//   console.log("courses list", courses&&courses);
//   return (
//     <div className="flex flex-col gap-30px">

//       {courses?.length > 0 ? (
//         courses?.map((course, idx) => (
//           <CourseCard2
//             key={idx}
//             course={course}
//             isList={isList}
//             card={card}
//             isNotSidebar={isNotSidebar}
//           />
//         ))
//       ) : (
//         <span>Not working</span>
//       )}
//     </div>
//   );
// };

// export default CoursesList;
