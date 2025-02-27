"use client";
import { useState } from "react";
import useSweetAlert from "@/hooks/useSweetAlert"; // Assuming you have a SweetAlert hook
import { useSession } from "next-auth/react";

const CommentFome = ({ courseId }) => {
  const { data: session } = useSession();
  const showAlert = useSweetAlert();

  // Form state
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [number, setNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !comment) {
      showAlert("error", "Please fill out all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      const newComment = {
        user: name,
        email: email,
        date: new Date().toLocaleDateString(),
        avatar: session?.user?.image || "/fallback-image.jpg",
        comment: comment,
        website: website,
        number: number,
      };

      // Send PATCH request to insert new comment
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comments: [newComment], // Add the new comment to the comments array
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showAlert("success", "Comment posted successfully!");
        // Clear form
        setName(session?.user?.name || "");
        setEmail(session?.user?.email || "");
        setNumber("");
        setWebsite("");
        setComment("");
      } else {
        showAlert("error", data.message || "Failed to post the comment.");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      showAlert("error", "An error occurred while posting the comment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-50px">
      <h4
        className="text-size-26 font-bold text-blackColor dark:text-blackColor-dark mb-30px !leading-30px"
        data-aos="fade-up"
      >
        Write your comment
      </h4>
      <form className="pt-5" data-aos="fade-up" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-2 xl:gap-x-30px mb-10 gap-10">
          <input
            type="text"
            placeholder="Enter your name*"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full pl-5 bg-transparent text-sm focus:outline-none text-contentColor dark:text-contentColor-dark border border-borderColor2 dark:border-borderColor2-dark placeholder:text-placeholder placeholder:opacity-80 h-15 leading-15 font-medium rounded"
            required
          />
          <input
            type="email"
            placeholder="Enter your email*"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-5 bg-transparent text-sm focus:outline-none text-contentColor dark:text-contentColor-dark border border-borderColor2 dark:border-borderColor2-dark placeholder:text-placeholder placeholder:opacity-80 h-15 leading-15 font-medium rounded"
            required
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 xl:gap-x-30px mb-10 gap-10">
          <input
            type="text"
            placeholder="Enter your number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="w-full pl-5 bg-transparent text-sm focus:outline-none text-contentColor dark:text-contentColor-dark border border-borderColor2 dark:border-borderColor2-dark placeholder:text-placeholder placeholder:opacity-80 h-15 leading-15 font-medium rounded"
          />
          <input
            type="text"
            placeholder="Website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full pl-5 bg-transparent text-sm focus:outline-none text-contentColor dark:text-contentColor-dark border border-borderColor2 dark:border-borderColor2-dark placeholder:text-placeholder placeholder:opacity-80 h-15 leading-15 font-medium rounded"
          />
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Enter your comment*"
          className="w-full p-5 mb-2 bg-transparent text-sm text-contentColor dark:text-contentColor-dark border border-borderColor2 dark:border-borderColor2-dark rounded"
          cols="30"
          rows="8"
          required
        />

        <div data-aos="fade-up" className="text-center">
          <input type="checkbox" defaultChecked />{" "}
          <span className="text-size-15 text-contentColor dark:text-contentColor-dark font-medium text-center">
            Save my name, email, and website in this browser for the next time I
            comment.
          </span>
        </div>
        <div className="mt-30px text-center">
          <button
            type="submit"
            className="text-size-15 text-whiteColor bg-primaryColor px-70px py-13px border border-primaryColor hover:text-primaryColor hover:bg-whiteColor inline-block rounded group dark:hover:text-whiteColor dark:hover:bg-whiteColor-dark"
            disabled={isLoading}
          >
            {isLoading ? "Posting..." : "Post a Comment"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentFome;




// const CommentFome = ({courseId}) => {
//   return (
//     <div className="pt-50px">
//       <h4
//         className="text-size-26 font-bold text-blackColor dark:text-blackColor-dark mb-30px !leading-30px"
//         data-aos="fade-up"
//       >
//         Write your comment
//       </h4>
//       <form className="pt-5" data-aos="fade-up">
//         <div className="grid grid-cols-1 xl:grid-cols-2 xl:gap-x-30px mb-10 gap-10">
//           <input
//             type="text"
//             placeholder="Enter your name*"
//             className="w-full pl-5 bg-transparent text-sm focus:outline-none text-contentColor dark:text-contentColor-dark border border-borderColor2 dark:border-borderColor2-dark placeholder:text-placeholder placeholder:opacity-80 h-15 leading-15 font-medium rounded"
//           />
//           <input
//             type="email"
//             placeholder="Enter your email*"
//             className="w-full pl-5 bg-transparent text-sm focus:outline-none text-contentColor dark:text-contentColor-dark border border-borderColor2 dark:border-borderColor2-dark placeholder:text-placeholder placeholder:opacity-80 h-15 leading-15 font-medium rounded"
//           />
//         </div>

//         <div className="grid grid-cols-1 xl:grid-cols-2 xl:gap-x-30px mb-10 gap-10">
//           <input
//             type="text"
//             placeholder="Enter your number*"
//             className="w-full pl-5 bg-transparent text-sm focus:outline-none text-contentColor dark:text-contentColor-dark border border-borderColor2 dark:border-borderColor2-dark placeholder:text-placeholder placeholder:opacity-80 h-15 leading-15 font-medium rounded"
//           />
//           <input
//             type="text"
//             placeholder="Website*"
//             className="w-full pl-5 bg-transparent text-sm focus:outline-none text-contentColor dark:text-contentColor-dark border border-borderColor2 dark:border-borderColor2-dark placeholder:text-placeholder placeholder:opacity-80 h-15 leading-15 font-medium rounded"
//           />
//         </div>

//         <textarea
//           defaultValue={"Enter your Massage*"}
//           className="w-full p-5 mb-2 bg-transparent text-sm text-contentColor dark:text-contentColor-dark border border-borderColor2 dark:border-borderColor2-dark rounded"
//           cols="30"
//           rows="8"
//         />

//         <div data-aos="fade-up" className="text-center">
//           <input type="checkbox" defaultChecked />{" "}
//           <span className="text-size-15 text-contentColor dark:text-contentColor-dark font-medium text-center">
//             Save my name, email, and website in this browser for the next time I
//             comment.
//           </span>
//         </div>
//         <div className="mt-30px text-center">
//           <button
//             type="submit"
//             className="text-size-15 text-whiteColor bg-primaryColor px-70px py-13px border border-primaryColor hover:text-primaryColor hover:bg-whiteColor inline-block rounded group dark:hover:text-whiteColor dark:hover:bg-whiteColor-dark"
//           >
//             Post a Comment
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default CommentFome;
