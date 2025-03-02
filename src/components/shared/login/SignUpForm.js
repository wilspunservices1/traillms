"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SignUpForm = () => {
  const [formState, setFormState] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    error: "",
    success: "",
    isLoading: false,
    acceptedTerms: false,
  });

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormState({ ...formState, isLoading: true, error: "", success: "" });

    // Basic validation
    if (formState.password !== formState.confirmPassword) {
      setFormState({
        ...formState,
        error: "Passwords do not match.",
        isLoading: false,
      });
      return;
    }

    if (!formState.acceptedTerms) {
      setFormState({
        ...formState,
        error: "You must accept the Terms and Privacy Policy.",
        isLoading: false,
      });
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formState.username,
          email: formState.email,
          password: formState.password,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFormState({
          ...formState,
          success: "Registration successful! Please check your email to activate your account.",
          isLoading: false,
        });
        setTimeout(() => {
          router.push("/login");
        }, 5000); // Redirect to login after 5 seconds
      } else {
        setFormState({
          ...formState,
          error: data.message || "An error occurred during registration.",
          isLoading: false,
        });
      }
    } catch (error) {
      setFormState({
        ...formState,
        error: "An error occurred. Please try again later.",
        isLoading: false,
      });
    }
  };

  return (
    <div className="transition-opacity duration-150 ease-linear">
      {/* heading */}
      <div className="text-center">
        <h3 className="text-size-32 font-bold text-blackColor dark:text-blackColor-dark mb-2 leading-normal">
          Sign Up
        </h3>
        <p className="text-contentColor dark:text-contentColor-dark mb-5px">
          Already have an account?
          <Link
            href="/login"
            className="hover:text-primaryColor relative after:absolute after:left-0 after:bottom-0.5 after:w-0 after:h-0.5 after:bg-primaryColor after:transition-all after:duration-300 hover:after:w-full"
          >
            Log In
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="pt-5px" data-aos="fade-up">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-30px gap-y-25px mb-25px">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={formState.username}
              onChange={(e) =>
                setFormState({ ...formState, username: e.target.value })
              }
              className="w-full h-52px leading-52px pl-5 bg-transparent text-sm focus:outline-none text-contentColor dark:text-contentColor-dark border dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 font-medium rounded"
              required
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Your Email"
              value={formState.email}
              onChange={(e) =>
                setFormState({ ...formState, email: e.target.value })
              }
              className="w-full h-52px leading-52px pl-5 bg-transparent text-sm focus:outline-none text-contentColor dark:text-contentColor-dark border dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 font-medium rounded"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-30px gap-y-25px mb-25px">
          <div>
            <input
              type="password"
              placeholder="Password"
              value={formState.password}
              onChange={(e) =>
                setFormState({ ...formState, password: e.target.value })
              }
              className="w-full h-52px leading-52px pl-5 bg-transparent text-sm focus:outline-none text-contentColor dark:text-contentColor-dark border dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 font-medium rounded"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Re-Enter Password"
              value={formState.confirmPassword}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  confirmPassword: e.target.value,
                })
              }
              className="w-full h-52px leading-52px pl-5 bg-transparent text-sm focus:outline-none text-contentColor dark:text-contentColor-dark border dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 font-medium rounded"
              required
            />
          </div>
        </div>

        <div className="text-contentColor dark:text-contentColor-dark flex items-center">
          <input
            type="checkbox"
            id="accept-pp"
            checked={formState.acceptedTerms}
            onChange={(e) =>
              setFormState({
                ...formState,
                acceptedTerms: e.target.checked,
              })
            }
            className="w-18px h-18px mr-2 block box-content"
          />
          <label htmlFor="accept-pp">Accept the Terms and Privacy Policy</label>
        </div>

        {/* Error Message */}
        {formState.error && (
          <p className="text-red-500 text-center mt-4">{formState.error}</p>
        )}

        {/* Success Message */}
        {formState.success && (
          <p className="text-green-500 text-center mt-4">
            {formState.success}
          </p>
        )}

        {/* Loader */}
        {formState.isLoading && (
          <div className="flex justify-center my-4">
            <div role="status">
              <svg
                aria-hidden="true"
                className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}

        <div className="mt-25px text-center">
          <button
            type="submit"
            className="text-size-15 text-whiteColor bg-primaryColor px-25px py-10px w-full border border-primaryColor hover:text-primaryColor hover:bg-whiteColor inline-block rounded group dark:hover:text-whiteColor dark:hover:bg-whiteColor-dark"
            disabled={formState.isLoading}
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUpForm;
