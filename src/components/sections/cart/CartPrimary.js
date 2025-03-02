"use client";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import CartProduct from "@/components/shared/cart/CartProduct";
import { useCartContext } from "@/contexts/CartContext";
import useSweetAlert from "@/hooks/useSweetAlert";
import countTotalPrice from "@/libs/countTotalPrice";
import Link from "next/link";
import getStripe from "@/utils/loadStripe";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const CartPrimary = () => {
  const { cartProducts: currentProducts, clearCart } = useCartContext();
  const creteAlert = useSweetAlert();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Ensure cartProducts is assigned properly
  const cartProducts = currentProducts || [];

  // Calculate total price
  const totalPrice = Number(countTotalPrice(cartProducts));

  // Check if there are any products in the cart
  const isCartProduct = cartProducts.length > 0;

  const userId = session?.user?.id;

  // Function to handle cart update
  const handleUpdateCart = () => {
    if (isCartProduct) {
      creteAlert("success", "Success! Cart updated.");
    } else {
      creteAlert("error", "Cart is empty. Nothing to update.");
    }
  };

  // Function to clear the cart
  const handleClearCart = () => {
    if (isCartProduct) {
      clearCart(); // Use clearCart from context
    } else {
      creteAlert("error", "Cart is already empty.");
    }
  };

  // Function to handle checkout
  const handleCheckout = async () => {
    if (!session) {
      creteAlert("error", "You need to sign in to proceed with checkout.");
      router.push("/login");
      return;
    }

    if (!isCartProduct) {
      creteAlert("error", "Cart is empty. Please add items to the cart.");
      return;
    }

    setLoading(true);

    try {
      const stripe = await getStripe();

      const items = cartProducts.map((product) => ({
        name: product.title,
        price: parseFloat(product.price).toFixed(2),
        image: product.thumbnail,
        quantity: 1,
        courseId: product.courseId,
      }));

      const userEmail = session.user.email;

      const response = await fetch(`/api/stripe/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          email: userEmail,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session.");
      }

      const { sessionId } = await response.json();

      if (sessionId) {
        await stripe.redirectToCheckout({ sessionId });
      } else {
        creteAlert("error", "Failed to create checkout session.");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      creteAlert(
        "error",
        error.message || "Failed to proceed to checkout. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="container py-50px lg:py-60px 2xl:py-20 3xl:py-100px">
        {/* Cart table */}
        <div className="text-contentColor dark:text-contentColor-dark text-size-10 md:text-base overflow-auto">
          <table className="table-fixed md:table-auto leading-1.8 text-center w-150 md:w-full overflow-auto border border-borderColor dark:border-borderColor-dark box-content md:box-border">
            <thead>
              <tr className="md:text-sm text-blackColor dark:text-blackColor-dark uppercase font-medium border-b border-borderColor dark:border-borderColor-dark">
                <th className="pt-13px pb-9px md:py-22px px-5 md:px-25px leading-1.8 max-w-25 whitespace-nowrap">
                  Image
                </th>
                <th className="pt-13px pb-9px md:py-22px px-5 md:px-25px leading-1.8 max-w-25 whitespace-nowrap">
                  Product
                </th>
                <th className="pt-13px pb-9px md:py-22px px-5 md:px-25px leading-1.8 max-w-25 whitespace-nowrap">
                  Price
                </th>
                <th className="pt-13px pb-9px md:py-22px px-5 md:px-25px leading-1.8 max-w-25 whitespace-nowrap">
                  Quantity
                </th>
                <th className="pt-13px pb-9px md:py-22px px-5 md:px-25px leading-1.8 max-w-25 whitespace-nowrap">
                  Total
                </th>
                <th className="pt-13px pb-9px md:py-22px px-5 md:px-25px leading-1.8 max-w-25 whitespace-nowrap">
                  Remove
                </th>
              </tr>
            </thead>
            <tbody>
              {!isCartProduct ? (
                <tr className="relative">
                  <td className="p-5 md:p-10 " colSpan="6">
                    <p className="w-full h-full flex items-center justify-center md:text-xl font-bold capitalize opacity-70 ">
                      Your cart is empty.
                    </p>
                  </td>
                </tr>
              ) : (
                cartProducts.map((product, idx) => (
                  <CartProduct key={idx} product={product} />
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Cart action buttons */}
        <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-x-5 gap-y-10px pt-22px pb-9 md:pt-30px md:pb-55px">
          <div>
            <Link
              href={"/courses"}
              className="text-size-13 text-whiteColor dark:text-whiteColor-dark dark:hover:text-whiteColor leading-1 px-5 py-18px md:px-10 bg-blackColor dark:bg-blackColor-dark hover:bg-primaryColor dark:hover:bg-primaryColor"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
          {isCartProduct && (
            <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-x-5 gap-y-10px">
              <button
                onClick={handleUpdateCart}
                className="text-size-13 text-whiteColor dark:text-whiteColor-dark dark:hover:text-whiteColor leading-1 px-5 py-18px md:px-10 bg-blackColor dark:bg-blackColor-dark hover:bg-primaryColor dark:hover:bg-primaryColor"
              >
                UPDATE CART
              </button>
              <button
                onClick={handleClearCart}
                className="text-size-13 text-whiteColor dark:text-whiteColor-dark dark:hover:text-whiteColor leading-1 px-5 py-18px md:px-10 bg-blackColor dark:bg-blackColor-dark hover:bg-primaryColor dark:hover:bg-primaryColor"
              >
                CLEAR CART
              </button>
            </div>
          )}
        </div>

        {/* Cart summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-30px">
          <div>
            <div className="px-30px pt-45px pb-50px leading-1.8 border border-borderColor dark:border-borderColor-dark rounded-5px">
              {/* Heading */}
              <div className="flex gap-x-4">
                <h3 className="text-lg whitespace-nowrap font-medium text-blackColor dark:text-blackColor-dark mb-22px">
                  <span className="leading-1.2">
                    Review Course Details and Total Fees
                  </span>
                </h3>
                <div className="h-1px w-full bg-borderColor2 dark:bg-borderColor2-dark mt-2"></div>
              </div>
              <p className="text-contentColor dark:text-contentColor-dark mb-15px">
                This emphasizes the course-specific aspect of the purchase and
                creates a more student-friendly tone.
              </p>
            </div>
          </div>
          <div>
            <div className="px-30px pt-45px pb-50px leading-1.8 border border-borderColor dark:border-borderColor-dark rounded-5px">
              {/* Heading */}
              <div className="flex gap-x-4">
                <h3 className="text-lg whitespace-nowrap font-medium text-blackColor dark:text-blackColor-dark mb-22px">
                  <span className="leading-1.2">Cart Note</span>
                </h3>
                <div className="h-1px w-full bg-borderColor2 dark:bg-borderColor2-dark mt-2"></div>
              </div>
              <p className="text-contentColor dark:text-contentColor-dark mb-15px">
                Special instructions for seller
              </p>
              {/* Form */}
              <form>
                <div className="mb-5">
                  <textarea
                    className="text-xs text-blackColor py-11px px-15px w-full rounded box-border border border-borderColor2 dark:border-borderColor2-dark"
                    cols="30"
                    rows="4"
                  ></textarea>
                </div>
              </form>
            </div>
          </div>
          <div>
            <div className="px-30px pt-45px pb-50px leading-1.8 border border-borderColor dark:border-borderColor-dark rounded-5px">
              {/* Heading */}
              <div className="flex gap-x-4">
                <h3 className="text-lg whitespace-nowrap font-medium text-blackColor dark:text-blackColor-dark mb-9">
                  <span className="leading-1.2">Cart Total</span>
                </h3>
                <div className="h-1px w-full bg-borderColor2 dark:bg-borderColor2-dark mt-2"></div>
              </div>
              <h4 className="text-sm font-bold text-blackColor dark:text-blackColor-dark mb-5 flex justify-between items-center">
                <span className="leading-1.2">Cart Totals</span>
                <span className="leading-1.2 text-lg font-medium">
                  ${totalPrice ? totalPrice.toFixed(2) : "0.00"}
                </span>
              </h4>
              <div>
                <button
                  type="button"
                  className="text-size-13 text-whiteColor dark:text-whiteColor-dark dark:hover:text-whiteColor leading-1 px-5 py-18px md:px-10 bg-blackColor dark:bg-blackColor-dark hover:bg-primaryColor dark:hover:bg-primaryColor"
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "PROCEED TO CHECKOUT"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartPrimary;


// "use client";
// import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
// import CartProduct from "@/components/shared/cart/CartProduct";
// import { useCartContext } from "@/contexts/CartContext";
// import useSweetAlert from "@/hooks/useSweetAlert";
// import addItemsToLocalstorage from "@/libs/addItemsToLocalstorage";
// import countTotalPrice from "@/libs/countTotalPrice";
// import Link from "next/link";
// import getStripe from "@/utils/loadStripe";
// import { useSession } from "next-auth/react";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { BASE_URL } from "@/actions/constant";

// const CartPrimary = () => {
//   // const { cartProducts: currentProducts, setCartProducts } = useCartContext();
//   const { cartProducts: currentProducts, clearCart } = useCartContext();

//   const creteAlert = useSweetAlert();
//   const { data: session } = useSession();
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   // Ensure cartProducts is assigned properly
//   const cartProducts = currentProducts || [];

//   // Calculate total price
//   const totalPrice = Number(countTotalPrice(cartProducts));

//   // Check if there are any products in the cart
//   const isCartProduct = cartProducts.length > 0;

//   const userId = session?.user?.id;

//   // Function to handle cart update
//   const handleUpdateCart = () => {
//     if (isCartProduct) {
//       creteAlert("success", "Success! Cart updated.");
//     } else {
//       creteAlert("error", "Cart is empty. Nothing to update.");
//     }
//   };

//   // Function to clear the cart
//   const handleClearCart = () => {
//     if (isCartProduct) {
//       clearCart();
//       creteAlert("success", "Success! Cart cleared.");
//     } else {
//       creteAlert("error", "Cart is already empty.");
//     }
//   };


//   // Function to handle checkout
//   const handleCheckout = async () => {
//     if (!session) {
//       creteAlert("error", "You need to sign in to proceed with checkout.");
//       router.push("/login");
//       return; // Add return statement to prevent further execution
//     }

//     if (!isCartProduct) {
//       creteAlert("error", "Cart is empty. Please add items to the cart.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const stripe = await getStripe();

//       const items = cartProducts.map((product) => ({
//         name: product.title,
//         price: parseFloat(product.price).toFixed(2), // Ensure price is a string with two decimal places
//         image: product.thumbnail,
//         quantity: 1,
//         courseId: product.courseId,
//       }));

//       const userEmail = session.user.email;

//       const response = await fetch(`/api/stripe/checkout`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           items,
//           email: userEmail,
//           userId,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to create checkout session.");
//       }

//       const { sessionId } = await response.json();

//       if (sessionId) {
//         await stripe.redirectToCheckout({ sessionId }); // Redirect to Stripe Checkout
//       } else {
//         creteAlert("error", "Failed to create checkout session.");
//       }
//     } catch (error) {
//       console.error("Error during checkout:", error);
//       creteAlert(
//         "error",
//         error.message || "Failed to proceed to checkout. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <section>
//       <div className="container py-50px lg:py-60px 2xl:py-20 3xl:py-100px">
//         {/* Cart table */}
//         <div className="text-contentColor dark:text-contentColor-dark text-size-10 md:text-base overflow-auto">
//           <table className="table-fixed md:table-auto leading-1.8 text-center w-150 md:w-full overflow-auto border border-borderColor dark:border-borderColor-dark box-content md:box-border">
//             <thead>
//               <tr className="md:text-sm text-blackColor dark:text-blackColor-dark uppercase font-medium border-b border-borderColor dark:border-borderColor-dark">
//                 <th className="pt-13px pb-9px md:py-22px px-5 md:px-25px leading-1.8 max-w-25 whitespace-nowrap">
//                   Image
//                 </th>
//                 <th className="pt-13px pb-9px md:py-22px px-5 md:px-25px leading-1.8 max-w-25 whitespace-nowrap">
//                   Product
//                 </th>
//                 <th className="pt-13px pb-9px md:py-22px px-5 md:px-25px leading-1.8 max-w-25 whitespace-nowrap">
//                   Price
//                 </th>
//                 <th className="pt-13px pb-9px md:py-22px px-5 md:px-25px leading-1.8 max-w-25 whitespace-nowrap">
//                   Quantity
//                 </th>
//                 <th className="pt-13px pb-9px md:py-22px px-5 md:px-25px leading-1.8 max-w-25 whitespace-nowrap">
//                   Total
//                 </th>
//                 <th className="pt-13px pb-9px md:py-22px px-5 md:px-25px leading-1.8 max-w-25 whitespace-nowrap">
//                   Remove
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {!isCartProduct ? (
//                 <tr className="relative">
//                   <td className="p-5 md:p-10 " colSpan="6">
//                     <p className="w-full h-full flex items-center justify-center md:text-xl font-bold capitalize opacity-70 ">
//                       Your cart is empty.
//                     </p>
//                   </td>
//                 </tr>
//               ) : (
//                 cartProducts.map((product, idx) => (
//                   <CartProduct key={idx} product={product} />
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//         {/* Cart action buttons */}
//         <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-x-5 gap-y-10px pt-22px pb-9 md:pt-30px md:pb-55px">
//           <div>
//             <Link
//               href={"/courses"}
//               className="text-size-13 text-whiteColor dark:text-whiteColor-dark dark:hover:text-whiteColor leading-1 px-5 py-18px md:px-10 bg-blackColor dark:bg-blackColor-dark hover:bg-primaryColor dark:hover:bg-primaryColor"
//             >
//               CONTINUE SHOPPING
//             </Link>
//           </div>
//           {isCartProduct && (
//             <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-x-5 gap-y-10px">
//               <button
//                 onClick={handleUpdateCart}
//                 className="text-size-13 text-whiteColor dark:text-whiteColor-dark dark:hover:text-whiteColor leading-1 px-5 py-18px md:px-10 bg-blackColor dark:bg-blackColor-dark hover:bg-primaryColor dark:hover:bg-primaryColor"
//               >
//                 UPDATE CART
//               </button>
//               <button
//                 onClick={handleClearCart}
//                 className="text-size-13 text-whiteColor dark:text-whiteColor-dark dark:hover:text-whiteColor leading-1 px-5 py-18px md:px-10 bg-blackColor dark:bg-blackColor-dark hover:bg-primaryColor dark:hover:bg-primaryColor"
//               >
//                 CLEAR CART
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Cart summary */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-30px">
//           <div>
//             <div className="px-30px pt-45px pb-50px leading-1.8 border border-borderColor dark:border-borderColor-dark rounded-5px">
//               {/* Heading */}
//               <div className="flex gap-x-4">
//                 <h3 className="text-lg whitespace-nowrap font-medium text-blackColor dark:text-blackColor-dark mb-22px">
//                   <span className="leading-1.2">
//                     Review Course Details and Total Fees
//                   </span>
//                 </h3>
//                 <div className="h-1px w-full bg-borderColor2 dark:bg-borderColor2-dark mt-2"></div>
//               </div>
//               <p className="text-contentColor dark:text-contentColor-dark mb-15px">
//                 This emphasizes the course-specific aspect of the purchase and
//                 creates a more student-friendly tone.
//               </p>
//             </div>
//           </div>
//           <div>
//             <div className="px-30px pt-45px pb-50px leading-1.8 border border-borderColor dark:border-borderColor-dark rounded-5px">
//               {/* Heading */}
//               <div className="flex gap-x-4">
//                 <h3 className="text-lg whitespace-nowrap font-medium text-blackColor dark:text-blackColor-dark mb-22px">
//                   <span className="leading-1.2">Cart Note</span>
//                 </h3>
//                 <div className="h-1px w-full bg-borderColor2 dark:bg-borderColor2-dark mt-2"></div>
//               </div>
//               <p className="text-contentColor dark:text-contentColor-dark mb-15px">
//                 Special instructions for seller
//               </p>
//               {/* Form */}
//               <form>
//                 <div className="mb-5">
//                   <textarea
//                     className="text-xs text-blackColor py-11px px-15px w-full rounded box-border border border-borderColor2 dark:border-borderColor2-dark"
//                     cols="30"
//                     rows="4"
//                   ></textarea>
//                 </div>
//               </form>
//             </div>
//           </div>
//           <div>
//             <div className="px-30px pt-45px pb-50px leading-1.8 border border-borderColor dark:border-borderColor-dark rounded-5px">
//               {/* Heading */}
//               <div className="flex gap-x-4">
//                 <h3 className="text-lg whitespace-nowrap font-medium text-blackColor dark:text-blackColor-dark mb-9">
//                   <span className="leading-1.2">Cart Total</span>
//                 </h3>
//                 <div className="h-1px w-full bg-borderColor2 dark:bg-borderColor2-dark mt-2"></div>
//               </div>
//               <h4 className="text-sm font-bold text-blackColor dark:text-blackColor-dark mb-5 flex justify-between items-center">
//                 <span className="leading-1.2">Cart Totals</span>
//                 <span className="leading-1.2 text-lg font-medium">
//                   ${totalPrice ? totalPrice.toFixed(2) : "0.00"}
//                 </span>
//               </h4>
//               <div>
//                 <button
//                   type="button"
//                   className="text-size-13 text-whiteColor dark:text-whiteColor-dark dark:hover:text-whiteColor leading-1 px-5 py-18px md:px-10 bg-blackColor dark:bg-blackColor-dark hover:bg-primaryColor dark:hover:bg-primaryColor"
//                   onClick={handleCheckout}
//                   disabled={loading}
//                 >
//                   {loading ? "Processing..." : "PROCEED TO CHECKOUT"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default CartPrimary;

