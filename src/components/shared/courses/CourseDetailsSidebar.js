import BlogContactForm from "../blogs/BlogContactForm";
import BlogSocials from "../blogs/BlogSocials";
import BlogTags from "../blogs/BlogTags";
import CourseEnroll from "../course-details/CourseEnroll";
import PopularCoursesMini from "../course-details/PopularCoursesMini";
import RecentCourses from "@/components/sections/sub-section/dashboards/RecentCourses";

const CourseDetailsSidebar = ({ type, course }) => {
  return (
    <div className="flex flex-col">
      {/* enroll section  */}
      <CourseEnroll type={type} course={course} />

      {/* social area  */}
      <BlogSocials />

      {/* popular course  */}
      {/* <PopularCoursesMini /> */}
      <RecentCourses />

      {/* contact form  */}
      {/* <BlogContactForm /> */}

      {/* tags */}
      <BlogTags />
    </div>
  );
};

export default CourseDetailsSidebar;
