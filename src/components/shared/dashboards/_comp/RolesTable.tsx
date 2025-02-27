import React, {useMemo, useState, useEffect, useCallback, useRef } from "react";
import debounce from "lodash.debounce";
import useSweetAlert from "@/hooks/useSweetAlert";
import DotLoader from "@/components/sections/create-course/_comp/Icons/DotLoader";
import Modal from "./Modal";
import VerifiedSymbol from "./VerifiedIcon";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";
import UserTableSkeleton from "./skeleton/UserTable";
import { formatDate } from "@/actions/formatDate";
import { User, UserTableProps } from "@/types/type";
import UserDetailsCustom from "./UserDetailsCustom";
import ErrorBoundary from "./ErrorBoundary";

const UserTable: React.FC<UserTableProps> = ({
  users,
  setUsers,
  isLoading,
}) => {
  const { data: session } = useSession() as { data: Session | null };
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>("");
  const [loading, setLoading] = useState<string | null>(null);
  const [modalType, setModalType] = useState<
    "deleteUser" | "inviteAdmin" | "viewUser"
  >("inviteAdmin");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const showAlert = useSweetAlert();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Ensure that the filtered users list updates when the users prop changes
  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  // Attach and clean up the click outside event listener once when the component mounts
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setSelectedUserId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  
  const debouncedSearch = useMemo(() => {
      return debounce((query: string) => {
          if (query.trim() === "") {
              setFilteredUsers(users);
          } else {
              const lowerCaseQuery = query.toLowerCase();
              const filtered = users.filter((user) =>
                  user.uniqueIdentifier
                      ? user.uniqueIdentifier.toLowerCase().includes(lowerCaseQuery) ||
                        user.name.toLowerCase().includes(lowerCaseQuery) ||
                        user.email.toLowerCase().includes(lowerCaseQuery) ||
                        user.username.toLowerCase().includes(lowerCaseQuery)
                      : false
              );
              setFilteredUsers(filtered);
          }
      }, 300);
  }, [users]); // Only re-create when `users` change
  
  // Cleanup debounce on component unmount
  useEffect(() => {
      return () => {
          debouncedSearch.cancel();
      };
  }, [debouncedSearch]); // Ensures cleanup happens whenever debouncedSearch changes
  

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  if (isLoading) {
    return <UserTableSkeleton />;
  }

  const handleDropdownToggle = (userId: string) => {
    setSelectedUserId((prevSelectedUserId) =>
      prevSelectedUserId === userId ? null : userId
    );
  };

  const viewUserDetails = (userId: string) => {
    setSelectedUserId(userId);
    setModalType("viewUser");
    setShowModal(true);
  };
  const handleAction = (
    userId: string,
    action: string,
    currentRoles: string[]
  ) => {
    setSelectedUserId(null); // Close the dropdown after action

    if (action === "makeAdmin" && !currentRoles.includes("admin")) {
      updateUserRole(userId, "admin");
    } else if (
      action === "makeInstructor" &&
      !currentRoles.includes("instructor")
    ) {
      updateUserRole(userId, "instructor");
    } else if (
      action === "makeUser" &&
      (currentRoles.includes("admin") || currentRoles.includes("instructor"))
    ) {
      updateUserRole(userId, "user");
    } else if (action === "deleteUser") {
      setShowModal(true); // Open the modal for deletion
      setModalType("deleteUser"); // Set modal type to delete
      setSelectedUserId(userId); // Track which user to delete
    }
  };

  const renderActions = (user: User, currentUserRoles: string[]) => {
    if (currentUserRoles.includes("superAdmin")) {
      return (
        <>
          {/* SuperAdmin: Full access */}
          {user.roles.includes("user") && (
            <>
              <button
                onClick={() =>
                  handleAction(user.id, "makeInstructor", user.roles)
                }
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Make Instructor
              </button>
              <button
                onClick={() => handleAction(user.id, "makeAdmin", user.roles)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Make Admin
              </button>
              <button
                onClick={() => handleAction(user.id, "deleteUser", user.roles)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Delete User
              </button>
            </>
          )}
          {user.roles.includes("instructor") && (
            <>
              <button
                onClick={() => handleAction(user.id, "makeAdmin", user.roles)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Make Admin
              </button>
              <button
                onClick={() => handleAction(user.id, "makeUser", user.roles)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Make User
              </button>
              <button
                onClick={() => handleAction(user.id, "deleteUser", user.roles)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Delete Instructor
              </button>
            </>
          )}
          {user.roles.includes("admin") && (
            <>
              <button
                onClick={() =>
                  handleAction(user.id, "makeInstructor", user.roles)
                }
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Make Instructor
              </button>
              <button
                onClick={() => handleAction(user.id, "makeUser", user.roles)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Make User
              </button>
              <button
                onClick={() => handleAction(user.id, "deleteUser", user.roles)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Delete Admin
              </button>
            </>
          )}
        </>
      );
    }

    // Admin: Limited access (can delete if allowed)
    if (currentUserRoles.includes("admin")) {
      return (
        <>
          {/* Dropdown for users with the role 'user' */}
          {user.roles.includes("user") && (
            <>
              <button
                onClick={() =>
                  handleAction(user.id, "makeInstructor", user.roles)
                }
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Make Instructor
              </button>
              <button
                onClick={() => handleAction(user.id, "makeAdmin", user.roles)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Make Admin
              </button>
            </>
          )}

          {/* Dropdown for users with the role 'instructor' */}
          {user.roles.includes("instructor") && (
            <>
              <button
                onClick={() => handleAction(user.id, "makeUser", user.roles)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Make User
              </button>
              <button
                onClick={() => handleAction(user.id, "makeAdmin", user.roles)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Make Admin
              </button>
            </>
          )}

          {/* Dropdown for users with the role 'admin' */}
          {user.roles.includes("admin") && (
            <>
              <button
                onClick={() =>
                  handleAction(user.id, "makeInstructor", user.roles)
                }
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Make Instructor
              </button>
              <button
                onClick={() => handleAction(user.id, "makeUser", user.roles)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Make User
              </button>
            </>
          )}
        </>
      );
    }

    return null;
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    setLoading(userId);
    try {
      const response = await fetch(`/api/user/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error("Failed to update the role");

      const updatedUser = await response.json();
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? { ...user, roles: updatedUser.updatedUser.roles }
            : user
        )
      );
      showAlert("success", `Role updated to ${newRole}`);
    } catch (error: any) {
      showAlert("error", error.message || "Failed to update the role");
    } finally {
      setLoading(null);
    }
  };

  const deleteUser = async (userId: string) => {
    setLoading(userId);

    if (!userId) {
      showAlert("error", "Invalid user ID");
      return;
    }

    try {
      const response = await fetch(`/api/user/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete the user");

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      showAlert("success", "User deleted successfully");
      setShowModal(false);
    } catch (error: any) {
      showAlert("error", error.message || "Failed to delete the user");
    } finally {
      setLoading(null);
    }
  };

  const inviteAdminByEmail = async () => {
    try {
      const response = await fetch(`/api/user/invite-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput }),
      });

      if (!response.ok) throw new Error("Failed to invite admin");

      showAlert("success", `Invitation sent to ${emailInput}`);
      setShowModal(false);
      setEmailInput("");
    } catch (error: any) {
      showAlert("error", error.message || "Failed to send invitation");
    }
  };

  return (
    <div className="overflow-x-auto pb-[130px] shadow-sm rounded-md relative">
      <div className="flex justify-start p-4">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by Unique ID, Name, or Username..."
          className="border text-sm border-gray-300 rounded-md p-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue"
        />
      </div>
      <table className="min-w-full ">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
              # ID
            </th>
            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
              Name
            </th>
            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
              No. of Courses
            </th>
            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
              Join At
            </th>
            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
              Role
            </th>
            <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y  divide-gray-200">
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td
                className="px-6 py-4 whitespace-nowrap text-sm text-blue cursor-pointer hover:underline"
                onClick={() => viewUserDetails(user.id)}
              >
                {user.uniqueIdentifier || "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                {user.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                {user.enrolledCoursesCount || 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                {formatDate(user.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                {user.roles.join(", ")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                <div className="relative inline-block text-left">
                  {loading === user.id ? (
                    <DotLoader className="h-2 w-2" />
                  ) : user.roles.includes("superAdmin") ? (
                    <VerifiedSymbol className="h-6 w-6" />
                  ) : (
                    <>
                      <button
                        onClick={() => handleDropdownToggle(user.id)}
                        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-blue text-sm font-medium text-white hover:bg-blueDark focus:outline-none focus:ring-2 focus:ring-blue"
                      >
                        ...
                      </button>
                      {selectedUserId === user.id && (
                        <div
                          ref={dropdownRef}
                          className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                        >
                          <div className="py-1">
                            {renderActions(user, session?.user?.roles || [])}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showModal && (
        <Modal
          isVisible={showModal}
          onClose={() => setShowModal(false)}
          title={
            modalType === "inviteAdmin"
              ? "Add Admin via Email"
              : modalType === "deleteUser"
              ? "Confirm Delete"
              : "User Details"
          }
          content={
            <ErrorBoundary>
              {modalType === "inviteAdmin" ? (
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 w-full"
                  placeholder="Enter email"
                />
              ) : modalType === "deleteUser" ? (
                <p className="text-red-500">
                  Are you sure you want to delete this user? This action cannot
                  be undone.
                </p>
              ) : (
                <UserDetailsCustom userId={selectedUserId!} />
              )}
            </ErrorBoundary>
          }
          confirmText={
            modalType === "inviteAdmin"
              ? "Send Invitation"
              : modalType === "deleteUser"
              ? "Yes, Delete"
              : "Close"
          }
          onConfirm={
            modalType === "inviteAdmin"
              ? inviteAdminByEmail
              : modalType === "deleteUser"
              ? () => deleteUser(selectedUserId!)
              : () => setShowModal(false)
          }
          cancelText={
            modalType === "inviteAdmin" || modalType === "deleteUser"
              ? "Cancel"
              : undefined
          }
          size={
            modalType === "inviteAdmin"
              ? "sm"
              : modalType === "deleteUser"
              ? "lg"
              : "xl"
          } // Assign 'xl' for 'viewUser'
          customClasses={modalType === "deleteUser" ? "bg-red-500" : ""}
        />
      )}
    </div>
  );
};

export default UserTable;
