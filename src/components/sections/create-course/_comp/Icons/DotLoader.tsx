import React from "react";

const DotLoader = ({ className = "w-3 h-3", containerClassName = "p-5" }) => {
  return (
    <div className={`flex items-center justify-center h-auto bg-transparent min-w-screen ${containerClassName}`}>
      <div className="flex space-x-2 animate-pulse">
        <div className={`bg-gray-500 rounded-full ${className}`}></div>
        <div className={`bg-gray-500 rounded-full ${className}`}></div>
        <div className={`bg-gray-500 rounded-full ${className}`}></div>
      </div>
    </div>
  );
};

export default DotLoader;


// import React from "react";

// const DotLoader = () => {
//   return (
//     <div className="flex items-center justify-center h-auto p-5 bg-transparent min-w-screen">
//       <div className="flex space-x-2 animate-pulse">
//         <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
//         <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
//         <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
//       </div>
//     </div>
//   );
// };

// export default DotLoader;
