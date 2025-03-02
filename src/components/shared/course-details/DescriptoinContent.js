import CourseDescription from "@/components/sections/course-details/CourseDescription";
import React from "react";

const DescriptoinContent = ({ title, description }) => {
  return (
    <div>
      <h4
        className="text-size-26 font-bold text-blackColor dark:text-blackColor-dark mb-15px !leading-14"
        data-aos="fade-up"
      >
        {title ? title : "About the course"}
      </h4>
      {
        description && (
          <CourseDescription description={description} />
        )
      }
    </div>
  );
};

export default DescriptoinContent;
