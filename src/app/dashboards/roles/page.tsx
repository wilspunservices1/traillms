import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import AdminRolesMain from "@/components/layout/main/dashboards/AdminRolesMain";

export const metadata = {
  title: "Admin Dashboard | Meridian LMS - Education LMS Template",
  description: "Admin Dashboard | Meridian LMS - Education LMS Template",
};
const Admin_Dashboard = () => {
  return (
    <PageWrapper>
      <main>
        <DsahboardWrapper>
          <DashboardContainer>
            <AdminRolesMain />
          </DashboardContainer>
        </DsahboardWrapper>
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Admin_Dashboard;
