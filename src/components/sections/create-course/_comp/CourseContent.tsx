import React, { useState, useEffect } from "react";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import ImageField from "./ImageField";
import useSweetAlert from "@/hooks/useSweetAlert";
import { useSession } from "next-auth/react";
import VideoField from "./VideoField";
import Loader from "./Icons/Loader";
import dynamic from "next/dynamic";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import { Session } from "next-auth";

const CourseContent = ({ setCourseId, initialData, isEditMode = false }) => {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [regularPrice, setRegularPrice] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [category, setCategory] = useState("");
  const [offer, setOffer] = useState("paid");
  const [imagePath, setImagePath] = useState("");
  const [videoPath, setVideoPath] = useState(""); // Manage videoPath properly
  const [description, setDescription] = useState(""); // Rich text description state
  const showAlert = useSweetAlert();
  const { data: session } = useSession() as { data: Session | null };
  const [isLoading, setIsLoading] = useState(false);

  // // Log initial data for debugging
  // useEffect(() => {
  //   console.log("Initial Data:", initialData);
  // }, [initialData]);

  // Update state when initialData is received or changed
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setSlug(initialData.slug || "");
      setRegularPrice(initialData.price?.toString() || "");
      setEstimatedPrice(initialData.estimatedPrice?.toString() || "");
      setCategory(initialData.categories || "");
      setOffer(initialData.isFree ? "Free" : "paid");
      setImagePath(initialData.thumbnail || "");
      setVideoPath(initialData.demoVideoUrl || ""); // Correctly set the initial video URL
      setDescription(initialData.description || "");
    }
  }, [initialData]);

  // Auto-generate slug based on the title
  useEffect(() => {
    if (!isEditMode) {
      const generatedSlug = title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric characters with hyphen
        .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

      setSlug(generatedSlug);
    }
  }, [title, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const regularPriceValue = parseFloat(regularPrice);
    const estimatedPriceValue = parseFloat(estimatedPrice);

    // Validate required fields
    if (!title || !regularPriceValue || !description || !category || !imagePath || !videoPath) {
      showAlert("error", "Please fill out all required fields.");
      return;
    }

    // Validate prices
    if (isNaN(regularPriceValue) || regularPriceValue <= 0) {
      showAlert("error", "Please enter a valid regular price.");
      return;
    }

    if (estimatedPrice && (isNaN(estimatedPriceValue) || estimatedPriceValue <= 0)) {
      showAlert("error", "Please enter a valid estimated price.");
      return;
    }

    if (estimatedPriceValue < regularPriceValue) {
      showAlert("error", "Estimated price cannot be greater than the regular price.");
      return;
    }

    // Prepare course data for submission
    const courseData = {
      title,
      slug,
      lesson: title,
      duration: "0 hours",
      price: regularPriceValue.toFixed(2),
      estimatedPrice: estimatedPriceValue ? estimatedPriceValue.toFixed(2) : null,
      isFree: offer === "Free",
      tag: slug,
      skillLevel: "Beginner",
      categories: category,
      insName: session?.user?.name || "Unknown Instructor",
      thumbnail: imagePath,
      userId: session?.user?.id || "",
      demoVideoUrl: videoPath, // Make sure videoPath is included
      description: description || "", // Pass rich text content
    };

    try {
      setIsLoading(true);
      const response = await fetch(isEditMode ? `/api/courses/${initialData.id}` : "/api/courses", {
        method: isEditMode ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.id}`,
        },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        const result = await response.json();
        if (isEditMode) {
          showAlert("success", "Course updated successfully!");
        } else {
          setCourseId(result.course.id); // Assuming API returns the created course's ID
          showAlert("success", "Course created successfully!");
        }
        setIsLoading(false);
      } else {
        const errorData = await response.json();
        showAlert("error", `Failed to ${isEditMode ? "update" : "create"} course: ${errorData.message || "Unknown error"}`);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.error("An error occurred:", error);
      showAlert("error", "An error occurred. Please try again.");
    }
  };

  return (
    <div className="overflow-y-auto max-h-150 accordion-content transition-all duration-500 overflow-hidden">
      <div className="content-wrapper py-4 px-5">
        <form
          className="p-10px md:p-10 lg:p-5 2xl:p-10 bg-darkdeep3 dark:bg-transparent text-sm text-blackColor dark:text-blackColor-dark leading-1.8"
          data-aos="fade-up"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 mb-15px gap-15px">
            <div>
              <label className="mb-3 block font-semibold">Course Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Course Title"
                className="w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no"
              />
            </div>
            <div>
              <label className="mb-3 block font-semibold">Course Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Course Slug"
                className="w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no"
                disabled={isEditMode} // Disable editing slug in edit mode
              />
            </div>
            <div>
              <label className="mb-3 block font-semibold">Regular Price ($)</label>
              <input
                type="number"
                value={regularPrice}
                onChange={(e) => setRegularPrice(e.target.value)}
                placeholder="Regular Price ($)"
                className="w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="mb-3 block font-semibold">Estimated Price ($)</label>
              <input
                type="number"
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(e.target.value)}
                placeholder="Estimated Price ($)"
                className="w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md"
                min="0"
                step="0.01"
              />
            </div>
            {/* Rich Text Editor for Description */}
            <div>
              <label className="mb-3 block font-semibold">Course Description</label>
              <ReactQuill
                theme="snow"
                value={description}
                onChange={setDescription}
                placeholder="Enter course description"
                className="bg-whiteColor dark:bg-whiteColor-dark"
              />
            </div>
            {/* Category Input */}
            <div>
              <label className="text-xs uppercase text-placeholder block font-semibold text-opacity-50 leading-1.8">
                Category
              </label>
              <div className="bg-whiteColor relative rounded-md">
                <input
                  list="categories"
                  className="text-base bg-transparent text-blackColor2 w-full p-13px pr-30px focus:outline-none block appearance-none relative z-20 focus:shadow-select rounded-md"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Select or type a category"
                />
                <datalist id="categories">
                  <option value="All" />
                  <option value="Web Design" />
                  <option value="Graphic" />
                  <option value="English" />
                  <option value="Spoken English" />
                  <option value="Art Painting" />
                  <option value="App Development" />
                  <option value="Web Application" />
                  <option value="Php Development" />
                </datalist>
                <i className="icofont-simple-down absolute top-1/2 right-3 -translate-y-1/2 block text-lg z-10"></i>
              </div>
            </div>
            <div>
              <label className="text-xs uppercase text-placeholder block font-semibold text-opacity-50 leading-1.8">
                Short by Offer
              </label>
              <div className="bg-whiteColor relative rounded-md">
                <select
                  className="text-base bg-transparent text-blackColor2 w-full p-13px pr-30px focus:outline-none block appearance-none relative z-20 focus:shadow-select rounded-md"
                  value={offer}
                  onChange={(e) => setOffer(e.target.value)}
                >
                  <option value="paid">Paid</option>
                  <option value="Free">Free</option>
                </select>
                <i className="icofont-simple-down absolute top-1/2 right-3 -translate-y-1/2 block text-lg z-10"></i>
              </div>
            </div>
            {/* Video Upload Field */}
            <VideoField
              setVideoPath={setVideoPath}
              showAlert={showAlert}
              labelText={"Demo Video"}
              initialVideoUrl={videoPath}
            />
          </div>
          {/* Image Field */}
          <ImageField
            setImagePath={setImagePath}
            showAlert={showAlert}
            initialImagePath={imagePath}
          />
          <div className="mt-15px">
            <ButtonPrimary type="submit">
              {isLoading ? <Loader text={isEditMode ? "Updating..." : "Creating..."} /> : isEditMode ? "Update" : "Save"}
            </ButtonPrimary>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseContent;




// import React, { useState, useEffect } from "react";
// import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
// import ImageField from "./ImageField";
// import useSweetAlert from "@/hooks/useSweetAlert";
// import { useSession } from "next-auth/react";
// import VideoField from "./VideoField";
// import Loader from "./Icons/Loader";
// import { Session } from "next-auth";
// import dynamic from "next/dynamic";

// // Dynamically import ReactQuill to avoid SSR issues
// const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
// import "react-quill/dist/quill.snow.css"; // Import Quill styles

// interface Props {
//   setCourseId: (courseId: string) => void;
// }

// const CourseContent: React.FC<Props> = ({ setCourseId }) => {
//   const [title, setTitle] = useState("");
//   const [slug, setSlug] = useState("");
//   const [regularPrice, setRegularPrice] = useState("");
//   const [estimatedPrice, setEstimatedPrice] = useState("");
//   const [category, setCategory] = useState("");
//   const [offer, setOffer] = useState("premium");
//   const [imagePath, setImagePath] = useState("");
//   const [videoPath, setVideoPath] = useState("");
//   const [description, setDescription] = useState(""); // Rich text description state
//   const showAlert = useSweetAlert();
//   const { data: session } = useSession() as { data: Session | null };
//   const [isLoading, setIsLoading] = useState(false);

//   // Auto-generate slug based on the title
//   useEffect(() => {
//     const generatedSlug = title
//       .trim()
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric characters with hyphen
//       .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

//     setSlug(generatedSlug);
//   }, [title]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const regularPriceValue = parseFloat(regularPrice);
//     const estimatedPriceValue = parseFloat(estimatedPrice);

//     // Validate required fields
//     if (!title || !regularPriceValue || !description || !category || !imagePath || !videoPath) {
//       showAlert("error", "Please fill out all required fields.");
//       return;
//     }

//     // Validate prices
//     if (isNaN(regularPriceValue) || regularPriceValue <= 0) {
//       showAlert("error", "Please enter a valid regular price.");
//       return;
//     }

//     if (estimatedPrice && (isNaN(estimatedPriceValue) || estimatedPriceValue <= 0)) {
//       showAlert("error", "Please enter a valid estimated price.");
//       return;
//     }

//     if (estimatedPriceValue > regularPriceValue) {
//       showAlert("error", "Estimated price cannot be greater than the regular price.");
//       return;
//     }

//     // Prepare course data for submission
//     const courseData = {
//       title,
//       slug,
//       lesson: title,
//       duration: "0 hours",
//       price: regularPriceValue.toFixed(2),
//       estimatedPrice: estimatedPriceValue ? estimatedPriceValue.toFixed(2) : null,
//       isFree: offer === "Free",
//       tag: slug,
//       skillLevel: "Beginner",
//       categories: category,
//       insName: session?.user?.name || "Unknown Instructor",
//       thumbnail: imagePath,
//       userId: session?.user?.id || "",
//       demoVideoUrl: videoPath,
//       description: description || "", // Pass rich text content
//     };

//     try {
//       setIsLoading(true);
//       const response = await fetch("/api/courses", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${session?.user?.id}`,
//         },
//         body: JSON.stringify(courseData),
//       });

//       if (response.ok) {
//         const result = await response.json();
//         setCourseId(result.course.id); // Assuming API returns the created course's ID
//         showAlert("success", "Course created successfully!");
//         setIsLoading(false);
//       } else {
//         showAlert("error", "Failed to create course.");
//       }
//     } catch (error) {
//       setIsLoading(false);
//       console.error("An error occurred:", error);
//       showAlert("error", error.message);
//     }
//   };

//   return (
//     <div className=" overflow-y-auto max-h-150 accordion-content transition-all duration-500 overflow-hidden">
//       <div className="content-wrapper py-4 px-5">
//         <form
//           className="p-10px md:p-10 lg:p-5 2xl:p-10 bg-darkdeep3 dark:bg-transparent text-sm text-blackColor dark:text-blackColor-dark leading-1.8"
//           data-aos="fade-up"
//           onSubmit={handleSubmit}
//         >
//           <div className="grid grid-cols-1 mb-15px gap-15px">
//             <div>
//               <label className="mb-3 block font-semibold">Course Title</label>
//               <input
//                 type="text"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 placeholder="Course Title"
//                 className="w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no"
//               />
//             </div>
//             <div>
//               <label className="mb-3 block font-semibold">Course Slug</label>
//               <input
//                 type="text"
//                 value={slug}
//                 onChange={(e) => setSlug(e.target.value)}
//                 placeholder="Course Slug"
//                 className="w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no"
//               />
//             </div>
//             <div>
//               <label className="mb-3 block font-semibold">Regular Price ($)</label>
//               <input
//                 type="text"
//                 value={regularPrice}
//                 onChange={(e) => setRegularPrice(e.target.value)}
//                 placeholder="Regular Price ($)"
//                 className="w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md font-no"
//               />
//             </div>
//             <div>
//               <label className="mb-3 block font-semibold">Estimated Price ($)</label>
//               <input
//                 type="text"
//                 value={estimatedPrice}
//                 onChange={(e) => setEstimatedPrice(e.target.value)}
//                 placeholder="Estimated Price ($)"
//                 className="w-full py-10px px-5 text-sm focus:outline-none text-contentColor dark:text-contentColor-dark bg-whiteColor dark:bg-whiteColor-dark border-2 border-borderColor dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 leading-23px rounded-md"
//               />
//             </div>
//             {/* Rich Text Editor for Description */}
//             <div>
//               <label className="mb-3 block font-semibold">Course Description</label>
//               <ReactQuill
//                 theme="snow"
//                 value={description}
//                 onChange={setDescription}
//                 placeholder="Enter course description"
//                 className="bg-whiteColor dark:bg-whiteColor-dark"
//               />
//             </div>
//             {/* Category Input */}
//             <div>
//               <label className="text-xs uppercase text-placeholder block font-semibold text-opacity-50 leading-1.8">
//                 Category
//               </label>
//               <div className="bg-whiteColor relative rounded-md">
//                 <input
//                   list="categories"
//                   className="text-base bg-transparent text-blackColor2 w-full p-13px pr-30px focus:outline-none block appearance-none relative z-20 focus:shadow-select rounded-md"
//                   value={category}
//                   onChange={(e) => setCategory(e.target.value)}
//                   placeholder="Select or type a category"
//                 />
//                 <datalist id="categories">
//                   <option value="All" />
//                   <option value="Web Design" />
//                   <option value="Graphic" />
//                   <option value="English" />
//                   <option value="Spoken English" />
//                   <option value="Art Painting" />
//                   <option value="App Development" />
//                   <option value="Web Application" />
//                   <option value="Php Development" />
//                 </datalist>
//                 <i className="icofont-simple-down absolute top-1/2 right-3 -translate-y-1/2 block text-lg z-10"></i>
//               </div>
//             </div>
//             <div>
//               <label className="text-xs uppercase text-placeholder block font-semibold text-opacity-50 leading-1.8">
//                 Short by Offer
//               </label>
//               <div className="bg-whiteColor relative rounded-md">
//                 <select
//                   className="text-base bg-transparent text-blackColor2 w-full p-13px pr-30px focus:outline-none block appearance-none relative z-20 focus:shadow-select rounded-md"
//                   value={offer}
//                   onChange={(e) => setOffer(e.target.value)}
//                 >
//                   <option value="paid">Paid</option>
//                   <option value="Free">Free</option>
//                 </select>
//                 <i className="icofont-simple-down absolute top-1/2 right-3 -translate-y-1/2 block text-lg z-10"></i>
//               </div>
//             </div>
//             {/* Video Upload Field */}
//             <VideoField setVideoPath={setVideoPath} showAlert={showAlert} labelText={"Demo Video"} />
//           </div>
//           {/* Image Field */}
//           <ImageField setImagePath={setImagePath} showAlert={showAlert} />
//           <div className="mt-15px">
//             <ButtonPrimary type="submit">
//               {isLoading ? <Loader text="Creating..." /> : "Save"}
//             </ButtonPrimary>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CourseContent;

