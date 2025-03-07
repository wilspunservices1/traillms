import WishlistMain from "@/components/layout/main/ecommerce/WishlistMain";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Wishlist | Meridian LMS - Education LMS Template",
  description: "Wishlist | Meridian LMS - Education LMS Template",
};

const Wishlist = async () => {
  return (
    <PageWrapper>
      <main>
        <WishlistMain />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Wishlist;
