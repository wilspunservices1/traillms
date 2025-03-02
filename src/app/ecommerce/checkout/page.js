import CheckoutMain from "@/components/layout/main/ecommerce/CheckoutMain";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Checkout | Meridian LMS - Education LMS Template",
  description: "Checkout | Meridian LMS - Education LMS Template",
};

const Checkout = async () => {
  return (
    <PageWrapper>
      <main>
        <CheckoutMain />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Checkout;
