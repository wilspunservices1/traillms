import CourseDetailsPrimary from "@/components/sections/course-details/CourseDetailsPrimary";
import HeroPrimary from "@/components/sections/hero-banners/HeroPrimary";
import React from "react";

const CourseDetailsMain = ({ id , course}) => {

  // console.log("duration of fetched course -> courseDetails✔️✔️✔️",course)
  
  return (
    <>
      <HeroPrimary path={"Course-Details"} title={"Course Details"} />
      <CourseDetailsPrimary id={id} courseDetails={course}/>
    </>
  );
};

export default CourseDetailsMain;
