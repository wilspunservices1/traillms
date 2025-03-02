"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSweetAlert from "@/hooks/useSweetAlert";

export default function RequestPage({ params }: { params: { request: string } }) {
  const { request } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // Get the token from the query params

  const alert = useSweetAlert();

  const [formState, setFormState] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
    error: "",
    success: "",
    isLoading: false,
  });

  useEffect(() => {
    console.log("🚀 ~ RequestPage ~ request:", request);
    console.log("🚀 ~ RequestPage ~ token:", token);
  }, [request, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState({ ...formState, isLoading: true });

    if (request === "reset") {
      if (formState.newPassword !== formState.confirmPassword) {
        setFormState({
          ...formState,
          isLoading: false,
        });
        alert("error", "Passwords do not match.");
        return;
      }

      try {
        const res = await fetch(`/api/auth/reset-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            newPassword: formState.newPassword,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setFormState({
            ...formState,
            success: data.message,
            error: "",
            isLoading: false,
          });
          alert("success", data.message);
          router.push("/login");
        } else {
          setFormState({
            ...formState,
            error: data.error,
            success: "",
            isLoading: false,
          });
          alert("error", data.error);
        }
      } catch (error) {
        setFormState({
          ...formState,
          error: "An error occurred. Please try again later.",
          isLoading: false,
        });
        alert("error", "An error occurred. Please try again later.");
      }
    }

    if (request === "forget") {
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formState.email }),
        });

        const data = await res.json();
        if (res.ok) {
          setFormState({
            ...formState,
            success: data.message,
            error: "",
            isLoading: false,
          });
          alert("success", data.message);
        } else {
          setFormState({
            ...formState,
            error: data.error,
            success: "",
            isLoading: false,
          });
          alert("error", data.error);
        }
      } catch (error) {
        setFormState({
          ...formState,
          error: "An error occurred. Please try again later.",
          isLoading: false,
        });
        alert("error", "An error occurred. Please try again later.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">
          {request === "reset" ? "Reset Your Password" : "Forgot Password"}
        </h1>

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

        <form onSubmit={handleSubmit}>
          {request === "reset" && (
            <>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="new-password"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="new-password"
                  className="w-full px-3 py-2 border rounded"
                  value={formState.newPassword}
                  onChange={(e) =>
                    setFormState({ ...formState, newPassword: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="confirm-password"
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  className="w-full px-3 py-2 border rounded"
                  value={formState.confirmPassword}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </>
          )}

          {request === "forget" && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Enter Your Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 border rounded"
                value={formState.email}
                onChange={(e) =>
                  setFormState({ ...formState, email: e.target.value })
                }
                required
              />
            </div>
          )}

          <button
            type="submit"
            className={`w-full bg-blue ${
              formState.isLoading && "opacity-50 disabled:cursor-not-allowed"
            } text-white py-2 rounded hover:bg-blue-600`}
            disabled={formState.isLoading}
          >
            {request === "reset" ? "Reset Password" : "Submit"}
          </button>
        </form>

        {formState.success && request === "reset" && (
          <div className="mt-4">
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
