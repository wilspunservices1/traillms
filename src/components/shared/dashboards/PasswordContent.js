"use client";

import React, { useState } from "react";
import ButtonPrimary from "../buttons/ButtonPrimary";
import Loader from "@/components/sections/create-course/_comp/Icons/Loader";
import useSweetAlert from "@/hooks/useSweetAlert"; // Import SweetAlert hook

const PasswordContent = () => {
  const showAlert = useSweetAlert(); // Initialize SweetAlert
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [retypeNewPassword, setRetypeNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false); // Loading state

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset messages
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true); // Start loading

    // Check if the new passwords match
    if (newPassword !== retypeNewPassword) {
      setErrorMessage("New password and re-type password do not match.");
      showAlert("error", "New password and re-type password do not match."); // Show error alert
      setLoading(false); // Stop loading
      return;
    }

    // Check if the new password is different from the current one
    if (currentPassword === newPassword) {
      setErrorMessage("New password cannot be the same as the current password.");
      showAlert("error", "New password cannot be the same as the current password."); // Show error alert
      setLoading(false); // Stop loading
      return;
    }

    // Call API to update password
    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "An error occurred.");
        showAlert("error", result.error || "An error occurred."); // Show error alert
      } else {
        setSuccessMessage(result.message || "Password updated successfully.");
        showAlert("success", result.message || "Password updated successfully."); // Show success alert
        setCurrentPassword("");
        setNewPassword("");
        setRetypeNewPassword("");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again later.");
      showAlert("error", "An error occurred. Please try again later."); // Show error alert
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <form
      className="text-sm text-blackColor dark:text-blackColor-dark leading-1.8"
      data-aos="fade-up"
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 mb-15px gap-y-15px gap-x-30px">
        <div>
          <label className="mb-3 block font-semibold">Current Password</label>
          <input
            type="password"
            placeholder="Current password"
            className={`w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no ${
              loading ? "cursor-not-allowed opacity-50" : ""
            }`}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            disabled={loading} // Disable during loading
          />
        </div>

        <div>
          <label className="mb-3 block font-semibold">New Password</label>
          <input
            type="password"
            placeholder="New Password"
            className={`w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no ${
              loading ? "cursor-not-allowed opacity-50" : ""
            }`}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={loading} // Disable during loading
          />
        </div>

        <div>
          <label className="mb-3 block font-semibold">Re-Type New Password</label>
          <input
            type="password"
            placeholder="Re-Type New Password"
            className={`w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no ${
              loading ? "cursor-not-allowed opacity-50" : ""
            }`}
            value={retypeNewPassword}
            onChange={(e) => setRetypeNewPassword(e.target.value)}
            required
            disabled={loading} // Disable during loading
          />
        </div>
      </div>

      {/* Remove inline error and success messages */}
      {/* {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
      {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>} */}

      <div className="mt-15px">
        <ButtonPrimary type="submit" disabled={loading}>
          {loading ? (
            <div className="flex items-center">
              <Loader className="mr-2 h-4 w-4" text="Updating..."/> 
            </div>
          ) : (
            "Update Password"
          )}
        </ButtonPrimary>
      </div>
    </form>
  );
};

export default PasswordContent;
