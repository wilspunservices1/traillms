import Home8 from "@/components/layout/main/Home8";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Home-8 University - Dark | Meridian LMS - Education LMS Template",
  description: "Home-8 University - Dark | Meridian LMS - Education LMS Template",
};
const Home_8_Dark = () => {
  return (
    <PageWrapper>
      <main className="is-dark">
        <Home8 />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Home_8_Dark;
