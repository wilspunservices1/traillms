// src/components/InstructorApplicationTable.tsx

import React, { useState, useEffect } from "react";
import useSweetAlert from "@/hooks/useSweetAlert";
import DotLoader from "@/components/sections/create-course/_comp/Icons/DotLoader";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";
import UserTableSkeleton from "./skeleton/UserTable";
import { formatDate } from "@/actions/formatDate";

interface Application {
  id: string;
  userId: string;
  instructorBio: string;
  qualifications: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  name: string | null;
  email: string | null;
}

const InstructorApplicationTable: React.FC = () => {
  const { data: session } = useSession() as { data: Session | null };
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const showAlert = useSweetAlert();

  useEffect(() => {
    // Fetch instructor applications
    const fetchApplications = async () => {
      try {
        const response = await fetch(`/api/admin/teacher-requests`);
        if (!response.ok) {
          throw new Error("Failed to fetch instructor applications");
        }
        const data = await response.json();
        setApplications(data.applications);
      } catch (error) {
        console.error(error);
        showAlert("error", "Failed to fetch instructor applications");
      } finally {
        setIsLoadingApplications(false);
      }
    };

    fetchApplications();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Removed showAlert from dependency array to fix infinite loop

  // Function to handle actions on applications
  const handleApplicationAction = async (
    applicationId: string,
    action: "approve" | "reject"
  ) => {
    setActionLoadingId(applicationId);
    try {
      const response = await fetch(
        `/api/admin/teacher-requests/${applicationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${action} the application`);
      }

      // Remove the application from the state
      setApplications((prev) => prev.filter((app) => app.id !== applicationId));

      showAlert(
        "success",
        `Application has been ${action === "approve" ? "approved" : "rejected"}`
      );
    } catch (error) {
      console.error(error);
      showAlert("error", `Failed to ${action} the application`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Function to toggle the dropdown menu
  const handleDropdownToggle = (applicationId: string) => {
    setSelectedApplicationId((prevSelectedId) =>
      prevSelectedId === applicationId ? null : applicationId
    );
  };

  if (isLoadingApplications) {
    return <UserTableSkeleton />;
  }

  if (applications.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No pending instructor applications.
      </div>
    );
  }

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <div className="overflow-x-auto pb-16 shadow-sm rounded-md">
      <h2 className="text-xl font-bold mb-4">Pending Instructor Applications</h2>
      <table className="min-w-full mb-6">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Bio
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Qualifications
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Joining Date
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {applications.map((app) => (
            <tr key={app.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                {app.name ? truncateText(app.name, 12) : "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                {app.email ? truncateText(app.email, 12) : "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                {app.instructorBio ? truncateText(app.instructorBio, 12) : "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                {app.qualifications && app.qualifications.length > 0
                  ? truncateText(app.qualifications.join(", "), 12)
                  : "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 capitalize">
                {app.status || "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                {app.createdAt ? formatDate(app.createdAt) : "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {actionLoadingId === app.id ? (
                  <DotLoader className="h-2 w-2 mx-auto" />
                ) : (
                  <div className="relative inline-block text-left">
                    <button
                      type="button"
                      onClick={() => handleDropdownToggle(app.id)}
                      className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-2 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                      aria-haspopup="true"
                      aria-expanded={selectedApplicationId === app.id}
                    >
                      <span className="sr-only">Open options</span>
                      {/* Replace '...' with an icon if preferred */}
                      ...
                    </button>
                    {selectedApplicationId === app.id && (
                      <div className="origin-top-right z-10 absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                        <div className="py-1">
                          <button
                            onClick={() =>
                              handleApplicationAction(app.id, "approve")
                            }
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleApplicationAction(app.id, "reject")
                            }
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InstructorApplicationTable;
