import ContactMain from "@/components/layout/main/ContactMain";

import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Contact | Meridian LMS - Education LMS Template",
  description: "Contact | Meridian LMS - Education LMS Template",
};

const Contact = async () => {
  return (
    <PageWrapper>
      <main>
        <ContactMain />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Contact;
