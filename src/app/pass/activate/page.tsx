"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSweetAlert from "@/hooks/useSweetAlert";

export default function ActivatePage() {
  const alert = useSweetAlert();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading"); // 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/auth/activate?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          alert("success", "Account Activated Successfully!");
          // Redirect after 5 seconds if activation is successful
          setTimeout(() => {
            router.push("/login");
          }, 5000);
        } else {
          setStatus("error");
          setErrorMessage(data.message);
          alert("error", data.message);
        }
      } catch (error) {
        setStatus("error");
        setErrorMessage("An error occurred during account activation.");
        alert("error", "Activation Failed");
      }
    };

    if (token) {
      verifyToken();
    } else {
      setStatus("error");
      setErrorMessage("Invalid activation link.");
      alert("error", "Invalid activation link.");
    }
  }, [alert, router, token]);

  const handleResendActivation = async () => {
    setResending(true);
    try {
      const response = await fetch(`/api/auth/resend-activation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("success", "Activation link resent successfully. Please check your email.");
      } else {
        alert("error", `Failed to resend activation link: ${data.message}`);
      }
    } catch (error) {
      alert("error", "An error occurred while resending the activation link.");
    } finally {
      setResending(false);
    }
  };

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-lg">
        {status === "success" ? (
          <>
            <div className="mb-6">
              <svg
                aria-hidden="true"
                className="mx-auto w-16 h-16 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586l-2.293-2.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">
              Account Activated Successfully!
            </h1>
            <p className="text-gray-600">
              Your account has been successfully activated. You can now log in to your account.
            </p>
            <p className="text-gray-600 mt-2">
              You will be redirected to the login page shortly.
            </p>
          </>
        ) : (
          <>
            <div className="mb-6">
              <svg
                aria-hidden="true"
                className="mx-auto w-16 h-16 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11h2v4H9v-4zm0 6h2v2H9v-2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">
              Activation Failed
            </h1>
            <p className="text-gray-600">{errorMessage}</p>
            <p className="text-gray-600 mt-2">
              If you didn’t receive an email, you can resend the activation link.
            </p>
            <button
              onClick={handleResendActivation}
              disabled={resending}
              className="mt-4 bg-blue text-white px-4 py-2 rounded-lg hover:bg-blue.50"
            >
              {resending ? "Resending..." : "Resend Activation Link"}
            </button>
          </>
        )}
        <button
          onClick={() => router.push("/login")}
          className="mt-6 ml-4 bg-blue text-white px-4 py-2 rounded-lg hover:bg-blue/50"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}
