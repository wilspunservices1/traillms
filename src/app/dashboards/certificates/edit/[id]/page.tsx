import InstructorDashbordMain from "@/components/layout/main/dashboards/InstructorDashbordMain";

import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import EditCertificate from "../../_comp/EditCertificate";

export const metadata = {
  title: "Instructor Dashboard | Meridian LMS - Education LMS Certification",
  description: "Instructor Dashboard | Meridian LMS - Education LMS Certification",
};

function page({params} : {params : {id : string}}) {

  console.log("params",params.id)

  return (
    <PageWrapper>
      <main>
        <DsahboardWrapper>
          <DashboardContainer>
            <EditCertificate />
          </DashboardContainer>
        </DsahboardWrapper>
        <ThemeController />
      </main>
    </PageWrapper>
  )
}

export default page
