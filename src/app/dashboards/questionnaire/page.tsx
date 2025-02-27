import QuestionnaireMain from "@/components/sections/questionnaire/QuestionnaireMain";
import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

// export const metadata = {
//   title: "Questionnaire Dashboard | Meridian LMS",
//   description: "Manage your course questionnaires",
// };

function QuestionnairePage() {
  return (
    <PageWrapper>
      <main>
        <DsahboardWrapper>
          <DashboardContainer>
            <QuestionnaireMain />
          </DashboardContainer>
        </DsahboardWrapper>
        <ThemeController />
      </main>
    </PageWrapper>
  );
}

export default QuestionnairePage; 