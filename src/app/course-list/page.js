import CourseListMain from "@/components/layout/main/CourseListMain";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Course List | Meridian LMS - Education LMS Template",
  description: "Course List | Meridian LMS - Education LMS Template",
};

const Course_List = async () => {
  return (
    <PageWrapper>
      <main>
        <CourseListMain />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Course_List;
