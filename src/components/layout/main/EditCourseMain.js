import CreateCoursePrimary from "@/components/sections/create-course/CreateCoursePrimary";
import HeroPrimary from "@/components/sections/hero-banners/HeroPrimary";
import React from "react";

const EditCourseMain = () => {
  return (
    <>
      <HeroPrimary path={"Edit Course"} title={"Edit Course"} />
      <CreateCoursePrimary />
    </>
  );
};

export default EditCourseMain;
