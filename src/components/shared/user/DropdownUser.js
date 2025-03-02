"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import DropdownWrapperSecondary from "@/components/shared/wrappers/DropdownWrapperSecondary";
import DropdownContainerSecondary from "@/components/shared/containers/DropdownContainerSecondary";
// import { useSession } from "next-auth/react";
import { useSession, signOut } from "next-auth/react";

const DropdownUser = () => {
  const { data: session } = useSession();

  // Determine the preferred role (admin > instructor > user)
  const preferredRole = session?.user?.roles?.includes("admin")
    ? "admin"
    : session?.user?.roles?.includes("instructor")
      ? "instructor"
      : "user"; // default to user if no admin or instructor role is found

  const dashboardPath =
    preferredRole === "admin"
      ? "/dashboards/admin-dashboard"
      : preferredRole === "instructor"
        ? "/dashboards/instructor-dashboard"
        : "/dashboards/student-dashboard";

  return (
    <>
      <div className="relative">
        {/* <p>HI {session?.user?.name}</p> */}
        <Link href="">
          {/* <Image
            src={"/default-avatar.png"}
            alt="User Avatar"
            className="rounded-full w-10 h-10"
            width={40}
            height={40}
          /> */}
          <div
            //rounded-standard block
            className="text-size-12 w-10 items-center flex justify-center h-10 rounded-md 2xl:text-size-15 px-15px py-2 text-blackColor hover:text-whiteColor bg-whiteColor  hover:bg-primaryColor border border-borderColor1  font-semibold mr-[7px] 2xl:mr-15px dark:text-blackColor-dark dark:bg-whiteColor-dark dark:hover:bg-primaryColor dark:hover:text-whiteColor dark:hover:border-primaryColor"
          >
            <i className="icofont-user-alt-5"></i>
            <span className="top-0 left-7 absolute  w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
          </div>
        </Link>

        <DropdownWrapperSecondary>
          <DropdownContainerSecondary>
            {session ? (
              <ul className="flex flex-col gap-y-5 pb-5 mb-30px border-b border-borderColor dark:border-borderColor-dark">
                <li className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  <div>{session.user?.name}</div>
                  <div className="font-medium truncate">
                    {session.user?.email}
                  </div>
                </li>
                <li className="">
                  <Link
                    href={dashboardPath}
                    className="block w-full cursor-pointer select-none items-center gap-2 rounded-md px-3 pt-[9px] pb-2 text-start leading-tight outline-none transition-all hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900 text-sm text-darkblack hover:text-secondaryColor dark:text-darkblack-dark dark:hover:text-secondaryColor"
                  >
                    <div className="flex items-center text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="feather feather-home"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                      <span className="truncate pl-2">Dashboard</span>
                    </div>
                  </Link>
                </li>
                <li className="">
                  <Link
                    href="/dashboards/student-settings"
                    className=" block w-full cursor-pointer select-none items-center gap-2 rounded-md px-3 pt-[9px] pb-2 text-start leading-tight outline-none transition-all hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900 text-sm text-darkblack hover:text-secondaryColor  dark:text-darkblack-dark dark:hover:text-secondaryColor"
                  >
                    <i className="icofont-settings"></i>
                    <span className="truncate pl-2">Settings</span>
                  </Link>
                </li>
                <li className="">
                  <button
                    onClick={() => signOut()}
                    className=" block w-full cursor-pointer select-none items-center gap-2 rounded-md px-3 pt-[9px] pb-2 text-start leading-tight outline-none transition-all hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900 text-sm text-darkblack hover:text-secondaryColor  dark:text-darkblack-dark dark:hover:text-secondaryColor"
                  >
                    <i className="icofont-logout"></i>
                    <span className="truncate pl-2">Logout</span>
                  </button>
                </li>
              </ul>
            ) : (
              <div className="min-h-14 flex items-center justify-center text-center">
                <p className="text-contentColor dark:text-contentColor-dark font-semibold opacity-55">
                  Not logged in
                </p>
              </div>
            )}
          </DropdownContainerSecondary>
        </DropdownWrapperSecondary>
      </div>
    </>
  );
};

export default DropdownUser;
