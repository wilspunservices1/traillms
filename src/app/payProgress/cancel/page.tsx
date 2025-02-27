"use client";
import Link from "next/link";
import { useEffect } from "react";

const CancelPage = () => {
  useEffect(() => {
    // Optionally: Handle any post-cancellation actions like clearing session
    console.log("Payment was canceled by the user.");
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-5">
          Payment Canceled!
        </h1>
        <p className="text-lg mb-8">
          Your payment has been canceled. Feel free to try again or contact support if you need assistance.
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

export default CancelPage;
