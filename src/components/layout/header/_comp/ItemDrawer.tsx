import React, { useEffect, useState } from "react";
import DropdownWrapperSecondary from "@/components/shared/wrappers/DropdownWrapperSecondary";
import DropdownContainerSecondary from "@/components/shared/containers/DropdownContainerSecondary";
import { CldImage } from "next-cloudinary";
import Skeleton from "./searchSkeleton";
import { useRouter } from "next/navigation";

interface ItemDrawerProps {
  searchQuery: string;
}

interface Course {
  id: string;
  title: string;
  image: string;
  instructor: string;
}

const ItemDrawer: React.FC<ItemDrawerProps> = ({ searchQuery }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        let endpoint = `/api/search`;
        if (searchQuery) {
          endpoint += `?q=${encodeURIComponent(searchQuery)}`;
        }
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = await response.json();
        setCourses(data.courses);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [searchQuery]);

  // Handle click and navigate to the course page
  const handleItemClick = (id: string, event: React.MouseEvent) => {
    event.preventDefault(); // Prevent default action (optional)
    router.push(`/courses/${id}`);
  };

  return (
    <DropdownWrapperSecondary isHeaderTop={true}>
      <DropdownContainerSecondary>
        <ul className="flex max-h-[400px] overflow-auto flex-col gap-y-5 pb-5 mb-30px border-b border-borderColor dark:border-borderColor-dark">
          {loading &&
            Array.from({ length: 4 }).map((_, idx) => <Skeleton key={idx} />)}

          {error && <li>Error: {error}</li>}
          {!loading && !error && courses.length === 0 && (
            <li>No courses found</li>
          )}
          {courses.map(({ id, title, image, instructor }) => (
            <li
              key={id}
              className="px-4 py-3 hover:bg-slate-300 text-sm text-gray-900 dark:text-white"
            >
              <div
                onMouseDown={(event) => handleItemClick(id, event)} // Use onMouseDown instead of onClick to prevent blur
                className="cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <CldImage
                    src={image || ""}
                    alt={title || ""}
                    className="w-12 h-12 rounded-md"
                    width={200}
                    height={120}
                    sizes={"60w"}
                  />
                  <div>
                    <h5 className="text-black font-bold text-lg">{title}</h5>
                    <p className="text-xs">{instructor}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </DropdownContainerSecondary>
    </DropdownWrapperSecondary>
  );
};

export default ItemDrawer;

