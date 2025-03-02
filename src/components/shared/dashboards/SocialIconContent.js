"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ButtonPrimary from "../buttons/ButtonPrimary";
import Loader from "@/components/sections/create-course/_comp/Icons/Loader";
import useSweetAlert from "@/hooks/useSweetAlert"; // Custom hook for SweetAlert

const SocialIconContent = () => {
  // State to manage the form inputs
  const [formValues, setFormValues] = useState({
    facebook: "",
    twitter: "",
    linkedin: "",
    website: "",
    github: ""
  });

  const [isUpdating, setIsUpdating] = useState(false); // Flag to determine if updating or creating
  const [loading, setLoading] = useState(false); // Loading state for fetch and submit
  const showAlert = useSweetAlert(); // Initialize SweetAlert
  const { data: session } = useSession();

  // Fetch existing social links on component mount
  useEffect(() => {
    if (session?.user?.id) {
      fetchSocialLinks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  // Fetch user's social links
  const fetchSocialLinks = async () => {
    setLoading(true); // Start loading
    try {
      const response = await fetch(`/api/user/${session.user.id}/socials`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setFormValues({
          facebook: data.facebook || "",
          twitter: data.twitter || "",
          linkedin: data.linkedin || "",
          website: data.website || "",
          github: data.github || "",
        });
        setIsUpdating(true); // Social links exist, we are updating
      } else if (response.status === 404) {
        // Social links do not exist, user can create new ones
        setIsUpdating(false);
      } else {
        const errorData = await response.json();
        showAlert("error", errorData.error || "Failed to load social links.", "Error");
      }
    } catch (error) {
      console.error("Error fetching social links:", error);
      showAlert("error", "An error occurred while fetching social links.", "Error");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true); // Start loading during submission

    if (!session?.user?.id) {
      showAlert("error", "User is not authenticated.", "Error");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/user/${session.user.id}/socials`, {
        method: "POST", // Using POST as per your API implementation
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formValues),
      });

      const result = await response.json();

      if (!response.ok) {
        showAlert("error", result.error || "Failed to update social links.", "Error");
      } else {
        showAlert("success", result.message || "Social links updated successfully!", "Success");
        setIsUpdating(true); // Ensure we're in update mode after creation
      }
    } catch (error) {
      console.error("Error updating social links:", error);
      showAlert("error", "An error occurred while updating social links.", "Error");
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
      {/* Loader during fetching */}
      {loading && (
        <div className="flex items-center mb-4">
          <Loader className="mr-2 h-4 w-4" /> Loading...
        </div>
      )}

      <div className="grid grid-cols-1 mb-15px gap-y-15px gap-x-30px">
        {/* Facebook */}
        <div>
          <label className="mb-3 block font-semibold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-facebook inline-block mr-1"
            >
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
            Facebook
          </label>
          <input
            type="text"
            name="facebook"
            placeholder="https://facebook.com/"
            className={`w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no ${
              loading ? "cursor-not-allowed opacity-50" : ""
            }`}
            value={formValues.facebook}
            onChange={handleInputChange}
            disabled={loading}
          />
        </div>

        {/* Twitter */}
        <div>
          <label className="mb-3 block font-semibold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-twitter inline-block mr-1"
            >
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
            </svg>
            Twitter
          </label>
          <input
            type="text"
            name="twitter"
            placeholder="https://twitter.com/"
            className={`w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no ${
              loading ? "cursor-not-allowed opacity-50" : ""
            }`}
            value={formValues.twitter}
            onChange={handleInputChange}
            disabled={loading}
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label className="mb-3 block font-semibold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-linkedin inline-block mr-1"
            >
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
            LinkedIn
          </label>
          <input
            type="text"
            name="linkedin"
            placeholder="https://linkedin.com/"
            className={`w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no ${
              loading ? "cursor-not-allowed opacity-50" : ""
            }`}
            value={formValues.linkedin}
            onChange={handleInputChange}
            disabled={loading}
          />
        </div>

        {/* Website */}
        <div>
          <label className="mb-3 block font-semibold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-layout inline-block mr-1"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            Website
          </label>
          <input
            type="text"
            name="website"
            placeholder="https://website.com/"
            className={`w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no ${
              loading ? "cursor-not-allowed opacity-50" : ""
            }`}
            value={formValues.website}
            onChange={handleInputChange}
            disabled={loading}
          />
        </div>

        {/* GitHub */}
        <div>
          <label className="mb-3 block font-semibold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-github inline-block mr-1"
            >
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            Github
          </label>
          <input
            type="text"
            name="github"
            placeholder="https://github.com/"
            className={`w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no ${
              loading ? "cursor-not-allowed opacity-50" : ""
            }`}
            value={formValues.github}
            onChange={handleInputChange}
            disabled={loading}
          />
        </div>
      </div>

      {/* Remove inline error and success messages as SweetAlert handles them */}
      {/* {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
      {message && <p className="text-green-500 mb-4">{message}</p>} */}

      {/* Submit Button */}
      <div className="mt-15px">
        <ButtonPrimary type="submit" disabled={loading}>
          {loading ? (
            <div className="flex items-center">
              <Loader className="mr-2 h-4 w-4" text={isUpdating ? "Updating..." : "Creating..."} /> 
            </div>
          ) : (
            isUpdating ? "Update Socials" : "Create Socials"
          )}
        </ButtonPrimary>
      </div>
    </form>
  );
};

export default SocialIconContent;
