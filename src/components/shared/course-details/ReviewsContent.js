import { useState } from "react";
import ClientsReviews from "./_comp/ClientsReviews";
import ReviewForm from "./_comp/reviewForm";
import TotalRating from "./_comp/TotalRating";

const ReviewsContent = ({ reviews: initialReviews, courseId }) => {
  // Initialize state with existing reviews
  const [reviews, setReviews] = useState(initialReviews || []);

  // Function to add a new review to the list of reviews
  const addReview = (newReview) => {
    setReviews((prevReviews) => [...prevReviews, newReview]);
  };

  return (
    <div>
      <TotalRating />
      
      {/* Display existing reviews */}
      <ClientsReviews reviews={reviews} />

      {/* Review form to add new reviews */}
      <ReviewForm courseId={courseId} addReview={addReview} />
    </div>
  );
};

export default ReviewsContent;



// import Image from "next/image";
// import React from "react";
// import ReviewForm from "./_comp/reviewForm";
// import ClientsReviews from "./_comp/ClientsReviews";
// import TotalRating from "./_comp/TotalRating";
// const ReviewsContent = ({reviews,courseId}) => {

  
//   return (
//     <div>
//       <TotalRating />
//       {/* client reviews  */}
//       <ClientsReviews reviews={reviews && reviews} />

//       {/* add reviews  */}
//       <ReviewForm courseId={courseId}/>
//     </div>
//   );
// };

// export default ReviewsContent;
