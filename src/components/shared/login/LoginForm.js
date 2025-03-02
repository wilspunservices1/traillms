"use client"

import { getCsrfToken, signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const LoginForm = ({ csrfToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState("Log in");
  const [error, setError] = useState(""); // Ensure this is a string
  const router = useRouter();

  const signInOAuth = async (provider) => {
    try {
      setLoading("...");
      const res = await signIn(provider, { callbackUrl: "/" });

      if (!res?.error) {
        router.push("/");
      } else {
        setError(`Failed to login with ${provider}`);
      }
      setLoading("Log in");
    } catch (err) {
      setLoading("Log in");
      setError(err.message || "An unexpected error occurred");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading("...");
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: "/",
      });

      setLoading("Log in");

      if (res?.error) {
        // Handle specific error messages
        if (res.error.includes("verify your email")) {
          setError("Please verify your email before logging in.");
        } else if (res.error.includes("No user found")) {
          setError("No user found with this email.");
        } else if (res.error.includes("Password does not match")) {
          setError("Invalid email or password.");
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      } else {
        router.push("/");
      }
    } catch (err) {
      setLoading("Log in");
      setError(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="opacity-100 transition-opacity duration-150 ease-linear">
      <div className="text-center">
        <h3 className="text-size-32 font-bold text-blackColor dark:text-blackColor-dark mb-2 leading-normal">
          Login
        </h3>
        <p className="text-contentColor dark:text-contentColor-dark mb-15px">
          {"Don't"} have an account yet?
          <Link
            href="/register"
            className="hover:text-primaryColor relative after:absolute after:left-0 after:bottom-0.5 after:w-0 after:h-0.5 after:bg-primaryColor after:transition-all after:duration-300 hover:after:w-full"
          >
            Sign up for free
          </Link>
        </p>
      </div>

      <form className="pt-25px" onSubmit={handleSubmit} data-aos="fade-up">
        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

        <div className="mb-25px">
          <input
            name="email"
            type="email"
            placeholder="Your username or email"
            className="w-full h-52px leading-52px pl-5 bg-transparent text-sm focus:outline-none text-contentColor dark:text-contentColor-dark border  dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 font-medium rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-25px">
          <input
            name="password"
            type="password"
            placeholder="Password"
  autocomplete="current-password"  
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-52px leading-52px pl-5 bg-transparent text-sm focus:outline-none text-contentColor dark:text-contentColor-dark border  dark:border-borderColor-dark placeholder:text-placeholder placeholder:opacity-80 font-medium rounded"
          />
        </div>

        {error && (
          <p className="text-center bg-red-300 py-4 rounded">{error}</p>
        )}

        <div className="text-contentColor dark:text-contentColor-dark flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              className="w-18px h-18px mr-2 block box-content"
            />
            <label htmlFor="remember"> Remember me</label>
          </div>
          <div>
            <Link
              href="/pass/forget"
              className="hover:text-primaryColor relative after:absolute after:left-0 after:bottom-0.5 after:w-0 after:h-0.5 after:bg-primaryColor after:transition-all after:duration-300 hover:after:w-full"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <div className="my-25px text-center">
          <button
            type="submit"
            className="text-size-15 text-whiteColor bg-primaryColor px-25px py-10px w-full border border-primaryColor hover:text-primaryColor hover:bg-whiteColor inline-block rounded group dark:hover:text-whiteColor dark:hover:bg-whiteColor-dark"
          >
            {loading}
          </button>
        </div>

        {/* Social Logins */}
        <div>
          <p className="text-contentColor dark:text-contentColor-dark text-center relative mb-15px before:w-2/5 before:h-1px before:bg-borderColor4 dark:before:bg-borderColor2-dark before:absolute before:left-0 before:top-4 after:w-2/5 after:h-1px after:bg-borderColor4 dark:after:bg-borderColor2-dark after:absolute after:right-0 after:top-4">
            or Log-in with
          </p>
        </div>
        <div className="text-center flex gap-x-1 md:gap-x-15px lg:gap-x-25px gap-y-5 items-center justify-center flex-wrap">
          <button
            type="button"
            onClick={() => signInOAuth("google")}
            className="text-size-15   px-5 py-6px border border-primaryColor hover:text-primaryColor hover:bg-whiteColor inline-block rounded-full group dark:hover:text-whiteColor dark:hover:bg-whiteColor-dark"
          >
            <i className="icofont-google-plus text-red-500 text-lg"></i> Google
          </button>
          <button
            type="button"
            onClick={() => signInOAuth("github")}
            className="text-size-15   px-5 py-6px border border-primaryColor hover:text-primaryColor hover:bg-whiteColor inline-block rounded-full group dark:hover:text-whiteColor dark:hover:bg-whiteColor-dark"
          >
            <i className="icofont-github icofont-facebook text-lg text-primaryColor"></i>{" "}
            GitHub
          </button>
        </div>
      </form>
    </div>
  );
};

// Fetch the CSRF token on the server side
export async function getServerSideProps(context) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}

export default LoginForm;
