import HeroPrimary from "@/components/sections/hero-banners/HeroPrimary";
import LessonPrimary from "@/components/sections/lessons/LessonPrimary";
import React from "react";

const LessonMain = ({ lesson }) => {

  // console.log("lesson ....",lesson && lesson)
  return <LessonPrimary lessonId={lesson?.id} />;
};

export default LessonMain;
