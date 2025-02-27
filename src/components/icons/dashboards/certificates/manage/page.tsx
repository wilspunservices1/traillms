import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import ManageCertificate from "../_comp/ManageCertificate";

export const metadata = {
  title: "Instructor Dashboard | Meridian LMS - Education LMS Certification",
  description: "Instructor Dashboard | Meridian LMS - Education LMS Certification",
};

function page() {
  return (
    <PageWrapper>
      <main>
        <DsahboardWrapper>
          <DashboardContainer>
            {/* <InstructorDashbordMain /> */}
            <ManageCertificate />
          </DashboardContainer>
        </DsahboardWrapper>
        <ThemeController />
      </main>
    </PageWrapper>
  )
}

export default page