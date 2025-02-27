// src/components/LessonList.tsx

"use client";

import Link from "next/link";
import Extras from "./Extras";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Session } from "next-auth";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  isPreview: boolean;
}

interface Props {
  lessons: Lesson[];
  extras?: any;
  isEnrolled: boolean;
  courseOwnerId: string;
}

const LessonList: React.FC<Props> = ({
  lessons,
  extras,
  isEnrolled,
  courseOwnerId,
}) => {
  const { data: session } = useSession() as { data: Session | null };
  const user = session?.user;

  // Determine user roles
  const isSuperAdmin = user?.roles?.includes("superAdmin") ?? false;
  const isInstructor = user?.roles?.includes("instructor") ?? false;
  const isCourseOwner = user?.id === courseOwnerId;

  // Determine if the user can access all lessons
  const canAccessAll =
    isSuperAdmin || isEnrolled || (isInstructor && isCourseOwner);

  // State to manage which lessons to lock for non-enrolled users
  const [lockedLessons, setLockedLessons] = useState<string[]>([]);

  useEffect(() => {
    if (!canAccessAll) {
      // Lock lessons after the first two if user cannot access all lessons
      const initialLocked = lessons.slice(2).map((lesson) => lesson.id);
      setLockedLessons(initialLocked);
    } else {
      // No lessons are locked for users who have access
      setLockedLessons([]);
    }
  }, [canAccessAll, lessons]);

  // Determine if Extras should be displayed within LessonList
  const canAccessExtras = extras && canAccessAll;

  return (
    <ul className="space-y-4">
      {lessons?.map((lesson) => {
        const isLocked = lockedLessons.includes(lesson.id);
        const canView =
          canAccessAll || (!isEnrolled && !isLocked && lesson.isPreview);

        return (
          <li
            key={lesson.id}
            className="py-4 flex items-center justify-between flex-wrap border-b border-borderColor dark:border-borderColor-dark"
          >
            {/* Lesson Info */}
            <div className="flex items-center space-x-2">
              {/* Video or Lock Icon */}
              {isLocked ? (
                <i
                  className="icofont-lock text-red-500 text-xl"
                  aria-hidden="true"
                ></i>
              ) : (
                <i
                  className="icofont-video-alt text-blue-500 text-xl"
                  aria-hidden="true"
                ></i>
              )}

              {/* Lesson Title */}
              <Link
                href={`/lessons/${lesson.id}`}
                className="font-medium text-base text-contentColor dark:text-contentColor-dark hover:text-primaryColor dark:hover:text-primaryColor transition-colors"
              >
                {lesson.title.length > 30
                  ? `${lesson.title.slice(0, 30)}...`
                  : lesson.title}
              </Link>
            </div>

            {/* Lesson Details */}
            <div className="flex items-center space-x-4">
              {/* Lesson Duration with Conditional Lock Icon */}
              <span className="flex items-center text-blackColor dark:text-blackColor-dark text-sm font-semibold">
                {lesson.duration} min
                {!isEnrolled && isLocked && (
                  <i
                    className="icofont-lock ml-2 text-red-500"
                    aria-hidden="true"
                    title="Lesson Locked"
                  ></i>
                )}
              </span>

              {/* Preview Button for Preview Lessons */}
              {canView && (
                <Link
                  href={`/lessons/${lesson.id}`}
                  className="flex items-center bg-primaryColor text-whiteColor text-sm rounded py-1 px-3 hover:bg-primaryColor-dark transition-colors"
                >
                  <i
                    className="icofont-eye mr-1"
                    aria-hidden="true"
                  ></i>
                  Preview
                </Link>
              )}
            </div>
          </li>
        );
      })}

      {/* Optional Extras Section */}
      {/* {canAccessExtras && lessons.length > 0 && (
        <li className="py-4 flex items-center justify-center">
          <Extras lessonId={lessons[0].id} />
        </li>
      )} */}
    </ul>
  );
};

export default LessonList;