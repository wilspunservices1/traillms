"use client";
import useSweetAlert from "@/hooks/useSweetAlert";
import addItemsToLocalstorage from "@/libs/addItemsToLocalstorage";
import getItemsFromLocalstorage from "@/libs/getItemsFromLocalstorage";
import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const wishlistContext = createContext(null);

const WishlistContextProvider = ({ children }) => {
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const { data: session } = useSession(); // Get session details
  const creteAlert = useSweetAlert();
  const [userData, setUserData] = useState();

  // Load wishlist from local storage or database
  useEffect(() => {
    const localWishlist = getItemsFromLocalstorage("wishlist") || [];
    
    if (session?.user?.id) {
      // If user is logged in, load the wishlist from the database
      fetchWishlistFromDB(session.user.id);
    } else {
      // Load from local storage for logged-out users
      setWishlistProducts(localWishlist);
    }
  }, [session]);

  // Fetch wishlist from database
  const fetchWishlistFromDB = async (userId) => {
    try {
      const response = await fetch(`/api/user/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setWishlistProducts(data.wishlist || []); // Set wishlist from database
        setUserData(data);
      } else {
        creteAlert("error", "Failed to load wishlist from database.");
      }
    } catch (error) {
      console.error("Error loading wishlist from database:", error);
      creteAlert("error", "Error fetching wishlist.");
    }
  };

  // Sync wishlist to the database
  const syncWishlistToDatabase = async (localWishlist) => {
    try {
      const response = await fetch(`/api/user/${session.user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wishlist: localWishlist, // Send the local wishlist items to the server
        }),
      });

      if (response.ok) {
        setWishlistProducts(localWishlist); // Set local wishlist state
        addItemsToLocalstorage("wishlist", []); // Clear local storage
        creteAlert("success", "Wishlist synced with your account.");
      } else {
        creteAlert("error", "Failed to sync wishlist.");
      }
    } catch (error) {
      creteAlert("error", "Error syncing wishlist.");
      console.error("Error syncing wishlist:", error);
    }
  };

  // Add product to wishlist
  const addProductToWishlist = async (currentId) => {
    if (!session) {
      // If not logged in, store in local storage
      creteAlert("info", "You are not logged in. Adding course to local favorites.");
      const localWishlist = getItemsFromLocalstorage("wishlist") || [];
      if (!localWishlist.includes(currentId)) {
        const updatedLocalWishlist = [...localWishlist, currentId];
        addItemsToLocalstorage("wishlist", updatedLocalWishlist);
        setWishlistProducts(updatedLocalWishlist);
        creteAlert("success", "Course added to local favorites.");
      } else {
        creteAlert("error", "Course already exists in local favorites.");
      }
    } else {
      // If logged in, store in database
      if (!wishlistProducts.includes(currentId)) {
        try {
          const response = await fetch(`/api/user/${session?.user?.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              wishlist: [...wishlistProducts, currentId], // Append to wishlist
            }),
          });

          if (response.ok) {
            setWishlistProducts((prevProducts) => [...prevProducts, currentId]);
            creteAlert("success", "Course added to favorites.");
          } else {
            const data = await response.json();
            creteAlert("error", data.error || "Failed to add course to the favorites.");
          }
        } catch (error) {
          creteAlert("error", "Error occurred while adding course to favorites.");
          console.error("Error while adding course to favorites:", error);
        }
      } else {
        creteAlert("error", "Failed! Course already exists in favorites.");
      }
    }
  };

  // Delete product from wishlist
  const deleteProductFromWishlist = async (currentId) => {
    const updatedWishlist = wishlistProducts.filter((productId) => productId !== currentId);
    setWishlistProducts(updatedWishlist);
    addItemsToLocalstorage("wishlist", updatedWishlist);

    if (session) {
      try {
        const response = await fetch(`/api/user/${session?.user?.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            wishlist: updatedWishlist,
            removeFromWishlist: currentId,
          }),
        });

        if (response.ok) {
          creteAlert("success", "Course removed from favorites.");
        } else {
          const data = await response.json();
          creteAlert("error", data.error || "Failed to remove Course from favorites.");
          // Rollback if there was a failure
          setWishlistProducts((prevProducts) => [...prevProducts, currentId]);
          addItemsToLocalstorage("wishlist", [...updatedWishlist, currentId]);
        }
      } catch (error) {
        creteAlert("error", "Error removing course from favorites.");
        console.error("Error removing course from favorites in the server:", error);
        // Rollback if error occurred
        setWishlistProducts((prevProducts) => [...prevProducts, currentId]);
        addItemsToLocalstorage("wishlist", [...updatedWishlist, currentId]);
      }
    } else {
      creteAlert("success", "Course removed from local favorites.");
    }
  };

  return (
    <wishlistContext.Provider
      value={{
        wishlistProducts,
        addProductToWishlist,
        deleteProductFromWishlist,
      }}
    >
      {children}
    </wishlistContext.Provider>
  );
};

export const useWishlistContext = () => {
  return useContext(wishlistContext);
};

export default WishlistContextProvider;






// "use client";
// import useSweetAlert from "@/hooks/useSweetAlert";
// import { createContext, useContext, useEffect, useState } from "react";
// import { useSession } from "next-auth/react";

// // Create wishlist context
// const wishlistContext = createContext(null);

// // Wishlist Context Provider
// const WishlistContextProvider = ({ children }) => {
//   const [wishlistProducts, setWishlistProducts] = useState([]);
//   const creteAlert = useSweetAlert();
//   const { data: session } = useSession();

//   // Fetch wishlist from the database when the component mounts
  // useEffect(() => {
  //   const fetchWishlist = async (userId) => {
  //     try {
  //       const response = await fetch(`http://localhost:3000/api/user/${userId}?onlyWishlist=false`);
  //       const data = await response.json();
  //       if (response.ok) {
  //         setWishlistProducts(data.wishlist || []); // Set wishlist from database
  //       } else {
  //         console.error("Failed to fetch wishlist from database:", data.error);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching wishlist:", error);
  //     }
  //   };

  //   if (session) {
  //     // Call function to fetch wishlist for a logged-in user (pass the userId)
  //     const userId = session?.user?.id; // Replace with the logged-in user's ID
  //     fetchWishlist("5649aae6-05fa-4934-a1e4-0daca4273785");
  //   }
  // }, []);

//   // Add product to the wishlist and store it in the database
//   const addProductToWishlist = async (currentProduct) => {
//     const { id: currentId } = currentProduct; // Extract only the product ID
  
//     // Check if the product already exists in the wishlist by its ID
//     const isAlreadyExist = wishlistProducts.some((productId) => productId === currentId);

//     // Check if there is user logged in
//     if (!session) {
//       creteAlert("error", "Please login to add product to wishlist.");
//       return;
//     }
  
//     if (isAlreadyExist) {
//       creteAlert("error", "Failed! Product already exists in wishlist.");
//     } else {
//       try {
//         // Make API request to store product ID in the wishlist in the database
//         const response = await fetch(`http://localhost:3000/api/user/${session?.user?.id}`, {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             wishlist: [currentId], // Send only the product ID
//           }),
//         });
  
//         const data = await response.json();
  
//         if (response.ok) {
//           setWishlistProducts((prevProducts) => [...prevProducts, currentId]); // Update local wishlist state with product ID
//           creteAlert("success", "Success! Product added to wishlist.");
//         } else {
//           creteAlert("error", data.error || "Failed to add product to the wishlist.");
//         }
//       } catch (error) {
//         creteAlert("error", "Error occurred while adding product to wishlist.");
//         console.error("Error while adding product to wishlist:", error);
//       }
//     }
//   };
  

//   // Delete product from wishlist in the database
//   const deleteProductFromWishlist = async (productId, userId) => {
//     try {
//       // Update the wishlist on the server by removing the item
//       const response = await fetch(`http://localhost:3000/api/user/${userId}`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           wishlist: wishlistProducts.filter((product) => product.id !== productId), // Update wishlist
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setWishlistProducts((prevProducts) =>
//           prevProducts.filter((product) => product.id !== productId)
//         );
//         creteAlert("success", "Success! Product removed from wishlist.");
//       } else {
//         creteAlert("error", data.error || "Failed to remove product from the wishlist.");
//       }
//     } catch (error) {
//       creteAlert("error", "Error occurred while removing product from wishlist.");
//       console.error("Error while removing product from wishlist:", error);
//     }
//   };

//   return (
//     <wishlistContext.Provider
//       value={{
//         wishlistProducts,
//         addProductToWishlist,
//         deleteProductFromWishlist,
//       }}
//     >
//       {children}
//     </wishlistContext.Provider>
//   );
// };

// // Custom hook to use the wishlist context
// export const useWishlistContext = () => {
//   const value = useContext(wishlistContext);
//   return value;
// };

// export default WishlistContextProvider;

