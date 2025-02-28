"use client";
import useSweetAlert from "@/hooks/useSweetAlert";
import addItemsToLocalstorage from "@/libs/addItemsToLocalstorage";
import getItemsFromLocalstorage from "@/libs/getItemsFromLocalstorage";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

const wishlistContext = createContext(null);

const WishlistContextProvider = ({ children }) => {
	const [wishlistProducts, setWishlistProducts] = useState([]);
	const { data: session } = useSession(); // Get session details
	const creteAlert = useSweetAlert();
	const [userData, setUserData] = useState();


	const fetchWishlistFromDB = useCallback(async (userId) => {
		if (!userId) return; // Prevent fetch if userId is not available

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
	}, [creteAlert]); // `useCallback` ensures the function remains stable

	// Load wishlist from local storage or database when `session` changes
	useEffect(() => {
		const localWishlist = getItemsFromLocalstorage("wishlist") || [];

		if (session?.user?.id) {
			fetchWishlistFromDB(session.user.id); // Load from database if logged in
		} else {
			setWishlistProducts(localWishlist); // Load from local storage if logged out
		}
	}, [session, fetchWishlistFromDB]); // Now `fetchWishlistFromDB` is safely included

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
			creteAlert(
				"info",
				"You are not logged in. Adding course to local favorites."
			);
			const localWishlist = getItemsFromLocalstorage("wishlist") || [];
			if (!localWishlist.includes(currentId)) {
				const updatedLocalWishlist = [...localWishlist, currentId];
				addItemsToLocalstorage("wishlist", updatedLocalWishlist);
				setWishlistProducts(updatedLocalWishlist);
				creteAlert("success", "Course added to local favorites.");
			} else {
				creteAlert(
					"error",
					"Course already exists in local favorites."
				);
			}
		} else {
			// If logged in, store in database
			if (!wishlistProducts.includes(currentId)) {
				try {
					const response = await fetch(
						`/api/user/${session?.user?.id}`,
						{
							method: "PATCH",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								wishlist: [...wishlistProducts, currentId], // Append to wishlist
							}),
						}
					);

					if (response.ok) {
						setWishlistProducts((prevProducts) => [
							...prevProducts,
							currentId,
						]);
						creteAlert("success", "Course added to favorites.");
					} else {
						const data = await response.json();
						creteAlert(
							"error",
							data.error ||
								"Failed to add course to the favorites."
						);
					}
				} catch (error) {
					creteAlert(
						"error",
						"Error occurred while adding course to favorites."
					);
					console.error(
						"Error while adding course to favorites:",
						error
					);
				}
			} else {
				creteAlert(
					"error",
					"Failed! Course already exists in favorites."
				);
			}
		}
	};

	// Delete product from wishlist
	const deleteProductFromWishlist = async (currentId) => {
		const updatedWishlist = wishlistProducts.filter(
			(productId) => productId !== currentId
		);
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
					creteAlert(
						"error",
						data.error || "Failed to remove Course from favorites."
					);
					// Rollback if there was a failure
					setWishlistProducts((prevProducts) => [
						...prevProducts,
						currentId,
					]);
					addItemsToLocalstorage("wishlist", [
						...updatedWishlist,
						currentId,
					]);
				}
			} catch (error) {
				creteAlert("error", "Error removing course from favorites.");
				console.error(
					"Error removing course from favorites in the server:",
					error
				);
				// Rollback if error occurred
				setWishlistProducts((prevProducts) => [
					...prevProducts,
					currentId,
				]);
				addItemsToLocalstorage("wishlist", [
					...updatedWishlist,
					currentId,
				]);
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
