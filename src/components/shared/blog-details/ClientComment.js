"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import useSweetAlert from "@/hooks/useSweetAlert"; 

const ClientComment = ({ commits, courseId }) => {
  const { data: session } = useSession();
  const showReply = useSweetAlert();
  
  const [replyText, setReplyText] = useState("");
  const [replyCommitIndex, setReplyCommitIndex] = useState(null);
  const [allCommits, setAllCommits] = useState(commits); // Initialize with commits
  const [isLoading, setIsLoading] = useState(false); // Loading state

  // Handle reply submission
  const handleReplySubmit = async (index, commentId) => {
    if (!replyText.trim()) return;

    setIsLoading(true);

    try {
      const newReply = {
        user: session?.user?.name || "Anonymous", // Get the user's name from the session
        date: new Date().toLocaleDateString(),
        avatar: session?.user?.image || "/fallback-image.jpg", // Default image if none exists
        comment: replyText,
      };

      // Send PATCH request to update the course with the new reply
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId: commentId, // Pass the specific comment ID to update
          reply: newReply,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the local state with the new reply
        const updatedCommits = [...allCommits];
        updatedCommits[index].replies = updatedCommits[index].replies
          ? [...updatedCommits[index].replies, newReply]
          : [newReply];

        setAllCommits(updatedCommits);
        showReply("success", "Reply added successfully!");
      } else {
        showReply("error", data.message || "Failed to add reply.");
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
      showReply("error", "An error occurred while adding the reply.");
    }

    setReplyText("");
    setReplyCommitIndex(null); // Hide the reply form
    setIsLoading(false);
  };

  return (
    <div className="pt-50px pb-15px border-y border-borderColor2 dark:border-borderColor2-dark">
      <h4
        className="text-size-26 font-bold text-blackColor dark:text-blackColor-dark mb-30px !leading-30px"
        data-aos="fade-up"
      >
        ({allCommits?.length}) Comment{allCommits?.length > 1 ? 's' : ''}
      </h4>
      <ul>
        {allCommits?.map((commit, index) => (
          <li key={commit.id || index} className="flex gap-30px mb-10">
            {/* Main comment */}
            <div className="flex-shrink-0">
              <div>
                <img
                  src={commit.avatar || "/fallback-image.jpg"}
                  alt={`${commit.user}'s Avatar`}
                  className="w-card-img py-[3px] rounded-full"
                  width={100}
                  height={100}
                />
              </div>
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-center">
                <div>
                  <h4>{commit.user}</h4>
                  <p className="text-xs">{commit.date}</p>
                </div>
              </div>
              <p>{commit.comment}</p>

              {/* Display replies */}
              {commit.replies?.length > 0 && (
                <ul className="ml-10 mt-5">
                  {commit.replies.map((reply, replyIndex) => (
                    <li key={reply.id || replyIndex} className="flex gap-30px mb-5">
                      <div className="flex-shrink-0">
                        <img
                          src={reply.avatar || "/fallback-image.jpg"}
                          alt={`${reply.user}'s Avatar`}
                          className="w-card-img py-[3px] rounded-full"
                          width={50}
                          height={50}
                        />
                      </div>
                      <div>
                        <h5>{reply.user}</h5>
                        <p className="text-xs">{reply.date}</p>
                        <p>{reply.comment}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Reply form */}
              {replyCommitIndex === index ? (
                <div className="mt-5">
                  <input
                    type="text"
                    placeholder="Write a reply..."
                    className="border rounded-md p-2 w-full mb-3"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => handleReplySubmit(index, commit.id)}
                    className="bg-primaryColor text-white py-2 px-4 rounded-md"
                    disabled={isLoading}
                  >
                    {isLoading ? "Submitting..." : "Submit Reply"}
                  </button>
                  <button
                    onClick={() => setReplyCommitIndex(null)}
                    className="ml-2 text-sm text-gray-500"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setReplyCommitIndex(index)}
                  className="mt-2 text-sm text-primaryColor"
                >
                  Reply
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClientComment;




// import Image from "next/image";
// import Link from "next/link";
// import { CldImage } from 'next-cloudinary';

// const ClientComment = ({ commits }) => {
//   return (
//     <div className="pt-50px pb-15px border-y border-borderColor2 dark:border-borderColor2-dark">
//       <h4
//         className="text-size-26 font-bold text-blackColor dark:text-blackColor-dark mb-30px !leading-30px"
//         data-aos="fade-up"
//       >
//         ({commits?.length}) Comment{commits?.length > 1 ? 's' : ''}
//       </h4>
//       <ul>
//         {commits?.map((commit, index) => (
//           <li key={index} className="flex gap-30px mb-10">
//             {/* Main comment */}
//             <div className="flex-shrink-0">
//               <div>
//                 <CldImage
//                   src={commit.avatar || "/fallback-image.jpg"}
//                   alt={`${commit.user}'s Avatar`}
//                   className="w-card-img py-[3px] rounded-full"
//                   width={100}
//                   height={100}
//                   sizes={"60w"}
//                 />
//               </div>
//             </div>
//             <div className="flex-grow">
//               <div className="flex justify-between items-center">
//                 <div>
//                   <h4>
//                     <Link
//                       href="#"
//                       className="text-lg font-semibold text-blackColor hover:text-primaryColor dark:text-blackColor-dark dark:hover:text-primaryColor leading-25px"
//                     >
//                       {commit.user}
//                     </Link>
//                   </h4>
//                   <p className="text-xs font-medium text-contentColor dark:text-contentColor-dark leading-29px uppercase mb-5px">
//                     {commit.date}
//                   </p>
//                 </div>
//               </div>

//               <p className="text-sm text-contentColor dark:text-contentColor-dark leading-23px mb-15px">
//                 {commit.comment}
//               </p>

//               {/* Display replies if any */}
//               {commit.replies && commit.replies.length > 0 && (
//                 <ul className="ml-10 mt-5">
//                   {commit.replies.map((reply, replyIndex) => (
//                     <li key={replyIndex} className="flex gap-30px mb-5">
//                       <div className="flex-shrink-0">
//                         <div>
//                           <CldImage
//                             src={reply.avatar || "/fallback-image.jpg"}
//                             alt={`${reply.user}'s Avatar`}
//                             className="w-card-img py-[3px] rounded-full"
//                             width={50}
//                             height={50}
//                             sizes={"30w"}
//                           />
//                         </div>
//                       </div>
//                       <div className="flex-grow">
//                         <div className="flex justify-between items-center">
//                           <div>
//                             <h4>
//                               <Link
//                                 href="#"
//                                 className="text-md font-semibold text-blackColor hover:text-primaryColor dark:text-blackColor-dark dark:hover:text-primaryColor leading-25px"
//                               >
//                                 {reply.user}
//                               </Link>
//                             </h4>
//                             <p className="text-xs font-medium text-contentColor dark:text-contentColor-dark leading-29px uppercase mb-5px">
//                               {reply.date}
//                             </p>
//                           </div>
//                         </div>

//                         <p className="text-sm text-contentColor dark:text-contentColor-dark leading-23px mb-15px">
//                           {reply.comment}
//                         </p>
//                       </div>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default ClientComment;
