"use client";
import { useEffect, useState } from "react";

const TabContentWrapper = ({ children, isShow }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isShow) {
      setIsVisible(true); // Set visibility to true immediately when isShow is true
    } else {
      // Delay the setting of visibility to false until the fade-out animation is done
      const timeout = setTimeout(() => setIsVisible(false), 150); // 150ms matches the duration of your transition
      return () => clearTimeout(timeout); // Clear timeout on component unmount or re-render
    }
  }, [isShow]);

  return (
    <div
      className={`transition-opacity duration-150 ease-linear ${isShow ? "opacity-100" : "opacity-0"} ${
        isVisible ? "block" : "hidden"
      }`}
    >
      {children}
    </div>
  );
};

export default TabContentWrapper;


// "use client";
// import { useEffect, useState } from "react";

// const TabContentWrapper = ({ children, isShow }) => {
//   const [isBlock, setIsBlock] = useState(false);

//   useEffect(() => {
//     if (isShow) {
//       setTimeout(() => {
//         setIsBlock(true);
//       }, 150);
//     } else {
//       setIsBlock(false);
//     }
//   }, [isShow]);
//   return (
//     <div
//       className={`transition-opacity min-h-[500px] duration-150 ease-linear ${
//         isShow ? "block " : "hidden "
//       } ${isBlock ? "opacity-100" : "opacity-0"}`}
//     >
//       {children}
//     </div>
//   );
// };

// export default TabContentWrapper;
