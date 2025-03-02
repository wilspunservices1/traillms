"use client"
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import Link from "next/link";
import { useEffect, useState } from "react";

// export const metadata = {
//   title: "Account Activated | Meridian LMS - Education LMS Template",
//   description: "Account Activated | Meridian LMS - Education LMS Template",
// };

const ActivationSuccess = () => {
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Simulate a successful operation or error handling
    } catch (err) {
      setError("An error occurred during activation.");
    }
  }, []);

  return (
    <PageWrapper>
      <main className="flex justify-center items-center h-screen">
        <div className="bg-white p-8 rounded-lg shadow-md">
          {error ? (
            <>
              <h1 className="text-2xl font-bold mb-4">Activation Error</h1>
              <p className="mb-4">{error}</p>
              <Link href="/login">
                <p className="text-blue-500 hover:underline">Go to Login</p>
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-4">Account Activated Successfully!</h1>
              <p className="mb-4">Your account has been activated. You can now log in.</p>
              <Link href="/login">
                <p className="text-blue-500 hover:underline">Go to Login</p>
              </Link>
            </>
          )}
        </div>
      </main>
    </PageWrapper>
  );
};

export default ActivationSuccess;
