"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchUserDetailsFromApi } from "@/actions/getUser";
import { formatDate } from "@/actions/formatDate";
import { useRouter } from "next/navigation";

const UserDetails = () => {
  const { data: session } = useSession();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  if(!session) {
    router.push("/login");
  }

  useEffect(() => {
    async function getUserDetails() {
      if (session?.user?.id) {
        try {
          const user = await fetchUserDetailsFromApi(session.user.id);
          setUserDetails(user);
        } catch (error) {
          console.error("Failed to fetch user details:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    getUserDetails();
  }, [session]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userDetails) {
    return <div>User details not found.</div>;
  }

  const user = userDetails;



  return (
    <div>
      <ul>
        <li className="text-lg text-contentColor dark:text-contentColor-dark leading-1.67 grid grid-cols-1 md:grid-cols-12 gap-x-30px">
          <div className="md:col-start-1 md:col-span-4">
            <span className="inline-block">Registration Date</span>
          </div>
          <div className="md:col-start-5 md:col-span-8">
            <span className="inline-block">
              {formatDate(userDetails.createdAt) || "20, January 2024 9:00 PM"}
            </span>
          </div>
        </li>

        <li className="text-lg text-contentColor dark:text-contentColor-dark leading-1.67 grid grid-cols-1 md:grid-cols-12 gap-x-30px mt-15px">
          <div className="md:col-start-1 md:col-span-4">
            <span className="inline-block">First Name</span>
          </div>
          <div className="md:col-start-5 md:col-span-8">
            <span className="inline-block">{user.name.split(" ")[0]}</span>
          </div>
        </li>
        <li className="text-lg text-contentColor dark:text-contentColor-dark leading-1.67 grid grid-cols-1 md:grid-cols-12 gap-x-30px mt-15px">
          <div className="md:col-start-1 md:col-span-4">
            <span className="inline-block">Last Name</span>
          </div>
          <div className="md:col-start-5 md:col-span-8">
            <span className="inline-block"></span>
            {user.name && user.name.split(" ").length > 1 ? user.name.split(" ")[1] : "N/A"}
          </div>
        </li>

        <li className="text-lg text-contentColor dark:text-contentColor-dark leading-1.67 grid grid-cols-1 md:grid-cols-12 gap-x-30px mt-15px">
          <div className="md:col-start-1 md:col-span-4">
            <span className="inline-block">Username</span>
          </div>
          <div className="md:col-start-5 md:col-span-8">
            <span className="inline-block">{user.username || "No username"}</span>
          </div>
        </li>

        <li className="text-lg text-contentColor dark:text-contentColor-dark leading-1.67 grid grid-cols-1 md:grid-cols-12 gap-x-30px mt-15px">
          <div className="md:col-start-1 md:col-span-4">
            <span className="inline-block">Email</span>
          </div>
          <div className="md:col-start-5 md:col-span-8">
            <span className="inline-block">{user.email}</span>
          </div>
        </li>

        <li className="text-lg text-contentColor dark:text-contentColor-dark leading-1.67 grid grid-cols-1 md:grid-cols-12 gap-x-30px mt-15px">
          <div className="md:col-start-1 md:col-span-4">
            <span className="inline-block">Phone Number</span>
          </div>
          <div className="md:col-start-5 md:col-span-8">
            <span className="inline-block">{user.phone ? user.phone : "N/A"}</span>
          </div>
        </li>

        <li className="text-lg text-contentColor dark:text-contentColor-dark leading-1.67 grid grid-cols-1 md:grid-cols-12 gap-x-30px mt-15px">
          {/* Label Section */}
          <div className="  md:col-start-1 md:col-span-4  md:w-32">
            <span className="inline-block">Expertise</span>
          </div>

          {/* Expertise Badges Section */}
          <div className="flex flex-wrap gap-2 md:col-start-5 md:col-span-8">
            {user.expertise && user.expertise.length > 0 ? (
              user.expertise.map((exp, index) => (
                <span
                  key={index}
                  className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 px-3 py-1 rounded-md text-sm shadow-sm"
                >
                  {exp}
                </span>
              ))
            ) : (
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                No expertise listed.
              </span>
            )}
          </div>
        </li>




        <li className="text-lg text-contentColor dark:text-contentColor-dark leading-1.67 grid grid-cols-1 md:grid-cols-12 gap-x-30px mt-15px">
          <div className="md:col-start-1 md:col-span-4">
            <span className="inline-block">Biography</span>
          </div>
          <div className="md:col-start-5 md:col-span-8">
            <span className="inline-block">{user.biography}</span>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default UserDetails;
