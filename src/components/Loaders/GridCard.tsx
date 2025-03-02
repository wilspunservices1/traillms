const CourseGridCardSkeleton = () => {
    return (
      <div className="p-4 border rounded-md shadow-sm h-[350px] bg-gray-200 dark:bg-gray-700">
        <div className="w-full h-40 bg-gray-300 dark:bg-gray-600 rounded-md mb-4 animate-pulse"></div>
        <div className="w-3/4 h-4 bg-gray-300 dark:bg-gray-600 rounded-md mb-2 animate-pulse"></div>
        <div className="w-1/2 h-4 bg-gray-300 dark:bg-gray-600 rounded-md mb-2 animate-pulse"></div>
        <div className="w-1/4 h-4 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
      </div>
    );
  };
  
  export default CourseGridCardSkeleton;
  