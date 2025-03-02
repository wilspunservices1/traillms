"use client";

import Chart from "chart.js/auto";
import { useEffect, useRef, useState } from "react";

const LineChartDashboard = () => {
  const lineChartRef = useRef(null);
  const [selectedType, setSelectedType] = useState("revenue");
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Data",
        data: [],
        tension: 0.4,
        backgroundColor: "#5F2DED",
        borderColor: "#5F2DED",
        borderWidth: 2,
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard/orders");
        const result = await response.json();

        if (result?.data) {
          if (selectedType === "revenue") {
            // Revenue Over Time
            const revenueData = result.data.revenueOverTimeData || [];
            const labels = revenueData.map((item) => item.month);
            const data = revenueData.map((item) => parseFloat(item.totalRevenue));

            setChartData({
              labels,
              datasets: [
                {
                  label: "Revenue Over Time",
                  data,
                  tension: 0.4,
                  backgroundColor: "#5F2DED",
                  borderColor: "#5F2DED",
                  borderWidth: 2,
                },
              ],
            });
          } else if (selectedType === "orders") {
            // Order Volume Trend
            const orderData = result.data.orderVolumeTrendData || [];
            const labels = orderData.map((item) => item.date);
            const data = orderData.map((item) => parseInt(item.orderCount));

            setChartData({
              labels,
              datasets: [
                {
                  label: "Order Volume",
                  data,
                  tension: 0.4,
                  backgroundColor: "#34A853",
                  borderColor: "#34A853",
                  borderWidth: 2,
                },
              ],
            });
          }
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchData();
  }, [selectedType]);

  useEffect(() => {
    const ctx = lineChartRef?.current;
    if (ctx) {
      const myChart = new Chart(ctx, {
        type: "line",
        data: chartData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });

      return () => {
        myChart.destroy();
      };
    }
  }, [chartData]);

  return (
    <div className="w-full md:w-65%">
      <div className="md:px-5 py-10px md:py-0">
        <div className="mb-6 pb-5 border-b-2 border-borderColor dark:border-borderColor-dark flex justify-between items-center gap-2">
          <h2 className="text-2xl font-bold text-blackColor dark:text-blackColor-dark">
            Dashboard
          </h2>
          <div className="bg-whiteColor rounded-md relative">
            <select
              className="bg-transparent text-darkBlue w-42.5 px-3 py-6px focus:outline-none block appearance-none leading-1.5 relative z-20 focus:shadow-select border border-borderColor6 rounded-md"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="revenue">Revenue Over Time</option>
              <option value="orders">Order Volume</option>
            </select>
            <i className="icofont-simple-down absolute top-1/2 right-3 -translate-y-1/2 block text-lg z-10"></i>
          </div>
        </div>
        <canvas id="lineChart" ref={lineChartRef}></canvas>
      </div>
    </div>
  );
};

export default LineChartDashboard;


// "use client";

// import Chart from "chart.js/auto";
// import { useEffect, useRef } from "react";

// const LineChartDashboard = () => {
//   const lineChartRef = useRef(null);
//   useEffect(() => {
//     const ctx = lineChartRef?.current;
//     if (ctx) {
//       const myChart = new Chart(ctx, {
//         type: "line",
//         data: {
//           labels: [
//             "Jan",
//             "Feb",
//             "Marc",
//             "April",
//             "May",
//             "Jun",
//             "July",
//             "Agust",
//             "Sept",
//             "Oct",
//             "Now",
//             "Dec",
//           ],
//           datasets: [
//             {
//               label: "#",
//               data: [
//                 148, 100, 205, 110, 165, 145, 180, 156, 148, 220, 180, 245,
//               ],
//               tension: 0.4,
//               backgroundColor: "#5F2DED",
//               borderColor: "#5F2DED",
//               borderWidth: 2,
//             },
//           ],
//         },
//         options: {
//           responsive: true,
//           plugins: {
//             legend: {
//               display: false,
//             },
//           },
//           scales: {
//             y: {
//               min: 0,
//               max: 300,
//               ticks: {
//                 stepSize: 50,
//               },
//             },
//           },
//         },
//       });
//     }
//   }, []);
//   return (
//     <div className="w-full md:w-65%">
//       <div className="md:px-5 py-10px md:py-0">
//         <div className="mb-6 pb-5 border-b-2 border-borderColor dark:border-borderColor-dark flex justify-between items-center gap-2">
//           <h2 className="text-2xl font-bold text-blackColor dark:text-blackColor-dark">
//             Dashboard
//           </h2>
//           <div className="bg-whiteColor rounded-md relative">
//             <select className="bg-transparent text-darkBlue w-42.5 px-3 py-6px focus:outline-none block appearance-none leading-1.5 relative z-20 focus:shadow-select border border-borderColor6 rounded-md">
//               <option defaultValue="HTML">HTML</option>
//               <option defaultValue="CSS">CSS</option>
//               <option defaultValue="Javascript">Javascript</option>
//               <option defaultValue="PHP">PHP</option>
//               <option defaultValue="WordPress">WordPress</option>
//             </select>
//             <i className="icofont-simple-down absolute top-1/2 right-3 -translate-y-1/2 block text-lg z-10"></i>
//           </div>
//         </div>
//         <canvas id="lineChart" ref={lineChartRef}></canvas>
//       </div>
//     </div>
//   );
// };

// export default LineChartDashboard;
