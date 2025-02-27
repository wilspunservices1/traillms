import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSweetAlert from "@/hooks/useSweetAlert";
import getStripe from "@/utils/loadStripe";
import { Session } from "next-auth";

type EnrollButtonProps = {
  currentCourseId: string;
  course: any;
};

const EnrollButton: React.FC<EnrollButtonProps> = ({
  currentCourseId,
  course,
}) => {
  const { title, price, thumbnail } = course || {};
  const { data: session } = useSession() as { data: Session | null };
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const creteAlert = useSweetAlert();
  const [error, setError] = useState("");

  console.log("course from checkout button",course)

  const handleEnrollClick = async () => {
    if (!session) {
      creteAlert("error", "You need to sign in to proceed with enrollment.");
      router.push("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const stripe = await getStripe();
      if (!stripe) throw new Error("Stripe not loaded");

      const items = [
        {
          name: title,
          price: parseFloat(price).toFixed(2),
          image: thumbnail,
          quantity: 1,
          courseId: currentCourseId,
        },
      ];

      const userEmail = session.user.email;

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, email: userEmail , userId: session.user.id}),
      });

      if (!response.ok) throw new Error("Failed to initiate checkout");

      const { sessionId } = await response.json();
      if (sessionId) await stripe.redirectToCheckout({ sessionId });
      else throw new Error("No sessionId returned from Stripe.");
    } catch (error) {
      setError(error.message || "Something went wrong during checkout.");
      creteAlert(
        "error",
        error.message || "Failed to enroll. Try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleEnrollClick}
      className={`w-full text-size-15 text-whiteColor bg-secondaryColor px-25px py-10px mb-10px leading-1.8 border border-secondaryColor hover:text-secondaryColor hover:bg-whiteColor inline-block rounded group dark:hover:text-secondaryColor dark:hover:bg-whiteColor-dark `}
      disabled={loading} // Disable if already enrolled or loading
    >
      {loading ? "Processing..." : "Enroll Now"}
    </button>
  );
};

export default EnrollButton;
