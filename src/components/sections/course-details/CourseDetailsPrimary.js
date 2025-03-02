"use client"
import CourseDetailsSidebar from "@/components/shared/courses/CourseDetailsSidebar";
import Image from "next/image";
import blogImag8 from "@/assets/images/blog/blog_8.png";
import BlogTagsAndSocila from "@/components/shared/blog-details/BlogTagsAndSocila";
import CourseDetailsTab from "@/components/shared/course-details/CourseDetailsTab";
import InstrutorOtherCourses from "@/components/shared/course-details/InstrutorOtherCourses";
import getAllCourses from "@/libs/getAllCourses";
import { formatDate } from "@/actions/formatDate";
import { CldImage } from "next-cloudinary";
import CourseDescription from "./CourseDescription";
import Commits from "./_comp/Commits";
let cid = 0;


const CourseDetailsPrimary = ({ id: currentId, type, courseDetails }) => {

  

  const {
    thumbnail, categories,
    duration, updatedAt, insName,
    title, price, estimatedPrice,
    lesson, description,
    discount, skillLevel,
    extras
  } = courseDetails

  // console.log("thumbnail course courseDetails", extras?.languages)
  const allCourses = getAllCourses();
  const course = allCourses?.find(({ id }) => parseInt(currentId) === id);
  const { id } = course || {};
  cid = id;
  cid = cid % 6 ? cid % 6 : 6;

  


  return (
    <section>
      <div className="container py-10 md:py-50px lg:py-60px 2xl:py-100px">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-30px">
          <div className="lg:col-start-1 lg:col-span-8 space-y-[35px]">
            {/* course 1  */}
            <div data-aos="fade-up">
              {/* course thumbnail  */}
              {type === 2 || type === 3 ? (
                ""
              ) : (
                <div className="overflow-hidden relative mb-5">
                  <CldImage
                    width="600"
                    height="600"
                    alt=""
                    src={thumbnail}
                    sizes={"60w"}
                  />
                </div>
              )}
              {/* course content  */}
              <div>
                {type === 2 || type === 3 ? (
                  ""
                ) : (
                  <>
                    <div
                      className="flex items-center justify-between flex-wrap gap-6 mb-30px"
                      data-aos="fade-up"
                    >
                      <div className="flex items-center gap-6">
                        <button className="text-sm text-whiteColor bg-primaryColor border border-primaryColor px-26px py-0.5 leading-23px font-semibold hover:text-primaryColor hover:bg-whiteColor rounded inline-block dark:hover:bg-whiteColor-dark dark:hover:text-whiteColor">
                          Featured
                        </button>
                        <button className="text-sm text-whiteColor bg-indigo border border-indigo px-22px py-0.5 leading-23px font-semibold hover:text-indigo hover:bg-whiteColor rounded inline-block dark:hover:bg-whiteColor-dark dark:hover:text-indigo">
                          {categories}
                        </button>
                      </div>
                      <div>
                        <p className="text-sm text-contentColor dark:text-contentColor-dark font-medium">
                          Last Update:{" "}
                          <span className="text-blackColor dark:text-blackColor-dark">
                            {formatDate(updatedAt)}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* titile  */}
                    <h4
                      className="text-size-32 md:text-4xl font-bold text-blackColor dark:text-blackColor-dark mb-15px leading-43px md:leading-14.5"
                      data-aos="fade-up"
                    >
                      {title || "Making inspiration with Other People"}
                    </h4>
                    {/* price and rating  */}
                    <div
                      className="flex gap-5 flex-wrap items-center mb-30px"
                      data-aos="fade-up"
                    >
                      <div className="text-size-21 font-medium text-primaryColor font-inter leading-25px">
                        ${price ? parseFloat(price).toFixed(2) : "0.00"}{" "}
                        <del className="text-sm text-lightGrey4 font-semibold">
                          / ${parseFloat(estimatedPrice).toFixed(2)}
                        </del>
                      </div>
                      <div className="flex items-center">
                        <div>
                          <i className="icofont-book-alt pr-5px text-primaryColor text-lg"></i>
                        </div>
                        <div>
                          <span className=" text-black dark:text-blackColor-dark">
                            {
                              lesson || "23 Lesson"}
                          </span>
                        </div>
                      </div>
                      <div className="text-start md:text-end">
                        <i className="icofont-star text-size-15 text-yellow"></i>{" "}
                        <i className="icofont-star text-size-15 text-yellow"></i>{" "}
                        <i className="icofont-star text-size-15 text-yellow"></i>{" "}
                        <i className="icofont-star text-size-15 text-yellow"></i>
                        <i className="icofont-star text-size-15 text-yellow"></i>{" "}
                        <span className=" text-blackColor dark:text-blackColor-dark">
                          (44)
                        </span>
                      </div>
                    </div>
                    <CourseDescription />
                    {/* details  */}
                    <div>
                      <h4
                        className="text-size-22 text-blackColor dark:text-blackColor-dark font-bold pl-2 before:w-0.5 relative before:h-[21px] before:bg-primaryColor before:absolute before:bottom-[5px] before:left-0 leading-30px mb-25px"
                        data-aos="fade-up"
                      >
                        Course Details
                      </h4>

                      <div
                        className="bg-darkdeep3 dark:bg-darkdeep3-dark mb-30px grid grid-cols-1 md:grid-cols-2"
                        data-aos="fade-up"
                      >
                        <ul className="p-10px md:py-55px md:pl-50px md:pr-70px lg:py-35px lg:px-30px 2xl:py-55px 2xl:pl-50px 2xl:pr-70px border-r-2 border-borderColor dark:border-borderColor-dark space-y-[10px]">
                          <li>
                            <p className="text-contentColor2 dark:text-contentColor2-dark flex justify-between items-center">
                              Instructor :
                              <span className="text-base lg:text-sm 2xl:text-base text-blackColor dark:text-deepgreen-dark font-medium text-opacity-100">
                                {insName || "Aqeel.S"}
                              </span>
                            </p>
                          </li>
                          <li>
                            <p className="text-contentColor2 dark:text-contentColor2-dark flex justify-between items-center">
                              Lectures :
                              <span className="text-base lg:text-sm 2xl:text-base text-blackColor dark:text-deepgreen-dark font-medium text-opacity-100">
                                {lesson ? lesson : 0} sub
                              </span>
                            </p>
                          </li>
                          <li>
                            <p className="text-contentColor2 dark:text-contentColor2-dark flex justify-between items-center">
                              Duration :
                              <span className="text-base lg:text-sm 2xl:text-base text-blackColor dark:text-deepgreen-dark font-medium text-opacity-100">
                                {duration ? duration : "0"}
                              </span>
                            </p>
                          </li>
                          <li>
                            <p className="text-contentColor2 dark:text-contentColor2-dark flex justify-between items-center">
                              Enrolled :
                              <span className="text-base lg:text-sm 2xl:text-base text-blackColor dark:text-deepgreen-dark font-medium text-opacity-100">
                                0 students
                              </span>
                            </p>
                          </li>
                          <li>
                            <p className="text-contentColor2 dark:text-contentColor2-dark flex justify-between items-center">
                              Total :
                              <span className="text-base lg:text-sm 2xl:text-base text-blackColor dark:text-deepgreen-dark font-medium text-opacity-100">
                                0 students
                              </span>
                            </p>
                          </li>
                        </ul>
                        <ul className="p-10px md:py-55px md:pl-50px md:pr-70px lg:py-35px lg:px-30px 2xl:py-55px 2xl:pl-50px 2xl:pr-70px border-r-2 border-borderColor dark:border-borderColor-dark space-y-[10px]">
                          <li>
                            <p className="text-contentColor2 dark:text-contentColor2-dark flex justify-between items-center">
                              Course level :
                              <span className="text-base lg:text-sm 2xl:text-base text-blackColor dark:text-deepgreen-dark font-medium text-opacity-100">
                                {skillLevel ? skillLevel : "Intermediate"}
                              </span>
                            </p>
                          </li>
                          <li>
                            <p className="text-contentColor2  dark:text-contentColor2-dark flex justify-between items-center">
                              <span>Languages :</span>
                              <span className="text-xs pl-1 lg:text-sm 2xl:text-base text-blackColor dark:text-deepgreen-dark font-medium text-opacity-100">
                                {/* Dynamically map and join languages */}
                                {extras?.languages && extras.languages.length > 0
                                  ? extras.languages.map((lang, index) =>
                                    lang.charAt(0).toUpperCase() + lang.slice(1)).join(', ')
                                  : "English"} {/* Default to "English" if no languages available */}
                              </span>
                            </p>
                          </li>

                          <li>
                            <p className="text-contentColor2 dark:text-contentColor2-dark flex justify-between items-center">
                              Price Discount :
                              <span className="text-base lg:text-sm 2xl:text-base text-blackColor dark:text-deepgreen-dark font-medium text-opacity-100">
                                {discount ? discount : "-20%"}
                              </span>
                            </p>
                          </li>
                          <li>
                            <p className="text-contentColor2 dark:text-contentColor2-dark flex justify-between items-center">
                              Regular Price :
                              <span className="text-base lg:text-sm 2xl:text-base text-blackColor dark:text-deepgreen-dark font-medium text-opacity-100">
                                {price ? price : "$0"}
                              </span>
                            </p>
                          </li>
                          <li>
                            <p className="text-contentColor2 dark:text-contentColor2-dark flex justify-between items-center">
                              Course Status :
                              <span className="text-base lg:text-sm 2xl:text-base text-blackColor dark:text-deepgreen-dark font-medium text-opacity-100">
                                Available
                              </span>
                            </p>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </>
                )}
                {/* course tab  */}
                <CourseDetailsTab id={cid} type={type} course={courseDetails} />
                <div className="md:col-start-5 md:col-span-8 mb-5">
                  <h4
                    className="text-2xl font-bold text-blackColor dark:text-blackColor-dark mb-15px !leading-38px"
                    data-aos="fade-up"
                  >
                    Why search Is Important ?
                  </h4>
                  <ul className="space-y-[15px] max-w-127">
                    <li className="flex items-center group" data-aos="fade-up">
                      <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
                      <p className="text-sm lg:text-xs 2xl:text-sm font-medium leading-25px lg:leading-21px 2xl:leading-25px text-contentColor dark:text-contentColor-dark">
                        Lorem Ipsum is simply dummying text of the printing
                        andtypesetting industry most of the standard.
                      </p>
                    </li>
                    <li className="flex items-center group" data-aos="fade-up">
                      <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
                      <p className="text-sm lg:text-xs 2xl:text-sm font-medium leading-25px lg:leading-21px 2xl:leading-25px text-contentColor dark:text-contentColor-dark">
                        Lorem Ipsum is simply dummying text of the printing
                        andtypesetting industry most of the standard.
                      </p>
                    </li>
                    <li className="flex items-center group" data-aos="fade-up">
                      <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
                      <p className="text-sm lg:text-xs 2xl:text-sm font-medium leading-25px lg:leading-21px 2xl:leading-25px text-contentColor dark:text-contentColor-dark">
                        Lorem Ipsum is simply dummying text of the printing
                        andtypesetting industry most of the standard.
                      </p>
                    </li>
                    <li className="flex items-center group" data-aos="fade-up">
                      <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
                      <p className="text-sm lg:text-xs 2xl:text-sm font-medium leading-25px lg:leading-21px 2xl:leading-25px text-contentColor dark:text-contentColor-dark">
                        Lorem Ipsum is simply dummying text of the printing
                        andtypesetting industry most of the standard.
                      </p>
                    </li>
                  </ul>
                </div>
                {/* tag and share   */}

                <BlogTagsAndSocila />
                {/* other courses  */}
                <InstrutorOtherCourses courseId={courseDetails?.id} />
                {/* All Commits and replies */}
                <Commits commits={courseDetails?.comments} courseId={courseDetails?.id} />
                
              </div>
            </div>
          </div>
          {/* course sidebar  */}
          <div
            className={`lg:col-start-9 lg:col-span-4 ${type === 2 || type === 3 ? "relative lg:top-[-340px]" : ""
              }`}
          >
            <CourseDetailsSidebar type={type} course={courseDetails} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseDetailsPrimary;
