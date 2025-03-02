"use client";

import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

const PieChartDashboard = () => {
  const pieChartRef = useRef(null);
  const [dataFetched, setDataFetched] = useState(false);
  const [paymentMethodData, setPaymentMethodData] = useState([]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard/orders");
        const result = await response.json();

        if (result?.data) {
          setPaymentMethodData(result.data.paymentMethodData);
          setDataFetched(true);
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (dataFetched && pieChartRef.current) {
      // Payment Method Pie Chart
      const pieChart = new Chart(pieChartRef.current, {
        type: "pie",
        data: {
          labels: paymentMethodData.map((item) => item.paymentMethod),
          datasets: [
            {
              label: "Total Sales",
              data: paymentMethodData.map((item) => parseFloat(item.totalSales)),
              backgroundColor: ["#5F2DED", "#34A853", "#FBBC05", "#EA4335"],
              hoverBackgroundColor: ["#5F2DED", "#34A853", "#FBBC05", "#EA4335"],
            },
          ],
        },
        options: {
          responsive: true,
          cutout: "70%",
          plugins: {
            legend: {
              position: "left",
              labels: {
                color: "rgb(255, 99, 132)", // Adjust text color for dark/light mode
              },
            },
          },
        },
      });

      return () => {
        pieChart.destroy();
      };
    }
  }, [dataFetched]);

  return (
    <div className="w-full md:w-1/2 lg:w-1/3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
        Payment Method Distribution
      </h2>
      <canvas ref={pieChartRef} />
    </div>
  );
};

export default PieChartDashboard;





// "use client";

// import Chart from "chart.js/auto";
// import { useEffect, useRef } from "react";

// const PieChartDashboard = () => {
//   const pieChartRef = useRef(null);

//   useEffect(() => {
//     const ctx = pieChartRef?.current;
//     if (ctx) {
//       const myChart = new Chart(ctx, {
//         type: "pie",
//         data: {
//           labels: ["Direct", "Referal", "Organic"],
//           datasets: [
//             {
//               label: "#",
//               data: [40, 28, 32],
//             },
//           ],
//         },
//         options: {
//           cutout: "75%",
//           plugins: {
//             legend: {
//               position: "left",
//             },
//           },
//           elements: {
//             arc: {
//               backgroundColor: "#5F2DED",
//               hoverBackgroundColor: "#5F2DED",
//             },
//           },
//         },
//       });
//     }
//   }, []);
//   return (
//     <div className="w-full md:w-35%">
//       <div className="md:px-5 py-10px md:py-0">
//         <div className="mb-6 pb-5 border-b-2 border-borderColor dark:border-borderColor-dark flex justify-between items-center gap-2">
//           <h2 className="text-2xl font-bold text-blackColor dark:text-blackColor-dark">
//             Traffic
//           </h2>
//           <div className="bg-whiteColor rounded-md relative">
//             <select className="bg-transparent text-darkBlue w-42.5 px-3 py-6px focus:outline-none block appearance-none leading-1.5 relative z-20 focus:shadow-select border border-borderColor6 rounded-md">
//               <option defaultValue="Today">Today</option>
//               <option defaultValue="Weekly">Weekly</option>
//               <option defaultValue="Monthly">Monthly</option>
//               <option defaultValue="Yearly">Yearly</option>
//             </select>
//             <i className="icofont-simple-down absolute top-1/2 right-3 -translate-y-1/2 block text-lg z-10"></i>
//           </div>
//         </div>
//         <canvas id="pieChart" ref={pieChartRef}></canvas>
//       </div>
//     </div>
//   );
// };

// export default PieChartDashboard;
