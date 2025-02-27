"use client";

import { usePathname } from "next/navigation";
import ItemsDashboard from "./ItemsDashboard";
import { useSession } from "next-auth/react";
import {
  PdfIcon,
  ManageCertiIcon,
  CertificateIcon,
  TrackIcon,
} from "@/components/icons";

const SidebarDashboard = () => {
  const pathname = usePathname();
  // const partOfPathNaem = pathname.split("/")[2].split("-")[0];

  // Get session data using useSession hook
  const { data: session, status } = useSession();

  // Handle loading state
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // Handle unauthenticated state
  if (!session) {
    return <div>You are not logged in</div>;
  }

  // Extract part of the pathname to check
  const partOfPathname = pathname.split("/")[2]; // Extracts 'admin-dashboard', 'student-dashboard', etc.

  // Determine title based on pathname and session roles
  let title;

  switch (partOfPathname) {
    case "admin-dashboard":
      title = "Admin Dashboard";
      break;
    case "instructor-dashboard":
      title = "Instructor Dashboard";
      break;
    case "student-dashboard":
      title = "Student Dashboard";
      break;
    default:
      title = "Dashboard"; // Default title if none of the above matches
  }
  // Determine title based on roles
  // Check if user has admin or instructor roles
  const isAdmin = session?.user?.roles?.includes("admin");
  const isInstructor = session?.user?.roles?.includes("instructor");

  // console.log("session data ", session)

  const adminItems = [
    {
      title: title,
      items: [
        {
          name: "Dashboard",
          path: "/dashboards/admin-dashboard",
          icon: (
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
          ),
        },
        {
          name: "My Profile",
          path: "/dashboards/admin-profile",
          icon: (
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
              className="feather feather-user"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          ),
        },
        // {
        //   name: "Message",
        //   path: "/dashboards/admin-message",
        //   tag: 12,
        //   icon: (
        //     <svg
        //       xmlns="http://www.w3.org/2000/svg"
        //       width="16"
        //       height="24"
        //       viewBox="0 0 24 24"
        //       fill="none"
        //       stroke="currentColor"
        //       strokeWidth="2"
        //       strokeLinecap="round"
        //       strokeLinejoin="round"
        //       className="feather feather-book-open"
        //     >
        //       <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        //       <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        //     </svg>
        //   ),
        // },
        {
          name: "Courses",
          path: "/dashboards/admin-course",
          icon: (
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
              className="feather feather-bookmark"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          ),
        },
        {
          name: "Reviews",
          path: "/dashboards/admin-reviews",
          icon: (
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
              className="feather feather-star"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          ),
        },
        {
          name: "Roles",
          path: "/dashboards/roles",
          icon: (
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
              className="feather feather-shield"
            >
              <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3z"></path>
            </svg>
          ),
        },

        // {
        //   name: "Quiz Attempts",
        //   path: "/dashboards/admin-quiz-attempts",
        //   icon: (
        //     <svg
        //       xmlns="http://www.w3.org/2000/svg"
        //       width="16"
        //       height="24"
        //       viewBox="0 0 24 24"
        //       fill="none"
        //       stroke="currentColor"
        //       strokeWidth="2"
        //       strokeLinecap="round"
        //       strokeLinejoin="round"
        //       className="feather feather-help-circle"
        //     >
        //       <circle cx="12" cy="12" r="10"></circle>
        //       <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        //       <line x1="12" y1="17" x2="12.01" y2="17"></line>
        //     </svg>
        //   ),
        // },
      ],
    },
    {
      title: "USER",
      items: [
        {
          name: "Settings",
          path: "/dashboards/admin-settings",
          icon: (
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
              className="feather feather-settings"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          ),
        },
        // {
        //   name: "Logout",
        //   path: "#",
        //   icon: (
        //     <svg
        //       xmlns="http://www.w3.org/2000/svg"
        //       width="16"
        //       height="24"
        //       viewBox="0 0 24 24"
        //       fill="none"
        //       stroke="currentColor"
        //       strokeWidth="2"
        //       strokeLinecap="round"
        //       strokeLinejoin="round"
        //       className="feather feather-volume-1"
        //     >
        //       <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        //       <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        //     </svg>
        //   ),
        // },
      ],
    },
  ];

  const instructorItems = [
    {
      title: title,
      items: [
        {
          name: "Dashboard",
          path: "/dashboards/instructor-dashboard",
          icon: (
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
          ),
        },
        {
          name: "My Profile",
          path: "/dashboards/instructor-profile",
          icon: (
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
              className="feather feather-user"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          ),
        },
        {
          name: "Wishlist",
          path: "/dashboards/instructor-wishlist",
          icon: (
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
              className="feather feather-bookmark"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          ),
        },
        {
          name: "Reviews",
          path: "/dashboards/instructor-reviews",
          icon: (
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
              className="feather feather-star"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          ),
        },
        {
          name: "Order History",
          path: "/dashboards/instructor-order-history",
          icon: (
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
              className="feather feather-shopping-bag"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          ),
        },
        {
          name: "My Course",
          path: "/dashboards/instructor-course",
          icon: (
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
              className="feather feather-monitor"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          ),
        },
        {
          name: "Certificates",
          path: "/dashboards/certificates/main",
          icon: (
            <PdfIcon
              height={34}
              width={18}
              color="#FF5722"
              className="items-start justify-center flex "
              ariaLabel="Custom SVG Icon"
            />
          ),
          subItems: [
            {
              name: "Create Certificate",
              path: "/dashboards/certificates/add",
              icon: (
                <CertificateIcon
                  height={34}
                  width={18}
                  color="#FF5722"
                  className="items-start justify-center flex "
                  ariaLabel="Custom SVG Icon"
                />
              ),
            },
            {
              name: "Manage Certificate",
              path: "/dashboards/certificates/manage",
              icon: (
                <ManageCertiIcon
                  height={34}
                  width={18}
                  color="#FF5722"
                  className="items-start justify-center flex "
                  ariaLabel="Custom SVG Icon"
                />
              ),
            },
            {
              name: "Track Certificate",
              path: "/dashboards/certificates/track",
              icon: (
                <TrackIcon
                  height={34}
                  width={18}
                  color="#FF5722"
                  className="items-start justify-center flex "
                  ariaLabel="Custom SVG Icon"
                />
              ),
            },
          ],
        },
        {
          name: "Questionnaire",
          path: "/dashboards/questionnaire",
          icon: (
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
              className="feather feather-help-circle"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          ),
          subItems: [
            {
              name: "Create Questionnaire",
              path: "/dashboards/questionnaire/add",
              icon: (
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
                  className="feather feather-plus-circle"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
              ),
            },
            {
              name: "Manage Questionnaire",
              path: "/dashboards/questionnaire/manage",
              icon: (
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
                  className="feather feather-list"
                >
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              ),
            },
          ],
        },
        {
          name: "Settings",
          path: "/dashboards/instructor-settings",
          icon: (
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
              className="feather feather-settings"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          ),
        },
      ],
    },
  ];

  const studentItems = [
    {
      title: title,
      items: [
        {
          name: "Dashboard",
          path: "/dashboards/student-dashboard",
          icon: (
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
          ),
        },
        {
          name: "My Profile",
          path: "/dashboards/student-profile",
          icon: (
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
              className="feather feather-user"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          ),
        },
        // {
        //   name: "Message",
        //   path: "/dashboards/student-message",
        //   tag: 12,
        //   icon: (
        //     <svg
        //       xmlns="http://www.w3.org/2000/svg"
        //       width="16"
        //       height="24"
        //       viewBox="0 0 24 24"
        //       fill="none"
        //       stroke="currentColor"
        //       strokeWidth="2"
        //       strokeLinecap="round"
        //       strokeLinejoin="round"
        //       className="feather feather-book-open"
        //     >
        //       <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        //       <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        //     </svg>
        //   ),
        // },
        {
          name: "Enrolled Courses",
          path: "/dashboards/student-enrolled-courses",
          icon: (
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
              className="feather feather-bookmark"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          ),
        },
        {
          name: "Wishlist",
          path: "/dashboards/student-wishlist",
          icon: (
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
              className="feather feather-bookmark"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          ),
        },
        // {
        //   name: "Reviews",
        //   path: "/dashboards/student-reviews",
        //   icon: (
        //     <svg
        //       xmlns="http://www.w3.org/2000/svg"
        //       width="16"
        //       height="24"
        //       viewBox="0 0 24 24"
        //       fill="none"
        //       stroke="currentColor"
        //       strokeWidth="2"
        //       strokeLinecap="round"
        //       strokeLinejoin="round"
        //       className="feather feather-star"
        //     >
        //       <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        //     </svg>
        //   ),
        // },
        // {
        //   name: "My Quiz Attempts",
        //   path: "/dashboards/student-my-quiz-attempts",
        //   icon: (
        //     <svg
        //       xmlns="http://www.w3.org/2000/svg"
        //       width="16"
        //       height="24"
        //       viewBox="0 0 24 24"
        //       fill="none"
        //       stroke="currentColor"
        //       strokeWidth="2"
        //       strokeLinecap="round"
        //       strokeLinejoin="round"
        //       className="feather feather-help-circle"
        //     >
        //       <circle cx="12" cy="12" r="10"></circle>
        //       <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        //       <line x1="12" y1="17" x2="12.01" y2="17"></line>
        //     </svg>
        //   ),
        // },
        // {
        //   name: "Assignments",
        //   path: "/dashboards/student-assignments",
        //   icon: (
        //     <svg
        //       xmlns="http://www.w3.org/2000/svg"
        //       width="16"
        //       height="24"
        //       viewBox="0 0 24 24"
        //       fill="none"
        //       stroke="currentColor"
        //       strokeWidth="2"
        //       strokeLinecap="round"
        //       strokeLinejoin="round"
        //       className="feather feather-volume-1"
        //     >
        //       <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        //       <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        //     </svg>
        //   ),
        // },
        {
          name: " Settings",
          path: "/dashboards/student-settings",
          icon: (
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
              className="feather feather-settings"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          ),
        },
        // {
        //   name: "Logout",
        //   path: "#",
        //   icon: (
        //     <svg
        //       xmlns="http://www.w3.org/2000/svg"
        //       width="16"
        //       height="24"
        //       viewBox="0 0 24 24"
        //       fill="none"
        //       stroke="currentColor"
        //       strokeWidth="2"
        //       strokeLinecap="round"
        //       strokeLinejoin="round"
        //       className="feather feather-volume-1"
        //     >
        //       <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        //       <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        //     </svg>
        //   ),
        // },
      ],
    },
  ];

  // Conditionally choose items based on role
  // const items = isAdmin
  //   ? adminItems // If user is an admin, show adminItems
  //   : isInstructor
  //     ? instructorItems // If user is an instructor, show instructorItems
  //     : studentItems; // Otherwise, show studentItems (for example, if user is a student)

  // Combine instructor and user items if the role is instructor
  let items = [];

  // Check the role and assign items based on role
  if (isInstructor) {
    // Show specific instructor items
    items = instructorItems;
  } else if (isAdmin) {
    // Show admin items if user is admin
    items = adminItems;
  } else {
    // Show default student items
    items = studentItems;
  }

  return (
    <div className="lg:col-start-1 lg:col-span-3">
      {/* navigation menu */}
      <div className="p-30px pt-5 lg:p-5 2xl:p-30px 2xl:pt-5 rounded-lg2 shadow-accordion dark:shadow-accordion-dark bg-whiteColor dark:bg-whiteColor-dark">
        {items?.map((item, idx) => (
          <ItemsDashboard key={idx} item={item} />
        ))}
      </div>
    </div>
  );
};

export default SidebarDashboard;
