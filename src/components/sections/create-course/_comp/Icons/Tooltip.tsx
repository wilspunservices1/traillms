import React, { useState } from "react";

type TooltipProps = {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
};

const Tooltip: React.FC<TooltipProps> = ({ content, position = "top", children }) => {
  const [isVisible, setIsVisible] = useState(false);

  const tooltipPositionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={`absolute z-10 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm transition-opacity duration-300 opacity-100 ${tooltipPositionClasses[position]}`}
        >
          {content}
          <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${position === "top" ? "bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2" : ""} ${position === "bottom" ? "top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2" : ""} ${position === "left" ? "right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2" : ""} ${position === "right" ? "left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2" : ""}`}></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
