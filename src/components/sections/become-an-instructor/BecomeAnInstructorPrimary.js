// src/components/BecomeAnInstructorPrimary.jsx
"use client";

import { useState } from "react";
import checkImage1 from "@/assets/images/dashbord/check__1.png";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSweetAlert from "@/hooks/useSweetAlert";

const BecomeAnInstructorPrimary = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    instructorBio: "",
    qualifications: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // State to hold the inline message
  const router = useRouter();
  const showAlert = useSweetAlert();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(""); // Reset message

    try {
      // Convert qualifications string to array
      const qualificationsArray = formData.qualifications
        .split(",")
        .map((q) => q.trim());

      const response = await fetch("/api/instructors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          qualifications: qualificationsArray,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit application");
      }

      // Set the inline message
      setMessage(data.message);

      // Optionally clear the form
      setFormData({
        username: "",
        email: "",
        phone: "",
        password: "",
        instructorBio: "",
        qualifications: "",
      });
    } catch (error) {
      console.error("Error:", error);
      showAlert("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="container pt-100px pb-100px" data-aos="fade-up">
        <h3 className="text-size-32 font-bold text-blackColor dark:text-blackColor-dark leading-1.2 pb-15px border-b border-borderColor dark:border-borderColor-dark mb-10">
          Apply As Instructor
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-30px">
          {/* Apply Left */}
          <div data-aos="fade-up">
            {/* Content about becoming an instructor */}
            <h6 className="text-2xl font-semibold text-blackColor dark:text-blackColor-dark leading-1.8 mb-15px">
              Become an Instructor
            </h6>
            <p className="text-contentColor dark:text-contentColor-dark leading-1.8 mb-15px mt-5">
              Share your knowledge and passion with learners around the world. As an instructor, you have the opportunity to create engaging courses, reach a global audience, and make a significant impact on students&lsquo; lives while earning income.
            </p>
            <p className="text-contentColor dark:text-contentColor-dark leading-1.8 mb-15px mt-5">
              Join our vibrant community of educators and experts. We provide you with the tools and support needed to develop high-quality courses and succeed in the online learning marketplace.
            </p>

            <h6 className="text-2xl font-semibold text-blackColor dark:text-blackColor-dark leading-1.8 mb-15px">
              Instructor Guidelines
            </h6>
            <p className="text-contentColor dark:text-contentColor-dark leading-1.8 mb-15px mt-5">
              To ensure the best learning experience for our students, we ask our instructors to adhere to the following guidelines:
            </p>
            <ul className="mb-30px space">
              <li className="mt-5 flex items-center gap-5">
                <div className="h-25px w-25px">
                  <Image src={checkImage1} alt="Check icon" className="w-full" />
                </div>
                <p className="text-contentColor dark:text-contentColor-dark leading-1.8">
                  Deliver high-quality content that is accurate, well-structured, and engaging.
                </p>
              </li>
              <li className="mt-5 flex items-center gap-5">
                <div className="h-25px w-25px">
                  <Image src={checkImage1} alt="Check icon" className="w-full" />
                </div>
                <p className="text-contentColor dark:text-contentColor-dark leading-1.8">
                  Respect all students and provide a supportive learning environment.
                </p>
              </li>
              <li className="mt-5 flex items-center gap-5">
                <div className="h-25px w-25px">
                  <Image src={checkImage1} alt="Check icon" className="w-full" />
                </div>
                <p className="text-contentColor dark:text-contentColor-dark leading-1.8">
                  Respond promptly to student questions and feedback.
                </p>
              </li>
              <li className="mt-5 flex items-center gap-5">
                <div className="h-25px w-25px">
                  <Image src={checkImage1} alt="Check icon" className="w-full" />
                </div>
                <p className="text-contentColor dark:text-contentColor-dark leading-1.8">
                  Uphold academic integrity and originality in your course materials.
                </p>
              </li>
              <li className="mt-5 flex items-center gap-5">
                <div className="h-25px w-25px">
                  <Image src={checkImage1} alt="Check icon" className="w-full" />
                </div>
                <p className="text-contentColor dark:text-contentColor-dark leading-1.8">
                  Comply with our platform policies and terms of service.
                </p>
              </li>
            </ul>

            <h6 className="text-2xl font-semibold text-blackColor dark:text-blackColor-dark leading-1.8 mb-15px">
              Get Started with Your Courses
            </h6>
            <p className="text-contentColor dark:text-contentColor-dark leading-1.8 mb-15px mt-5">
              Embark on your teaching journey by creating your first course. We offer comprehensive resources to help you design, develop, and promote your course effectively.
            </p>
            {/* Rules list */}
            <ul className="mb-30px space">
              <li className="mt-5 flex items-center gap-5">
                <div className="h-25px w-25px">
                  <Image src={checkImage1} alt="Check icon" className="w-full" />
                </div>
                <p className="text-contentColor dark:text-contentColor-dark leading-1.8">
                  Utilize our intuitive course creation tools for a seamless experience.
                </p>
              </li>
              <li className="mt-5 flex items-center gap-5">
                <div className="h-25px w-25px">
                  <Image src={checkImage1} alt="Check icon" className="w-full" />
                </div>
                <p className="text-contentColor dark:text-contentColor-dark leading-1.8">
                  Access a wealth of resources and best practices for course development.
                </p>
              </li>
              <li className="mt-5 flex items-center gap-5">
                <div className="h-25px w-25px">
                  <Image src={checkImage1} alt="Check icon" className="w-full" />
                </div>
                <p className="text-contentColor dark:text-contentColor-dark leading-1.8">
                  Engage with a community of instructors to exchange ideas and advice.
                </p>
              </li>
            </ul>
            <p className="text-contentColor dark:text-contentColor-dark leading-1.8 mb-15px mt-5">
              Ready to make a difference? Join us today and start sharing your expertise with eager learners everywhere.
            </p>
          </div>

          {/* Apply Right */}
          <div data-aos="fade-up">
            <form
              onSubmit={handleSubmit}
              className="p-10px md:p-10 lg:p-5 2xl:p-10 mb-50px bg-darkdeep3 dark:bg-darkdeep3-dark text-sm text-blackColor dark:text-blackColor-dark leading-1.8"
            >
              <div className="grid grid-cols-1 mb-15px gap-15px">
                <div>
                  <label className="mb-3 block font-semibold">Username</label>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full py-2 px-3 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-6 rounded-md font-no"
                  />
                </div>
                <div>
                  <label className="mb-3 block font-semibold">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full py-2 px-3 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-6 rounded-md font-no"
                  />
                </div>
                <div>
                  <label className="mb-3 block font-semibold">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="+1-555-555-5555"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full py-2 px-3 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-6 rounded-md font-no"
                  />
                </div>
                <div>
                  <label className="mb-3 block font-semibold">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full py-2 px-3 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-6 rounded-md font-no"
                  />
                </div>
              </div>
              <div className="mb-15px">
                <label className="mb-3 block font-semibold">Bio</label>
                <textarea
                  name="instructorBio"
                  placeholder="Tell us about yourself..."
                  value={formData.instructorBio}
                  onChange={handleChange}
                  className="w-full py-2 px-3 text-sm text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-6 rounded-md"
                  cols="30"
                  rows="6"
                />
              </div>
              <div className="mb-15px">
                <label className="mb-3 block font-semibold">Qualifications</label>
                <input
                  type="text"
                  name="qualifications"
                  placeholder="Enter qualifications separated by commas"
                  value={formData.qualifications}
                  onChange={handleChange}
                  className="w-full py-2 px-3 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-6 rounded-md font-no"
                />
              </div>

              <div className="mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    required
                    className="form-checkbox h-5 w-5 text-primaryColor"
                  />
                  <span className="ml-2 text-size-15 text-contentColor dark:text-contentColor-dark">
                    You agree to our friendly{" "}
                    <Link
                      href="#"
                      className="text-base text-blackColor dark:text-blackColor-dark hover:text-primaryColor dark:hover:text-primaryColor font-bold leading-1 relative before:w-full before:h-1px before:bg-blackColor dark:before:bg-blackColor-dark before:absolute before:left-0 before:-bottom-0.5"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
              </div>
              <div className="mt-15px">
                <ButtonPrimary type="submit" disabled={loading}>
                  {loading ? "Submitting..." : "Apply Now"}
                </ButtonPrimary>
              </div>

              {/* Inline Message */}
              {message && (
                <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
                  {message}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BecomeAnInstructorPrimary;



// import checkImage1 from "@/assets/images/dashbord/check__1.png";
// import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
// import Image from "next/image";
// import Link from "next/link";

// const BecomeAnInstructorPrimary = () => {
//   return (
//     <section>
//       <div className="container pt-100px pb-100px" data-aos="fade-up">
//         <h3 className="text-size-32 font-bold text-blackColor dark:text-blackColor-dark leading-1.2 pb-15px border-b border-borderColor dark:border-borderColor-dark mb-10">
//           Apply As Instructor
//         </h3>
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-30px">
//           {/* apply left */}
//           <div data-aos="fade-up">
// <h6 className="text-2xl font-semibold text-blackColor dark:text-blackColor-dark leading-1.8 mb-15px">
//   Become an Instructor
// </h6>
// <p className="text-contentColor dark:text-contentColor-dark leading-1.8 mb-15px mt-5">
//   Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus
//   blanditiis officiis vero fugiat inventore voluptates sint magnam,
//   accusantium cupiditate odio dolore ipsam ut, corrupti quisquam
//   veritatis pariatur harum labore voluptatibus consectetur dolorem
//   aliquid soluta.
// </p>
// <h6 className="text-2xl font-semibold text-blackColor dark:text-blackColor-dark leading-1.8 mb-15px">
//   Instructor Rules
// </h6>
// <p className="text-contentColor dark:text-contentColor-dark leading-1.8 mb-15px mt-5">
//   Various versions have evolved over the years, sometimes by
//   accident, sometimes on purpose (injected humour and the like).
// </p>
//             {/* rules list */}
// <ul className="mb-30px space">
//   <li className="mt-5 flex items-center gap-5">
//     <div className="h-25px w-25px">
//       <Image src={checkImage1} alt="" className="w-full" />
//     </div>
//     <p className="text-contentColor dark:text-contentColor-dark leading-1.8">
//       Basic knowledge and detailed understanding of CSS3 to create.
//     </p>
//   </li>
//   <li className="mt-5 flex items-center gap-5">
//     <div className="h-25px w-25px">
//       <Image src={checkImage1} alt="" className="w-full" />
//     </div>
//     <p className="text-contentColor dark:text-contentColor-dark leading-1.8">
//       Details Idea about HTMLS, Creating Basic Web Pages using HTMLS
//     </p>
//   </li>
//   <li className="mt-5 flex items-center gap-5">
//     <div className="h-25px w-25px">
//       <Image src={checkImage1} alt="" className="w-full" />
//     </div>
//     <p className="text-contentColor dark:text-contentColor-dark leading-1.8">
//       Web Page Layout Design and Slider Creation
//     </p>
//   </li>
//   <li className="mt-5 flex items-center gap-5">
//     <div className="h-25px w-25px">
//       <Image src={checkImage1} alt="" className="w-full" />
//     </div>
//     <p className="text-contentColor dark:text-contentColor-dark leading-1.8">
//       Image Insert method af web site
//     </p>
//   </li>
//   <li className="mt-5 flex items-center gap-5">
//     <div className="h-25px w-25px">
//       <Image src={checkImage1} alt="" className="w-full" />
//     </div>
//     <p className="text-contentColor dark:text-contentColor-dark leading-1.8">
//       Creating Styling Web Pages Using CSS3
//     </p>
//   </li>
// </ul>
// <h6 className="text-2xl font-semibold text-blackColor dark:text-blackColor-dark leading-1.8 mb-15px">
//   Start With courses
// </h6>
// <p className="text-contentColor dark:text-contentColor-dark leading-1.8 mb-15px mt-5">
//   Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam
//   facilis inventore tempora maxime quibusdam cumque aperiam? Ducimus
//   totam repellendus fugiat vel dolorum. Commodi, vel. Aliquid quia
//   voluptas esse accusantium? Libero impedit, odit dolorum sint fugit
//   error.
// </p>
// {/* rules list */}
// <ul className="mb-30px space">
//   <li className="mt-5 flex items-center gap-5">
//     <div className="h-25px w-25px">
//       <Image src={checkImage1} alt="" className="w-full" />
//     </div>
//     <p className="text-contentColor dark:text-contentColor-dark leading-1.8">
//       Basic knowledge and detailed understanding of CSS3 to create.
//     </p>
//   </li>
//   <li className="mt-5 flex items-center gap-5">
//     <div className="h-25px w-25px">
//       <Image src={checkImage1} alt="" className="w-full" />
//     </div>
//     <p className="text-contentColor dark:text-contentColor-dark leading-1.8">
//       Details Idea about HTMLS, Creating Basic Web Pages using HTMLS
//     </p>
//   </li>
//   <li className="mt-5 flex items-center gap-5">
//     <div className="h-25px w-25px">
//       <Image src={checkImage1} alt="" className="w-full" />
//     </div>
//     <p className="text-contentColor dark:text-contentColor-dark leading-1.8">
//       Web Page Layout Design and Slider Creation
//     </p>
//   </li>
// </ul>
// <p className="text-contentColor dark:text-contentColor-dark leading-1.8 mb-15px mt-5">
//   Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia,
//   voluptas.
// </p>
//           </div>
//           {/* apply righ */}
//           <div data-aos="fade-up">
//             <form
//               className="p-10px md:p-10 lg:p-5 2xl:p-10 mb-50px bg-darkdeep3 dark:bg-darkdeep3-dark text-sm text-blackColor dark:text-blackColor-dark leading-1.8"
//               data-aos="fade-up"
//             >
//               <div className="grid grid-cols-1 mb-15px gap-15px">
//                 <div>
//                   <label className="mb-3 block font-semibold">First Name</label>
//                   <input
//                     type="text"
//                     placeholder="John"
//                     className="w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no"
//                   />
//                 </div>
//                 <div>
//                   <label className="mb-3 block font-semibold">Last Name</label>
//                   <input
//                     type="text"
//                     placeholder="Due"
//                     className="w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no"
//                   />
//                 </div>
//                 <div>
//                   <label className="mb-3 block font-semibold">Email</label>
//                   <input
//                     type="email"
//                     placeholder="Email"
//                     className="w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no"
//                   />
//                 </div>
//                 <div>
//                   <label className="mb-3 block font-semibold">
//                     Phone Number
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="+8-333-555-6666"
//                     className="w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no"
//                   />
//                 </div>
//               </div>
//               <div className="mb-15px">
//                 <label className="mb-3 block font-semibold">Bio</label>
//                 <textarea
//                   placeholder="Type you comments...."
//                   defaultValue={
//                     "Lorem ipsum dolor sit, amet consectetur adipisicing elit."
//                   }
//                   className="w-full py-10px px-5 text-sm text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md"
//                   cols="30"
//                   rows="6"
//                 />
//               </div>

//               <div>
//                 <input type="checkbox" />{" "}
//                 <span className="text-size-15 text-contentColor dark:text-contentColor-dark">
//                   You agree to our friendly
//                   <Link
//                     href="#"
//                     className="text-base text-blackColor dark:text-blackColor-dark hover:text-primaryColor dark:hover:text-primaryColor font-bold leading-1 relative before:w-full before:h-1px before:bg-blackColor dark:before:bg-blackColor-dark before:absolute before:left-0 before:-bottom-0.5"
//                   >
//                     Privacy policy
//                   </Link>
//                   .
//                 </span>
//               </div>
//               <div className="mt-15px">
//                 <ButtonPrimary type={"submit"}>Update Info</ButtonPrimary>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default BecomeAnInstructorPrimary;
