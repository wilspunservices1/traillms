import Home1 from "@/components/layout/main/Home1";
import Home2 from "@/components/layout/main/Home2";
import Home3 from "@/components/layout/main/Home3";
import Home4 from "@/components/layout/main/Home4";
import Home5 from "@/components/layout/main/Home5";
import Home6 from "@/components/layout/main/Home6";
import Home7 from "@/components/layout/main/Home7";
import Home8 from "@/components/layout/main/Home8";
import Home9 from "@/components/layout/main/Home9";
import Home10 from "@/components/layout/main/Home10";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export default function Home() {
  return (
    <PageWrapper>
      <main>
        {/* home 10 */}
        <Home3 />
        <ThemeController />
      </main>
    </PageWrapper>
  );
}
