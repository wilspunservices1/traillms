"use client";
import { useState, useEffect } from "react";
import CourseCard from "../courses/CourseCard";
import HeadingDashboard from "../headings/HeadingDashboard";
import { useSession } from "next-auth/react"; // To get the user session
import UserTableSkeleton from "./_comp/skeleton/UserTable";

const Wishlist = () => {
  const [courses, setCourses] = useState([]); // State to store wishlist courses
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const { data: session } = useSession(); // Get the user session

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!session?.user?.id) {
        setError("No user session found");
        setLoading(false);
        return;
      }

      try {
        // Fetch the wishlist data from the API using the user's ID
        const response = await fetch(`/api/user/${session.user.id}/wishlist`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch wishlist");
        }

        const data = await response.json();
        if (data.success) {
          setCourses(data.data); // Set the fetched courses in the state
        } else {
          setError(data.message || "Failed to load wishlist.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false); // Set loading to false once the request is completed
      }
    };

    fetchWishlist();
  }, [session]); // Fetch wishlist when session is available

  // if (loading) return <p>Loading wishlist...</p>;

  // Ensure that the error is a string before rendering it
  if (error) return <p>{String(error)}</p>;

  // if (!courses.length) return <p>Your wishlist is empty.</p>;

  return (
    <div className="p-10px min-h-[400px] md:px-10 md:py-50px mb-30px bg-whiteColor dark:bg-whiteColor-dark shadow-accordion dark:shadow-accordion-dark rounded-5">
      <HeadingDashboard>Wishlist</HeadingDashboard>
      {loading && <UserTableSkeleton />}
      {!loading && !courses.length  && <p className="">Your wishlist is empty.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 -mx-15px">
        {courses.map((course, idx) => (
          <CourseCard key={idx} type={"primary"} course={course} />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;


// "use client";
// import CourseCard from "../courses/CourseCard";
// import HeadingDashboard from "../headings/HeadingDashboard";
// // import getAllCourses from "@/libs/getAllCourses";
// const Wishlist = () => {
//   // const courses = getAllCourses()?.slice(0, 5);
//   return (
//     <div className="p-10px md:px-10 md:py-50px mb-30px bg-whiteColor dark:bg-whiteColor-dark shadow-accordion dark:shadow-accordion-dark rounded-5">
//       <HeadingDashboard>Wishlist</HeadingDashboard>{" "}
//       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 -mx-15px">
//         {courses?.map((course, idx) => (
//           <CourseCard key={idx} type={"primary"} course={course} />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Wishlist;
