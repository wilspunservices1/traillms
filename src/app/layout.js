import FixedShadow from "@/components/shared/others/FixedShadow";
import PreloaderPrimary from "@/components/shared/others/PreloaderPrimary";

import { Hind, Inter } from "next/font/google";
import "@/assets/css/icofont.min.css";
import "@/assets/css/popup.css";
import "@/assets/css/video-modal.css";
import "aos/dist/aos.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-cards";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import { options } from "@/libs/auth"; // Adjust path as necessary
import SessionProvider from "@/components/provider/provider"
import { getSession } from "@/libs/auth";

export const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const hind = Hind({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-hind",
});

export const metadata = {
  title: "Home 1 | Meridian LMS - Education LMS Template",
  description: "Home description",
};

export default async function RootLayout({ children }) {
  // Fetch the session server-side
  const session = await getSession();

  return (
    <html lang="en" className={`${hind.variable}`}>
      <body
        className={`relative leading-[1.8] bg-bodyBg dark:bg-bodyBg-dark z-0 ${inter.className}`}
      >
        <PreloaderPrimary />
        <SessionProvider session={session}>
          {children}
        </SessionProvider>

        {/* theme fixed shadow */}
        <div>
          <FixedShadow />
          <FixedShadow align={"right"} />
        </div>
      </body>
    </html>
  );
}
