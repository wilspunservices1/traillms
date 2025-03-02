import Home9 from "@/components/layout/main/Home9";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Home-9 Kindergarten - Dark | Meridian LMS - Education LMS Template",
  description: "Home-9 Kindergarten - Dark | Meridian LMS - Education LMS Template",
};
const Home_9 = () => {
  return (
    <PageWrapper>
      <Home9 />
      <ThemeController />
    </PageWrapper>
  );
};

export default Home_9;
