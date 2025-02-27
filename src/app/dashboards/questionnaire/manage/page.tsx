'use client';
import dynamic from 'next/dynamic';
import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

const ManageQuestionnaire = dynamic(() => import('../../../../components/sections/questionnaire/ManageQuestionnaire'), {
});

// export const metadata = {
//   title: "Manage Questionnaires | Meridian LMS",
//   description: "Manage your course questionnaires",
// };

function ManageQuestionnairePage() {
  return (
    <PageWrapper>
      <main>
        <DsahboardWrapper>
          <DashboardContainer>
            <ManageQuestionnaire
              questionnaireId=""
              mode="manage"
              onClose={() => {}}
            />
          </DashboardContainer>
        </DsahboardWrapper>
        <ThemeController />
      </main>
    </PageWrapper>
  );
}

export default ManageQuestionnairePage; 