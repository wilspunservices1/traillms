"use client";

import React, { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable"; // Import CreatableSelect
import ButtonPrimary from "../buttons/ButtonPrimary";
import { useSession } from "next-auth/react";
import useSweetAlert from "@/hooks/useSweetAlert";

// Initial skillsOptions with value and label
const initialSkillsOptions = [
  { value: "Full Stack Developer", label: "Full Stack Developer" },
  { value: "Frontend Developer", label: "Frontend Developer" },
  { value: "Backend Developer", label: "Backend Developer" },
  { value: "DevOps Engineer", label: "DevOps Engineer" },
  { value: "Data Scientist", label: "Data Scientist" },
  { value: "Project Manager", label: "Project Manager" },
];

const ProfileContent = () => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    phoneNumber: "",
    expertise: [], // Changed from "skills" to "expertise"
    displayName: "",
    bio: "",
  });
  const [skillsOptions, setSkillsOptions] = useState(initialSkillsOptions); // Manage skills options dynamically
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const showAlert = useSweetAlert();

  useEffect(() => {
    if (!session?.user?.id) return;

    // Fetch user data when component mounts
    const fetchUserData = async () => {
      try {
        const res = await fetch(`/api/user/${session.user.id}`);
        const data = await res.json();
        if (res.ok) {
          setFormData({
            firstName: data.name?.split(" ")[0] || "",
            lastName: data.name?.split(" ")[1] || "",
            username: data.username || "",
            email: data.email || "", // Set email from fetched data
            phoneNumber: data.phone || "",
            expertise: data.expertise || [], // Changed from "skills" to "expertise"
            displayName: data.name || "",
            bio: data.biography || "",
          });

          // Update skillsOptions to include existing expertise
          const existingExpertise = data.expertise || [];
          const newSkillsOptions = existingExpertise.reduce((acc, skill) => {
            if (!acc.find(option => option.value === skill)) {
              acc.push({ value: skill, label: skill });
            }
            return acc;
          }, [...initialSkillsOptions]);
          setSkillsOptions(newSkillsOptions);
        } else {
          setErrorMessage("Failed to fetch user data.");
        }
      } catch (error) {
        setErrorMessage("An error occurred while fetching user data.");
      }
    };

    fetchUserData();
  }, [session?.user?.id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle change for CreatableSelect
  const handleSkillsChange = (selectedOptions) => {
    const expertise = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData({ ...formData, expertise });

    // Update skillsOptions with any new skills
    if (selectedOptions) {
      const newOptions = selectedOptions.filter(
        option => !skillsOptions.some(existing => existing.value === option.value)
      );
      if (newOptions.length > 0) {
        setSkillsOptions([...skillsOptions, ...newOptions]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const updatedData = {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email, // Include email in the update
      username: formData.username,
      phone: formData.phoneNumber,
      expertise: formData.expertise, // Changed from "skills" to "expertise"
      biography: formData.bio,
    };

    try {
      const res = await fetch(`/api/user/${session?.user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage("Profile updated successfully!");
        showAlert("success", "Profile updated successfully.");
        setErrorMessage("");
      } else {
        setErrorMessage(data.message || "Failed to update profile.");
        showAlert("error", data.message || "Failed to update profile.");
        setSuccessMessage("");
      }
    } catch (error) {
      setErrorMessage("An error occurred while updating profile.");
      showAlert("error", "An error occurred while updating profile.");
    } finally {
      setLoading(false);
    }
  };

  // Prepare the selected skills for CreatableSelect
  const selectedSkills = skillsOptions.filter(option => formData.expertise.includes(option.value));

  return (
    <form
      onSubmit={handleSubmit}
      className="text-sm text-blackColor dark:text-blackColor-dark leading-1.8"
      data-aos="fade-up"
    >
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}
      <div className="grid grid-cols-1 xl:grid-cols-2 mb-15px gap-y-15px gap-x-30px">
        <div>
          <label className="mb-3 block font-semibold">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="John"
            className="w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no"
          />
        </div>
        <div>
          <label className="mb-3 block font-semibold">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Doe"
            className="w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no"
          />
        </div>
        {/* change user email */}
        <div>
          <label className="mb-3 block font-semibold">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="youremail@example.com"
            className="w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no"
          />
        </div>
        <div>
          <label className="mb-3 block font-semibold">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="john_doe"
            className="w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no"
          />
        </div>
        <div>
          <label className="mb-3 block font-semibold">Phone Number</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="+1-202-555-0174"
            className="w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no"
          />
        </div>
        <div>
          <label className="mb-3 block font-semibold">Skills</label>
          <CreatableSelect
            isMulti
            name="expertise" // Changed from "skills" to "expertise"
            options={skillsOptions}
            value={selectedSkills}
            onChange={handleSkillsChange}
            className="basic-multi-select"
            classNamePrefix="select"
            placeholder="Select or add your skills..."
            // Handle creating new options
            onCreateOption={(inputValue) => {
              const newOption = { value: inputValue, label: inputValue };
              setSkillsOptions([...skillsOptions, newOption]);
              setFormData({ ...formData, expertise: [...formData.expertise, inputValue] }); // Changed from "skills" to "expertise"
            }}
          />
        </div>
        <div>
          <label className="mb-3 block font-semibold">
            Display Name Publicly As
          </label>
          <input
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no"
          />
        </div>
      </div>
      <div className="mb-15px">
        <label className="mb-3 block font-semibold">Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          className="w-full py-10px px-5 text-sm text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md"
          cols="30"
          rows="10"
        />
      </div>

      <div className="mt-15px">
        <ButtonPrimary type={"submit"} disabled={loading}>
          {loading ? "Updating..." : "Update Info"}
        </ButtonPrimary>
      </div>
    </form>
  );
};

export default ProfileContent;


