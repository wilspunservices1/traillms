"use client";
import { useEffect, useState } from "react";
import HeadingDashboard from "@/components/shared/headings/HeadingDashboard";
import { useSession } from "next-auth/react";
import UserTableSkeleton from "@/components/shared/dashboards/_comp/skeleton/UserTable";
import * as XLSX from "xlsx"; // Correct import
import { saveAs } from "file-saver"; // Correct import

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1); // Track current page
  const [totalPages, setTotalPages] = useState(1); // Track total pages
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const { data: session } = useSession();
  const [isDownloading, setIsDownloading] = useState(false); // New state

  const limit = 10; // Number of orders per page

  useEffect(() => {
    // Fetch orders with pagination
    const fetchOrders = async () => {
      setLoading(true); // Start loading when fetching data
      try {
        const response = await fetch(
          `/api/orders/complete?userId=${session?.user?.id}&page=${page}&limit=${limit}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();
        setOrders(data.data || []); // Set the orders data or empty array
        setTotalPages(Math.ceil(data.total / limit)); // Set the total number of pages
        setHasNext(data.hasNext); // Set whether there's a next page
        setHasPrevious(data.hasPrevious); // Set whether there's a previous page
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    if (session?.user?.id) {
      fetchOrders();
    }
  }, [page, session?.user?.id]);

  // Handle navigation to next page
  const handleNextPage = () => {
    if (hasNext) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  // Handle navigation to previous page
  const handlePreviousPage = () => {
    if (hasPrevious) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  // Handle downloading the Excel file
  // Handle downloading the Excel file
  const handleDownloadExcel = async () => {
    setIsDownloading(true);
    try {
      if (!session?.user?.id) {
        alert("User not authenticated. Please log in.");
        return;
      }

      // Fetch all orders with a high limit to ensure all data is retrieved
      const response = await fetch(
        `/api/orders/complete?userId=${session.user.id}&page=1&limit=1000`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      const allOrders = data.data || [];

      if (allOrders.length === 0) {
        alert("No orders available to download.");
        return;
      }

      // Prepare data for Excel in a well-structured format
      const excelData = allOrders.map((order) => ({
        "Order ID": order.orderId,
        "User ID": order.uniqueIdentifier || "N/A",
        "Course Name": order.items?.map((item) => item.name).join(", ") || "N/A",
        "Date": order.createdAt
          ? new Date(order.createdAt).toLocaleDateString()
          : "N/A",
        "Price": order.totalAmount || "N/A",
        "Status":
          order.status === "completed"
            ? "Success"
            : order.status === "processing"
              ? "Processing"
              : order.status === "on_hold"
                ? "On Hold"
                : "Canceled",
      }));

      // Create a new workbook and add the worksheet to it
      const worksheet = XLSX.utils.json_to_sheet(excelData, { header: Object.keys(excelData[0]) });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

      // Adjust column widths for better readability
      worksheet['!cols'] = [
        { wch: 15 },  // Order ID width
        { wch: 20 },  // User ID width
        { wch: 25 },  // Course Name width
        { wch: 15 },  // Date width
        { wch: 10 },  // Price width
        { wch: 15 }   // Status width
      ];

      // Generate Excel file and trigger download
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const dataBlob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(dataBlob, "order_history.xlsx");
    } catch (error) {
      console.error("Error downloading Excel file:", error);
      alert(`Failed to download Excel file: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };


  return (
    <div className="p-10px md:px-10 md:py-50px mb-30px bg-whiteColor dark:bg-whiteColor-dark shadow-accordion dark:shadow-accordion-dark rounded-5">
      {/* Heading */}
      <div className="flex items-center justify-between">
        <HeadingDashboard>Order History</HeadingDashboard>

        {/* Download Button */}
        <button
          onClick={handleDownloadExcel}
          disabled={isDownloading}
          className={`bg-blue text-white px-4 py-2 rounded mb-4 ${isDownloading ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          {isDownloading ? "Downloading..." : "Download Excel"}
        </button>
      </div>

      {loading ? (
        <UserTableSkeleton />
      ) : error ? (
        <p>Error fetching orders: {error}</p>
      ) : (
        <>
          {/* Main Content */}
          <div className="overflow-auto">
            <table className="w-full text-left">
              <thead className="text-sm md:text-base text-blackColor dark:text-blackColor-dark bg-lightGrey5 dark:bg-whiteColor-dark leading-1.8 md:leading-1.8">
                <tr>
                  <th className="px-5px py-10px md:px-5">Order ID</th>
                  <th className="px-5px py-10px md:px-5">User ID</th> {/* New column header */}
                  <th className="px-5px py-10px md:px-5">Course Name</th>
                  <th className="px-5px py-10px md:px-5">Date</th>
                  <th className="px-5px py-10px md:px-5">Price</th>
                  <th className="px-5px py-10px md:px-5">Status</th>
                </tr>
              </thead>
              <tbody className="text-size-13 md:text-base text-contentColor dark:text-contentColor-dark font-normal">
                {orders.length > 0 ? (
                  orders.map((order, index) => (
                    <tr
                      key={order.orderId}
                      className={`${index % 2 === 0 ? "" : "bg-lightGrey5"
                        } leading-1.8 md:leading-1.8 dark:bg-whiteColor-dark`}
                    >
                      <th className="px-5px py-10px md:px-5">
                        #{order.orderId.slice(0, 4)} {/* Display first 4 characters of Order ID */}
                      </th>
                      <td className="px-5px text-sm py-10px md:px-5">
                        {order.uniqueIdentifier || "N/A"}
                      </td>
                      <td className="px-5px py-10px md:px-5">
                        <p>
                          {order.items
                            .map((item) => item.name)
                            .join(", ")}
                        </p>
                      </td>
                      <td className="px-5px py-10px md:px-5">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5px py-10px md:px-5">
                        ${order.totalAmount}
                      </td>
                      <td className="px-5px py-10px md:px-5">
                        <span
                          className={`h-22px inline-block px-3 py-1 rounded-md text-white text-xs font-bold ${order.status === "completed"
                            ? "bg-green-500"
                            : order.status === "processing"
                              ? "bg-purple-500"
                              : order.status === "on_hold"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                        >
                          {order.status === "completed"
                            ? "Success"
                            : order.status === "processing"
                              ? "Processing"
                              : order.status === "on_hold"
                                ? "On Hold"
                                : "Canceled"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between mt-4">
            <button
              onClick={handlePreviousPage}
              disabled={!hasPrevious}
              className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={!hasNext}
              className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderHistory;


// "use client";
// import { useEffect, useState } from "react";
// import HeadingDashboard from "@/components/shared/headings/HeadingDashboard";
// import { useSession } from "next-auth/react";
// import UserTableSkeleton from "@/components/shared/dashboards/_comp/skeleton/UserTable";

// const OrderHistory = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [page, setPage] = useState(1); // Track current page
//   const [totalPages, setTotalPages] = useState(1); // Track total pages
//   const [hasNext, setHasNext] = useState(false);
//   const [hasPrevious, setHasPrevious] = useState(false);
//   const { data: session } = useSession();

//   const limit = 10; // Number of orders per page

//   useEffect(() => {
//     // Fetch orders with pagination
//     const fetchOrders = async () => {
//       setLoading(true); // Start loading when fetching data
//       try {
//         const response = await fetch(
//           `/api/orders/complete?userId=${session?.user?.id}&page=${page}&limit=${limit}`
//         );
//         if (!response.ok) {
//           throw new Error("Failed to fetch orders");
//         }
//         const data = await response.json();
//         setOrders(data.data || []); // Set the orders data or empty array
//         setTotalPages(Math.ceil(data.total / limit)); // Set the total number of pages
//         setHasNext(data.hasNext); // Set whether there's a next page
//         setHasPrevious(data.hasPrevious); // Set whether there's a previous page
//         setLoading(false); // Stop loading
//       } catch (err) {
//         setError(err.message);
//         setLoading(false); // Stop loading on error
//       }
//     };

//     if (session?.user?.id) {
//       fetchOrders();
//     }
//   }, [page, session?.user?.id]); // Refetch data when page or user session changes

//   // Handle navigation to next page
//   const handleNextPage = () => {
//     if (hasNext) {
//       setPage(page + 1);
//     }
//   };

//   // Handle navigation to previous page
//   const handlePreviousPage = () => {
//     if (hasPrevious) {
//       setPage(page - 1);
//     }
//   };

//   // console.log("orders[0].items.name :",orders[0].items[0].name);

//   // if (loading) {
//   //   return <p>Loading order history...</p>;
//   // }

//   // if (error) {
//   //   return <p>Error fetching orders: {error}</p>;
//   // }

//   return (
//     <div className="p-10px md:px-10 md:py-50px mb-30px bg-whiteColor dark:bg-whiteColor-dark shadow-accordion dark:shadow-accordion-dark rounded-5">
//       {/* heading */}
//       <HeadingDashboard>Order History</HeadingDashboard>

//       {loading ? (<UserTableSkeleton />) : (
//         <>
//           {/* main content */}
//           <div className="overflow-auto">
//             <table className="w-full text-left">
//               <thead className="text-sm md:text-base text-blackColor dark:text-blackColor-dark bg-lightGrey5 dark:bg-whiteColor-dark leading-1.8 md:leading-1.8">
//                 <tr>
//                   <th className="px-5px py-10px md:px-5">Order ID</th>
//                   <th className="px-5px py-10px md:px-5">Course Name</th>
//                   <th className="px-5px py-10px md:px-5">Date</th>
//                   <th className="px-5px py-10px md:px-5">Price</th>
//                   <th className="px-5px py-10px md:px-5">Status</th>
//                 </tr>
//               </thead>
//               <tbody className="text-size-13 md:text-base text-contentColor dark:text-contentColor-dark font-normal">
//                 {orders.length > 0 ? (
//                   orders.map((order, index) => (
//                     <tr
//                       key={order.orderId}
//                       className={`${index % 2 === 0 ? "" : "bg-lightGrey5"
//                         } leading-1.8 md:leading-1.8 dark:bg-whiteColor-dark`}
//                     >
//                       <th className="px-5px py-10px md:px-5">
//                         #{order.orderId.slice(0, 4)} {/* Display first 4 characters of Order ID */}
//                       </th>
//                       <td className="px-5px py-10px md:px-5">
//                         <p>{order?.name}</p> {/* Access the course name directly */}
//                       </td>
//                       <td className="px-4 py-2 border">
//                         {new Date(order.createdAt).toLocaleDateString()}
//                       </td>
//                       <td className="px-4 py-2 border">${order.totalAmount}</td>
//                       <td className="px-4 py-2 border">
//                         <span
//                           className={`h-22px inline-block px-3 py-1 rounded-md text-white text-xs font-bold ${order.status === "completed"
//                             ? "bg-green-500"
//                             : order.status === "processing"
//                               ? "bg-purple-500"
//                               : order.status === "on_hold"
//                                 ? "bg-yellow-500"
//                                 : "bg-red-500"
//                             }`}
//                         >
//                           {order.status === "completed"
//                             ? "Success"
//                             : order.status === "processing"
//                               ? "Processing"
//                               : order.status === "on_hold"
//                                 ? "On Hold"
//                                 : "Canceled"}
//                         </span>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="5" className="text-center py-4">
//                       No orders found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>

//             </table>
//           </div>

//           {/* Pagination Controls */}
//           <div className="flex justify-between mt-4">
//             <button
//               onClick={handlePreviousPage}
//               disabled={!hasPrevious}
//               className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
//             >
//               Previous
//             </button>
//             <span>
//               Page {page} of {totalPages}
//             </span>
//             <button
//               onClick={handleNextPage}
//               disabled={!hasNext}
//               className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
//             >
//               Next
//             </button>
//           </div>
//         </>
//       )}

//       {!loading && error && (
//         <p>Error fetching orders: {error}</p>
//       )}


//     </div>
//   );
// };

// export default OrderHistory;


