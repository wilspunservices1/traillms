import CourseDetailsMain from "@/components/layout/main/CourseDetailsMain";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import courses from "@/../public/fakedata/courses.json";
import { notFound } from "next/navigation";
import { BASE_URL } from "@/actions/constant";

export const metadata = {
  title: "Course Details | Meridian LMS - Education LMS Template",
  description: "Course Details | Meridian LMS - Education LMS Template",
};

const isUUID = (id) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

const existingCourse = async (id) => {
  try {
    if (id && isUUID(id)) {
      const response = await fetch(`${BASE_URL}/api/courses/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch course");
      }
      const result = await response.json();
      return result.data;
    }
    return null;
  } catch (error) {
    console.error("An error occurred while fetching the course details:", error);
    return null;
  }
};

const Course_Details = async ({ params }) => {
  const { id } = params;

  const isExistCourse = await existingCourse(id);


  if (!isExistCourse) {
    return notFound();
  }

  return (
    <PageWrapper>
      <main>
        <CourseDetailsMain id={id} course={isExistCourse} />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export async function generateStaticParams() {
  return courses?.map(({ id }) => ({ id: id.toString() }));
}

export default Course_Details;



// import CourseDetailsMain from "@/components/layout/main/CourseDetailsMain";
// import ThemeController from "@/components/shared/others/ThemeController";
// import PageWrapper from "@/components/shared/wrappers/PageWrapper";
// import courses from "@/../public/fakedata/courses.json";
// import { notFound } from "next/navigation";
// export const metadata = {
//   title: "Course Details | Meridian LMS - Education LMS Template",
//   description: "Course Details | Meridian LMS - Education LMS Template",
// };

// const existingCoure = async (id) => {
//   try {
//     if (id && id != 1) {
//       const response = await fetch(`/api/courses/${id}`);
//       if (!response.ok) {
//         throw new Error("Failed to fetch courses");
//       }
//       const result = await response.json();
//       console.log("resuult", result)
//       return result.data;
//     }
//     return null;
//   } catch (error) {
//     console.error("An error occurred while fetching the course details:", error);
//   }
// };

// const Course_Details = async ({ params }) => {
//   const { id } = params;

//   console.log("main", id)

//   const isExistCourse = await existingCoure(id);
//   console.log("isExistCourse ", isExistCourse)
//   // const isExistCourse = courses?.find(({ id: id1 }) => id1 === parseInt(id));
//   if (!isExistCourse) {
//     notFound();
//   }
//   return (
//     <PageWrapper>
//       <main>
//         <CourseDetailsMain id={id} course={isExistCourse}/>
//         <ThemeController />
//       </main>
//     </PageWrapper>
//   );
// };
// export async function generateStaticParams() {
//   return courses?.map(({ id }) => ({ id: id.toString() }));
// }
// export default Course_Details;
