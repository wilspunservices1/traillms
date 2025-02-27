"use client";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { formDataSchema, type FormData } from "./CertFormSchema";
import { z } from "zod";
import { BASE_URL } from "@/actions/constant";
import { useSession, signIn } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { Session } from "next-auth";
import useSweetAlert from "@/hooks/useSweetAlert";

// Dynamically import ReactQuill to avoid 'document is not defined' error during SSR
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const CertificateForm: React.FC = () => {
  // State variables
  const [certificateName, setCertificateName] = useState(""); //*variable to fetch certificate name

  const [selectedCourse, setSelectedCourse] = useState<{
    value: string;
    label: string;
  } | null>(null); //*variable to fetch course details

  const [enabledOption, setEnabledOption] = useState<{
    //*variable to fetch isEnabled options
    value: boolean;
    label: string;
  } | null>(null);

  const [isEnabled, setIsEnabled] = useState<boolean | null>(null); //*variable to fetch isEnabled data

  const [orientationOption, setOrientationOption] = useState<{
    value: "landscape" | "portrait";
    label: string;
  } | null>(null); //*variable to fetch orientation data

  const [maxDownloads, setMaxDownloads] = useState<number | "">(""); //*variable to fetch maxDownloads data

  const [description, setDescription] = useState(""); //*variable to fetch description data

  const [certificateImage, setCertificateImage] = useState<File | null>(null); //*variable to fetch image data

  const [coursesOptions, setCoursesOptions] = useState<
    Array<{ value: string; label: string }>
  >([]); //*variable to fetch course options

  const [isLoading, setIsLoading] = useState(false); //*variable to fetch loading state

  const [formErrors, setFormErrors] = useState<Record<string, string>>({}); //*variable to fetch form Error

  const [imageError, setImageError] = useState(""); //*variable to fetch image error data
  const showAlert = useSweetAlert(); //*variable to show alert
  const [exitCer, SetExitCertificate] = useState(false); //*variable to exit certificate stage
  //! Handle User Authentication

  const { data: session, status } = useSession() as {
    data: Session | null;
    status: "loading" | "authenticated" | "unauthenticated";
  };

  const router = useRouter();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      signIn(); // Redirect to login page
    } else if (
      status === "authenticated" &&
      !session?.user?.roles.some((role: string) =>
        ["admin", "instructor", "superAdmin"].includes(role)
      )
    ) {
      // If authenticated but without the correct roles, redirect to login
      router.push("/login");
    }
  }, [status, session, router]);

  //! fectch courses
  useEffect(() => {
    if (session?.user?.roles?.includes("instructor")) {
      const fetchCourses = async () => {
        try {
          const instructorId = session?.user?.id;

          const response = await fetch(
            `${BASE_URL}/api/courses/instructorCourses?instructorId=${instructorId}`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch courses");
          }

          const data = await response.json();
          const options = data.courses.map(
            (course: { id: string; title: string }) => ({
              value: course.id,
              label: course.title,
            })
          );
          setCoursesOptions(options);
        } catch (error) {
          console.error("Error fetching courses:", error);
          setFormErrors((prev) => ({
            ...prev,
            global: "Failed to load courses. Please try again.",
          }));
        }
      };

      fetchCourses();
    }
  }, [session?.user?.id, session?.user?.roles]);

  //! Handles image uploading
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError("");
    const file = e.target.files?.[0];

    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        // Accept the image without dimension validation
        setCertificateImage(file);

        // Clear any previous error messages
        setImageError("");
      };

      img.onerror = () => {
        setImageError("Invalid image file.");
        setCertificateImage(null);
      };
    }
  };

  // Clear error for a field when its value changes
  const clearError = (field: string) => {
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // ! Handle form submission part 1
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Validate form data using Zod schema
    try {
      const formDataToValidate: FormData = {
        certificateName,
        courseId: selectedCourse?.value || "",
        enabled: isEnabled !== null ? isEnabled : true,
        orientation: orientationOption?.value || "landscape",
        certificateImage,
        maxDownloads: typeof maxDownloads === "number" ? maxDownloads : 0,
        description,
      };
      formDataSchema.parse(formDataToValidate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Map Zod errors to field-specific errors
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setFormErrors(errors);
      }
      return;
    }

    // Convert the certificate image to a base64 string
    if (certificateImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        submitCertificateForm(reader.result as string); // ✅ Now it waits for image processing
      };
      reader.readAsDataURL(certificateImage);
    } else {
      submitCertificateForm(""); // ✅ Still handles the case where no image is selected
    }
  };

  // ! Handle form submission part 2 last
  const submitCertificateForm = async (base64Image: string) => {
    try {
      setIsLoading(true);

      const fileName = certificateImage?.name || "default_certificate.png";

      // Prepare the payload to match the server schema
      const payload = {
        owner_id: session?.user?.id || "",
        certificate_data_url: base64Image ? base64Image : "",
        title: certificateName,
        description,
        file_name: certificateImage?.name || fileName,
        expirationDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 100)
        ).toISOString(),
        isRevocable: true,
        metadata: {
          courseName: selectedCourse?.label || "",
          instructor: session?.user?.name || "",
          courseDuration: "6 months",
          file_name: certificateImage?.name || "certificateImage.png",
        },
        is_enabled: isEnabled !== null ? isEnabled : true,
        orientation: orientationOption?.value ?? "landscape",
        max_download: maxDownloads !== "" ? Number(maxDownloads) : 1,
        is_deleted: false,
        course_id: selectedCourse?.value || "",
      };

      const response = await fetch("/api/certificates/save-mine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log("response", response);

      const responseData = await response.json();

      if (response.status === 409) {
        // Handle the case where the certificate already exists
        showAlert("error", "A certificate with this title already exists.");
        setFormErrors((prev) => ({
          ...prev,
          global: "A certificate with this title already exists.",
        }));
        return;
      }

      if (!response.ok) {
        showAlert("error", "Failed to save certificate");
        throw new Error(responseData.message || "Failed to save certificate");
      }

      showAlert("success", "Certificate saved successfully");
      // Navigate to the edit page for the created certificate
      const owner_id_response = responseData.owner_id;

      router.push(`/dashboards/certificates/edit/${owner_id_response}`);

      // Reset form fields
      setCertificateName("");
      setSelectedCourse(null);
      setEnabledOption(null);
      setOrientationOption(null);
      setMaxDownloads("");
      setDescription("");
      setCertificateImage(null);
    } catch (error) {
      console.error("Error saving certificate:", error);
      showAlert("error", "Error saving certificate");
      setFormErrors((prev) => ({
        ...prev,
        global: "An error occurred while saving the certificate.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const enabledOptions: Array<{ value: boolean; label: string }> = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ];

  const orientationOptions: Array<{
    value: "landscape" | "portrait";
    label: string;
  }> = [
    { value: "landscape", label: "Landscape" },
    { value: "portrait", label: "Portrait" },
  ];

  if (status === "loading") {
    return <p>Loading...</p>; // Show a loading state while checking authentication
  }

  return (
    <form
      className="flex flex-col min-h-screen text-sm text-blackColor dark:text-blackColor-dark leading-1.8"
      data-aos="fade-up"
      onSubmit={handleSubmit}
    >
      {formErrors.global && (
        <p className="text-sm text-red-500 mb-4">{formErrors.global}</p>
      )}
      {exitCer && (
        <p className="text-md p-2 rounded-sm bg-red-200 text-black-brerry-light mb-4">
          A certificate with this title already exists.
        </p>
      )}
      <div className="grid grid-cols-1 xl:grid-cols-2 mb-4 gap-y-4 gap-x-6">
        <div>
          <label
            htmlFor="certificateName"
            className="form-label flex items-center"
          >
            Certificate Name{" "}
            {formErrors.certificateName && (
              <span className="ml-[3px] flex items-center text-red-400">*</span>
            )}
          </label>
          <input
            type="text"
            id="certificateName"
            value={certificateName}
            onChange={(e) => {
              setCertificateName(e.target.value);
              clearError("certificateName");
            }}
            placeholder="Enter certificate name"
            className="form-input font-no"
          />
          {formErrors.certificateName && (
            <p className="text-xs ml-2 text-red-500 mt-1">
              {formErrors.certificateName}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="sessionCourse"
            className="form-label flex items-center"
          >
            Session/Course{" "}
            {formErrors.courseId && (
              <span className="ml-[3px] flex items-center text-red-400">*</span>
            )}
          </label>
          <Select
            options={coursesOptions}
            value={selectedCourse}
            onChange={(option) => {
              setSelectedCourse(option);
              clearError("courseId");
            }}
            placeholder="Select a course"
            className="mt-1 font-no"
          />
          {formErrors.courseId && (
            <p className="text-xs ml-2 text-red-500 mt-1">
              {formErrors.courseId}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="enabled" className="form-label">
            Enabled
          </label>
          <Select
            options={enabledOptions}
            value={enabledOption}
            onChange={(option) => {
              setEnabledOption(option);
              setIsEnabled(option?.value ?? true);
              clearError("enabled");
            }}
            placeholder="Select"
            className="mt-1 font-no"
          />
          {formErrors.enabled && (
            <p className="text-xs text-red-500 mt-1">{formErrors.enabled}</p>
          )}
        </div>

        <div>
          <label htmlFor="orientation" className="form-label">
            Orientation
          </label>
          <Select
            options={orientationOptions}
            value={orientationOption}
            onChange={(option) => {
              setOrientationOption(option);
              clearError("orientation");
            }}
            placeholder="Select Orientation"
            className="mt-1 font-no"
          />
          {formErrors.orientation && (
            <p className="text-xs text-red-500 mt-1">
              {formErrors.orientation}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="certificateImage"
            className="form-label flex items-center"
          >
            Certificate Image{" "}
            {formErrors.certificateImage && (
              <span className="ml-[3px] flex items-center text-red-400">*</span>
            )}
          </label>
          <input
            type="file"
            id="certificateImage"
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue file:text-white hover:file:bg-blue-light dark:file:bg-gray-700 dark:hover:file:bg-gray-600"
          />
          {imageError && (
            <p className="text-xs text-red-500 mt-1">{imageError}</p>
          )}
          {formErrors.certificateImage && (
            <p className="text-xs ml-2 text-red-500 mt-1">
              {formErrors.certificateImage}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="maxDownloads" className="form-label">
            Maximum Downloads
          </label>
          <input
            type="number"
            id="maxDownloads"
            value={maxDownloads}
            onChange={(e) => {
              setMaxDownloads(Number(e.target.value) || "");
              clearError("maxDownloads");
            }}
            placeholder="Enter maximum downloads"
            className="form-input font-no"
          />
          {formErrors.maxDownloads && (
            <p className="text-xs text-red-500 mt-1">
              {formErrors.maxDownloads}
            </p>
          )}
        </div>

        <div className="xl:col-span-2">
          <label htmlFor="description" className="form-label flex items-center">
            Description{" "}
            {formErrors.description && (
              <span className="ml-[3px] flex items-center text-red-400">*</span>
            )}
          </label>
          <ReactQuill
            id="description"
            value={description}
            onChange={(value) => {
              setDescription(value);
              clearError("description");
            }}
            placeholder="Enter description"
            className="mt-1 font-no"
            style={{ minHeight: "100px" }}
          />
          {formErrors.description && (
            <p className="text-xs ml-2 text-red-500 mt-1">
              {formErrors.description}
            </p>
          )}
        </div>
      </div>

      <div className="text-left mt-2">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue hover:bg-blueDark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

export default CertificateForm;