"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const SuccessPage = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Example: Check if there's anything to do post-success
      console.log("Payment was successful!");
    } catch (err) {
      // Handle any unexpected errors
      setError("An error occurred while processing your payment.");
    }
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-10 rounded-lg shadow-md text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-5">Error!</h1>
          <p className="text-lg mb-8">{error}</p>
          <Link href="/">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-all">
              Return to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-5">Success!</h1>
        <p className="text-lg mb-8">
          Thank you for your purchase! Your payment was successful.
        </p>
        <Link href="/">
          <button className="bg-blue text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-all">
            Return to Home
          </button>
        </Link>
      </div>
    </div>
  );
};

export default SuccessPage;
