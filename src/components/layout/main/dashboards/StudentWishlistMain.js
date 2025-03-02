"use client"; // Mark this component as a client-side component

import Wishlist from "@/components/shared/dashboards/Wishlist";
import React from "react";
import { useSession } from "next-auth/react"; // Client-side hook

const StudentWishlistMain = () => {
  const { data: session } = useSession(); // This should only be used in client-side components

  if (!session) {
    return <p>Loading...</p>; // Render a loading state or a message for unauthenticated users
  }

  return <Wishlist session={session} />; // Pass session data to Wishlist if needed
};

export default StudentWishlistMain;



// import Wishlist from "@/components/shared/dashboards/Wishlist";
// import React from "react";
// import { useSession } from "next-auth/react";

// const StudentWishlistMain = () => {
//   const { data: session } = useSession();
//   return <Wishlist />;
// };

// export default StudentWishlistMain;
