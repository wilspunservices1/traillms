"use client";

import React, { useState } from "react";
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
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import LessonQuizes from "@/components/shared/lesson-quiz/LessonQuizes";
import useSweetAlert from "@/hooks/useSweetAlert";
import ManageQuestionnaire from "../questionnaire/ManageQuestionnaire";
import { Autoplay } from "swiper/modules";

import { useEffect } from "react";

let cid = 0;

const CourseDetailsPrimary = ({ id: currentId, type, courseDetails }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [showQuiz, setShowQuiz] = useState(false);
  const showAlert = useSweetAlert();

  const [isPurchased, setIsPurchased] = useState(false);
  const [error, setError] = useState(null); // Track errors


  useEffect(() => {
    const checkPurchaseStatus = async () => {
      if (!session?.user) return; // If user is not logged in, don't check

      try {
        const response = await fetch(`/api/courses/${currentId}/check-purchase`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to check course enrollment");
        }

        const data = await response.json();

        if (typeof data.hasPurchased !== "boolean") {
          throw new Error("Invalid response format");
        }

        setIsPurchased(data.hasPurchased); // Show button only if purchased
        setError(null); // Reset error state

      } catch (error) {
        console.error("Error checking purchase status:", error);
        setError(error.message); // Store error as a string, not an object
      }
    };

    checkPurchaseStatus();
  }, [session, currentId]); // Runs when session or course ID changes




  // A helper to build the HTML for the certificate + placeholders
  function buildCertificateHTML(certificate_data_url, placeholders = [], originalWidth = 1024, originalHeight = 728) {
    const displayedWidth = 450; // Thumbnail width
    const scaleFactor = displayedWidth / originalWidth; // Scaling factor
    const displayedHeight = originalHeight * scaleFactor; // Maintain aspect ratio

    let html = `
    <div style="position: relative; display: inline-block; width: ${displayedWidth}px; height: ${displayedHeight}px; overflow: hidden; border: 1px solid #ccc;">
      <img 
        src="${certificate_data_url}" 
        alt="Certificate" 
        style="display: block; width: 100%; height: auto;"
      />
    `;

    // Correctly scale & position placeholders within the certificate
    const visiblePlaceholders = placeholders.filter(ph => ph.is_visible);
    visiblePlaceholders.forEach(ph => {
      const percentX = ((ph.x + 50) / originalWidth) * 100 + 18; // X in percentage
      const percentY = ((ph.y + 50) / originalHeight) * 100 + 18; // Y in percentage
      const scaledFontSize = Math.max((ph.font_size ?? 16) * scaleFactor, 12); // Prevent too small text

      html += `
        <div 
          style="
            position: absolute;
            top: ${percentY}%;
            left: ${percentX}%;
            font-size: ${scaledFontSize}px;
            color: ${ph.color || '#000'};
            transform: translate(-50%, -50%);
            text-align: center;
            white-space: nowrap;
            background: rgba(255, 255, 255, 0.7); /* Background to prevent overlap */
            padding: 2px 5px;
            border-radius: 3px;
            max-width: 90%;
          "
        >
          ${ph.value ?? ph.label ?? ""}
        </div>
      `;
    });

    html += `</div>`;
    return html;
  }


  function openFullScreenCertificate(certificateUrl, placeholders) {
    const originalWidth = 1024; // Set to actual certificate width
    const originalHeight = 728; // Set to actual certificate height

    const newWindow = window.open("", "_blank");

    const html = `
      <html>
      <head>
        <title>Certificate</title>
        <style>
          body { text-align: center; background-color: #f0f0f0; margin: 0; padding: 20px; }
          .certificate-container { position: relative; display: inline-block; width: ${originalWidth}px; height: ${originalHeight}px; }
          .placeholder { position: absolute; white-space: nowrap; }
          button { margin-top: 20px; padding: 10px 20px; font-size: 16px; cursor: pointer; }
        </style>
      </head>
      <body>
        <div class="certificate-container">
          <img src="${certificateUrl}" alt="Certificate" style="width: 100%; height: auto;" id="certificate-image" />
          ${placeholders
        .map(
          (ph) => `
            <div class="placeholder" 
              style="
                top: ${(ph.y / originalHeight) * 100 + 16}%;
                left: ${(ph.x / originalWidth) * 100 + 14}%;
                font-size: ${(ph.font_size / originalWidth) * 100}vw;
                color: ${ph.color || '#000000'};
              ">
              ${ph.value ?? ph.label ?? ""}
            </div>
          `
        )
        .join("")}
        </div>
        <br>
        <button onclick="downloadCertificate()">Download</button>
        <script>
          function downloadCertificate() {
            html2canvas(document.querySelector('.certificate-container'), { useCORS: true }).then(canvas => {
              const link = document.createElement("a");
              link.href = canvas.toDataURL("image/png");
              link.download = "certificate.png";
              link.click();
            });
          }
        </script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
      </body>
      </html>
    `;

    newWindow.document.write(html);
    newWindow.document.close();
  }




  const handleCertificateSelect = async () => {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    try {
      // Check course purchase first
      const purchaseResponse = await fetch(`/api/courses/${currentId}/check-purchase`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!purchaseResponse.ok) {
        throw new Error("Failed to check course enrollment");
      }

      const purchaseData = await purchaseResponse.json();

      if (!purchaseData.hasPurchased) {
        showAlert("warning", "Please purchase this course to access the certificate.");
        return;
      }

      // 2️⃣ Fetch the user details (for student name)
      const userResponse = await fetch(`/api/user/${session.user.id}`);
      if (!userResponse.ok) throw new Error("Failed to fetch user data");
      const userData = await userResponse.json();
      const studentName = userData?.name || "Student Name"; // Fallback


      // 2️⃣ Fetch the course details to get the certificateId
      const courseResponse = await fetch(`/api/courses/${currentId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!courseResponse.ok) {
        throw new Error(`Failed to fetch course data: ${courseResponse.statusText}`);
      }

      const courseData = await courseResponse.json();
      // Assuming the response is shaped like { message: "...", data: { ...courseFields } }
      const { data: fetchedCourse } = courseData;



      const sessionName = fetchedCourse?.title || "Session Name"; // Fallback
      const sessionStartDate = fetchedCourse?.startDate || "Start Date"; // Fallback
      const sessionEndDate = fetchedCourse?.endDate || "End Date"; // Fallback


      // 3️⃣ Check if the course has a certificateId
      const storedCertificateId = fetchedCourse?.certificateId;
      if (!storedCertificateId) {
        showAlert("error", "No certificate is set for this course. Please select a certificate in the admin panel.");
        return;
      }

      // 4️⃣ Fetch that single certificate
      const certificateResponse = await fetch(`/api/manageCertificates/${storedCertificateId}`);
      if (!certificateResponse.ok) {
        throw new Error(`Failed to fetch certificate: ${certificateResponse.statusText}`);
      }

      const certificateData = await certificateResponse.json();

      const { certificate_data_url, placeholders, id: certificateId, unique_identifier } = certificateData;

      // 6️⃣ Construct the Certificate Number
      const certificateNumber = `${unique_identifier}-${certificateId}`;

      // 7️⃣ Replace Placeholders with Actual Data
      const filledPlaceholders = placeholders
        .filter(ph => ph.is_visible) // ✅ Only process visible placeholders
        .map(ph => {
          switch (ph.key) {
            case "studentName": return { ...ph, value: studentName };
            case "sessionName": return { ...ph, value: sessionName };
            case "sessionStartDate": return { ...ph, value: sessionStartDate };
            case "sessionEndDate": return { ...ph, value: sessionEndDate };
            case "dateGenerated": return { ...ph, value: new Date().toLocaleDateString() };
            case "companyName": return { ...ph, value: "Meridian LMS Pvt. Ltd." };
            case "certificateNumber": return { ...ph, value: unique_identifier };
            default: return ph; // If no match, return the original placeholder
          }
        });




      const htmlContent = buildCertificateHTML(certificate_data_url, filledPlaceholders);


      // Display the selected certificate (modify as per your actual implementation)
      Swal.fire({
        title: 'Certificate of Completion',
        html: htmlContent,
        showCancelButton: true,
        confirmButtonText: 'Download',
        cancelButtonText: 'Close',
      }).then((result) => {
        if (result.isConfirmed) {
          // Optionally download the image
          openFullScreenCertificate(certificate_data_url, filledPlaceholders);
        }
      });

    } catch (error) {
      console.error("Detailed error:", error);
      showAlert("error", `Error: ${error.message}. Please try again or contact support.`);
    }
  };

  const {
    thumbnail,
    categories,
    duration,
    updatedAt,
    insName,
    title,
    price,
    estimatedPrice,
    lesson,
    description,
    discount,
    skillLevel,
    extras,
  } = courseDetails;

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
                        {isPurchased && (
                          <button
                            onClick={handleCertificateSelect}
                            className="text-sm text-whiteColor bg-primaryColor border border-primaryColor px-26px py-0.5 leading-23px font-semibold hover:text-primaryColor hover:bg-whiteColor rounded inline-block dark:hover:bg-whiteColor-dark dark:hover:text-whiteColor"
                          >
                            Get Certificate
                          </button>
                        )}

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

                    {/* title  */}
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
                            {lesson || "23 Lesson"}
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
                                {extras?.languages &&
                                  extras.languages.length > 0
                                  ? extras.languages
                                    .map(
                                      (lang, index) =>
                                        lang.charAt(0).toUpperCase() +
                                        lang.slice(1)
                                    )
                                    .join(", ")
                                  : "English"}{" "}
                                {/* Default to "English" if no languages available */}
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
                <Commits
                  commits={courseDetails?.comments}
                  courseId={courseDetails?.id}
                />
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
      {/* Quiz Modal */}
      {showQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-whiteColor-dark rounded-lg p-6 max-w-2xl w-full mx-4">
            <ManageQuestionnaire
              courseId={currentId}
              onQuizComplete={(passed) => {
                if (passed) {
                  showAlert("success", "Quiz completed successfully!");
                }
                setShowQuiz(false);
              }}
            />
            <button
              onClick={() => setShowQuiz(false)}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default CourseDetailsPrimary;
