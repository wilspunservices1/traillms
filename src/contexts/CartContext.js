"use client";
import useSweetAlert from "@/hooks/useSweetAlert";
import addItemsToLocalstorage from "@/libs/addItemsToLocalstorage";
import getItemsFromLocalstorage from "@/libs/getItemsFromLocalstorage";
import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const cartContext = createContext(null);

const CartContextProvider = ({ children }) => {
  const [cartProducts, setCartProducts] = useState([]);
  const [error, setError] = useState(null); // To store errors
  const creteAlert = useSweetAlert();
  const { data: session } = useSession();
  const userId = session?.user?.id; // Static user ID for now (can be replaced with dynamic userId from session)

  useEffect(() => {
    if (userId) {
      fetchCartFromDB();
    } else {
      const cartFromLocalStorage = getItemsFromLocalstorage("cart");
      if (cartFromLocalStorage) {
        setCartProducts(cartFromLocalStorage);
      }
    }
  }, [userId]);

  const clearCart = async () => {
    // Clear cart in state
    setCartProducts([]);
  
    // Clear cart in local storage
    addItemsToLocalstorage('cart', []);
  
    // Clear cart in the database if user is logged in
    if (userId) {
      try {
        const response = await fetch(`/api/user/${userId}/cart`, {
          method: 'DELETE',
        });
  
        if (!response.ok) {
          const data = await response.json();
          console.error(
            'Failed to clear cart on server:',
            data.error || 'Unknown error'
          );
          throw new Error(data.error || 'Failed to clear cart on server.');
        }
  
        creteAlert('success', 'Cart cleared on server.');
      } catch (err) {
        console.error('Error clearing cart on server:', err.message || err);
        setError(err.message || 'Failed to clear cart on server.');
      }
    } else {
      creteAlert('success', 'Cart cleared locally.');
    }
  };
  
  

  // Fetch cart items from the database
  const fetchCartFromDB = async () => {
    try {
      const response = await fetch(`/api/user/${userId}/cart`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.statusText}`);
      }
  
      const data = await response.json();
      if (data.length === 0) {
        console.log("No items in the cart");
        return;
      }
  
      // Process and update the cart data
      const updatedCart = data.map(item => ({
        ...item,
        discount: calculateDiscount(item.price, item.estimatedPrice),
      }));
  
      setCartProducts(updatedCart);
      addItemsToLocalstorage("cart", updatedCart);
    } catch (err) {
      console.error("Error fetching cart:", err.message || err);
      setError(err.message || "Failed to fetch cart items.");
    }
  };
  
  // Calculate discount based on price and estimated price
  const calculateDiscount = (price, estimatedPrice) => {
    const discount = (estimatedPrice - price).toFixed(2); // Calculate the difference
    return discount > 0 ? discount : "0.00"; // Only return discount if it's greater than 0
  };

  const addProductToCart = async (currentCourse) => {
    const { courseId } = currentCourse;
    const isAlreadyExist = cartProducts.some(({ courseId: id }) => id === courseId);

    if (isAlreadyExist) {
      creteAlert("error", "Course already in cart.");
      return;
    }

    const updatedCart = [...cartProducts, currentCourse];
    setCartProducts(updatedCart);
    addItemsToLocalstorage("cart", updatedCart);
    creteAlert("success", "Course added to cart.");

    try {
      const response = await fetch(`/api/user/${userId}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (!response.ok) {
        throw new Error("Failed to add course to the cart");
      }
      creteAlert("success", "Course successfully added to server cart.");
    } catch (error) {
      console.error("Failed to sync cart with the server:", error.message || error);
      setError(error.message || "Failed to sync cart with the server.");
    }
  };

  const deleteProductFromCart = async (cartId) => {
    if (!cartId) {
      console.error("Cart ID is required.");
      return;
    }
  
    console.log("Removing cart item with ID:", cartId);
  
    const updatedCart = cartProducts.filter((product) => product.cartId !== cartId);
    setCartProducts(updatedCart);
    addItemsToLocalstorage("cart", updatedCart);
    creteAlert("success", "Course removed from cart.");
  
    try {
      const response = await fetch(`/api/user/${userId}/cart?cartId=${cartId}`, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        const data = await response.json();
        console.error("Failed to remove course from server cart:", data.error || "Unknown error");
        throw new Error(data.error || "Failed to remove course from server cart.");
      }
  
      creteAlert("success", "Course removed from server cart.");
    } catch (err) {
      console.error("Error removing course from server cart:", err.message || err);
      setError(err.message || "Failed to remove course. Please try again.");
    }
  };
  

  // Handling rendering when error exists
  if (error) {
    console.error("Rendering error:", error); // Ensure errors are logged but not rendered directly
    return <div className="error-message">Error: {error}</div>; // Display a safe error message
  }

  return (
    <cartContext.Provider
      value={{
        clearCart, // Expose clearCart function
        cartProducts,
        addProductToCart,
        deleteProductFromCart,
      }}
    >
      {children}
    </cartContext.Provider>
  );
};

export const useCartContext = () => {
  return useContext(cartContext);
};
export default CartContextProvider;


// "use client";
// import useSweetAlert from "@/hooks/useSweetAlert";
// import addItemsToLocalstorage from "@/libs/addItemsToLocalstorage";
// import getItemsFromLocalstorage from "@/libs/getItemsFromLocalstorage";
// import { createContext, useContext, useEffect, useState } from "react";

// const cartContext = createContext(null);

// const CartContextProvider = ({ children }) => {
//   const [cartProducts, setCartProducts] = useState([]);
//   const [error, setError] = useState(null); // To store errors
//   const creteAlert = useSweetAlert();
//   const userId = "5649aae6-05fa-4934-a1e4-0daca4273785"; // Static user ID for now (can be replaced with dynamic userId from session)

//   useEffect(() => {
//     if (userId) {
//       fetchCartFromDB();
//     } else {
//       const cartFromLocalStorage = getItemsFromLocalstorage("cart");
//       if (cartFromLocalStorage) {
//         setCartProducts(cartFromLocalStorage);
//       }
//     }
//   }, [userId]);

//   // Fetch cart items from the database
//   const fetchCartFromDB = async () => {
//     try {
//       const response = await fetch(`/api/user/${userId}/cart`);
//       if (!response.ok) {
//         throw new Error(`Failed to fetch cart: ${response.statusText}`);
//       }
//       const data = await response.json();
      
//       if (data.length === 0) {
//         console.log("No items in the cart");
//         return;
//       }

//       const updatedCart = data.map(item => ({
//         ...item,
//         discount: calculateDiscount(item.price, item.estimatedPrice),
//       }));

//       setCartProducts(updatedCart); // Sync cart items from DB
//       addItemsToLocalstorage("cart", updatedCart); // Sync with local storage
//     } catch (err) {
//       console.error("Error fetching cart:", err.message || err);
//       setError(err.message || "Failed to fetch cart items.");
//     }
//   };

//   // Calculate discount based on price and estimated price
//   const calculateDiscount = (price, estimatedPrice) => {
//     const discount = (estimatedPrice - price).toFixed(2); // Calculate the difference
//     return discount > 0 ? discount : "0.00"; // Only return discount if it's greater than 0
//   };

//   const addProductToCart = async (currentCourse) => {
//     const { courseId } = currentCourse;
//     const isAlreadyExist = cartProducts.some(({ courseId: id }) => id === courseId);

//     if (isAlreadyExist) {
//       creteAlert("error", "Course already in cart.");
//       return;
//     }

//     const updatedCart = [...cartProducts, currentCourse];
//     setCartProducts(updatedCart);
//     addItemsToLocalstorage("cart", updatedCart);
//     creteAlert("success", "Course added to cart.");

//     try {
//       const response = await fetch(`/api/user/${userId}/cart`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ courseId }),
//       });
//       if (!response.ok) {
//         throw new Error("Failed to add course to the cart");
//       }
//       creteAlert("success", "Course successfully added to server cart.");
//     } catch (error) {
//       console.error("Failed to sync cart with the server:", error.message || error);
//       setError(error.message || "Failed to sync cart with the server.");
//     }
//   };

//   const deleteProductFromCart = async (currentCourseId) => {
//     console.log("Removing course with ID:", currentCourseId);

//     const updatedCart = cartProducts.filter((product) => product.courseId !== currentCourseId);
//     setCartProducts(updatedCart);
//     addItemsToLocalstorage("cart", updatedCart);
//     creteAlert("success", "Course removed from cart.");

//     if (userId) {
//       try {
//         const response = await fetch(`/api/user/${userId}/cart?courseId=${currentCourseId}`, {
//           method: "DELETE",
//         });

//         const data = await response.json();
//         console.log("Delete API Response:", response.status, data);

//         if (!response.ok) {
//           throw new Error(data.error || "Failed to remove course from cart.");
//         }

//         creteAlert("success", "Course removed from server cart.");
//       } catch (err) {
//         console.error("Error removing course from server cart:", err.message || err);
//         setError(err.message || "Failed to remove course. Please try again.");
//       }
//     }
//   };

//   // Handling rendering when error exists
//   if (error) {
//     console.error("Rendering error:", error); // Ensure errors are logged but not rendered directly
//     return <div className="error-message">Error: {error}</div>; // Display a safe error message
//   }

//   return (
//     <cartContext.Provider
//       value={{
//         cartProducts,
//         addProductToCart,
//         deleteProductFromCart,
//       }}
//     >
//       {children}
//     </cartContext.Provider>
//   );
// };

// export const useCartContext = () => {
//   return useContext(cartContext);
// };
// export default CartContextProvider;



// "use client";
// import useSweetAlert from "@/hooks/useSweetAlert";
// import addItemsToLocalstorage from "@/libs/addItemsToLocalstorage";
// import getItemsFromLocalstorage from "@/libs/getItemsFromLocalstorage";
// import { createContext, useContext, useEffect, useState } from "react";

// const cartContext = createContext(null);

// const CartContextProvider = ({ children }) => {
//   const [cartProducts, setCartProducts] = useState([]);
//   const [error, setError] = useState(null); // To store errors
//   const creteAlert = useSweetAlert();
//   const userId = "5649aae6-05fa-4934-a1e4-0daca4273785"; // Static user ID for now (can be replaced with dynamic userId from session)

//   // Fetch cart from the database or local storage
//   useEffect(() => {
//     if (userId) {
//       fetchCartFromDB();
//     } else {
//       const cartFromLocalStorage = getItemsFromLocalstorage("cart");
//       if (cartFromLocalStorage) {
//         setCartProducts(cartFromLocalStorage);
//       }
//     }
//   }, [userId]);

//   // Fetch cart items from the database
//   const fetchCartFromDB = async () => {
//     try {
//       const response = await fetch(`/api/user/${userId}/cart`);
//       if (!response.ok) {
//         throw new Error(`Failed to fetch cart: ${response.statusText}`);
//       }
//       const data = await response.json();

//       const updatedCart = data.map((item) => {
//         const discount = calculateDiscount(item.price, item.estimatedPrice);
//         return { ...item, discount };
//       });

//       setCartProducts(updatedCart); // Sync cart items from DB
//       addItemsToLocalstorage("cart", updatedCart); // Sync with local storage
//     } catch (err) {
//       console.error("Error fetching cart from the database:", err);
//       // setError("Failed to fetch cart items. Please try again later.");
//     }
//   };

//   // Calculate discount based on price and estimated price
//   const calculateDiscount = (price, estimatedPrice) => {
//     const discount = (estimatedPrice - price).toFixed(2); // Calculate the difference
//     return discount > 0 ? discount : "0.00"; // Only return discount if it's greater than 0
//   };

//   // Sync cart to the database
//   const syncCartToDB = async (cartItems) => {
//     try {
//       const response = await fetch(`/api/user/${userId}/cart`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ cartItems }), // Send cart items to sync with the DB
//       });

//       if (!response.ok) {
//         throw new Error("Failed to sync cart with the server.");
//       }
//     } catch (err) {
//       console.error("Error syncing cart to the server:", err);
//       setError("Failed to sync cart. Please try again.");
//     }
//   };

//   // Add course to cart (without checking for existing items)
//   const addProductToCart = async (currentCourse) => {
//     const { courseId } = currentCourse;
//     const isAlreadyExist = cartProducts.some(({ courseId: id }) => id === courseId);

//     if (isAlreadyExist) {
//       creteAlert("error", "Course already in cart.");
//       return;
//     }

//     const updatedCart = [...cartProducts, currentCourse];
//     setCartProducts(updatedCart);
//     addItemsToLocalstorage("cart", updatedCart);
//     creteAlert("success", "Course added to cart.");

//     // Sync with DB
//     try {
//       const response = await fetch(`/api/user/${userId}/cart`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ courseId }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to add course to the cart");
//       }

//       const data = await response.json();
//       if (data.message === "Course added to cart.") {
//         creteAlert("success", data.message);
//       }
//     } catch (error) {
//       console.error("Error syncing cart to DB:", error);
//       setError("Failed to sync cart with the server.");
//     }
//   };


//   // Remove course from cart
//   const deleteProductFromCart = async (currentCartId) => {
//     console.log("Removing cart item with ID:", currentCartId); // Log the cartId

//     const updatedCart = cartProducts.filter((product) => product.cartId !== currentCartId);
//     setCartProducts(updatedCart);
//     addItemsToLocalstorage("cart", updatedCart);
//     creteAlert("success", "Course removed from cart.");

//     if (userId) {
//       try {
//         const response = await fetch(`/api/user/${userId}/cart?cartId=${currentCartId}`, {
//           method: "DELETE",
//         });

//         const data = await response.json();
//         console.log("Delete API Response:", response.status, data); // Log API response

//         if (!response.ok) {
//           throw new Error(data.error || "Failed to remove course from cart.");
//         }

//         creteAlert("success", "Course removed from server cart.");
//       } catch (err) {
//         console.error("Error removing course from server cart:", err); // Log the error
//         setError("Failed to remove course. Please try again.");
//       }
//     }
//   };

//   // Handling rendering when error exists
//   // if (error) {
//   //   console.log(error)
//   //   // return <div className="error-message">{error}</div>;
//   // }

//   return (
//     <cartContext.Provider
//       value={{
//         cartProducts,
//         addProductToCart,
//         deleteProductFromCart,
//       }}
//     >
//       {children}
//     </cartContext.Provider>
//   );
// };

// export const useCartContext = () => {
//   return useContext(cartContext);
// };
// export default CartContextProvider;


