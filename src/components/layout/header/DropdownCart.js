"use client";
import Link from "next/link";
import useIsTrue from "@/hooks/useIsTrue";
import { useCartContext } from "@/contexts/CartContext";
import { CldImage } from "next-cloudinary";
import getStripe from "@/utils/loadStripe";
import { useState } from "react";
import { useSession } from "next-auth/react";
import DropdownWrapperSecondary from "@/components/shared/wrappers/DropdownWrapperSecondary"; // Ensure this import is correct
import DropdownContainerSecondary from "@/components/shared/containers/DropdownContainerSecondary"; // Ensure this import is correct
import useSweetAlert from "@/hooks/useSweetAlert";
import { useRouter } from "next/navigation";

// Function to calculate the total price of items in the cart
const calculateTotalPrice = (cartProducts) => {
  return cartProducts.reduce((total, item) => {
    const price = parseFloat(item.price); // Convert price to a number
    return total + (isNaN(price) ? 0 : price); // Add price to total, default to 0 if price is NaN
  }, 0); // Initial total is 0
};

const DropdownCart = ({ isHeaderTop }) => {
  const { cartProducts, deleteProductFromCart } = useCartContext();
  const [loading, setLoading] = useState(false); // State to track loading
  const [error, setError] = useState(null); // State to track errors
  const { data: session } = useSession(); // Get user session data
  const userId = session?.user.id;
  const creteAlert = useSweetAlert();
  const router = useRouter();

  // console.log("cart products of courses",cartProducts[0]?.courseId)

  // Calculate total price of cart items
  const totalPrice = calculateTotalPrice(cartProducts);

  const isHome4 = useIsTrue("/home-4");
  const isHome4Dark = useIsTrue("/home-4-dark");
  const isHome5 = useIsTrue("/home-5");
  const isHome5Dark = useIsTrue("/home-5-dark");

  const totalProduct = cartProducts?.length || 0;


  // Function to handle checkout process
  const handleCheckout = async () => {
    if (!session) {
      creteAlert("error", "You must be logged in to checkout");
      router.push("/login")
    } else if (!cartProducts.length > 0) {
      creteAlert("error", "Cart is empty. Please add items to the cart.");
    } else {
      
      setLoading(true);
      setError(null); // Reset error state

      const stripe = await getStripe(); // Load Stripe.js

      const items = cartProducts.map((product) => ({
        name: product.title,
        price: product.price, // Ensure this is the string/number in correct format (e.g., "299.99")
        image: product.thumbnail,
        quantity: 1, // Defaulting to 1 for each item (adjust if needed)
        courseId: product.courseId,
      }));

      const userEmail = session?.user?.email; // Get user email from session

      try {
        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // { items, email: userEmail, userId }
          body: JSON.stringify({ items, email: userEmail, userId }), // Pass user email to the backend
        });

        const { sessionId } = await response.json();
        if (sessionId) {
          await stripe.redirectToCheckout({ sessionId }); // Redirect to Stripe Checkout
        } else {
          setError("Failed to create checkout session.");
        }
      } catch (error) {
        console.error("Checkout error:", error);
        setError("Something went wrong during the checkout process.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Link
        href="/ecommerce/cart"
        className={`relative ${isHeaderTop
          ? "block"
          : isHome4 || isHome4Dark || isHome5 || isHome5Dark
            ? "block lg:hidden"
            : "block"
          }`}
      >
        <i className="icofont-cart-alt text-2xl text-blackColor group-hover:text-secondaryColor transition-all duration-300 dark:text-blackColor-dark"></i>
        <span
          className={`${totalProduct < 10 ? "px-1 py-[2px]" : "px-3px pb-1 pt-3px"
            } absolute -top-1 2xl:-top-[5px] -right-[10px] lg:right-3/4 2xl:-right-[10px] text-[10px] font-medium text-white dark:text-whiteColor-dark bg-secondaryColor leading-1 rounded-full z-50 block`}
        >
          {totalProduct}
        </span>
      </Link>
      <DropdownWrapperSecondary isHeaderTop={isHeaderTop}>
        <DropdownContainerSecondary>
          <ul className="flex flex-col max-h-68 gap-y-5 pb-5 mb-30px border-b border-borderColor dark:border-borderColor-dark overflow-y-auto">
            {!cartProducts?.length ? (
              <div className="min-h-14 flex items-center justify-center text-center">
                <p className="text-contentColor dark:text-contentColor-dark font-semibold opacity-55">
                  Empty
                </p>
              </div>
            ) : (
              cartProducts.map(
                ({ id, courseId, cartId, title, thumbnail, price, quantity, isCourse }, idx) => {
                  const formattedPrice = !isNaN(Number(price)) ? Number(price).toFixed(2) : "0.00";
                  const productQuantity = quantity || 1; // Ensure a default quantity

                  return (
                    <li key={idx} className="relative flex gap-x-15px items-center">
                      <Link href={`/${isCourse ? "courses" : "courses"}/${courseId}`}>
                        <CldImage
                          src={thumbnail || "/fallback-image.jpg"}
                          alt="Product Image"
                          className="w-card-img py-[3px]"
                          width={100}
                          height={100}
                          sizes={"60w"}
                        />
                      </Link>
                      <div>
                        <Link
                          href={`/${isCourse ? "courses" : "courses"}/${courseId}`}
                          className="text-sm text-darkblack hover:text-secondaryColor leading-5 block pb-2 capitalize dark:text-darkblack-dark dark:hover:text-secondaryColor"
                        >
                          {title.length > 16 ? title.slice(0, 16) : title}
                        </Link>
                        <p className="text-sm text-darkblack leading-5 block pb-5px dark:text-darkblack-dark">
                          {productQuantity} x{" "}
                          <span className="text-secondaryColor">${formattedPrice}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => deleteProductFromCart(cartId && cartId)}
                        className="absolute block top-0 right-0 text-base text-contentColor leading-1 hover:text-secondaryColor dark:text-contentColor-dark dark:hover:text-secondaryColor"
                      >
                        <i className="icofont-close-line"></i>
                      </button>
                    </li>
                  );
                }
              )
            )}
          </ul>
          <div>
            <p className="text-size-17 text-contentColor dark:text-contentColor-dark pb-5 flex justify-between">
              Total Price:
              <span className="font-bold text-secondaryColor">
                ${!isNaN(totalPrice) ? totalPrice.toFixed(2) : "0.00"}
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-y-5">
            <Link
              href="/ecommerce/cart"
              className="text-sm font-bold text-contentColor dark:text-contentColor-dark hover:text-whiteColor hover:bg-secondaryColor text-center py-10px border border-secondaryColor"
            >
              View Cart
            </Link>
            <button
              type="button"
              onClick={handleCheckout} // Add the checkout handler
              className="text-sm font-bold bg-darkblack dark:bg-darkblack-dark text-whiteColor dark:text-whiteColor-dark hover:bg-secondaryColor dark:hover:bg-secondaryColor text-center py-10px"
              disabled={loading} // Disable button during checkout process
            >
              {loading ? "Processing..." : "Checkout"}
            </button>
          </div>
        </DropdownContainerSecondary>
      </DropdownWrapperSecondary>
    </>
  );
};

export default DropdownCart;



// "use client";
// import Image from "next/image";
// import DropdownWrapperSecondary from "@/components/shared/wrappers/DropdownWrapperSecondary";
// import DropdownContainerSecondary from "@/components/shared/containers/DropdownContainerSecondary";
// import Link from "next/link";
// import countTotalPrice from "@/libs/countTotalPrice";
// import useIsTrue from "@/hooks/useIsTrue";
// import { useCartContext } from "@/contexts/CartContext";
// import { CldImage } from 'next-cloudinary';


// const calculateTotalPrice = (cartProducts) => {
//   return cartProducts.reduce((total, item) => {
//     const price = parseFloat(item.price); // Convert price to a number
//     return total + (isNaN(price) ? 0 : price); // Add price to total, default to 0 if price is NaN
//   }, 0); // Initial total is 0
// };


// const DropdownCart = ({ isHeaderTop }) => {
//   const { cartProducts, deleteProductFromCart } = useCartContext();

//   // Calculate total price of cart items
//   // const totalPrice = countTotalPrice(cartProducts);
//   const totalPrice = calculateTotalPrice(cartProducts);

//   const isHome4 = useIsTrue("/home-4");
//   const isHome4Dark = useIsTrue("/home-4-dark");
//   const isHome5 = useIsTrue("/home-5");
//   const isHome5Dark = useIsTrue("/home-5-dark");

//   const totalProduct = cartProducts?.length || 0;

//   console.log("cartProducts",cartProducts)

//   return (
//     <>
//       <Link
//         href="/ecommerce/cart"
//         className={`relative ${
//           isHeaderTop
//             ? "block"
//             : isHome4 || isHome4Dark || isHome5 || isHome5Dark
//             ? "block lg:hidden"
//             : "block"
//         }`}
//       >
//         <i className="icofont-cart-alt text-2xl text-blackColor group-hover:text-secondaryColor transition-all duration-300 dark:text-blackColor-dark"></i>
//         <span
//           className={`${
//             totalProduct < 10 ? "px-1 py-[2px]" : "px-3px pb-1 pt-3px"
//           } absolute -top-1 2xl:-top-[5px] -right-[10px] lg:right-3/4 2xl:-right-[10px] text-[10px] font-medium text-white dark:text-whiteColor-dark bg-secondaryColor leading-1 rounded-full z-50 block`}
//         >
//           {totalProduct}
//         </span>
//       </Link>
//       <DropdownWrapperSecondary isHeaderTop={isHeaderTop}>
//         <DropdownContainerSecondary>
//           <ul className="flex flex-col max-h-68 gap-y-5 pb-5 mb-30px border-b border-borderColor dark:border-borderColor-dark overflow-y-auto">
//             {!cartProducts?.length ? (
//               <div className="min-h-14 flex items-center justify-center text-center">
//                 <p className="text-contentColor dark:text-contentColor-dark font-semibold opacity-55">
//                   Empty
//                 </p>
//               </div>
//             ) : (
//               cartProducts.map(
//                 ({ id, title, thumbnail, price, quantity, isCourse }, idx) => {
//                   // Ensure price is valid and format it correctly
//                   const formattedPrice = !isNaN(Number(price))
//                     ? Number(price).toFixed(2)
//                     : "0.00";
//                   const productQuantity = quantity || 1; // Ensure a default quantity

//                   return (
//                     <li
//                       key={idx}
//                       className="relative flex gap-x-15px items-center"
//                     >
//                       <Link
//                         href={`/${
//                           isCourse ? "courses" : "ecommerce/products"
//                         }/${id}`}
//                       >
//                         <CldImage
//                           src={thumbnail || "/fallback-image.jpg"}
//                           alt="Product Image"
//                           className="w-card-img py-[3px]"
//                           width={100} // You can adjust this
//                           height={100} // You can adjust this
//                           sizes={"60w"}
//                         />
//                       </Link>
//                       <div>
//                         <Link
//                           href={`/${
//                             isCourse ? "courses" : "ecommerce/products"
//                           }/${id}`}
//                           className="text-sm text-darkblack hover:text-secondaryColor leading-5 block pb-2 capitalize dark:text-darkblack-dark dark:hover:text-secondaryColor"
//                         >
//                           {title.length > 16 ? title.slice(0, 16) : title}
//                         </Link>
//                         <p className="text-sm text-darkblack leading-5 block pb-5px dark:text-darkblack-dark">
//                           {productQuantity} x{" "}
//                           <span className="text-secondaryColor">
//                             ${formattedPrice}
//                           </span>
//                         </p>
//                       </div>

//                       <button
//                         onClick={() => deleteProductFromCart(id, title)}
//                         className="absolute block top-0 right-0 text-base text-contentColor leading-1 hover:text-secondaryColor dark:text-contentColor-dark dark:hover:text-secondaryColor"
//                       >
//                         <i className="icofont-close-line"></i>
//                       </button>
//                     </li>
//                   );
//                 }
//               )
//             )}
//           </ul>

//           {/* Total Price */}
//           <div>
//             <p className="text-size-17 text-contentColor dark:text-contentColor-dark pb-5 flex justify-between">
//               Total Price:
//               <span className="font-bold text-secondaryColor">
//               ${!isNaN(totalPrice) ? totalPrice.toFixed(2) : "0.00"}
//               </span>
//             </p>
//           </div>

//           {/* Action buttons */}
//           <div className="flex flex-col gap-y-5">
//             <Link
//               href="/ecommerce/cart"
//               className="text-sm font-bold text-contentColor dark:text-contentColor-dark hover:text-whiteColor hover:bg-secondaryColor text-center py-10px border border-secondaryColor"
//             >
//               View Cart
//             </Link>
//             <Link
//               href="/ecommerce/checkout"
//               className="text-sm font-bold bg-darkblack dark:bg-darkblack-dark text-whiteColor dark:text-whiteColor-dark hover:bg-secondaryColor dark:hover:bg-secondaryColor text-center py-10px"
//             >
//               Checkout
//             </Link>
//           </div>
//         </DropdownContainerSecondary>
//       </DropdownWrapperSecondary>
//     </>
//   );
// };

// export default DropdownCart;



// "use client";
// import Image from "next/image";
// import DropdownWrapperSecondary from "@/components/shared/wrappers/DropdownWrapperSecondary";
// import DropdownContainerSecondary from "@/components/shared/containers/DropdownContainerSecondary";
// import Link from "next/link";
// import countTotalPrice from "@/libs/countTotalPrice";
// import useIsTrue from "@/hooks/useIsTrue";
// import { useCartContext } from "@/contexts/CartContext";
// const DropdownCart = ({ isHeaderTop }) => {
//   const { cartProducts, deleteProductFromCart } = useCartContext();

//   // calculate total price
//   const totalPrice = countTotalPrice(cartProducts);
//   const isHome4 = useIsTrue("/home-4");
//   const isHome4Dark = useIsTrue("/home-4-dark");
//   const isHome5 = useIsTrue("/home-5");
//   const isHome5Dark = useIsTrue("/home-5-dark");
//   const totalProduct = cartProducts?.length;
//   return (
//     <>
//       <Link
//         href="/ecommerce/cart"
//         className={`relative ${
//           isHeaderTop
//             ? "block"
//             : isHome4 || isHome4Dark || isHome5 || isHome5Dark
//             ? "block lg:hidden"
//             : "block"
//         }`}
//       >
//         <i className="icofont-cart-alt text-2xl text-blackColor group-hover:text-secondaryColor transition-all duration-300 dark:text-blackColor-dark"></i>
//         <span
//           className={`${
//             totalProduct < 10 ? "px-1 py-[2px]" : "px-3px pb-1 pt-3px"
//           } absolute -top-1 2xl:-top-[5px] -right-[10px] lg:right-3/4 2xl:-right-[10px] text-[10px] font-medium text-white dark:text-whiteColor-dark bg-secondaryColor leading-1 rounded-full z-50 block`}
//         >
//           {totalProduct}
//         </span>
//       </Link>
//       <DropdownWrapperSecondary isHeaderTop={isHeaderTop}>
//         <DropdownContainerSecondary>
//           <ul className="flex flex-col max-h-68 gap-y-5 pb-5 mb-30px border-b border-borderColor dark:border-borderColor-dark overflow-y-auto">
//             {!cartProducts?.length ? (
//               <div className="min-h-14 flex items-center justify-center text-center">
//                 <p className="text-contentColor dark:text-contentColor-dark font-semibold opacity-55">
//                   Empty
//                 </p>
//               </div>
//             ) : (
//               cartProducts.map(
//                 ({ id, title, image, price, quantity, isCourse }, idx) => (
//                   <li
//                     key={idx}
//                     className="relative flex gap-x-15px items-center"
//                   >
//                     <Link
//                       href={`/${
//                         isCourse ? "courses" : "ecommerce/products"
//                       }/${id}`}
//                     >
//                       <Image
//                         prioriy="false"
//                         placeholder="blur"
//                         src={image}
//                         alt="photo"
//                         className="w-card-img py-[3px]"
//                       />
//                     </Link>
//                     <div>
//                       <Link
//                         href={`/${
//                           isCourse ? "courses" : "ecommerce/products"
//                         }/${id}`}
//                         className="text-sm text-darkblack hover:text-secondaryColor leading-5 block pb-2 capitalize dark:text-darkblack-dark dark:hover:text-secondaryColor"
//                       >
//                         {title.length > 16 ? title.slice(0, 16) : title}
//                       </Link>
//                       <p className="text-sm text-darkblack leading-5 block pb-5px dark:text-darkblack-dark">
//                         {quantity} x{" "}
//                         <span className="text-secondaryColor">
//                           ${price.toFixed(2)}
//                         </span>
//                       </p>
//                     </div>

//                     <button
//                       onClick={() => deleteProductFromCart(id, title)}
//                       className="absolute block top-0 right-0 text-base text-contentColor leading-1 hover:text-secondaryColor dark:text-contentColor-dark dark:hover:text-secondaryColor"
//                     >
//                       <i className="icofont-close-line"></i>
//                     </button>
//                   </li>
//                 )
//               )
//             )}
//           </ul>

//           {/* total price */}

//           <div>
//             <p className="text-size-17 text-contentColor dark:text-contentColor-dark pb-5 flex justify-between">
//               Total Price:
//               <span className="font-bold text-secondaryColor">
//                 ${totalPrice.toFixed(2)}
//               </span>
//             </p>
//           </div>

//           {/* action buttons */}
//           <div className="flex flex-col gap-y-5">
//             <Link
//               href="/ecommerce/cart"
//               className="text-sm font-bold text-contentColor dark:text-contentColor-dark hover:text-whiteColor hover:bg-secondaryColor text-center py-10px border border-secondaryColor"
//             >
//               View Cart
//             </Link>
//             <Link
//               href="/ecommerce/checkout"
//               className="text-sm font-bold bg-darkblack dark:bg-darkblack-dark text-whiteColor dark:text-whiteColor-dark hover:bg-secondaryColor dark:hover:bg-secondaryColor text-center py-10px"
//             >
//               Checkout
//             </Link>
//           </div>
//         </DropdownContainerSecondary>
//       </DropdownWrapperSecondary>
//     </>
//   );
// };

// export default DropdownCart;
