import React from "react";

const UserTableSkeleton: React.FC = () => {
  // Helper to create an array of specified size to repeat skeleton rows
  const skeletonRows = new Array(5).fill(null);

  return (
    <div className="animate-pulse">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">
              {" "}
            </th>
            <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">
              {" "}
            </th>
            <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">
              {" "}
            </th>
            <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">
              {" "}
            </th>
            <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">
              {" "}
            </th>
            <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase">
              {" "}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {skeletonRows.map((_, index) => (
            <tr key={index}>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-22 md:w-24 lg:w-28"></div>{" "}
                {/* Name placeholder */}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-32 md:w-48 lg:w-48"></div>{" "}
                {/* Email placeholder */}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-10 md:w-16 lg:w-16"></div>{" "}
                {/* Courses placeholder */}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-16 md:w-24 lg:w-24"></div>{" "}
                {/* Created at placeholder */}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-20 md:w-28 lg:w-24"></div>{" "}
                {/* Role placeholder */}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-end">
                <div className="h-4 bg-gray-200 rounded w-8 md:w-10 lg:w-8"></div>{" "}
                {/* Actions placeholder */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTableSkeleton;
