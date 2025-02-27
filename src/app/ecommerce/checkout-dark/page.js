import CheckoutMain from "@/components/layout/main/ecommerce/CheckoutMain";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Checkout Dark | Meridian LMS - Education LMS Template",
  description: "Checkout Dark | Meridian LMS - Education LMS Template",
};

const Checkout_Dark = async () => {
  return (
    <PageWrapper>
      <main className="is-dark">
        <CheckoutMain />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Checkout_Dark;
