"use client";
import React, { useState } from "react";
import useSweetAlert from "@/hooks/useSweetAlert";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";
import Loader from "@/components/sections/create-course/_comp/Icons/Loader";

const ReviewForm = ({ courseId, addReview }) => {
  const showAlert = useSweetAlert();
  const { data: session } = useSession() as { data: Session | null };
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0, // Initial rating set to 0
    comment: "",
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    avatar: session?.user?.image || "",
  });

  // Handle form input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Make the PATCH request
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviews: [
            {
              name: formData.name,
              rating: formData.rating, // Rating based on star selection
              comment: formData.comment,
              date: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              avatar: formData.avatar,
            },
          ],
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Add the new review to the list
        const newReview = {
          name: formData.name,
          rating: formData.rating,
          comment: formData.comment,
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          avatar: formData.avatar,
        };
        addReview(newReview); // Call the addReview function to update state

        showAlert("success", "Review submitted successfully", );
      } else {
        showAlert("error" , result.message || "Failed to submit the review" );
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      showAlert("error submitting review. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Function to update the star rating
  const handleStarClick = (rating: number) => {
    setFormData({ ...formData, rating });
  };

  return (
    <div className="p-5 md:p-50px mb-50px bg-lightGrey12 dark:bg-transparent dark:shadow-brand-dark">
      <h4
        className="text-2xl font-bold text-blackColor dark:text-blackColor-dark mb-15px !leading-1.2"
        data-aos="fade-up"
      >
        Add a Review
      </h4>
      <div className="flex gap-15px items-center mb-30px">
        <h6 className="font-bold text-blackColor dark:text-blackColor-dark !leading-[19.2px]">
          Your Ratings:
        </h6>
        <div className="text-secondaryColor leading-1.8">
          {[1, 2, 3, 4, 5].map((star) => (
            <i
              key={star}
              className={`icofont-star ${
                formData.rating >= star ? "text-primaryColor" : ""
              } hover:text-primaryColor cursor-pointer`}
              onClick={() => handleStarClick(star)}
            ></i>
          ))}
        </div>
      </div>
      <form className="pt-5" data-aos="fade-up" onSubmit={handleSubmit}>
        <textarea
          name="comment"
          placeholder="Type your comments...."
          className="w-full p-5 mb-8 bg-transparent text-sm text-blackColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border border-transparent dark:border-borderColor2-dark placeholder:text-placeholder"
          cols={30}
          rows={6}
          value={formData.comment}
          onChange={handleInputChange}
          required
        />
        <div className="grid grid-cols-1 mb-10 gap-10">
          <input
            type="text"
            name="name"
            placeholder="Type your name...."
            className="w-full pl-5 bg-transparent text-sm focus:outline-none text-blackColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border border-transparent dark:border-borderColor2-dark placeholder:text-placeholder placeholder:opacity-80 h-15 leading-15 font-medium rounded"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Type your email...."
            className="w-full pl-5 bg-transparent text-sm focus:outline-none text-blackColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border border-transparent dark:border-borderColor2-dark placeholder:text-placeholder placeholder:opacity-80 h-15 leading-15 font-medium rounded"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        {loading ? (
          <p className="flex ">
            <Loader />
          </p> // Show loading indicator
        ) : (
          <div className="mt-30px">
            <button
              type="submit"
              className="text-size-15 text-whiteColor bg-primaryColor px-25px py-10px border border-primaryColor hover:text-primaryColor hover:bg-whiteColor inline-block rounded group dark:hover:text-whiteColor dark:hover:bg-whiteColor-dark"
            >
              Submit
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ReviewForm;

// "use client";
// import React, { useState } from "react";
// import useSweetAlert from "@/hooks/useSweetAlert";
// import { useSession } from "next-auth/react";
// import { Session } from "next-auth";

// const ReviewForm = ({courseId}) => {
//   const showAlert = useSweetAlert();
//   const { data: session } = useSession() as { data: Session | null };
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     rating: 0, // Initial rating set to 0
//     comment: "",
//     name: session?.user?.name || "",
//     email: session?.user?.email || "",
//     avatar: session?.user?.image || "",
//   });

//   // Handle form input change
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   // Handle form submission
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // Assuming the course ID is known, replace with dynamic ID if needed
//     //   const courseId = "c65976ec-6ac5-4f35-8c05-f444635f54c1";

//       // Make the PATCH request
//       const response = await fetch(`/api/courses/${courseId}`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           reviews: [
//             {
//               name: formData.name,
//               rating: formData.rating, // Rating based on star selection
//               comment: formData.comment,
//               date: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }),
//               avatar: formData.avatar,
//             },
//           ],
//         }),
//       });

//       const result = await response.json();

//       if (response.ok) {
//         showAlert("Review submitted successfully!", "success");
//       } else {
//         showAlert(result.message || "Failed to submit the review", "error");
//       }
//     } catch (error) {
//       console.error("Error submitting review:", error);
//       showAlert("Error submitting review. Please try again.", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Function to update the star rating
//   const handleStarClick = (rating: number) => {
//     setFormData({ ...formData, rating });
//   };

//   return (
//     <div className="p-5 md:p-50px mb-50px bg-lightGrey12 dark:bg-transparent dark:shadow-brand-dark">
//       <h4
//         className="text-2xl font-bold text-blackColor dark:text-blackColor-dark mb-15px !leading-1.2"
//         data-aos="fade-up"
//       >
//         Add a Review
//       </h4>
//       <div className="flex gap-15px items-center mb-30px">
//         <h6 className="font-bold text-blackColor dark:text-blackColor-dark !leading-[19.2px]">
//           Your Ratings:
//         </h6>
//         <div className="text-secondaryColor leading-1.8">
//           {[1, 2, 3, 4, 5].map((star) => (
//             <i
//               key={star}
//               className={`icofont-star ${formData.rating >= star ? "text-primaryColor" : ""} hover:text-primaryColor cursor-pointer`}
//               onClick={() => handleStarClick(star)}
//             ></i>
//           ))}
//         </div>
//       </div>
//       <form className="pt-5" data-aos="fade-up" onSubmit={handleSubmit}>
//         <textarea
//           name="comment"
//           placeholder="Type your comments...."
//           className="w-full p-5 mb-8 bg-transparent text-sm text-blackColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border border-transparent dark:border-borderColor2-dark placeholder:text-placeholder"
//           cols={30}
//           rows={6}
//           value={formData.comment}
//           onChange={handleInputChange}
//           required
//         />
//         <div className="grid grid-cols-1 mb-10 gap-10">
//           <input
//             type="text"
//             name="name"
//             placeholder="Type your name...."
//             className="w-full pl-5 bg-transparent text-sm focus:outline-none text-blackColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border border-transparent dark:border-borderColor2-dark placeholder:text-placeholder placeholder:opacity-80 h-15 leading-15 font-medium rounded"
//             value={formData.name}
//             onChange={handleInputChange}
//             required
//           />
//           <input
//             type="email"
//             name="email"
//             placeholder="Type your email...."
//             className="w-full pl-5 bg-transparent text-sm focus:outline-none text-blackColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border border-transparent dark:border-borderColor2-dark placeholder:text-placeholder placeholder:opacity-80 h-15 leading-15 font-medium rounded"
//             value={formData.email}
//             onChange={handleInputChange}
//             required
//           />
//         </div>

//         {loading ? (
//           <p>Loading...</p> // Show loading indicator
//         ) : (
//           <div className="mt-30px">
//             <button
//               type="submit"
//               className="text-size-15 text-whiteColor bg-primaryColor px-25px py-10px border border-primaryColor hover:text-primaryColor hover:bg-whiteColor inline-block rounded group dark:hover:text-whiteColor dark:hover:bg-whiteColor-dark"
//             >
//               Submit
//             </button>
//           </div>
//         )}
//       </form>
//     </div>
//   );
// };

// export default ReviewForm;
